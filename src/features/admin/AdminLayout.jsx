import ProtectedRoute from '../../router/ProtectedRoute';
import PageWrapper from '../../components/layout/PageWrapper';
import { Card, CardBody } from '../../components/ui';

function AdminLayout() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <PageWrapper>
        <Card>
          <CardBody>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">Admin Panel</h2>
            <p className="text-sm text-gray-400">Milestone 5'te aktif olacak.</p>
          </CardBody>
        </Card>
      </PageWrapper>
    </ProtectedRoute>
  );
}

export default AdminLayout;
export { AdminLayout as Component };
