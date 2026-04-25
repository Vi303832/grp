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

function SidebarLink({ to, label, icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium transition-colors',
          isActive
            ? 'bg-primary-fixed text-on-primary-fixed'
            : 'text-on-surface-variant hover:bg-surface-container',
        )
      }
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-outline-variant/20 bg-surface-container-lowest md:flex md:flex-col">
      <div className="flex h-16 items-center gap-2 px-5 border-b border-outline-variant/20">
        <span className="material-symbols-outlined text-primary">shield_person</span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-headline font-bold text-on-surface">GRP Admin</span>
          <span className="text-[11px] text-on-surface-variant">Yönetim Paneli</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} />
        ))}
      </nav>
      <div className="px-5 py-3 text-[11px] text-on-surface-variant/70 border-t border-outline-variant/20">
        MVP · v0.1
      </div>
    </aside>
  );
}
