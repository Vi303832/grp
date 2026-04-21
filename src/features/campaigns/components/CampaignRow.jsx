import { useEffect, useRef, useState } from 'react';
import CampaignCard from './CampaignCard';
import { cn } from '../../../lib/utils';

/**
 * Yatay kaydırmalı kampanya şeridi.
 *
 * Netflix / Trendyol Go tarzı bir kategori satırı: başlık + sağ taraftan
 * ok butonları + snap-scroll ile kayan kartlar.
 *
 * Props:
 *   - title        : Şerit başlığı
 *   - subtitle     : İsteğe bağlı üst satır (kategori adı vs.)
 *   - icon         : Material icon adı (başlık yanında görünür)
 *   - campaigns    : gösterilecek kampanyalar
 *   - onSeeAll     : "Tümünü gör" tıklandığında çağrılır (yoksa link göstermez)
 */
export default function CampaignRow({
  title,
  subtitle,
  icon,
  campaigns = [],
  onSeeAll,
  className,
}) {
  const scrollerRef = useRef(null);
  // İlk açılışta sağ butonun hemen görünmesi için canNext=true başlat.
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    // Tam olarak bir kart kadar kaydır: ilk kartın genişliği + gap
    const firstCard = el.firstElementChild;
    let step = el.clientWidth * 0.9;
    if (firstCard) {
      const styles = getComputedStyle(el);
      const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
      step = firstCard.getBoundingClientRect().width + gap;
    }
    const delta = step * (dir === 'next' ? 1 : -1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => {
      setCanPrev(el.scrollLeft > 2);
      setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    };
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [campaigns.length]);

  if (!campaigns.length) return null;

  return (
    <section className={cn('relative min-w-0', className)}>
      <div className="mb-3 flex items-end justify-between gap-2 px-1 sm:mb-4 sm:gap-3">
        <div className="min-w-0">
          {subtitle && (
            <p className="mb-0.5 truncate text-[10px] font-label font-bold uppercase tracking-widest text-primary sm:mb-1 sm:text-[11px]">
              {subtitle}
            </p>
          )}
          <h3 className="flex items-center gap-1.5 font-headline font-extrabold text-base leading-tight text-on-surface sm:gap-2 sm:text-2xl md:text-3xl">
            {icon && (
              <span className="material-symbols-outlined text-lg not-italic text-primary sm:text-2xl">
                {icon}
              </span>
            )}
            <span className="truncate">{title}</span>
          </h3>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {onSeeAll && (
            <button
              type="button"
              onClick={onSeeAll}
              className="hidden rounded-full border border-outline-variant/60 bg-white px-3 py-1.5 text-xs font-label font-medium text-on-surface-variant transition hover:border-primary hover:text-primary sm:inline-flex"
            >
              Tümünü gör
            </button>
          )}
          {/* PC'de header'da prev/next butonları */}
          <div className="hidden gap-1 sm:flex">
            <ScrollButton direction="prev" onClick={() => scroll('prev')} disabled={!canPrev} />
            <ScrollButton direction="next" onClick={() => scroll('next')} disabled={!canNext} />
          </div>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 pl-3 pr-16 sm:gap-4 sm:px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="w-[45%] shrink-0 snap-start xs:w-[40%] sm:w-[42%] md:w-[33%] lg:w-[26%] xl:w-[21%]"
            >
              <CampaignCard campaign={c} rowMode />
            </div>
          ))}
        </div>

        {/* Mobil — sonraki kart butonu (ilk kartın hemen sağında) */}
        <button
          type="button"
          onClick={() => scroll('next')}
          aria-label="Sonraki kart"
          disabled={!canNext}
          className={cn(
            'absolute right-2 top-1/2 z-40 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-primary text-on-primary shadow-[0_8px_20px_rgba(26,20,107,0.55)] transition-all duration-200 sm:hidden',
            'active:scale-95 disabled:opacity-40',
          )}
        >
          <span className="material-symbols-outlined text-2xl">chevron_right</span>
        </button>
      </div>

      {onSeeAll && (
        <div className="mt-2 flex justify-end px-1 sm:hidden">
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs font-label font-semibold text-primary"
          >
            Tümünü gör →
          </button>
        </div>
      )}
    </section>
  );
}

function ScrollButton({ direction, onClick, disabled = false }) {
  const label = direction === 'next' ? 'Sonraki' : 'Önceki';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/60 bg-white text-on-surface-variant transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-outline-variant/60 disabled:hover:text-on-surface-variant"
    >
      <span className="material-symbols-outlined text-lg">
        {direction === 'next' ? 'chevron_right' : 'chevron_left'}
      </span>
    </button>
  );
}
