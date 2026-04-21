import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

/* ── Image URLs from Stitch AI ──────────────────────────────────── */
const IMG = {
  hero:    'https://lh3.googleusercontent.com/aida-public/AB6AXuB4opsxUB-GtC5HZpmxuZzpy7ehp9s14u92WIH4PPinbFbjJnJVQhMAy5kcno97vMwVh_LNXtjF59UsrqaDN05kI_hLEhXOoqhgYDG7NYG0JNwriApXi4m78EGh4L3Qv7ur8rhvdXi5Z5WtmaeKiJ_WwBPm-qqyChK0BW6SgKFaKuSEfNjdEvIt6T9gH6zFtEn4eUsAlXQm32MiujctG5O3MQwdo74ZrtIaigWu7E7RlcJDurq3nNq_Oz2G0a06wIlccgqTuUaGfoE',
  facial:  'https://lh3.googleusercontent.com/aida-public/AB6AXuBabKUWvZgRmuNzv2ERfn1a9wW8I1SjW03MMHHX6iNRPmsh1kuvlUcz9lmnYjWilETqxwxQJ4Gjue2-QtpMgZSm98JoKW6onQe7puApuJE8gIDhlUlajx0FeOQrXhCOsZ8-1ZPAmqm5zsnTd1ha2-PW1htZzs1_uL8RKjI7-wn1AV8QtT6DDc8A2dyU4FhBLEiT9fa-MjZZMJdzmOMWoZFOb2jRsjftCn6Sbuf13k5v3r0obGSwC0IMFgbjHJunDcJebGES9178-cQ',
  flowers: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDWJ4hRq0TSARuLC5o0bZTRW8F_4HaOLCCPAEnsyqr6Muh7WRQnRsij0EsWYUU1lsbEaSjuuh1k-y-iy3CSVyAn94m4rsMEz2qyqGI1URl5xk9zH29vNqSd6z8tHU6fOFW3O8OSNnhKJCOLFcDeJufDLZ8JgLJzCaxmuEptEi-SsT9jj6px0iWus00XFVPAZ0SOpZPZJxBhFWLpL3WJvZLlP9G1NtNYdaiXiRHgSoQSETVLXQJr7GNpFtzdExVygJpDFIMj-AFdgs',
  stones:  'https://lh3.googleusercontent.com/aida-public/AB6AXuAIeuke514OVHHTN5RPoahiVdsL8sAFMMrKsAHmL4A2kOw4tpajULDjKyXNi5fduUBLZtWOmeNaKo1TFWxUy7f-k_dAM1Hu-QfwZF0dkCbplX3x1sYy1zPoaDeQn89DcU3Qb_ySFq4pXtG9caprRBIYyeUIIzcE8IB19H-tW9GYoOBR5_YjEnHQCUo5PzWe4ra1t_iwlu_abFliiwJ58uykppiYsnaKKDU8YGa1Scs0bO-BG7bCXF6FrVINJ-P_Z54ACLjsceGBWGI',
  bath:    'https://lh3.googleusercontent.com/aida-public/AB6AXuB4opsxUB-GtC5HZpmxuZzpy7ehp9s14u92WIH4PPinbFbjJnJVQhMAy5kcno97vMwVh_LNXtjF59UsrqaDN05kI_hLEhXOoqhgYDG7NYG0JNwriApXi4m78EGh4L3Qv7ur8rhvdXi5Z5WtmaeKiJ_WwBPm-qqyChK0BW6SgKFaKuSEfNjdEvIt6T9gH6zFtEn4eUsAlXQm32MiujctG5O3MQwdo74ZrtIaigWu7E7RlcJDurq3nNq_Oz2G0a06wIlccgqTuUaGfoE',
};

/* ── Featured campaigns data ────────────────────────────────────── */
const FEATURED = [
  {
    id: 1,
    tag: 'Spa & Masaj',
    title: 'Aromaterapi Kaçış Paketi',
    description: '90 dakikalık aromatik yağ masajı ve özel buhar seansı. Haftanın yorgunluğunu atın.',
    originalPrice: '1.400 ₺',
    price: '980 ₺',
    image: IMG.facial,
  },
  {
    id: 2,
    tag: 'Güzellik & Bakım',
    title: 'Gelinlik Işıltısı Programı',
    description: '4 haftalık cilt bakımı ve vücut polisajı programı. Özel gününüze hazırlanın.',
    originalPrice: '4.250 ₺',
    price: '3.200 ₺',
    image: IMG.flowers,
  },
  {
    id: 3,
    tag: 'Wellness',
    title: 'Sıcak Taş Terapisi',
    description: 'Isıtılmış bazalt taşları ve botanik yağlarıyla derin doku gevşemesi.',
    originalPrice: '1.050 ₺',
    price: '775 ₺',
    image: IMG.stones,
  },
];

/* ── Bento grid picks ───────────────────────────────────────────── */
const BENTO_LARGE = {
  label: 'HAFTALIK ÖZEL',
  expiresNote: 'Son 3 gün',
  title: 'Çiçekli Banyo Ritüeli',
  description: 'Değerli yağlar eşliğinde 30 dakikalık banyo ve ardından minerallerle canlandırıcı masaj.',
  originalPrice: '900 ₺',
  price: '600 ₺',
  image: IMG.bath,
};

