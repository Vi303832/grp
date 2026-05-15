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
<<<<<<< HEAD
              <div className="relative">
                <Link
                  to="/hesabim"
                  className="flex md:hidden items-center rounded-full p-1.5 text-on-surface transition-colors hover:bg-surface-container"
                  aria-label="Hesabım"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-xs font-bold">
                    {userProfile?.displayName?.[0]?.toUpperCase() ??
                      user.email[0].toUpperCase()}
                  </span>
                </Link>

=======
              <div className="relative z-50">
>>>>>>> 10ef69004ca0b11cbbfe8616546584783f47f935
                  utton
                  pe="button"
                  Click={() => setMenuOpen((v) => !v)}
<<<<<<< HEAD
  assName = "hidden md:flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors"
=======
                  className="flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface px-2 py-1.5 text-sm font-label font-medium text-on-surface hover:shadow-md transition-all sm:px-3"
>>>>>>> 10ef69004ca0b11cbbfe8616546584783f47f935
                
                  pan className = "flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-xs font-bold" >
    serProfile?.displayName?.[0]?.toUpperCase() ??
    er.email[0].toUpperCase()
}
span >
  pan className = "hidden text-on-surface lg:block" >
    serProfile?.displayName ?? user.email}
span >
  pan className = "material-symbols-outlined text-[18px] text-on-surface-variant/70" >
    nu
span >
  button >

  enuOpen && (
<<<<<<< HEAD
    iv className = "absolute right-0 mt-2 hidden w-52 rounded-xl bg-surface-container-lowest shadow-[0_8px_24px_rgba(28,28,25,0.12)] md:block" >
      ink
                      ="/hesabim"
assName = "block rounded-t-xl px-4 py-2.5 text-sm font-label text-on-surface hover:bg-surface-container-low"
=======
                  <>
                    <div
                      className="fixed inset-0 z-40"
>>>>>>> 10ef69004ca0b11cbbfe8616546584783f47f935
Click = {() => setMenuOpen(false)}
ia - label="Close menu"
                    
                    iv className = "absolute right-0 top-full mt-2 w-64 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2 shadow-lg z-50 overflow-hidden" >
  iv className = "px-3 py-3 border-b border-outline-variant/20 mb-2" >
    iv className = "font-headline font-bold text-sm text-on-surface truncate" >
      serProfile?.displayName || 'Kullanıcı'}
div >
  iv className = "font-label text-xs text-on-surface-variant truncate" >
    ser.email}
div >
  div >

  iv className = "flex flex-col gap-1" >
    ink
                          ="/hesabim"
assName = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors"
Click = {() => setMenuOpen(false)}
                        
                          pan className = "material-symbols-outlined text-[20px] text-on-surface-variant" > person</span >
  sabım
Link >
  ink
                          ="/hesabim/siparislerim"
assName = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors"
Click = {() => setMenuOpen(false)}
                        
                          pan className = "material-symbols-outlined text-[20px] text-on-surface-variant" > receipt_long</span >
  parişlerim
Link >
  ink
                          ="/hesabim/kuponlarim"
assName = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-on-surface hover:bg-surface-container transition-colors"
Click = {() => setMenuOpen(false)}
                        
                          pan className = "material-symbols-outlined text-[20px] text-on-surface-variant" > confirmation_number</span >
  ponlarım
Link >

  ole === 'admin' && (
    ink
    = "/admin"
                            assName = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-primary hover:bg-primary-fixed/30 transition-colors"
Click = {() => setMenuOpen(false)}
                          
                            pan className = "material-symbols-outlined text-[20px]" > admin_panel_settings</span >
  min Panel
Link >

  ole === 'business' && (
    ink
    = "/isletme"
                            assName = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-label font-medium text-primary hover:bg-primary-fixed/30 transition-colors"
Click = {() => setMenuOpen(false)}
                          
                            pan className = "material-symbols-outlined text-[20px]" > store</span >
  letme Paneli
Link >


  iv className = "my-1 h-px bg-surface-container" />

    utton
Click = { handleSignOut }
assName = "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left text-sm font-label font-medium text-error hover:bg-error-container/50 transition-colors"
                        
                          pan className = "material-symbols-outlined text-[20px]" > logout</span >
  kış Yap
button >
  div >
  div >
                  >

  div >
  (

    utton
                  riant = "ghost"
ze = "sm"
assName = "hidden sm:inline-flex"
Click = {() => navigate('/giris')}
                
                  riş Yap
Button >
  utton
riant = "primary"
ze = "sm"
Click = {() => navigate('/kayit')}
                
                  yıt Ol
Button >
              >
            )}
v >
        </div >

        * Mobil arama(yalnızca ana sayfa) */}
sHome && (
  iv className = "px-3 pb-2 md:hidden" >
    omeNavSearch />
    div >
        

        * Kategori şeridi — PC + mobil için scrollable, sadece ana sayfa */}
sHome && (
  iv className = "bg-surface" >
    iv className = "mx-auto max-w-7xl px-3 sm:px-4" >
      omeCategoryStrip />
      div >
      div >
        
      </header >

  {/* Mobil kompakt navbar — scroll sonrası görünür */ }
  < div
className = {
  cn(
          'fixed inset-x-0 top-0 z-40 bg-surface/95 backdrop-blur-md transition-transform duration-300 ease-out md:hidden',
    scrolled
      ? 'translate-y-0 shadow-[0_6px_20px_rgba(14,13,49,0.08)]'
            : '-translate-y-full',
  )
}
  >
  <MobileMiniNavbar
    isHome={isHome}
    onOpenDrawer={() => setDrawerOpen(true)}
    onSearchClick={handleMiniSearch}
  />
      </div >

  {/* Soldan açılan mobil menü */ }
  < MobileDrawer open = { drawerOpen } onClose = {() => setDrawerOpen(false)} />
    </>
  );
}
