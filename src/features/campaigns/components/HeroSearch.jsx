import { useEffect, useMemo, useRef, useState } from 'react';
import IconSelect from '../../../components/ui/IconSelect';

/**
 * Ana sayfanın arama kutusu. Tamamen kontrollü.
 *
 * Üst bileşen her filtre için ayrı bir handler geçer — böylece debounce
 * edilen arama input'u şehir/kategori değişikliklerini ezmez.
 */
export default function HeroSearch({
  cities = [],
  categories = [],
  cityId = '',
  categoryId = 'all',
  query = '',
  onCityChange,
  onCategoryChange,
  onQueryChange,
  dense = false,
}) {
  const [localQuery, setLocalQuery] = useState(query);
  const lastCommittedQuery = useRef(query);

  useEffect(() => {
    if (query !== lastCommittedQuery.current) {
      lastCommittedQuery.current = query;
      setLocalQuery(query);
    }
  }, [query]);

  useEffect(() => {
    if (localQuery === lastCommittedQuery.current) return;
    const handle = setTimeout(() => {
      lastCommittedQuery.current = localQuery;
      onQueryChange?.(localQuery);
    }, 300);
    return () => clearTimeout(handle);
  }, [localQuery, onQueryChange]);

  const commitQuery = (q) => {
    setLocalQuery(q);
    lastCommittedQuery.current = q;
    onQueryChange?.(q);
  };

  const cityOptions = useMemo(
    () => cities.map((c) => ({ id: c.id, label: c.name })),
    [cities],
  );

  const categoryOptions = useMemo(
    () => [
      { id: 'all', label: 'Tüm Kategoriler', icon: 'grid_view' },
      ...categories.map((c) => ({ id: c.id, label: c.name, icon: c.icon })),
    ],
    [categories],
  );

  // ── DENSE (Navbar) ───────────────────────────────────────────────────
  if (dense) {
    return (
      <div className="w-full">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex w-full flex-col gap-1.5 md:flex-row md:items-stretch md:gap-0 md:rounded-full md:bg-surface-container-high md:p-1"
        >
          {/* Mobil: iki select yan yana */}
          <div className="flex gap-1.5 md:contents">
            <div className="flex-1 rounded-full bg-surface-container-high md:flex-initial md:rounded-none md:bg-transparent md:w-40 md:border-r md:border-outline-variant/30">
              <IconSelect
                value={cityId}
                options={cityOptions}
                onChange={onCityChange}
                triggerIcon="location_on"
                ariaLabel="Şehir seç"
                placeholder={cities.length === 0 ? 'Yükleniyor…' : 'Şehir seç'}
              />
            </div>

            <div className="flex-1 rounded-full bg-surface-container-high md:flex-initial md:rounded-none md:bg-transparent md:w-44 md:border-r md:border-outline-variant/30">
              <IconSelect
                value={categoryId}
                options={categoryOptions}
                onChange={onCategoryChange}
                triggerIcon="grid_view"
                ariaLabel="Kategori seç"
              />
            </div>
          </div>

          {/* Mobil: input + Ara aynı satırda */}
          <div className="flex items-stretch gap-1.5 rounded-full bg-surface-container-high p-1 md:contents md:gap-0 md:p-0">
            <label className="flex flex-1 items-center gap-2 px-2">
              <span className="material-symbols-outlined text-base text-on-surface-variant">search</span>
              <input
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                type="text"
                placeholder="Ara…"
                className="w-full min-w-0 bg-transparent py-1.5 text-xs font-label outline-none placeholder:text-on-surface-variant/60 md:text-sm"
              />
              {localQuery && (
                <button
                  type="button"
                  onClick={() => commitQuery('')}
                  className="rounded-full p-0.5 text-on-surface-variant/60 hover:bg-surface-container-highest"
                  aria-label="Temizle"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </label>

            <button
              type="submit"
              aria-label="Ara"
              className="bg-primary-gradient flex shrink-0 items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-label font-semibold text-on-primary transition-opacity hover:opacity-90 md:px-4 md:py-2 md:text-sm"
            >
              <span className="material-symbols-outlined text-sm md:text-base">search</span>
              <span className="hidden sm:inline">Ara</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── HERO (büyük kullanım — rezerve, şu an kullanılmıyor) ─────────────
  return null;
}
