import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';
import { useCities } from '../../features/campaigns/hooks/useCities';
import useHomeFilters from '../../features/campaigns/hooks/useHomeFilters';

/**
 * Mobil, scroll sonrası görünen kompakt navbar.
 *
 *  [ ☰ ]      Keşfet        [ 🔍 ]
 *           Bursa ▼
 */
export default function MobileMiniNavbar({ onOpenDrawer, onSearchClick, isHome = true }) {
  const { data: cities = [] } = useCities();
  const { cityId, update } = useHomeFilters();

  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef(null);

  const selectedCity = cities.find((c) => c.id === cityId);

  useEffect(() => {
    if (!cityOpen) return;
    const onClick = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setCityOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [cityOpen]);

  return (
    <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4">
      {/* Sol: hamburger */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Menüyü aç"
        className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
      >
        <span className="material-symbols-outlined text-2xl">menu</span>
      </button>

      {/* Orta: Keşfet + şehir */}
      <div ref={cityRef} className="relative flex min-w-0 flex-col items-center">
        <span className="font-headline text-sm font-extrabold leading-tight text-on-surface">
          Keşfet
        </span>

        {isHome ? (
          <button
            type="button"
            onClick={() => setCityOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={cityOpen}
            className="group mt-0.5 flex max-w-[60vw] items-center gap-0.5 font-label text-xs font-medium leading-none text-primary"
          >
            <span className="truncate underline decoration-primary/40 underline-offset-[3px] group-hover:decoration-primary">
              {selectedCity?.name ?? 'Şehir seç'}
            </span>
            <span
              className={cn(
                'material-symbols-outlined shrink-0 leading-none transition-transform',
                cityOpen && 'rotate-180',
              )}
              style={{ fontSize: '14px' }}
              aria-hidden
            >
              expand_more
            </span>
          </button>
        ) : (
          <span className="text-[11px] font-label font-medium text-on-surface-variant">
            Fırsatlar
          </span>
        )}

        {cityOpen && isHome && (
          <div
            role="listbox"
            className="absolute left-1/2 top-full z-50 mt-2 max-h-72 w-56 max-w-[calc(100vw-2rem)] -translate-x-1/2 overflow-y-auto rounded-xl bg-surface-container-lowest p-1.5 shadow-[0_20px_48px_rgba(14,13,49,0.18)] ring-1 ring-outline-variant/20"
          >
            {cities.map((c) => {
              const active = c.id === cityId;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    update({ cityId: c.id });
                    setCityOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-label transition-colors',
                    active
                      ? 'bg-primary-fixed font-semibold text-on-primary-fixed'
                      : 'text-on-surface hover:bg-surface-container-low',
                  )}
                >
                  <span
                    className={cn(
                      'material-symbols-outlined text-base',
                      active ? 'text-primary' : 'text-on-surface-variant',
                    )}
                  >
                    location_on
                  </span>
                  <span className="flex-1 truncate">{c.name}</span>
                  {active && (
                    <span className="material-symbols-outlined text-base text-primary">check</span>
                  )}
                </button>
              );
            })}
            {cities.length === 0 && (
              <div className="px-3 py-4 text-center text-xs font-label text-on-surface-variant/70">
                Yükleniyor…
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sağ: arama */}
      <button
        type="button"
        onClick={onSearchClick}
        aria-label="Ara"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-primary transition-colors hover:bg-primary-fixed-dim"
      >
        <span className="material-symbols-outlined text-xl">search</span>
      </button>
    </div>
  );
}
