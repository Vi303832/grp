import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  SelectField,
} from '../components';
import { Input, Modal, Button, Card, CardBody } from '../../../components/ui';
import { formatDate, formatPrice } from '../../../lib/utils';
import { useAdminOrders, useUpdateOrderStatus } from './useAdminOrders';

const ORDER_STATUSES = [
  'pending',
  'paid',
  'coupon_issued',
  'cancelled',
  'refunded',
];

function OrderListPage() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOrder, setDetailOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.userId?.toLowerCase().includes(q) ||
        o.campaignId?.toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  const openDetail = (order) => {
    setDetailOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusSave = async () => {
    if (!detailOrder || newStatus === detailOrder.status) return;
    try {
      await updateStatus.mutateAsync({ id: detailOrder.id, status: newStatus });
      toast.success('Sipariş durumu güncellendi.');
      setDetailOrder(null);
    } catch (err) {
      toast.error(`Güncellenemedi: ${err.message}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Siparişler"
        description="Tüm siparişleri görüntüleyin ve gerektiğinde manuel durumu güncelleyin."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          type="search"
          placeholder="Sipariş / kullanıcı / kampanya ID ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={
              'rounded-full px-3 py-1.5 text-xs font-medium ' +
              (statusFilter === 'all'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant')
            }
          >
            Tümü
          </button>
          {ORDER_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={
                'rounded-full px-3 py-1.5 text-xs font-medium ' +
                (statusFilter === s
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant')
              }
            >
              <StatusBadge type="order" status={s} />
            </button>
          ))}
        </div>
      </div>

      <DataTable
        loading={isLoading}
        rows={filtered}
        rowKey="id"
        onRowClick={openDetail}
        emptyMessage="Bu filtreye uyan sipariş yok."
        columns={[
          {
            key: 'id',
            header: 'Sipariş ID',
            render: (o) => (
              <span className="font-mono text-xs text-on-surface-variant">
                {o.id.slice(0, 10)}…
              </span>
            ),
          },
          {
            key: 'userId',
            header: 'Kullanıcı',
            render: (o) => (
              <span className="font-mono text-xs text-on-surface-variant">
                {o.userId?.slice(0, 10) ?? '—'}…
              </span>
            ),
          },
          {
            key: 'amount',
            header: 'Tutar',
            align: 'right',
            render: (o) => (
              <span className="font-medium text-on-surface">
                {formatPrice(o.amount ?? 0)}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Durum',
            render: (o) => <StatusBadge type="order" status={o.status} />,
          },
          {
            key: 'createdAt',
            header: 'Tarih',
            render: (o) => (
              <span className="text-xs text-on-surface-variant">
                {formatDate(o.createdAt)}
              </span>
            ),
          },
        ]}
      />

      <Modal
        isOpen={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title="Sipariş Detayı"
        className="max-w-lg"
      >
        {detailOrder && (
          <div className="space-y-4">
            <Card className="shadow-none">
              <CardBody className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Sipariş ID" value={detailOrder.id} mono />
                <Info label="Kullanıcı ID" value={detailOrder.userId} mono />
                <Info label="Kampanya ID" value={detailOrder.campaignId} mono />
                <Info label="İşletme ID" value={detailOrder.businessId} mono />
                <Info
                  label="Tutar"
                  value={formatPrice(detailOrder.amount ?? 0)}
                />
                <Info
                  label="Tarih"
                  value={formatDate(detailOrder.createdAt)}
                />
                <Info
                  label="Ödeme ID"
                  value={detailOrder.paymentId ?? '—'}
                  mono
                />
                <Info
                  label="Mevcut Durum"
                  value={
                    <StatusBadge type="order" status={detailOrder.status} />
                  }
                />
              </CardBody>
            </Card>

            <SelectField
              label="Durumu değiştir"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectField>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDetailOrder(null)}>
                Kapat
              </Button>
              <Button
                onClick={handleStatusSave}
                loading={updateStatus.isPending}
                disabled={newStatus === detailOrder.status}
              >
                Kaydet
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Info({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-on-surface-variant">
        {label}
      </span>
      <span
        className={
          'text-sm text-on-surface ' +
          (mono ? 'font-mono text-xs break-all' : '')
        }
      >
        {value ?? '—'}
      </span>
    </div>
  );
}

export default OrderListPage;
export { OrderListPage as Component };
