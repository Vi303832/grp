import { Link } from 'react-router-dom';
import { Card, CardBody, Spinner, Badge, Button } from '../../components/ui';
import { formatDate, formatPrice } from '../../lib/utils';
import { useUserOrders } from './useUserOrders';

const STATUS_MAP = {
  pending: { variant: 'warning', label: 'Ödeme Bekleniyor' },
  paid: { variant: 'info', label: 'Ödendi' },
  coupon_issued: { variant: 'success', label: 'Tamamlandı' },
  cancelled: { variant: 'danger', label: 'İptal' },
  refunded: { variant: 'default', label: 'İade Edildi' },
};

function OrdersPage() {
  const { data: orders, isLoading, isError, refetch } = useUserOrders();

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
            Siparişler yüklenemedi
          </h3>
          <p className="mb-6 text-sm text-on-surface-variant max-w-sm mx-auto">
            Sipariş geçmişinize erişilirken bir sorun oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Tekrar Dene
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardBody className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-high">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">
              receipt_long
            </span>
          </div>
          <h3 className="mb-2 text-lg font-bold text-on-surface">
            Henüz siparişiniz yok
          </h3>
          <p className="mb-6 text-sm text-on-surface-variant max-w-sm mx-auto">
            Satın aldığın kampanyalar burada görünecek. Şimdi fırsatları keşfetmeye başla!
          </p>
          <Link to="/">
            <Button>Kampanyaları Keşfet</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-headline font-bold text-on-surface">
        Siparişlerim
      </h2>

      <div className="space-y-4">
        {orders.map((order) => {
          const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
          return (
            <Card key={order.id} className="transition-shadow hover:shadow-md">
              <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm font-semibold text-on-surface">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="sm:text-right flex sm:flex-col justify-between items-center sm:items-end w-full sm:w-auto border-t sm:border-t-0 border-outline-variant/20 pt-3 sm:pt-0">
                  <div className="text-xs text-on-surface-variant order-2 sm:order-1 mt-1 sm:mt-0 sm:mb-1">
                    {order.quantity ?? 1} adet
                  </div>
                  <div className="text-lg font-headline font-bold text-on-surface order-1 sm:order-2">
                    {formatPrice(order.amount ?? 0)}
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default OrdersPage;
export { OrdersPage as Component };
