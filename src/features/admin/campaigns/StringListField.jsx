import { useState } from 'react';
import { cn } from '../../../lib/utils';
import { FormField } from '../components';

/**
 * Basit string dizisi editörü.
 * Enter'a bas → chip olarak eklenir. X'e bas → silinir.
 *
 * Kullanım:
 *   <StringListField
 *     label="Öne Çıkanlar"
 *     value={watch('highlights')}
 *     onChange={(next) => setValue('highlights', next, { shouldValidate: true })}
 *   />
 */
export default function StringListField({
  label,
  hint,
  placeholder = 'Madde ekleyip Enter basın…',
  value = [],
  onChange,
  error,
  max = 20,
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (value.length >= max) return;
    onChange([...value, t]);
    setDraft('');
  };

  const remove = (idx) => {
    const next = value.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <FormField label={label} hint={hint} error={error}>
      <div className="flex flex-wrap gap-2">
        {value.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary-container/50 px-3 py-1 text-xs font-medium text-on-primary-container"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-full p-0.5 hover:bg-on-primary-container/10"
              aria-label="Kaldır"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 text-sm text-on-surface placeholder-on-surface-variant/40 transition-all hover:border-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40',
          )}
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/15"
        >
          Ekle
        </button>
      </div>
      <p className="text-xs text-on-surface-variant/80">
        {value.length} / {max}
      </p>
    </FormField>
  );
}
