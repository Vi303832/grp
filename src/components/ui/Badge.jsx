import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-surface-container text-on-surface-variant',
  primary: 'bg-primary-fixed text-on-primary-container',
  success: 'bg-primary-fixed/60 text-primary',
  warning: 'bg-secondary-container text-on-secondary-container',
  danger: 'bg-error-container text-on-error-container',
  info: 'bg-tertiary-container/40 text-on-tertiary-container',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-label font-medium',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
