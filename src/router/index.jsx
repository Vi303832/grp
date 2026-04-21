import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../pages/RootLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },

      // Kampanyalar — listeleme
      {
        path: 'kampanyalar',
        lazy: () => import('../features/campaigns/CampaignsPage'),
      },

      // Misafir rotaları (giriş yapmışsa yönlendirme)
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

      // Admin paneli
      {
        path: 'admin',
        lazy: () => import('../features/admin/AdminLayout'),
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
