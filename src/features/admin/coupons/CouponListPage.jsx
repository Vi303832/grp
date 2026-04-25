import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader, DataTable, StatusBadge, ConfirmDialog } from '../components';
import { Input } from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import { useAdminCoupons, useCancelCoupon } from './useAdminCoupons';

const COUPON_STATUSES = ['active', 'used', 'expired', 'cancelled'];

function CouponListPage() {
  const { data: coupons, isLoading } = useAdminCoupons();
  const cancelMutation = useCancelCoupon();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);

  const filtered = useMemo(() => {
    if (!coupons) return [];
    const q = search.trim().toLowerCase();
    return coupons.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        c.code?.toLowerCase().includes(q) ||
        c.userId?.toLowerCase().includes(q) ||
        c.campaignId?.toLowerCase().includes(q)
      );
    });
  }, [coupons, search, statusFilter]);

  const handleCancel = async () => {
    if (!cancelling) return;
    try {
      await cancelMutation.mutateAsync({ id: cancelling.id });
      toast.success(`${cancelling.code} iptal edildi.`);
      setCancelling(null);
    } catch (err) {
      toast.error(`İptal edilemedi: ${err.message}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kuponlar"
        description="Tüm kuponları görüntüleyin ve gerektiğinde manuel iptal edin."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          type="search"
          placeholder="Kupon kodu, kullanıcı veya kampanya ID ara…"
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
          {COUPON_STATUSES.map((s) => (
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
              <StatusBadge type="coupon" status={s} />
            </button>
          ))}
        </div>
      </div>

      <DataTable
        loading={isLoading}
        rows={filtered}
        rowKey="id"
        emptyMessage="Bu filtreye uyan kupon yok."
        columns={[
          {
            key: 'code',
            header: 'Kod',
            render: (c) => (
              <span className="rounded bg-surface-container-low px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                {c.code}
              </span>
            ),
          },
          {
            key: 'userId',
            header: 'Kullanıcı',
            render: (c) => (
              <span className="font-mono text-xs text-on-surface-variant">
                {c.userId?.slice(0, 10) ?? '—'}…
              </span>
            ),
          },
          {
            key: 'campaignId',
            header: 'Kampanya',
            render: (c) => (
              <span className="font-mono text-xs text-on-surface-variant">
                {c.campaignId?.slice(0, 10) ?? '—'}…
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Durum',
            render: (c) => <StatusBadge type="coupon" status={c.status} />,
          },
          {
            key: 'expiresAt',
            header: 'Son Kullanım',
            render: (c) => (
              <span className="text-xs text-on-surface-variant">
                {formatDate(c.expiresAt)}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            width: 'w-20',
            render: (c) =>
              c.status === 'active' ? (
                <button
                  type="button"
                  onClick={() => setCancelling(c)}
                  className="rounded-lg p-2 text-error hover:bg-error-container/40"
                  title="İptal et"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    block
                  </span>
                </button>
              ) : null,
          },
        ]}
      />

      <ConfirmDialog
        isOpen={!!cancelling}
        onClose={() => setCancelling(null)}
        onConfirm={handleCancel}
        title="Kuponu iptal et"
        description={`${cancelling?.code} kuponu iptal edilecek. Bu işlem geri alınamaz.`}
        confirmLabel="Evet, iptal et"
        loading={cancelMutation.isPending}
      />
    </div>
  );
}

export default CouponListPage;
export { CouponListPage as Component };
