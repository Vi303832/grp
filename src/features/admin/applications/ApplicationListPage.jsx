import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader, DataTable, StatusBadge } from '../components';
import { Input, Modal, Button, Card, CardBody } from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import {
  useAdminApplications,
  useUpdateApplicationStatus,
} from './useAdminApplications';

const APP_STATUSES = ['pending', 'reviewed', 'approved', 'rejected'];

function ApplicationListPage() {
  const { data: apps, isLoading } = useAdminApplications();
  const updateStatus = useUpdateApplicationStatus();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const filtered = useMemo(() => {
    if (!apps) return [];
    const q = search.trim().toLowerCase();
    return apps.filter((a) => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.businessName?.toLowerCase().includes(q) ||
        a.campaignTitle?.toLowerCase().includes(q) ||
        a.contactEmail?.toLowerCase().includes(q)
      );
    });
  }, [apps, search, statusFilter]);

  const changeStatus = async (status) => {
    if (!detail) return;
    try {
      await updateStatus.mutateAsync({ id: detail.id, status });
      toast.success('Durum güncellendi.');
      setDetail((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      toast.error(`Güncellenemedi: ${err.message}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Başvurular"
        description="Kampanya başvurularını inceleyin ve durumlarını güncelleyin."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <Input
          type="search"
          placeholder="İşletme / kampanya / email ara…"
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
          {APP_STATUSES.map((s) => (
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
              <StatusBadge type="application" status={s} />
            </button>
          ))}
        </div>
      </div>

      <DataTable
        loading={isLoading}
        rows={filtered}
        rowKey="id"
        onRowClick={setDetail}
        emptyMessage="Bu filtreye uyan başvuru yok."
        columns={[
          {
            key: 'businessName',
            header: 'İşletme / Kampanya',
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
            key: 'contactEmail',
            header: 'İletişim',
            render: (a) => (
              <div className="flex flex-col text-xs text-on-surface-variant">
                <span>{a.contactEmail}</span>
                <span>{a.contactPhone}</span>
              </div>
            ),
          },
          {
            key: 'status',
            header: 'Durum',
            render: (a) => <StatusBadge type="application" status={a.status} />,
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

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title="Başvuru Detayı"
        className="max-w-xl"
      >
        {detail && (
          <div className="space-y-4">
            <Card className="shadow-none">
              <CardBody className="space-y-3 text-sm">
                <Row label="İşletme" value={detail.businessName} />
                <Row label="Kampanya" value={detail.campaignTitle} />
                <Row label="Email" value={detail.contactEmail} />
                <Row label="Telefon" value={detail.contactPhone} />
                <Row
                  label="Durum"
                  value={
                    <StatusBadge type="application" status={detail.status} />
                  }
                />
                <Row label="Tarih" value={formatDate(detail.createdAt)} />
                <div>
                  <span className="text-[11px] uppercase tracking-wide text-on-surface-variant">
                    Açıklama
                  </span>
                  <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface-container-low p-3 text-sm text-on-surface">
                    {detail.description}
                  </p>
                </div>
              </CardBody>
            </Card>

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setDetail(null)}>
                Kapat
              </Button>
              <Button
                variant="secondary"
                onClick={() => changeStatus('reviewed')}
                disabled={detail.status === 'reviewed'}
                loading={updateStatus.isPending}
              >
                İncelendi
              </Button>
              <Button
                variant="danger"
                onClick={() => changeStatus('rejected')}
                disabled={detail.status === 'rejected'}
                loading={updateStatus.isPending}
              >
                Reddet
              </Button>
              <Button
                onClick={() => changeStatus('approved')}
                disabled={detail.status === 'approved'}
                loading={updateStatus.isPending}
              >
                Onayla
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[11px] uppercase tracking-wide text-on-surface-variant">
        {label}
      </span>
      <span className="text-right text-sm text-on-surface">{value}</span>
    </div>
  );
}

export default ApplicationListPage;
export { ApplicationListPage as Component };
