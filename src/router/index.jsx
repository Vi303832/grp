import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../pages/RootLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import GuestRoute from './GuestRoute';
import NotFoundPage from '../pages/NotFoundPage';
import ChunkErrorBoundary from '../components/error/ChunkErrorBoundary';

const router = createBrowserRouter([
  // ─── Admin (full-screen layout, Navbar/Footer olmadan) ─────────────
  {
    path: '/admin',
    errorElement: <ChunkErrorBoundary />,
    lazy: () => import('../features/admin/AdminLayout'),
    children: [
      {
        index: true,
        lazy: () => import('../features/admin/dashboard/DashboardPage'),
      },
      {
        path: 'kampanyalar',
        lazy: () =>
          import('../features/admin/campaigns/CampaignListPage'),
      },
      {
        path: 'kampanyalar/yeni',
        lazy: () =>
          import('../features/admin/campaigns/CampaignFormPage'),
      },
      {
        path: 'kampanyalar/:id',
        lazy: () =>
          import('../features/admin/campaigns/CampaignFormPage'),
      },
      {
        path: 'siparisler',
        lazy: () => import('../features/admin/orders/OrderListPage'),
      },
      {
        path: 'kuponlar',
        lazy: () => import('../features/admin/coupons/CouponListPage'),
      },
      {
        path: 'basvurular',
        lazy: () =>
          import('../features/admin/applications/ApplicationListPage'),
      },
      {
        path: 'ana-sayfa',
        lazy: () =>
          import('../features/admin/homepage/HomepageSectionsPage'),
      },
      {
        path: 'kullanicilar',
        lazy: () => import('../features/admin/users/UserListPage'),
      },
    ],
  },

  // ─── Public / User rotaları (RootLayout ile) ───────────────────────
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ChunkErrorBoundary />,
    children: [
      { index: true, element: <HomePage /> },

      // Misafir rotaları
      {
        path: 'giris',
        element: (
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        ),
      },
      {
        path: 'kayit',
        element: (
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        ),
      },
      {
        path: 'sifremi-unuttum',
        element: (
          <GuestRoute>
            <ForgotPasswordPage />
          </GuestRoute>
        ),
      },

      // Kampanya detay (demo sayfası)
      {
        path: 'kampanya/:slug',
        lazy: () => import('../features/campaigns/CampaignDetailPage'),
        errorElement: <ChunkErrorBoundary />,
      },

      // Ödeme sonucu (iyzico callback placeholder)
      {
        path: 'odeme-sonucu',
        lazy: () => import('../features/orders/PaymentResultPage'),
      },

      // Kullanıcı paneli (giriş gerekli)
      {
        path: 'hesabim',
        lazy: () => import('../features/user-panel/UserPanelLayout'),
        children: [
          {
            index: true,
            lazy: () => import('../features/user-panel/ProfilePage'),
          },
          {
            path: 'kuponlarim',
            lazy: () => import('../features/user-panel/CouponsPage'),
          },
          {
            path: 'siparislerim',
            lazy: () => import('../features/user-panel/OrdersPage'),
          },
        ],
      },

      // İşletme paneli
      {
        path: 'isletme',
        lazy: () => import('../features/business/BusinessLayout'),
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
