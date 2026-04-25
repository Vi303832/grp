import { Link } from 'react-router-dom';
import useAuthStore from '../../../store/authStore';

export default function AdminHeader({ onMenuClick }) {
  const user = useAuthStore((s) => s.user);
  const userProfile = useAuthStore((s) => s.userProfile);
  const signOut = useAuthStore((s) => s.signOut);

  const displayName = userProfile?.displayName || user?.displayName || user?.email || 'Admin';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b border-outline-variant/20 bg-surface-container-lowest px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container md:hidden"
          aria-label="Menüyü aç"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary">
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          <span className="hidden sm:inline">Siteyi Görüntüle</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-on-surface">{displayName}</span>
          <span className="text-[11px] text-on-surface-variant">Admin</span>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-gradient text-sm font-semibold text-on-primary">
          {initial}
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
          aria-label="Çıkış yap"
          title="Çıkış yap"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>
    </header>
  );
}
