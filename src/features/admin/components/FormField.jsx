import { forwardRef } from 'react';
import { cn } from '../../../lib/utils';

/**
 * react-hook-form ile uyumlu form alanları.
 *
 *   <FormField label="Başlık" error={errors.title?.message}>
 *     <input {...register('title')} />
 *   </FormField>
 *
 * Veya hazır input'larla:
 *   <TextField label="Başlık" error={errors.title?.message} {...register('title')} />
 */

export function FormField({ label, hint, error, required, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-label font-medium text-on-surface-variant">
          {label}
          {required && <span className="ml-0.5 text-error">*</span>}
        </label>
      )}
      {children}
      {hint && !error && (
        <p className="text-xs text-on-surface-variant/80">{hint}</p>
      )}
      {error && <p className="text-xs font-label text-error">{error}</p>}
    </div>
  );
}

const inputBaseClasses =
  'w-full rounded-lg border px-4 py-2.5 text-sm font-label text-on-surface placeholder-on-surface-variant/40 transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary';

const inputStateClasses = (hasError) =>
  hasError
    ? 'border-error bg-error-container/20 focus:ring-error/30'
    : 'border-outline-variant bg-surface-container-lowest hover:border-outline';

export const TextField = forwardRef(function TextField(
  { label, hint, error, required, className, ...props },
  ref,
) {
  return (
    <FormField label={label} hint={hint} error={error} required={required}>
      <input
        ref={ref}
        className={cn(inputBaseClasses, inputStateClasses(!!error), className)}
        {...props}
      />
    </FormField>
  );
});

export const TextareaField = forwardRef(function TextareaField(
  { label, hint, error, required, className, rows = 4, ...props },
  ref,
) {
  return (
    <FormField label={label} hint={hint} error={error} required={required}>
      <textarea
        ref={ref}
        rows={rows}
        className={cn(inputBaseClasses, inputStateClasses(!!error), 'resize-y', className)}
        {...props}
      />
    </FormField>
  );
});

export const SelectField = forwardRef(function SelectField(
  { label, hint, error, required, className, children, ...props },
  ref,
) {
  return (
    <FormField label={label} hint={hint} error={error} required={required}>
      <select
        ref={ref}
        className={cn(inputBaseClasses, inputStateClasses(!!error), 'pr-8', className)}
        {...props}
      >
        {children}
      </select>
    </FormField>
  );
});

export default FormField;
