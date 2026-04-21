import { cn } from '../../lib/utils';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('border-b border-outline-variant/20 px-5 py-4', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('border-t border-outline-variant/20 px-5 py-3', className)}>
      {children}
    </div>
  );
}
