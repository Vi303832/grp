import { useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { Button } from '../ui';

/**
 * Soldan açılan mobil drawer menü.
 *
 * Transition: backdrop fade + panel translate-x.
 * Kapanış: backdrop click, Esc, link tıklaması.
 */
export default function MobileDrawer({ open, onClose }) {
  const { user, userProfile, signOut } = useAuthStore();
  const navigate = useNavigate();

  // Scroll lock + Esc handler
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate('/giris');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          'fixed inset-0 z-60 bg-black/45 backdrop-blur-[2px] transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menü"
        className={cn(
          'fixed inset-y-0 left-0 z-61 flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-[12px_0_40px_rgba(14,13,49,0.18)] transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Üst bar */}
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <span className="font-headline text-xl font-extrabold tracking-tight text-primary">
              GRP
            </span>
            <span className="text-[10px] font-label font-medium uppercase tracking-widest text-on-surface-variant">
              Kampanya
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Kullanıcı kartı */}
        {user ? (
          <div className="mx-4 mb-3 rounded-2xl bg-primary-fixed/60 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-gradient text-on-primary text-base font-bold">
                {(userProfile?.displayName?.[0] ?? user.email[0]).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-label text-sm font-semibold text-on-surface">
                  {userProfile?.displayName ?? user.email.split('@')[0]}
                </p>
                <p className="truncate text-xs text-on-surface-variant">{user.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-4 mb-3 flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onClose();
                navigate('/giris');
              }}
            >
              Giriş Yap
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => {
                onClose();
                navigate('/kayit');
              }}
            >
              Kayıt Ol
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          <DrawerItem to="/" icon="home" label="Ana Sayfa" onClose={onClose} end />
          {user && (
            <>
              <DrawerItem to="/hesabim" icon="person" label="Hesabım" onClose={onClose} end />
              <DrawerItem
                to="/hesabim/siparislerim"
                icon="receipt_long"
                label="Siparişlerim"
                onClose={onClose}
              />
              <DrawerItem
                to="/hesabim/kuponlarim"
                icon="confirmation_number"
                label="Kuponlarım"
                onClose={onClose}
              />
              <DrawerItem
                to="/hesabim/favorilerim"
                icon="favorite"
                label="Favorilerim"
                onClose={onClose}
              />
            </>
          )}

          <DrawerSection label="Diğer" />

          <DrawerItem
            to="/isletme-basvurusu"
            icon="storefront"
            label="İşletme Başvurusu"
            onClose={onClose}
          />
          {userProfile?.role === 'admin' && (
            <DrawerItem
              to="/admin"
              icon="admin_panel_settings"
              label="Admin Paneli"
              onClose={onClose}
              highlight
            />
          )}
          {userProfile?.role === 'business' && (
            <DrawerItem
              to="/isletme"
              icon="dashboard"
              label="İşletme Paneli"
              onClose={onClose}
              highlight
            />
          )}
        </nav>

        {/* Alt bar */}
        {user && (
          <div className="border-t border-outline-variant/20 p-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-label font-medium text-error transition-colors hover:bg-error-container/30"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Çıkış Yap
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function DrawerItem({ to, icon, label, onClose, end = false, highlight = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        cn(
          'mt-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium transition-colors',
          isActive
            ? 'bg-primary-fixed text-on-primary-fixed'
            : highlight
              ? 'text-primary hover:bg-primary-fixed/40'
              : 'text-on-surface hover:bg-surface-container-high',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'material-symbols-outlined text-xl',
              isActive || highlight ? 'text-primary' : 'text-on-surface-variant',
            )}
          >
            {icon}
          </span>
          <span className="flex-1 truncate">{label}</span>
          {isActive && (
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          )}
        </>
      )}
    </NavLink>
  );
}

function DrawerSection({ label }) {
  return (
    <div className="mt-4 px-3 pb-1 text-[11px] font-label font-bold uppercase tracking-widest text-on-surface-variant/60">
      {label}
    </div>
  );
}
