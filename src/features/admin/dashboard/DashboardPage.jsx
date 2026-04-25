import { Link } from 'react-router-dom';
import { PageHeader, StatCard, DataTable, StatusBadge } from '../components';
import { formatDate, formatPrice } from '../../../lib/utils';
import {
  useAdminStats,
  useRecentOrders,
  useRecentApplications,
} from './useAdminStats';

function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders();
  const { data: recentApplications, isLoading: appsLoading } =
    useRecentApplications();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platformun güncel durumu."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aktif Kampanya"
          value={stats?.activeCampaigns ?? 0}
          icon="sell"
          tone="primary"
          loading={statsLoading}
        />
        <StatCard
          label="Son 7 Gün Sipariş"
          value={stats?.recentOrders ?? 0}
          icon="receipt_long"
          tone="tertiary"
          loading={statsLoading}
        />
        <StatCard
          label="Aktif Kupon"
          value={stats?.activeCoupons ?? 0}
          icon="confirmation_number"
          tone="success"
          loading={statsLoading}
        />
        <StatCard
          label="Bekleyen Başvuru"
          value={stats?.pendingApplications ?? 0}
          icon="inbox"
          tone="secondary"
          loading={statsLoading}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-headline font-semibold text-on-surface">
              Son Siparişler
            </h2>
            <Link
              to="/admin/siparisler"
              className="text-xs font-medium text-primary hover:underline"
            >
              Tümünü gör →
            </Link>
          </div>
          <DataTable
            loading={ordersLoading}
            rows={recentOrders}
            rowKey="id"
            emptyMessage="Henüz sipariş yok."
            columns={[
              {
                key: 'id',
                header: 'Sipariş',
                render: (o) => (
                  <span className="font-mono text-xs text-on-surface-variant">
                    {o.id.slice(0, 8)}…
                  </span>
                ),
              },
              {
                key: 'amount',
                header: 'Tutar',
                render: (o) => formatPrice(o.amount ?? 0),
                align: 'right',
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
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-headline font-semibold text-on-surface">
              Son Başvurular
            </h2>
            <Link
              to="/admin/basvurular"
              className="text-xs font-medium text-primary hover:underline"
            >
              Tümünü gör →
            </Link>
          </div>
          <DataTable
            loading={appsLoading}
            rows={recentApplications}
            rowKey="id"
            emptyMessage="Henüz başvuru yok."
            columns={[
              {
                key: 'businessName',
                header: 'İşletme',
                render: (a) => (
                  <div className="flex flex-col">
                    <span className="font-medium text-on-surface">
                      {a.businessName}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {a.campaignTitle}
                    </span>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Durum',
                render: (a) => (
                  <StatusBadge type="application" status={a.status} />
                ),
              },
              {
                key: 'createdAt',
                header: 'Tarih',
                render: (a) => (
                  <span className="text-xs text-on-surface-variant">
                    {formatDate(a.createdAt)}
                  </span>
                ),
              },
            ]}
          />
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
export { DashboardPage as Component };
