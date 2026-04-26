import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Card, CardBody, Button, Input } from '../../components/ui';
import { formatDate } from '../../lib/utils';

const schema = z.object({
  displayName: z.string().min(2, 'Ad en az 2 karakter olmalı').max(50, 'Ad en fazla 50 karakter olabilir'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Geçerli bir telefon numarası girin').optional().or(z.literal('')),
  cityId: z.string().min(1, 'Şehir seçmelisiniz'),
});

function ProfilePage() {
  const { user, userProfile, updateUserProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      cityId: userProfile?.cityId || 'bursa',
    },
  });

  const onSubmit = async (data) => {
    try {
      await updateUserProfile(data);
      toast.success('Profil bilgileriniz güncellendi.');
      setIsEditing(false);
    } catch (error) {
      console.error('[ProfilePage] Güncelleme hatası:', error);
      toast.error('Profil güncellenirken bir hata oluştu. Tekrar deneyin.');
    }
  };

  const handleCancel = () => {
    reset({
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      cityId: userProfile?.cityId || 'bursa',
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardBody>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-headline font-extrabold text-xl text-on-surface">Kişisel Bilgiler</h2>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Düzenle
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <Input
              label="Ad Soyad"
              {...register('displayName')}
              error={errors.displayName?.message}
            />
            <Input
              label="Telefon"
              placeholder="05xxxxxxxxx"
              {...register('phone')}
              error={errors.phone?.message}
            />
            {/* Şimdilik basit input, ileride select eklenebilir */}
            <Input
              label="Şehir (cityId)"
              {...register('cityId')}
              error={errors.cityId?.message}
            />

            <div className="pt-2 flex gap-3">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                İptal
              </Button>
              <Button type="submit" loading={isSubmitting}>
                Kaydet
              </Button>
            </div>
          </form>
        ) : (
          <dl className="space-y-4 text-sm font-label">
            <div className="flex flex-col sm:flex-row sm:gap-3 border-b border-outline-variant/20 pb-3">
              <dt className="w-36 font-medium text-on-surface-variant">Ad Soyad</dt>
              <dd className="text-on-surface font-semibold">{userProfile?.displayName ?? '—'}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-3 border-b border-outline-variant/20 pb-3">
              <dt className="w-36 font-medium text-on-surface-variant">E-posta</dt>
              <dd className="text-on-surface text-on-surface-variant/80">{user?.email}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-3 border-b border-outline-variant/20 pb-3">
              <dt className="w-36 font-medium text-on-surface-variant">Telefon</dt>
              <dd className="text-on-surface">{userProfile?.phone || '—'}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-3 border-b border-outline-variant/20 pb-3">
              <dt className="w-36 font-medium text-on-surface-variant">Şehir</dt>
              <dd className="text-on-surface capitalize">{userProfile?.cityId || 'Bursa'}</dd>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-3 pt-1">
              <dt className="w-36 font-medium text-on-surface-variant">Üyelik Tarihi</dt>
              <dd className="text-on-surface text-on-surface-variant/80">{formatDate(userProfile?.createdAt)}</dd>
            </div>
          </dl>
        )}
      </CardBody>
    </Card>
  );
}

export default ProfilePage;
export { ProfilePage as Component };
