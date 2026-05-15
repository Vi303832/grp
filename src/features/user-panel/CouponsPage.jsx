import { Link } from 'react-router-dom';
import { Card, CardBody, Spinner, Badge, Button } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { useUserCoupons } from './useUserCoupons';

const STATUS_MAP = {
  active: { variant: 'success', label: 'Aktif' },
  used: { variant: 'info', label: 'Kullanıldı' },
  expired: { variant: 'default', label: 'Süresi Doldu' },
  cancelled: { variant: 'danger', label: 'İptal' },
};

function CouponsPage() {
  const { data: coupons, isLoading, isError, refetch } = useUserCoupons();

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <span className="material-symbols-outlined text-5xl text-error/80 mb-2">
            error_outline
          </span>
          <h3 className="mb-2 text-lg font-bold text-on-surface">
            Kuponlar yüklenemedi
          </h3>
          <p className="mb-6 text-sm text-on-surface-variant max-w-sm mx-auto">
            Kuponlarınıza erişilirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!coupons || coupons.length === 0) {
    return (
      <Card>
        <CardBody className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">
              confirmation_number
            </span>
          </div>
          <h3 className="mb-2 text-lg font-bold text-on-surface">
            Henüz kuponunuz yok
          </h3>
          <p className="mb-6 text-sm text-on-surface-variant max-w-sm mx-auto">
            Satın aldığın kampanyalara ait kuponlar burada görünür. Ana sayfadan fırsatları keşfetmeye başla!
          </p>
          <Link to="/">
            <Button>Fırsatları Keşfet</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-headline font-bold text-on-surface">
        Kuponlarım
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {coupons.map((coupon) => {
          const status = STATUS_MAP[coupon.status] ?? STATUS_MAP.active;
          const isActive = coupon.status === 'active';
          
          return (
            <Card key={coupon.id} className="overflow-hidden border-2 border-dashed border-outline-variant/50 transition-all hover:border-primary/30 hover:shadow-md">
              <CardBody className="flex flex-col h-full space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant={status.variant} className="mb-1">{status.label}</Badge>
                </div>
                
                <div className={`flex-1 rounded-xl flex items-center justify-center py-4 ${isActive ? 'bg-primary-fixed' : 'bg-surface-container-high'}`}>
                  <span className={`font-mono text-2xl font-bold tracking-[0.2em] ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                    {coupon.code}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-on-surface-variant border-t border-dashed border-outline-variant/30 pt-3">
                  {coupon.expiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        Son kullanım
                      </span>
                      <span className="font-medium text-on-surface">{formatDate(coupon.expiresAt)}</span>
                    </div>
                  )}
                  {coupon.usedAt && (
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
                        Kullanıldı
                      </span>
                      <span className="font-medium text-on-surface">{formatDate(coupon.usedAt)}</span>
                    </div>
                  )}
                </div>

                {isActive && (
                  <p className="text-[11px] text-center text-primary/80 font-medium bg-primary/5 rounded py-1.5">
                    İşletmede bu kodu gösteriniz
                  </p>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default CouponsPage;
export { CouponsPage as Component };
