import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useScrolled from '../../hooks/useScrolled';
import { cn } from '../../lib/utils';
import { Button } from '../ui';
import HomeCategoryStrip from './HomeCategoryStrip';
import HomeNavSearch from './HomeNavSearch';
import MobileMiniNavbar from './MobileMiniNavbar';
import MobileDrawer from './MobileDrawer';

export default function Navbar() {
  const { user, userProfile, role, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isHome = location.pathname === '/';
  const scrolled = useScrolled(80);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/giris');
  };

  const handleMiniSearch = () => {
    // Aşağı inmiş kullanıcıyı yukarı götür — tam arama barı görünür
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Smooth scroll bittikten sonra input'u focusla
    setTimeout(() => {
      const input = document.querySelector('header input[type="text"]');
      input?.focus();
    }, 450);
  };

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 bg-surface/90 pt-3 backdrop-blur-md transition-transform duration-300 sm:pt-4',
          // Mobilde scroll sonrası yukarı kaç
          scrolled && 'max-md:-translate-y-full max-md:pointer-events-none max-md:opacity-0',
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 pb-3 sm:gap-4 sm:px-6">

          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <span className="font-headline font-extrabold text-xl text-primary tracking-tight sm:text-2xl">
              GRP
            </span>
            <span className="hidden text-[10px] font-label font-medium text-on-surface-variant uppercase tracking-widest lg:block">
              Kampanya
            </span>
          </Link>

          {/* Desktop search (yalnızca ana sayfa) */}
          {isHome && (
            <div className="hidden flex-1 md:flex md:max-w-2xl md:mx-auto">
              <HomeNavSearch className="w-full" />
            </div>
          )}
          {!isHome && <div className="flex-1" />}

          {/* Auth area */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {user ? (
              <div className="relative z-50">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-2 py-1.5 text-sm font-label font-medium text-on-surface hover:shadow-md transition-all sm:px-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-xs font-bold">
                    {userProfile?.displayName?.[0]?.toUpperCase() ??
                      user.email[0].toUpperCase()}
                  </span>
                  <span className="hidden text-on-surface lg:block">
                    {userProfile?.displayName ?? user.email}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant/70">
                    menu
                  </span>
                </button>

                {menuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setMenuOpen(false)}
                      aria-label="Close menu"
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2 shadow-lg z-50 overflow-hidden">
                      <div className="px-3 py-3 border-b border-outline-variant/20 mb-2">
                        <div className="font-headline font-bold text-sm text-on-surface truncate">
                          {userProfile?.displayName || 'Kullanıcı'}
                        </div>
                        <div className="font-label text-xs text-on-surface-variant truncate">
                          {user.email}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <Link
                          to="/hesabim"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
                          Hesabım
                        </Link>
                        <Link
                          to="/hesabim/siparislerim"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">receipt_long</span>
                          Siparişlerim
                        </Link>
                        <Link
                          to="/hesabim/kuponlarim"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant">confirmation_number</span>
                          Kuponlarım
                        </Link>
                        
                        {role === 'admin' && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-primary hover:bg-primary-fixed/30 transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                            Admin Panel
                          </Link>
                        )}
                        {role === 'business' && (
                          <Link
                            to="/isletme"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-primary hover:bg-primary-fixed/30 transition-colors"
                            onClick={() => setMenuOpen(false)}
                          >
                            <span className="material-symbols-outlined text-[20px]">store</span>
                            İşletme Paneli
                          </Link>
                        )}

                        <div className="my-1 h-px bg-surface-container" />
                        
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left text-sm font-label font-medium text-error hover:bg-error-container/50 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">logout</span>
                          Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate('/giris')}
                >
                  Giriş Yap
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/kayit')}
                >
                  Kayıt Ol
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobil arama (yalnızca ana sayfa) */}
        {isHome && (
          <div className="px-3 pb-2 md:hidden">
            <HomeNavSearch />
          </div>
        )}

        {/* Kategori şeridi — PC + mobil için scrollable, sadece ana sayfa */}
        {isHome && (
          <div className="bg-surface">
            <div className="mx-auto max-w-7xl px-3 sm:px-4">
              <HomeCategoryStrip />
            </div>
          </div>
        )}
      </header>

      {/* Mobil kompakt navbar — scroll sonrası görünür */}
      <div
        className={cn(
          'fixed inset-x-0 top-0 z-40 bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-out md:hidden',
          scrolled
            ? 'translate-y-0 shadow-[0_6px_20px_rgba(14,13,49,0.08)]'
            : '-translate-y-full',
        )}
      >
        <MobileMiniNavbar
          isHome={isHome}
          onOpenDrawer={() => setDrawerOpen(true)}
          onSearchClick={handleMiniSearch}
        />
      </div>

      {/* Soldan açılan mobil menü */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
