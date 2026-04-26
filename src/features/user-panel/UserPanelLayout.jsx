import { NavLink, Outlet } from 'react-router-dom';
import ProtectedRoute from '../../router/ProtectedRoute';
import PageWrapper from '../../components/layout/PageWrapper';
import useAuthStore from '../../store/authStore';

const links = [
  { to: '/hesabim', label: 'Profilim', icon: 'person', end: true },
  { to: '/hesabim/siparislerim', label: 'Siparişlerim', icon: 'receipt_long' },
  { to: '/hesabim/kuponlarim', label: 'Kuponlarım', icon: 'confirmation_number' },
];

function UserPanelLayout() {
  const { userProfile, user, role } = useAuthStore();

  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="mb-6">
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">Hesabım</h1>
          <p className="mt-1 font-label text-sm text-on-surface-variant">
            Profilini, siparişlerini ve kuponlarını buradan yönet.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <aside className="w-full shrink-0 md:w-64">
            {/* Profil Özeti Kartı */}
            <div className="mb-4 flex items-center gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-4 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-headline text-lg font-bold text-primary">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'K'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-headline text-sm font-bold text-on-surface">
                  {userProfile?.displayName || 'Kullanıcı'}
                </h3>
                <p className="truncate font-label text-xs text-on-surface-variant">
                  {user?.email}
                </p>
                {role && role !== 'user' && (
                  <span className="mt-1 inline-block rounded bg-tertiary-container px-1.5 py-0.5 text-[10px] font-medium text-on-tertiary-container">
                    {role.toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* Navigasyon */}
            <nav className="flex overflow-x-auto rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-2 shadow-sm md:flex-col md:overflow-visible">
              {links.map(({ to, label, icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-label font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-fixed text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`
                  }
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {icon}
                  </span>
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}

export default UserPanelLayout;
export { UserPanelLayout as Component };
