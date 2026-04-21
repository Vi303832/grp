import HeroSearch from '../../features/campaigns/components/HeroSearch';
import { useCategories } from '../../features/campaigns/hooks/useCategories';
import { useCities } from '../../features/campaigns/hooks/useCities';
import useHomeFilters from '../../features/campaigns/hooks/useHomeFilters';

/**
 * Navbar içine yerleştirilen kompakt ana sayfa arama pill'i.
 *
 * URL search-params üzerinden çalışır — HomePage ile aynı state'i paylaşır,
 * farklı yerlerden render edilse bile senkrondur.
 */
export default function HomeNavSearch({ className }) {
  const { cityId, categoryId, query, update } = useHomeFilters();
  const { data: cities = [] } = useCities();
  const { data: categories = [] } = useCategories();

  return (
    <div className={className}>
      <HeroSearch
        dense
        cities={cities}
        categories={categories}
        cityId={cityId}
        categoryId={categoryId}
        query={query}
        onCityChange={(v) => update({ cityId: v })}
        onCategoryChange={(v) => update({ categoryId: v })}
        onQueryChange={(v) => update({ query: v })}
      />
    </div>
  );
}
