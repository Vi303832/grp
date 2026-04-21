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
                {selectedCity?.name ?? 'Türkiye'}&apos;de Öne Çıkan Kampanyalar
              </h2>
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
                subtitle={`${items.length} kampanya · ${selectedCity?.name ?? ''}`}
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

      {/* ── NEWSLETTER ───────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-14 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 md:px-8">
          <span className="material-symbols-outlined mb-4 block text-4xl text-primary sm:mb-5">
            spa
          </span>
          <p className="mb-2 text-xs font-label font-bold uppercase tracking-widest text-primary">
            Haberdar Ol
          </p>
          <h2 className="mb-3 font-headline font-extrabold text-3xl text-on-surface sm:mb-4 sm:text-4xl">
            Fırsatları Kaçırma
          </h2>
          <p className="mb-8 font-body text-sm leading-relaxed text-on-surface-variant sm:mb-10 sm:text-base">
            Yeni kampanyalar ve davetiye özel tekliflerden ilk sen haberdar ol.
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
          : `${city?.name ?? 'Bu şehir'} için henüz kampanya yok`}
      </h3>
      <p className="max-w-sm font-body text-sm text-on-surface-variant">
        {hasFilter
          ? 'Farklı bir kategori deneyebilir veya aramayı genişletebilirsin.'
          : 'Çok yakında bu şehir için de fırsatlar eklenecek.'}
      </p>
      {!hasFilter && (
        <Link
          to="/?sehir=bursa"
          className="bg-primary-gradient mt-6 inline-flex items-center gap-1 rounded-full px-5 py-2 text-sm font-label font-semibold text-on-primary hover:opacity-90"
        >
          Bursa kampanyalarını gör
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </Link>
      )}
    </div>
  );
}
