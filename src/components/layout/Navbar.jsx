import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Button } from '../ui';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/giris');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-outline-variant/20 transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-headline italic text-2xl text-primary tracking-tight">GRP</span>
          <span className="hidden text-xs font-label font-medium text-on-surface-variant uppercase tracking-widest sm:block">
            Kampanya
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <NavLink
            to="/kampanyalar"
            className={({ isActive }) =>
              `font-label text-sm tracking-wide transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-on-surface/60 hover:text-on-surface'
              }`
            }
          >
            Kampanyalar
          </NavLink>
          <NavLink
            to="/isletme-basvurusu"
            className={({ isActive }) =>
              `font-label text-sm tracking-wide transition-colors duration-200 ${
                isActive ? 'text-primary' : 'text-on-surface/60 hover:text-on-surface'
              }`
            }
          >
            İşletme Başvurusu
          </NavLink>
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-container text-primary text-xs font-bold">
                  {userProfile?.displayName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                </span>
                <span className="hidden sm:block text-on-surface-variant">
                  {userProfile?.displayName ?? user.email}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-[0_8px_24px_rgba(28,28,25,0.12)]">
                  <Link to="/hesabim" className="block px-4 py-2.5 text-sm font-label text-on-surface hover:bg-surface-container-low rounded-t-xl" onClick={() => setMenuOpen(false)}>
                    Hesabım
                  </Link>
                  <Link to="/hesabim/siparislerim" className="block px-4 py-2.5 text-sm font-label text-on-surface hover:bg-surface-container-low" onClick={() => setMenuOpen(false)}>
                    Siparişlerim
                  </Link>
                  <Link to="/hesabim/kuponlarim" className="block px-4 py-2.5 text-sm font-label text-on-surface hover:bg-surface-container-low" onClick={() => setMenuOpen(false)}>
                    Kuponlarım
                  </Link>
                  {userProfile?.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2.5 text-sm font-label text-primary hover:bg-primary-fixed/30" onClick={() => setMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                  {userProfile?.role === 'business' && (
                    <Link to="/isletme" className="block px-4 py-2.5 text-sm font-label text-primary hover:bg-primary-fixed/30" onClick={() => setMenuOpen(false)}>
                      İşletme Paneli
                    </Link>
                  )}
                  <hr className="my-1 border-outline-variant/30" />
                  <button onClick={handleSignOut} className="w-full rounded-b-xl px-4 py-2.5 text-left text-sm font-label text-error hover:bg-error-container/30">
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/giris')}>
                Giriş Yap
              </Button>
              <Button variant="dark" size="sm" onClick={() => navigate('/kayit')}>
                Kayıt Ol
              </Button>
            </>
          )}

          <button
            className="flex md:hidden items-center justify-center rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              }
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-outline-variant/20 bg-surface-container-low px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-1">
            <NavLink to="/kampanyalar" className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-label font-medium ${isActive ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`} onClick={() => setMobileOpen(false)}>
              Kampanyalar
            </NavLink>
            <NavLink to="/isletme-basvurusu" className={({ isActive }) => `rounded-lg px-3 py-2.5 text-sm font-label font-medium ${isActive ? 'bg-primary-fixed text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`} onClick={() => setMobileOpen(false)}>
              İşletme Başvurusu
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
