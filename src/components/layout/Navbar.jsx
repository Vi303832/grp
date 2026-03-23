import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Button } from '../ui';

export default function Navbar() {
  const { user, userProfile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/giris');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-orange-500">GRP</span>
          <span className="hidden text-sm font-medium text-gray-500 sm:block">Kampanya</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <NavLink
            to="/kampanyalar"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            Kampanyalar
          </NavLink>
          <NavLink
            to="/isletme-basvurusu"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-orange-500' : 'text-gray-600 hover:text-gray-900'}`
            }
          >
            İşletme Başvurusu
          </NavLink>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                  {userProfile?.displayName?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
                </span>
                <span className="hidden sm:block">
                  {userProfile?.displayName ?? user.email}
                </span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-100 bg-white shadow-lg">
                  <Link
                    to="/hesabim"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Hesabım
                  </Link>
                  <Link
                    to="/hesabim/kuponlarim"
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMenuOpen(false)}
                  >
                    Kuponlarım
                  </Link>
                  {userProfile?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  {userProfile?.role === 'business' && (
                    <Link
                      to="/isletme"
                      className="block px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      İşletme Paneli
                    </Link>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => { setMenuOpen(false); handleSignOut(); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
                  >
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
              <Button size="sm" onClick={() => navigate('/kayit')}>
                Kayıt Ol
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
