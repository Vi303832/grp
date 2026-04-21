import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Input = forwardRef(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-label font-medium text-on-surface-variant">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-lg border px-4 py-2.5 text-sm font-label text-on-surface placeholder-on-surface-variant/40 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary',
          error
            ? 'border-error bg-error-container/20 focus:ring-error/30'
            : 'border-outline-variant bg-surface-container-lowest hover:border-outline',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs font-label text-error">{error}</p>}
    </div>
  );
});

export default Input;
