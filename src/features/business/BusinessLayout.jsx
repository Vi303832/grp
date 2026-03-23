import ProtectedRoute from '../../router/ProtectedRoute';
import PageWrapper from '../../components/layout/PageWrapper';
import { Card, CardBody } from '../../components/ui';

function BusinessLayout() {
  return (
    <ProtectedRoute allowedRoles={['business', 'admin']}>
      <PageWrapper>
        <Card>
          <CardBody>
            <h2 className="mb-2 text-lg font-semibold text-gray-800">İşletme Paneli</h2>
            <p className="text-sm text-gray-400">Milestone 4'te aktif olacak.</p>
          </CardBody>
        </Card>
      </PageWrapper>
    </ProtectedRoute>
  );
}

export default BusinessLayout;
export { BusinessLayout as Component };
