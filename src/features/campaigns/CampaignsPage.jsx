import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../../components/seo/Seo';
import CampaignCard from './components/CampaignCard';
import CategoryFilter from './components/CategoryFilter';
import { useCampaigns } from './hooks/useCampaigns';
import { useCategories } from './hooks/useCategories';

export default function CampaignsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryId = searchParams.get('kategori') ?? 'all';

  const { data: categories = [] } = useCategories();
  const {
    data: campaigns = [],
    isLoading,
    isError,
    error,
  } = useCampaigns({ categoryId, max: 60 });

  const handleCategoryChange = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'all') {
      params.delete('kategori');
    } else {
      params.set('kategori', next);
    }
    setSearchParams(params, { replace: true });
  };

  const activeCategoryName = useMemo(() => {
    if (categoryId === 'all') return null;
    return categories.find((c) => c.id === categoryId)?.name ?? null;
  }, [categoryId, categories]);

  return (
    <>
      <Seo
        title={activeCategoryName ? `${activeCategoryName} Kampanyaları` : 'Tüm Kampanyalar'}
        description={
          activeCategoryName
            ? `Bursa'da ${activeCategoryName.toLowerCase()} kategorisindeki aktif kampanyalar.`
            : "Bursa'daki tüm aktif kampanya ve fırsatlar tek sayfada."
        }
      />

      <main className="pt-16 md:pt-24">
        {/* ── Hero Header ─────────────────────────────────────────── */}
        <header className="mx-auto mb-16 max-w-7xl px-6 text-center md:mb-20 md:px-8">
          <p className="mb-4 text-xs font-label font-bold uppercase tracking-widest text-primary">
            Bursa için Özel
          </p>
          <h1 className="mb-6 font-headline italic text-5xl leading-tight tracking-tight text-on-surface md:text-7xl">
            {activeCategoryName ?? 'Seçkin Kampanyalar'}
          </h1>
          <p className="mx-auto max-w-2xl font-body text-base leading-relaxed text-on-surface-variant md:text-lg">
            Spa'lar, restoranlar, güzellik merkezleri ve daha fazlası — tek platformda, özel indirimlerle.
          </p>
        </header>

        {/* ── Filters ─────────────────────────────────────────────── */}
        <section className="mx-auto mb-12 max-w-7xl px-6 md:mb-16 md:px-8">
          <CategoryFilter
            categories={categories}
            value={categoryId}
            onChange={handleCategoryChange}
          />
        </section>

        {/* ── Campaigns Grid ──────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-6 pb-24 md:px-8 md:pb-32">
          {isError && (
            <div className="rounded-xl border border-error-container bg-error-container/30 p-6 text-on-error-container">
              <p className="font-label font-semibold">Bir hata oluştu.</p>
              <p className="mt-1 text-sm">{error?.message ?? 'Kampanyalar yüklenemedi.'}</p>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <CampaignCard.Skeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && !isError && campaigns.length === 0 && (
            <div className="flex flex-col items-center rounded-2xl border border-outline-variant/30 bg-surface-container-low py-20 text-center">
              <span className="material-symbols-outlined mb-4 text-5xl text-on-surface-variant/60">
                inventory_2
              </span>
              <h2 className="mb-2 font-headline text-2xl text-on-surface">
                Bu filtrede kampanya yok
              </h2>
              <p className="max-w-sm font-body text-sm text-on-surface-variant">
                Başka bir kategori seçerek daha fazla fırsatı keşfedebilirsin.
              </p>
            </div>
          )}

          {!isLoading && !isError && campaigns.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

export { CampaignsPage as Component };
