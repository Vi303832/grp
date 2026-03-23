import { cn } from '../../lib/utils';

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-gray-100 bg-white shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return <div className={cn('border-b border-gray-100 px-5 py-4', className)}>{children}</div>;
}

export function CardBody({ children, className }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('border-t border-gray-100 px-5 py-3', className)}>{children}</div>
  );
}
