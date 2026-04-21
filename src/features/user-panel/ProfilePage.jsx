import useAuthStore from '../../store/authStore';
import { Card, CardBody } from '../../components/ui';
import { formatDate } from '../../lib/utils';

function ProfilePage() {
  const { user, userProfile } = useAuthStore();

  return (
    <Card>
      <CardBody>
        <h2 className="mb-5 font-headline italic text-xl text-on-surface">Profilim</h2>
        <dl className="space-y-3 text-sm font-label">
          <div className="flex gap-3">
            <dt className="w-36 font-medium text-on-surface-variant">Ad Soyad</dt>
            <dd className="text-on-surface">{userProfile?.displayName ?? '—'}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-36 font-medium text-on-surface-variant">E-posta</dt>
            <dd className="text-on-surface">{user?.email}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-36 font-medium text-on-surface-variant">Telefon</dt>
            <dd className="text-on-surface">{userProfile?.phone || '—'}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-36 font-medium text-on-surface-variant">Üyelik tarihi</dt>
            <dd className="text-on-surface">{formatDate(userProfile?.createdAt)}</dd>
          </div>
        </dl>
      </CardBody>
    </Card>
  );
}

export default ProfilePage;
export { ProfilePage as Component };
