import { cn } from '../../../lib/utils';

/**
 * Kampanya sayfası için yatay kategori filtresi.
 * "Tümü" seçeneği + her kategori için bir pill button.
 */
export default function CategoryFilter({
  categories = [],
  value = 'all',
  onChange,
  className,
}) {
  const base =
    'px-6 py-2 rounded-full border font-label text-sm whitespace-nowrap transition-all duration-200';
  const active =
    'border-primary bg-primary text-on-primary shadow-sm';
  const inactive =
    'border-outline-variant bg-transparent text-on-surface-variant hover:border-primary hover:text-primary';

  return (
    <div
      className={cn(
        'flex w-full flex-nowrap gap-3 overflow-x-auto pb-2 md:flex-wrap md:justify-center md:overflow-visible',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onChange?.('all')}
        className={cn(base, value === 'all' ? active : inactive)}
      >
        Tümü
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onChange?.(cat.id)}
          className={cn(base, value === cat.id ? active : inactive)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
