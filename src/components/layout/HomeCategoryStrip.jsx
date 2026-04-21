import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { useCategories } from '../../features/campaigns/hooks/useCategories';
import useHomeFilters from '../../features/campaigns/hooks/useHomeFilters';

/**
 * Navbar altındaki yatay kaydırmalı kategori şeridi.
 *
 * - PC: her iki yanda gradient fade + sol/sağ chevron butonu
 * - Mobil: dokunarak kaydırma + ince fade göstergeleri (kaydırılabilir olduğunu sezdirir)
 */
export default function HomeCategoryStrip({ className }) {
  const { categoryId, update } = useHomeFilters();
  const { data: categories = [] } = useCategories();

  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const measure = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    measure();
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = () => measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [categories.length]);

  // Aktif chip'i görünür alana kaydır (URL'den gelen değişikliklerde faydalı)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const active = el.querySelector('[data-active="true"]');
    if (active) {
      active.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }
  }, [categoryId]);

  const scroll = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const delta = el.clientWidth * 0.8 * (dir === 'next' ? 1 : -1);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative', className)}>
      {/* Sol fade + buton */}
      <div
        className={cn(
          'pointer-events-none absolute left-0 top-0 z-10 flex h-full items-center justify-start bg-linear-to-r from-surface via-surface/80 to-transparent transition-opacity',
          'w-9 sm:w-11 md:w-14 md:pl-1',
          canPrev ? 'opacity-100' : 'opacity-0',
        )}
      >
        <button
          type="button"
          onClick={() => scroll('prev')}
          aria-label="Önceki kategoriler"
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-on-surface shadow-sm transition hover:bg-primary hover:text-on-primary md:h-9 md:w-9"
        >
          <span className="material-symbols-outlined text-base md:text-lg">chevron_left</span>
        </button>
      </div>

      {/* Sağ fade + buton */}
      <div
        className={cn(
          'pointer-events-none absolute right-0 top-0 z-10 flex h-full items-center justify-end bg-linear-to-l from-surface via-surface/80 to-transparent transition-opacity',
          'w-9 sm:w-11 md:w-14 md:pr-1',
          canNext ? 'opacity-100' : 'opacity-0',
        )}
      >
        <button
          type="button"
          onClick={() => scroll('next')}
          aria-label="Sonraki kategoriler"
          className="pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-on-surface shadow-sm transition hover:bg-primary hover:text-on-primary md:h-9 md:w-9"
        >
          <span className="material-symbols-outlined text-base md:text-lg">chevron_right</span>
        </button>
      </div>

      {/* Scroll alanı */}
      <div
        ref={scrollerRef}
        className="flex touch-pan-x gap-1.5 overflow-x-auto overflow-y-hidden scroll-smooth py-1.5 sm:gap-2 sm:py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Chip
          active={categoryId === 'all'}
          onClick={() => update({ categoryId: 'all' })}
          icon="grid_view"
          label="Tümü"
        />
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            active={categoryId === cat.id}
            onClick={() => update({ categoryId: cat.id })}
            icon={cat.icon}
            label={cat.name}
          />
        ))}
        {/* Sağda ekstra boşluk — son chip'in fade altında sıkışmasını engeller */}
        <div className="w-2 shrink-0 sm:w-4" aria-hidden />
      </div>
    </div>
  );
}

function Chip({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active || undefined}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-label font-medium transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
        active
          ? 'bg-primary-gradient text-on-primary'
          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-primary',
      )}
    >
      {icon && <span className="material-symbols-outlined text-sm sm:text-base">{icon}</span>}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}
