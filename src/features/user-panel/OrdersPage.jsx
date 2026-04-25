import { Card, CardBody, Spinner, Badge } from '../../components/ui';
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
  const { data: orders, isLoading } = useUserOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardBody className="py-12 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/50">
            receipt_long
          </span>
          <h3 className="mt-3 text-base font-semibold text-on-surface">
            Henüz siparişiniz yok
          </h3>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-headline font-bold text-on-surface">
        Siparişlerim
      </h2>

      <div className="space-y-2">
        {orders.map((order) => {
          const status = STATUS_MAP[order.status] ?? STATUS_MAP.pending;
          return (
            <Card key={order.id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-on-surface-variant">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  <div className="mt-1 text-sm text-on-surface-variant">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-headline font-bold text-tertiary">
                    {formatPrice(order.amount ?? 0)}
                  </div>
                  <div className="text-xs text-on-surface-variant">
                    {order.quantity ?? 1} adet
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
