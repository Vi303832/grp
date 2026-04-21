import { NavLink, Outlet } from 'react-router-dom';
import ProtectedRoute from '../../router/ProtectedRoute';
import PageWrapper from '../../components/layout/PageWrapper';

const links = [
  { to: '/hesabim', label: 'Profilim', end: true },
  { to: '/hesabim/siparislerim', label: 'Siparişlerim' },
  { to: '/hesabim/kuponlarim', label: 'Kuponlarım' },
];

function UserPanelLayout() {
  return (
    <ProtectedRoute>
      <PageWrapper>
        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="md:w-56 shrink-0">
            <nav className="flex flex-row gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-2 shadow-sm md:flex-col">
              {links.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-label font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-fixed text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  );
}

export default UserPanelLayout;
export { UserPanelLayout as Component };
