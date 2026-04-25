import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from '../../router/ProtectedRoute';
import { AdminSidebar, AdminHeader, AdminMobileDrawer } from './components';

function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-surface">
        <AdminSidebar />
        <AdminMobileDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminHeader onMenuClick={() => setDrawerOpen(true)} />
          <main className="flex-1 overflow-x-hidden p-4 md:p-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '14px', background: '#ffffff', color: '#171c1f', border: '1px solid rgba(200, 197, 211, 0.5)' },
          }}
        />
      </div>
    </ProtectedRoute>
  );
}

export default AdminLayout;
export { AdminLayout as Component };
