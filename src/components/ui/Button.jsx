import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-primary-gradient text-on-primary hover:opacity-90',
  secondary: 'bg-secondary-container hover:bg-secondary-fixed-dim text-on-secondary-container',
  tertiary: 'bg-transparent text-primary hover:bg-primary-fixed/40',
  outline: 'border border-primary text-primary hover:bg-primary-fixed/40',
  ghost: 'text-on-surface-variant hover:bg-surface-container',
  'ghost-white': 'border border-white/40 text-white hover:bg-white/10',
  dark: 'bg-dark-surface text-on-dark-surface hover:bg-dark-surface-raised',
  danger: 'bg-error hover:opacity-90 text-on-error',
};

const sizes = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2 text-sm',
  lg: 'px-7 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-label font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
