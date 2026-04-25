import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../lib/utils';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/kampanyalar', label: 'Kampanyalar', icon: 'sell' },
  { to: '/admin/siparisler', label: 'Siparişler', icon: 'receipt_long' },
  { to: '/admin/kuponlar', label: 'Kuponlar', icon: 'confirmation_number' },
  { to: '/admin/basvurular', label: 'Başvurular', icon: 'inbox' },
  { to: '/admin/ana-sayfa', label: 'Ana Sayfa', icon: 'home' },
  { to: '/admin/kullanicilar', label: 'Kullanıcılar', icon: 'group' },
];

export default function AdminMobileDrawer({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface-container-lowest shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-outline-variant/20 px-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">shield_person</span>
            <span className="text-sm font-headline font-bold text-on-surface">GRP Admin</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
            aria-label="Kapat"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-label font-medium transition-colors',
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : 'text-on-surface-variant hover:bg-surface-container',
                )
              }
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
}
