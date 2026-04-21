import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Spinner } from '../components/ui';

/**
 * Giriş yapılmış mı kontrol eder.
 * allowedRoles belirtilmişse ilgili rol de kontrol edilir.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/giris" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
