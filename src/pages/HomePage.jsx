import { Link } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import { Button } from '../components/ui';
import CampaignCard from '../features/campaigns/components/CampaignCard';
import { useFeaturedCampaigns } from '../features/campaigns/hooks/useCampaigns';

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB4opsxUB-GtC5HZpmxuZzpy7ehp9s14u92WIH4PPinbFbjJnJVQhMAy5kcno97vMwVh_LNXtjF59UsrqaDN05kI_hLEhXOoqhgYDG7NYG0JNwriApXi4m78EGh4L3Qv7ur8rhvdXi5Z5WtmaeKiJ_WwBPm-qqyChK0BW6SgKFaKuSEfNjdEvIt6T9gH6zFtEn4eUsAlXQm32MiujctG5O3MQwdo74ZrtIaigWu7E7RlcJDurq3nNq_Oz2G0a06wIlccgqTuUaGfoE';

export default function HomePage() {
  const { data: featured = [], isLoading, isError } = useFeaturedCampaigns({ max: 6 });

  // İlk 3 kampanya üst grid, 4. kampanya "Haftanın Seçkisi" featured banner
  const gridCampaigns = featured.slice(0, 3);
  const spotlightCampaign = featured[3] ?? featured[0] ?? null;

  return (
    <>
      <Seo />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Bursa kampanyaları"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#0a1a0c]/85 via-[#0a1a0c]/30 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 md:px-8 md:pb-20">
          <p className="mb-4 text-xs font-label font-semibold uppercase tracking-widest text-white/55">
            Bursa için Özel Fırsatlar
          </p>
          <h1 className="mb-6 font-headline italic text-6xl leading-[0.92] tracking-tight text-white md:text-8xl">
            Şehrin En İyi<br />
            Kampanyaları.
          </h1>
          <p className="mb-8 max-w-md font-body text-base leading-relaxed text-white/65">
            Spa&apos;lar, restoranlar, güzellik merkezleri ve daha fazlası — tek platformda, özel indirimlerle.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/kampanyalar">
              <Button variant="dark" size="lg" className="px-8 py-3">
                Kampanyaları Keşfet
              </Button>
            </Link>
            <Link to="/kampanyalar">
              <Button variant="ghost-white" size="lg" className="px-8 py-3">
                Tüm Teklifler
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED CAMPAIGNS (live from Firestore) ──────────────── */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-label font-bold uppercase tracking-widest text-primary">
                Öne Çıkan
              </p>
              <h2 className="font-headline italic text-4xl text-on-surface">
                Seçkin Kampanyalar
              </h2>
            </div>
            <Link
              to="/kampanyalar"
              className="hidden items-center gap-1 text-sm font-label font-semibold text-on-surface-variant transition-all hover:gap-2 hover:text-primary sm:flex"
            >
              Tümünü Gör
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {isError && (
            <div className="rounded-xl border border-error-container bg-error-container/30 p-6 text-on-error-container">
              Kampanyalar yüklenemedi.
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <CampaignCard.Skeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && !isError && gridCampaigns.length === 0 && (
            <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low py-16 text-center">
              <p className="font-body text-on-surface-variant">
                Henüz öne çıkan kampanya yok — yakında burada olacak.
              </p>
            </div>
          )}

          {!isLoading && !isError && gridCampaigns.length > 0 && (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {gridCampaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── SPOTLIGHT (Haftanın Seçkisi) ──────────────────────────── */}
      {spotlightCampaign && (
        <section className="bg-surface-container-low py-20">
          <div className="mx-auto max-w-7xl px-6 md:px-8">
            <div className="mb-10">
              <p className="mb-1 text-xs font-label font-bold uppercase tracking-widest text-primary">
                Bu Haftaya Özel
              </p>
              <h2 className="font-headline italic text-4xl text-on-surface">
                Haftanın Seçkisi
              </h2>
            </div>
            <CampaignCard campaign={spotlightCampaign} variant="featured" />
          </div>
        </section>
      )}

      {/* ── PULLQUOTE ─────────────────────────────────────────────── */}
      <section className="bg-surface px-6 py-24 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-headline italic text-3xl leading-relaxed text-on-surface md:text-5xl md:leading-snug">
            &ldquo;Kendinize en iyi yatırımı yapın &mdash; çünkü siz buna değersiniz.&rdquo;
          </p>
          <p className="mt-6 font-label text-sm uppercase tracking-widest text-on-surface-variant/60">
            GRP Kampanya
          </p>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────── */}
      <section className="bg-surface-container-low py-20">
        <div className="mx-auto max-w-2xl px-6 text-center md:px-8">
          <span className="material-symbols-outlined mb-5 block text-4xl text-primary">spa</span>
          <p className="mb-2 text-xs font-label font-bold uppercase tracking-widest text-primary">
            Haberdar Ol
          </p>
          <h2 className="mb-4 font-headline italic text-4xl text-on-surface">
            Fırsatları Kaçırma
          </h2>
          <p className="mb-10 font-body leading-relaxed text-on-surface-variant">
            Yeni kampanyalar ve davetiye özel tekliflerden ilk sen haberdar ol.
          </p>
          <form className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 rounded-full border border-outline-variant bg-surface px-6 py-3.5 text-sm font-label text-on-surface outline-none transition-shadow placeholder-on-surface-variant/40 focus:ring-2 focus:ring-primary/40"
            />
            <Button variant="dark" className="rounded-full px-8 py-3.5">
              Abone Ol
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