const BENTO_SMALL = [
  {
    id: 'b1',
    label: 'Üye Avantajı',
    title: 'Üye Olana %20 Ekstra',
    description: 'İlk alışverişinizde tüm kampanyalara ek indirim.',
    icon: 'loyalty',
  },
  {
    id: 'b2',
    label: 'Sezonluk',
    title: 'Işıltı Ritüeli Koleksiyonu',
    description: 'Bahar koleksiyonundan 3 al, 1\'ini ücretsiz kazan.',
    icon: 'auto_awesome',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <img
          src={IMG.hero}
          alt="Bursa kampanyaları"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0c]/85 via-[#0a1a0c]/30 to-transparent" />

        {/* Hero content — bottom-left */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pb-16 md:pb-20">
          <p className="mb-4 text-xs font-label font-semibold uppercase tracking-widest text-white/55">
            Bursa için Özel Fırsatlar
          </p>
          <h1 className="font-headline italic text-6xl leading-[0.92] tracking-tight text-white mb-6 md:text-8xl">
            Şehrin En İyi<br />
            Kampanyaları.
          </h1>
          <p className="mb-8 max-w-md font-body text-base leading-relaxed text-white/65">
            Spa'lar, restoranlar, güzellik merkezleri ve daha fazlası — tek platformda, özel indirimlerle.
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

      {/* ── FEATURED CAMPAIGNS ────────────────────────────────────── */}
      <section className="bg-surface py-20">
        <div className="mx-auto max-w-7xl px-8">
          {/* Section header */}
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
              className="hidden items-center gap-1 text-sm font-label font-semibold text-on-surface-variant hover:text-primary hover:gap-2 transition-all sm:flex"
            >
              Tümünü Gör
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          {/* 3-column campaign cards */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED.map((c) => (
              <Link key={c.id} to="/kampanyalar" className="group block">
                <div className="overflow-hidden rounded-xl aspect-[4/3]">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="pt-5">
                  <p className="mb-1.5 text-xs font-label font-bold uppercase tracking-widest text-primary">
                    {c.tag}
                  </p>
                  <h3 className="font-headline text-xl text-on-surface mb-2">{c.title}</h3>
                  <p className="font-body text-sm text-on-surface-variant leading-relaxed mb-4">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="font-label text-sm text-on-surface-variant line-through">
                      {c.originalPrice}
                    </span>
                    <span className="font-headline text-2xl text-primary">{c.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENTO GRID — Haftanın Seçkileri ──────────────────────── */}
      <section className="bg-surface-container-low py-20">
        <div className="mx-auto max-w-7xl px-8">
          <div className="mb-10">
            <p className="mb-1 text-xs font-label font-bold uppercase tracking-widest text-primary">
              Bu Haftaya Özel
            </p>
            <h2 className="font-headline italic text-4xl text-on-surface">
              Haftanın Seçkileri
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Large card */}
            <div className="group relative overflow-hidden rounded-2xl md:col-span-7 min-h-[420px]">
              <img
                src={BENTO_LARGE.image}
                alt={BENTO_LARGE.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0c]/80 via-[#0a1a0c]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-sm bg-primary-container/30 px-2 py-0.5 text-[10px] font-label font-bold uppercase tracking-widest text-white/90 backdrop-blur-sm border border-white/20">
                    {BENTO_LARGE.label}
                  </span>
                  <span className="text-xs font-label text-white/55">{BENTO_LARGE.expiresNote}</span>
                </div>
                <h3 className="font-headline text-3xl text-white mb-2">{BENTO_LARGE.title}</h3>
                <p className="font-body text-sm text-white/65 leading-relaxed mb-6 max-w-sm">
                  {BENTO_LARGE.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-headline text-3xl text-white">{BENTO_LARGE.price}</span>
                    <span className="font-label text-sm text-white/50 line-through">{BENTO_LARGE.originalPrice}</span>
                  </div>
                  <Link
                    to="/kampanyalar"
                    className="flex items-center gap-1.5 rounded-full bg-white/15 px-5 py-2 text-sm font-label font-semibold text-white backdrop-blur-sm hover:bg-white/25 transition-colors"
                  >
                    İncele
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Two stacked small cards */}
            <div className="flex flex-col gap-6 md:col-span-5">
              {BENTO_SMALL.map((item) => (
                <Link
                  key={item.id}
                  to="/kampanyalar"
                  className="group flex flex-1 flex-col justify-between rounded-2xl bg-surface-container-lowest border border-outline-variant/20 p-8 shadow-sm hover:shadow-md transition-shadow min-h-[190px]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="rounded-sm bg-primary-fixed/50 px-2 py-0.5 text-[10px] font-label font-bold uppercase tracking-widest text-primary">
                      {item.label}
                    </span>
                    <span className="material-symbols-outlined text-[22px] text-primary-container">
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xl text-on-surface mb-2">{item.title}</h3>
                    <p className="font-body text-sm text-on-surface-variant leading-relaxed">{item.description}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-sm font-label font-semibold text-primary group-hover:gap-2 transition-all">
                    Detaylar
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PULLQUOTE ─────────────────────────────────────────────── */}
      <section className="bg-surface py-24 px-8">
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
        <div className="mx-auto max-w-2xl px-8 text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-5 block">spa</span>
          <p className="mb-2 text-xs font-label font-bold uppercase tracking-widest text-primary">
            Haberdar Ol
          </p>
          <h2 className="font-headline italic text-4xl text-on-surface mb-4">
            Fırsatları Kaçırma
          </h2>
          <p className="font-body text-on-surface-variant leading-relaxed mb-10">
            Yeni kampanyalar ve davetiye özel tekliflerden ilk sen haberdar ol.
          </p>
          <form className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="flex-1 rounded-full border border-outline-variant bg-surface px-6 py-3.5 text-sm font-label text-on-surface placeholder-on-surface-variant/40 outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
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
