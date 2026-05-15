import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import { Button } from '../components/ui';
import CampaignCard from '../features/campaigns/components/CampaignCard';
import CampaignRow from '../features/campaigns/components/CampaignRow';
import { useActiveCampaigns } from '../features/campaigns/hooks/useCampaigns';
import { useCategories } from '../features/campaigns/hooks/useCategories';
import { useCities } from '../features/campaigns/hooks/useCities';

const DEFAULT_CITY = 'bursa';
const MIN_ROW_ITEMS = 2;

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const cityId = searchParams.get('sehir') ?? DEFAULT_CITY;
  const categoryId = searchParams.get('kategori') ?? 'all';
  const query = searchParams.get('q') ?? '';

  const updateFilters = (patch, { replace = true } = {}) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, mapped] of [
      ['cityId', 'sehir'],
      ['categoryId', 'kategori'],
      ['query', 'q'],
    ]) {
      if (!(key in patch)) continue;
      const v = patch[key];
      if (!v || v === 'all' || (key === 'cityId' && v === DEFAULT_CITY)) {
        next.delete(mapped);
      } else {
        next.set(mapped, v);
      }
    }
    setSearchParams(next, { replace });
  };

  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useCategories();
  const {
    data: allCampaigns = [],
    isLoading,
    isError,
  } = useActiveCampaigns({ cityId, max: 200 });

  const normalizedQuery = query.trim().toLowerCase();
  const hasActiveFilter = categoryId !== 'all' || normalizedQuery !== '';

  const filtered = useMemo(() => {
    return allCampaigns.filter((c) => {
      if (categoryId !== 'all' && c.categoryId !== categoryId) return false;
      if (normalizedQuery) {
        const haystack = [c.title, c.description, c.businessName, c.district]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [allCampaigns, categoryId, normalizedQuery]);

  const featured = useMemo(
    () => allCampaigns.filter((c) => c.isFeatured),
    [allCampaigns],
  );

  const groupedByCategory = useMemo(() => {
    if (hasActiveFilter) return [];
    const map = new Map();
    for (const c of allCampaigns) {
      if (!c.categoryId) continue;
      if (!map.has(c.categoryId)) map.set(c.categoryId, []);
      map.get(c.categoryId).push(c);
    }
    return categories
      .map((cat) => ({ category: cat, items: map.get(cat.id) ?? [] }))
      .filter((g) => g.items.length >= MIN_ROW_ITEMS);
  }, [allCampaigns, categories, hasActiveFilter]);

  const featuredGrid = featured.slice(0, 5);
  const selectedCity = cities.find((c) => c.id === cityId);

  return (
    <>
      <Seo />

      {/* ── ÖNE ÇIKAN (filtre yokken) ─────────────────────────────── */}
      {!hasActiveFilter && !isLoading && featuredGrid.length > 0 && (
        <section className="pt-8 sm:pt-10 md:pt-14">
          <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-end sm:justify-between sm:px-6 md:mb-8 md:px-8">
            <div>
              <p className="mb-1 text-xs font-label font-bold uppercase tracking-widest text-primary">
                Haftanın Seçkileri
              </p>
              <h2 className="font-headline font-extrabold text-2xl text-on-surface sm:text-3xl md:text-4xl">
                Öne Çıkan Kampanyalar
              </h2>
              <p className="mt-1 font-body text-sm text-on-surface-variant sm:text-base">
                Şehrindeki seçilmiş fırsatlar
              </p>
            </div>

            <HomeCitySelect
              cities={cities}
              cityId={cityId}
              onChange={(v) => updateFilters({ cityId: v })}
            />
          </div>

          <div className="md:px-8 lg:px-12">
            <div className="grid w-full grid-cols-2 gap-0 overflow-hidden shadow-[0_20px_50px_rgba(28,28,25,0.08)] md:grid-cols-4">
              {featuredGrid.map((c, i) => (
                <CampaignCard
                  key={c.id}
                  campaign={c}
                  variant="square"
                  hero={i === 0}
                  className={
                    i === 0
                      ? 'col-span-2 md:col-span-2 md:row-span-2'
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── KATEGORİ ŞERİTLERİ (filtre yokken) ───────────────────── */}
      {!hasActiveFilter && !isLoading && groupedByCategory.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16 md:px-8 md:pt-20">
          <div className="flex flex-col gap-10 sm:gap-14">
            {groupedByCategory.map(({ category, items }) => (
              <CampaignRow
                key={category.id}
                title={category.name}
                subtitle={`${items.length} kampanya`}
                icon={category.icon}
                campaigns={items}
                onSeeAll={() => updateFilters({ categoryId: category.id })}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── SONUÇLAR / FİLTRE AKTİF ───────────────────────────────── */}
      {(hasActiveFilter || isLoading || isError) && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-20">
          <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-label font-bold uppercase tracking-widest text-primary">
                {hasActiveFilter ? 'Arama Sonuçları' : 'Tümü'}
              </p>
              <h2 className="font-headline font-extrabold text-2xl text-on-surface sm:text-3xl md:text-4xl">
                {hasActiveFilter
                  ? `${filtered.length} Kampanya Bulundu`
                  : 'Tüm Kampanyalar'}
              </h2>
            </div>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={() => updateFilters({ categoryId: 'all', query: '' })}
                className="inline-flex items-center gap-1 self-start rounded-full bg-surface-container px-4 py-2 text-sm font-label font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary sm:self-auto"
              >
                <span className="material-symbols-outlined text-base">close</span>
                Filtreyi Temizle
              </button>
            )}
          </div>

          {isError && (
            <div className="bg-error-container/30 p-6 text-on-error-container">
              Kampanyalar yüklenemedi.
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <CampaignCard.Skeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <EmptyState hasFilter={hasActiveFilter} city={selectedCity} />
          )}

          {!isLoading && !isError && hasActiveFilter && filtered.length > 0 && (
            <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </section>
      )}

      <HomeBottomSections
        categories={categories}
        campaignCount={allCampaigns.length}
        cityCount={cities.length}
        onCategorySelect={(id) => updateFilters({ categoryId: id })}
        onClearFilters={() => updateFilters({ categoryId: 'all', query: '' })}
      />

      {/* ── NEWSLETTER ───────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 md:px-8">
          <span className="material-symbols-outlined mb-4 block text-4xl text-primary sm:mb-5">
            mail
          </span>
          <p className="mb-2 text-xs font-label font-bold uppercase tracking-widest text-primary">
            Haberdar Ol
          </p>
          <h2 className="mb-3 font-headline font-extrabold text-3xl text-on-surface sm:mb-4 sm:text-4xl">
            Fırsatları Kaçırma
          </h2>
          <p className="mb-8 font-body text-sm leading-relaxed text-on-surface-variant sm:mb-10 sm:text-base">
            Yeni kampanyalardan ve size özel fırsatlardan ilk siz haberdar olun.
          </p>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 rounded-full bg-surface-container-high px-5 py-3 text-sm font-label text-on-surface outline-none transition placeholder:text-on-surface-variant/40 focus:bg-surface-container-highest focus:ring-2 focus:ring-primary/40 sm:px-6 sm:py-3.5"
            />
            <Button variant="primary" className="rounded-full px-6 py-3 sm:px-8 sm:py-3.5">
              Abone Ol
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}

const HOW_IT_WORKS = [
  {
    icon: 'search',
    title: 'Keşfet',
    text: 'Şehrindeki kampanyalara göz atın; kategori veya arama ile aradığınızı bulun.',
  },
  {
    icon: 'shopping_cart',
    title: 'Satın Alın',
    text: 'Beğendiğiniz teklifi seçin, güvenli ödeme ile işleminizi tamamlayın.',
  },
  {
    icon: 'confirmation_number',
    title: 'Kullanın',
    text: 'Kuponunuzu hesabınızdan açın; işletmede kodu veya QR ile fırsatınızı kullanın.',
  },
];

const VALUE_PROPS = [
  {
    icon: 'verified',
    title: 'Güvenilir İşletmeler',
    text: 'Kampanyalar anlaşmalı iş ortaklarımızdan gelir; alışverişinizi güvenle yapın.',
  },
  {
    icon: 'savings',
    title: 'Net Tasarruf',
    text: 'İndirimli fiyatlar ve paket seçenekleriyle bütçenize uygun teklifler.',
  },
  {
    icon: 'schedule',
    title: 'Açık Süreler',
    text: 'Bitiş tarihleri her kampanyada görünür; planınızı önceden yapın.',
  },
  {
    icon: 'support_agent',
    title: 'Yanınızdayız',
    text: 'Sipariş ve kupon süreçlerinde destek ekibimizden yardım alın.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Kuponumu nasıl kullanırım?',
    a: 'Satın alma sonrası kuponunuz Hesabım → Kuponlarım bölümünde görünür. İşletmede ekrandaki kodu veya QR’ı göstermeniz yeterlidir.',
  },
  {
    q: 'Kampanyalar şehre göre mi listeleniyor?',
    a: 'Evet. Üst menüden şehrinizi seçerek o bölgedeki güncel fırsatları görebilirsiniz.',
  },
  {
    q: 'İade veya iptal yapabilir miyim?',
    a: 'Kullanılmamış kuponlar için kampanya koşullarına bağlı iptal mümkündür. Detaylar her kampanya sayfasında yer alır.',
  },
  {
    q: 'İşletmem için kampanya yayınlayabilir miyim?',
    a: 'Evet. İşletme Başvurusu formunu doldurun; onay sonrası kampanyanızı panelden yönetebilirsiniz.',
  },
];

function SectionHeader({ eyebrow, title, description, align = 'center', className = '' }) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`mb-10 max-w-2xl md:mb-14 ${alignClass} ${className}`}>
      <p className="mb-1 text-xs font-label font-bold uppercase tracking-widest text-primary">
        {eyebrow}
      </p>
      <h2 className="font-headline font-extrabold text-2xl text-on-surface sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 font-body text-sm leading-relaxed text-on-surface-variant sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

function HomeBottomSections({
  categories,
  campaignCount,
  cityCount,
  onCategorySelect,
  onClearFilters,
}) {
  const statCampaigns = campaignCount > 0 ? `${campaignCount}+` : '—';
  const statCategories = categories.length > 0 ? String(categories.length) : '—';
  const statCities = cityCount > 0 ? String(cityCount) : '—';

  const stats = [
    { value: statCampaigns, label: 'Aktif kampanya', icon: 'local_offer' },
    { value: statCategories, label: 'Kategori', icon: 'category' },
    { value: statCities, label: 'Hizmet verilen şehir', icon: 'location_city' },
  ];

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="border-t border-outline/10">
      {/* ── NASIL ÇALIŞIR ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 md:px-8">
        <SectionHeader
          eyebrow="Üç Adımda"
          title="Nasıl Çalışır?"
          description="Şehrinizdeki fırsatları keşfedin, satın alın ve işletmede kolayca kullanın."
        />

        <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {HOW_IT_WORKS.map((step, i) => (
            <li
              key={step.title}
              className="flex flex-col rounded-3xl bg-surface-container-lowest p-6 shadow-[0_12px_40px_rgba(26,20,107,0.06)] transition hover:shadow-[0_16px_48px_rgba(26,20,107,0.09)] sm:p-8"
            >
              <div className="mb-5 flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <span
                    className="material-symbols-outlined text-[28px] leading-none text-primary"
                    aria-hidden="true"
                  >
                    {step.icon}
                  </span>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-label font-bold text-on-primary">
                  {i + 1}
                </span>
              </div>
              <h3 className="mb-2 font-headline font-bold text-lg text-on-surface">{step.title}</h3>
              <p className="font-body text-sm leading-relaxed text-on-surface-variant">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── RAKAMLAR ──────────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 sm:grid-cols-3 sm:gap-6 sm:px-6 md:px-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest px-6 py-8 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <span
                  className="material-symbols-outlined text-2xl leading-none text-primary"
                  aria-hidden="true"
                >
                  {stat.icon}
                </span>
              </span>
              <div>
                <p className="font-headline font-extrabold text-3xl text-on-surface">{stat.value}</p>
                <p className="mt-0.5 text-sm font-label text-on-surface-variant">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEDEN GRP ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 md:px-8">
        <SectionHeader
          eyebrow="Avantajlar"
          title="Neden GRP?"
          description="Kampanya alışverişini sade, güvenilir ve şeffaf hale getiriyoruz."
          align="left"
        />
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {VALUE_PROPS.map((item) => (
            <div
              key={item.title}
              className="group rounded-3xl bg-surface-container-low p-6 transition hover:bg-surface-container-lowest hover:shadow-[0_12px_40px_rgba(26,20,107,0.06)]"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 transition group-hover:bg-primary">
                <span
                  className="material-symbols-outlined text-2xl leading-none text-primary transition group-hover:text-on-primary"
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
              </span>
              <h3 className="mb-2 font-headline font-bold text-base text-on-surface">{item.title}</h3>
              <p className="font-body text-sm leading-relaxed text-on-surface-variant">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── KATEGORİLER ───────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="bg-surface-container-low py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
            <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-label font-bold uppercase tracking-widest text-primary">
                  Keşfet
                </p>
                <h2 className="font-headline font-extrabold text-2xl text-on-surface sm:text-3xl">
                  Kategorilere Göz Atın
                </h2>
                <p className="mt-2 font-body text-sm text-on-surface-variant">
                  İlgi alanınıza göre şehrinizdeki kampanyaları filtreleyin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClearFilters?.();
                  scrollToTop();
                }}
                className="inline-flex shrink-0 items-center gap-1 self-start rounded-full bg-surface-container-highest px-4 py-2 text-sm font-label font-semibold text-primary transition hover:bg-primary hover:text-on-primary sm:self-auto"
              >
                Tüm kampanyalar
                <span className="material-symbols-outlined text-base">arrow_upward</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {categories.slice(0, 8).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onCategorySelect?.(cat.id);
                    scrollToTop();
                  }}
                  className="group flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest px-4 py-6 text-center transition hover:-translate-y-0.5 hover:bg-surface-container-highest hover:shadow-[0_8px_24px_rgba(26,20,107,0.08)]"
                >
                  {cat.icon ? (
                    <span className="material-symbols-outlined text-3xl text-primary transition group-hover:scale-110">
                      {cat.icon}
                    </span>
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-headline font-bold text-primary">
                      {cat.name?.charAt(0)}
                    </span>
                  )}
                  <span className="font-label text-sm font-semibold text-on-surface">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── İŞLETME CTA ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 md:px-8">
        <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl bg-dark-surface px-8 py-10 text-on-dark-surface sm:flex-row sm:items-center sm:justify-between sm:px-12 sm:py-14">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary-container/40 blur-3xl"
          />
          <div className="relative max-w-lg">
            <p className="mb-2 text-xs font-label font-bold uppercase tracking-widest text-primary-container/80">
              İş Ortaklığı
            </p>
            <h2 className="mb-3 font-headline font-extrabold text-2xl sm:text-3xl">
              İşletmeniz İçin Kampanya Yayınlayın
            </h2>
            <p className="font-body text-sm leading-relaxed text-on-dark-surface/75 sm:text-base">
              Yeni müşterilere ulaşın, tekliflerinizi yönetin ve satışlarınızı tek panelden
              takip edin.
            </p>
          </div>
          <div className="relative flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              to="/isletme-basvurusu"
              className="bg-primary-gradient inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-label font-semibold text-on-primary transition hover:opacity-90"
            >
              Başvuru Yapın
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
            <Link
              to="/isletme"
              className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3.5 text-sm font-label font-semibold text-on-dark-surface ring-1 ring-white/10 transition hover:bg-white/15"
            >
              İşletme Girişi
            </Link>
          </div>
        </div>
      </section>

      {/* ── SSS ───────────────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 md:px-8">
          <SectionHeader
            eyebrow="Yardım"
            title="Sık Sorulan Sorular"
            description="Merak ettiklerinize hızlı yanıtlar."
          />
          <div className="flex flex-col gap-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl bg-surface-container-lowest px-5 py-4 transition open:bg-surface-container-highest/80 open:shadow-[0_4px_20px_rgba(26,20,107,0.05)]"
              >
                <summary className="cursor-pointer list-none font-label text-sm font-semibold text-on-surface marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    <span className="pr-2">{item.q}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition group-open:rotate-180 group-open:bg-primary/10 group-open:text-primary">
                      <span className="material-symbols-outlined text-xl">expand_more</span>
                    </span>
                  </span>
                </summary>
                <p className="mt-3 border-t border-outline/10 pt-3 font-body text-sm leading-relaxed text-on-surface-variant">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function HomeCitySelect({ cities, cityId, onChange }) {
  return (
    <label className="relative flex shrink-0 items-center gap-2 self-start rounded-full bg-surface-container-high pl-4 pr-2 py-1.5 transition hover:bg-surface-container-highest sm:self-auto">
      <span className="material-symbols-outlined text-primary">location_on</span>
      <span className="hidden text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant sm:inline">
        Şehir
      </span>
      <select
        value={cityId}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Şehir seç"
        className="cursor-pointer appearance-none bg-transparent py-1.5 pl-1 pr-8 text-sm font-label font-semibold text-on-surface outline-none"
      >
        {cities.length === 0 && <option value="">Yükleniyor…</option>}
        {cities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-base">
        expand_more
      </span>
    </label>
  );
}

function EmptyState({ hasFilter, city }) {
  return (
    <div className="flex flex-col items-center bg-surface-container-low px-6 py-14 text-center sm:py-20">
      <span className="material-symbols-outlined mb-4 text-5xl text-on-surface-variant/60">
        inventory_2
      </span>
      <h3 className="mb-2 font-headline font-extrabold text-xl text-on-surface sm:text-2xl">
        {hasFilter
          ? 'Bu filtrede kampanya yok'
          : 'Şehriniz için henüz kampanya yok'}
      </h3>
      <p className="max-w-sm font-body text-sm text-on-surface-variant">
        {hasFilter
          ? 'Farklı bir kategori deneyebilir veya aramayı genişletebilirsiniz.'
          : 'Yeni kampanyalar eklendikçe burada görünecek.'}
      </p>
    </div>
  );
}
