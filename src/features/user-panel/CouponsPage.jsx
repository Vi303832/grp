import { Card, CardBody } from '../../components/ui';

function CouponsPage() {
  return (
    <Card>
      <CardBody>
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Kuponlarım</h2>
        <p className="text-sm text-gray-400">Milestone 3'te aktif olacak.</p>
      </CardBody>
    </Card>
  );
}

export default CouponsPage;
export { CouponsPage as Component };
