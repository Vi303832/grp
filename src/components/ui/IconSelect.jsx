import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * İkonlu, styled dropdown. Native `<select>` yerine kullanılır.
 *
 * Özellikler:
 *  - Her option için opsiyonel `icon` (material symbol adı)
 *  - Seçili option'ın ikonu varsa trigger'da o gösterilir, yoksa `triggerIcon`
 *  - Click-outside + Esc ile kapanır
 *  - Klavye: ↑/↓ ile gezinme, Enter ile seçim
 *  - A11y: role=listbox/option, aria-selected, aria-expanded
 *
 * Props:
 *   value       : seçili option id
 *   onChange(id): seçim callback
 *   options     : [{ id, label, icon? }]
 *   triggerIcon : trigger'da gösterilecek varsayılan ikon
 *   ariaLabel   : erişilebilirlik etiketi
 *   menuAlign   : "left" | "right" — popover hizalama (mobilde içe düşsün diye)
 */
export default function IconSelect({
  value,
  options = [],
  onChange,
  triggerIcon,
  ariaLabel,
  className,
  menuClassName,
  menuAlign = 'left',
  placeholder = 'Seç…',
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const itemRefs = useRef([]);

  const selectedIndex = options.findIndex((o) => o.id === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const displayIcon = selected?.icon ?? triggerIcon;
  const displayLabel = selected?.label ?? placeholder;

  // Açılış/kapanış efektleri
  useEffect(() => {
    if (!open) return;

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);

    const onClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + options.length) % options.length);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        const opt = options[activeIndex];
        if (opt) {
          onChange?.(opt.id);
          setOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeIndex, options.length]);

  useEffect(() => {
    if (open && activeIndex >= 0 && itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [open, activeIndex]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex w-full items-center gap-1.5 rounded-full px-2 py-1.5 text-left text-xs font-label text-on-surface outline-none transition-colors hover:bg-surface-container-highest focus-visible:bg-surface-container-highest md:text-sm"
      >
        {displayIcon && (
          <span className="material-symbols-outlined shrink-0 text-sm text-primary md:text-base">
            {displayIcon}
          </span>
        )}
        <span className="flex-1 truncate font-semibold">{displayLabel}</span>
        <span
          className={cn(
            'material-symbols-outlined shrink-0 text-sm text-on-surface-variant/60 transition-transform',
            open && 'rotate-180',
          )}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute top-full z-50 mt-2 max-h-80 w-64 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-xl bg-surface-container-lowest p-1.5 shadow-[0_20px_48px_rgba(14,13,49,0.18)] ring-1 ring-outline-variant/20',
            menuAlign === 'right' ? 'right-0' : 'left-0',
            menuClassName,
          )}
        >
          {options.map((opt, i) => {
            const isSelected = opt.id === value;
            const isActive = i === activeIndex;
            return (
              <button
                key={opt.id}
                ref={(el) => (itemRefs.current[i] = el)}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => {
                  onChange?.(opt.id);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-label transition-colors',
                  isSelected
                    ? 'bg-primary-fixed font-semibold text-on-primary-fixed'
                    : isActive
                      ? 'bg-surface-container-low text-on-surface'
                      : 'text-on-surface hover:bg-surface-container-low',
                )}
              >
                {opt.icon ? (
                  <span
                    className={cn(
                      'material-symbols-outlined shrink-0 text-base',
                      isSelected ? 'text-primary' : 'text-on-surface-variant',
                    )}
                  >
                    {opt.icon}
                  </span>
                ) : (
                  <span className="w-4 shrink-0" />
                )}
                <span className="flex-1 truncate">{opt.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined shrink-0 text-base text-primary">
                    check
                  </span>
                )}
              </button>
            );
          })}
          {options.length === 0 && (
            <div className="px-3 py-4 text-center text-xs font-label text-on-surface-variant/70">
              Seçenek yok
            </div>
          )}
        </div>
      )}
    </div>
  );
}
