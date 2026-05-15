import { NavLink, Outlet } from 'react-router-dom';
import ProtectedRoute from '../../router/ProtectedRoute';

const links = [
  { to: '/hesabim', label: 'Hakkımda', icon: 'person', end: true },
  { to: '/hesabim/siparislerim', label: 'Satın almalar', icon: 'shopping_bag' },
  { to: '/hesabim/kuponlarim', label: 'Kuponlarım', icon: 'confirmation_number' },
];

function UserPanelLayout() {

  return (
    <ProtectedRoute>
      {/* Beyaz sayfa arka planı */}
      <div className="min-h-screen bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

          {/* ── MOBİL: Üstte başlık + yatay tab ── */}
          <div className="md:hidden">
            <h1
              className="mb-5 font-headline text-[26px] font-extrabold tracking-tight"
              style={{ color: '#222222' }}
            >
              Profil
            </h1>

            <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {links.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive
                        ? 'bg-[#222222] text-white'
                        : 'bg-[#F7F7F7] text-[#717171] hover:bg-[#EBEBEB]'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* ── DESKTOP: İki kolon layout ── */}
          <div className="flex flex-col md:flex-row md:gap-12 lg:gap-16">
            {/* Sol Sidebar — sadece desktopta görünür */}
            <aside className="hidden shrink-0 md:block" style={{ width: 280 }}>
              <h1
                className="mb-8 font-headline text-[28px] font-extrabold tracking-tight"
                style={{ color: '#222222' }}
              >
                Profil
              </h1>

              <nav className="flex flex-col gap-1">
                {links.map(({ to, label, icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      `group flex items-center gap-3.5 rounded-xl px-4 transition-colors ${
                        isActive
                          ? 'bg-[#F7F7F7]'
                          : 'hover:bg-[#F7F7F7]'
                      }`
                    }
                    style={{ minHeight: 56 }}
                  >
                    {({ isActive }) => (
                      <>
                        {/* Avatar/icon wrapper */}
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-colors ${
                            isActive
                              ? 'bg-[#222222] text-white'
                              : 'bg-[#EBEBEB] text-[#717171] group-hover:bg-[#DDDDDD]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </span>

                        <span
                          className={`text-[15px] font-medium ${
                            isActive ? 'text-[#222222]' : 'text-[#717171]'
                          }`}
                        >
                          {label}
                        </span>
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </aside>

            {/* Vertical divider — desktopta */}
            <div className="hidden md:block">
              <div className="h-full w-px bg-[#EBEBEB]" />
            </div>

            {/* Sağ İçerik */}
            <main className="min-w-0 flex-1">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default UserPanelLayout;
export { UserPanelLayout as Component };
