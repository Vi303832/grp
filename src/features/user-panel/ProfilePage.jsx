import useAuthStore from '../../store/authStore';
import { Card, CardBody } from '../../components/ui';
import { formatDate } from '../../lib/utils';

function ProfilePage() {
  const { user, userProfile } = useAuthStore();

  return (
    <Card>
      <CardBody>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Profilim</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex gap-2">
            <dt className="w-32 font-medium text-gray-500">Ad Soyad</dt>
            <dd className="text-gray-800">{userProfile?.displayName ?? '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-32 font-medium text-gray-500">E-posta</dt>
            <dd className="text-gray-800">{user?.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-32 font-medium text-gray-500">Telefon</dt>
            <dd className="text-gray-800">{userProfile?.phone || '—'}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-32 font-medium text-gray-500">Üyelik tarihi</dt>
            <dd className="text-gray-800">{formatDate(userProfile?.createdAt)}</dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}

export default ProfilePage;
export { ProfilePage as Component };
