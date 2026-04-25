import { Card, CardBody, Spinner, Badge } from '../../components/ui';
import { formatDate } from '../../lib/utils';
import { useUserCoupons } from './useUserCoupons';

const STATUS_MAP = {
  active: { variant: 'success', label: 'Aktif' },
  used: { variant: 'info', label: 'Kullanıldı' },
  expired: { variant: 'default', label: 'Süresi Doldu' },
  cancelled: { variant: 'danger', label: 'İptal' },
};

function CouponsPage() {
  const { data: coupons, isLoading } = useUserCoupons();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!coupons || coupons.length === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
            confirmation_number
          </span>
          <h3 className="mt-3 text-base font-semibold text-on-surface">
            Henüz kuponunuz yok
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ana sayfadan kampanyaları inceleyip satın alma yapabilirsiniz.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-headline font-bold text-on-surface">
        Kuponlarım
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        {coupons.map((coupon) => {
          const status = STATUS_MAP[coupon.status] ?? STATUS_MAP.active;
          return (
            <Card key={coupon.id} className="overflow-hidden">
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="rounded-lg bg-primary-fixed px-3 py-2 font-mono text-lg font-bold tracking-widest text-primary">
                    {coupon.code}
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="space-y-1 text-xs text-on-surface-variant">
                  {coupon.expiresAt && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">
                        schedule
                      </span>
                      Son kullanım: {formatDate(coupon.expiresAt)}
                    </div>
                  )}
                  {coupon.usedAt && (
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">
                        check_circle
                      </span>
                      Kullanıldı: {formatDate(coupon.usedAt)}
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-on-surface-variant/70">
                  Bu kodu işletmede göstererek kampanyanızı kullanabilirsiniz.
                </p>
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
