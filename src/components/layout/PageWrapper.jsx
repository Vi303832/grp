import { cn } from '../../lib/utils';

export default function PageWrapper({ children, className }) {
  return (
    <main className={cn('mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6', className)}>
      {children}
    </main>
  );
}
