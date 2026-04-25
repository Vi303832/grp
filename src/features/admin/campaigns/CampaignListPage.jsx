import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PageHeader, DataTable, ConfirmDialog } from '../components';
import { Badge, Button, Input } from '../../../components/ui';
import { formatDate, formatPrice } from '../../../lib/utils';
import { useAdminCampaigns, useDeleteCampaign } from './useAdminCampaigns';
import { useCategories } from '../../campaigns/hooks/useCategories';

function CampaignListPage() {
  const navigate = useNavigate();
  const { data: campaigns, isLoading } = useAdminCampaigns();
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteCampaign();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingCampaign, setDeletingCampaign] = useState(null);

  const categoryMap = useMemo(() => {
    const map = {};
    (categories ?? []).forEach((c) => (map[c.id] = c));
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    if (!campaigns) return [];
    const q = search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;
      if (statusFilter === 'featured' && !c.isFeatured) return false;
      if (!q) return true;
      return (
        c.title?.toLowerCase().includes(q) ||
        c.slug?.toLowerCase().includes(q)
      );
    });
  }, [campaigns, search, statusFilter]);

  const handleDelete = async () => {
    if (!deletingCampaign) return;
    try {
      await deleteMutation.mutateAsync({
        id: deletingCampaign.id,
        images: deletingCampaign.images ?? [],
      });
      toast.success('Kampanya silindi.');
      setDeletingCampaign(null);
    } catch (err) {
      toast.error(`Silinemedi: ${err.message}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kampanyalar"
        description="Platformdaki tüm kampanyaları yönetin."
        actions={
          <Button onClick={() => navigate('/admin/kampanyalar/yeni')}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Yeni Kampanya
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Başlık veya slug ile ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'active', label: 'Aktif' },
            { id: 'inactive', label: 'Pasif' },
            { id: 'featured', label: 'Öne Çıkan' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={
                'rounded-full px-3 py-1.5 text-xs font-label font-medium transition-colors ' +
                (statusFilter === f.id
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high')
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        loading={isLoading}
        rows={filtered}
        rowKey="id"
        emptyMessage={
          search || statusFilter !== 'all'
            ? 'Bu filtreye uyan kampanya yok.'
            : 'Henüz kampanya eklenmemiş.'
        }
        columns={[
          {
            key: 'title',
            header: 'Kampanya',
            render: (c) => (
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface-container">
                  {c.images?.[0] ? (
                    <img
                      src={c.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-on-surface-variant/50">
                      <span className="material-symbols-outlined text-[18px]">
                        image
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium text-on-surface">
                    {c.title}
                  </span>
                  <span className="truncate text-xs text-on-surface-variant">
                    /{c.slug}
                  </span>
                </div>
              </div>
            ),
          },
          {
            key: 'categoryId',
            header: 'Kategori',
            render: (c) => (
              <span className="text-xs text-on-surface-variant">
                {categoryMap[c.categoryId]?.name ?? c.categoryId}
              </span>
            ),
          },
          {
            key: 'price',
            header: 'Fiyat',
            align: 'right',
            render: (c) => (
              <div className="flex flex-col items-end leading-tight">
                <span className="font-medium text-tertiary">
                  {formatPrice(c.price)}
                </span>
                {c.originalPrice > c.price && (
                  <span className="text-[11px] text-on-surface-variant line-through">
                    {formatPrice(c.originalPrice)}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: 'sold',
            header: 'Satış',
            align: 'center',
            render: (c) => (
              <span className="text-xs text-on-surface-variant">
                {c.soldCount ?? 0}
                {c.quota ? ` / ${c.quota}` : ''}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Durum',
            render: (c) => (
              <div className="flex flex-wrap gap-1">
                <Badge variant={c.isActive ? 'success' : 'default'}>
                  {c.isActive ? 'Aktif' : 'Pasif'}
                </Badge>
                {c.isFeatured && <Badge variant="warning">Öne Çıkan</Badge>}
              </div>
            ),
          },
          {
            key: 'expiresAt',
            header: 'Son',
            render: (c) => (
              <span className="text-xs text-on-surface-variant">
                {formatDate(c.expiresAt)}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            width: 'w-32',
            align: 'right',
            render: (c) => (
              <div className="flex items-center justify-end gap-1">
                <Link
                  to={`/admin/kampanyalar/${c.id}`}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
                  title="Düzenle"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingCampaign(c);
                  }}
                  className="rounded-lg p-2 text-error hover:bg-error-container/40"
                  title="Sil"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            ),
          },
        ]}
      />

      <ConfirmDialog
        isOpen={!!deletingCampaign}
        onClose={() => setDeletingCampaign(null)}
        onConfirm={handleDelete}
        title="Kampanyayı sil"
        description={`"${deletingCampaign?.title}" kampanyası kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        confirmLabel="Evet, sil"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CampaignListPage;
export { CampaignListPage as Component };
