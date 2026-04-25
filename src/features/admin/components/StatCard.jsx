import { cn } from '../../../lib/utils';

const toneMap = {
  primary: 'bg-primary-fixed text-on-primary-fixed',
  tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  secondary: 'bg-secondary-container text-on-secondary-container',
  success: 'bg-primary-fixed/60 text-primary',
  danger: 'bg-error-container text-on-error-container',
};

export default function StatCard({
  label,
  value,
  icon,
  tone = 'primary',
  helper,
  loading = false,
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          toneMap[tone],
        )}
      >
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
          {label}
        </span>
        {loading ? (
          <div className="h-7 w-16 animate-pulse rounded bg-surface-container" />
        ) : (
          <span className="text-2xl font-headline font-bold text-on-surface">
            {value}
          </span>
        )}
        {helper && (
          <span className="text-[11px] text-on-surface-variant">{helper}</span>
        )}
      </div>
    </div>
  );
}
