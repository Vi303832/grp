import { useSearchParams } from 'react-router-dom';

export const DEFAULT_CITY = 'bursa';

/**
 * Ana sayfa filtre state'ini URL search-params üzerinden yönetir.
 *
 * Birden fazla bileşen (Navbar'daki search, kategori şeridi, HomePage grid)
 * aynı URL'i okuduğu için state otomatik senkron.
 */
export default function useHomeFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const cityId = searchParams.get('sehir') ?? DEFAULT_CITY;
  const categoryId = searchParams.get('kategori') ?? 'all';
  const query = searchParams.get('q') ?? '';

  const update = (patch, { replace = true } = {}) => {
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

  return { cityId, categoryId, query, update };
}
