import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Spinner } from '../components/ui';

/**
 * Giriş yapılmışsa auth sayfalarına erişimi engeller
 * (login, register vb. sayfalarda kullanılır)
 */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}
