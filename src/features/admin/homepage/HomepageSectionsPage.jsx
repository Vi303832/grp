import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader, ConfirmDialog, TextField } from '../components';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Modal,
  Spinner,
} from '../../../components/ui';
import { slugify } from '../campaigns/campaignSchema';
import {
  useHomepageSections,
  useCreateSection,
  useUpdateSection,
  useDeleteSection,
  useReorderSections,
} from './useHomepageSections';
import { useAdminCampaigns } from '../campaigns/useAdminCampaigns';

function HomepageSectionsPage() {
  const { data: sections, isLoading } = useHomepageSections();
  const { data: campaigns } = useAdminCampaigns();

  const createMutation = useCreateSection();
  const updateMutation = useUpdateSection();
  const deleteMutation = useDeleteSection();
  const reorderMutation = useReorderSections();

  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [isCreateOpen, setCreateOpen] = useState(false);

  const campaignMap = useMemo(() => {
    const map = {};
    (campaigns ?? []).forEach((c) => (map[c.id] = c));
    return map;
  }, [campaigns]);

  const move = async (index, direction) => {
    if (!sections) return;
    const next = [...sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    await reorderMutation.mutateAsync(next);
  };

  const toggleActive = (section) => {
    updateMutation.mutate({
      id: section.id,
      values: { isActive: !section.isActive },
    });
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteMutation.mutateAsync({ id: deleting.id });
      toast.success('Bölüm silindi.');
      setDeleting(null);
    } catch (err) {
      toast.error(`Silinemedi: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Ana Sayfa Bölümleri"
        description="Ana sayfada gösterilen kampanya gruplarını sıralayın ve yönetin."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Yeni Bölüm
          </Button>
        }
      />

      <div className="space-y-4">
        {(sections ?? []).length === 0 && (
          <Card>
            <CardBody className="py-12 text-center text-sm text-on-surface-variant">
              Henüz ana sayfa bölümü yok. Yeni bir bölüm oluşturun.
            </CardBody>
          </Card>
        )}

        {(sections ?? []).map((section, index) => (
          <Card key={section.id}>
            <CardHeader className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || reorderMutation.isPending}
                    className="rounded p-0.5 text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
                    title="Yukarı taşı"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      keyboard_arrow_up
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={
                      index === sections.length - 1 || reorderMutation.isPending
                    }
                    className="rounded p-0.5 text-on-surface-variant hover:bg-surface-container disabled:opacity-30"
                    title="Aşağı taşı"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      keyboard_arrow_down
                    </span>
                  </button>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-headline font-semibold text-on-surface">
                      {section.title}
                    </h3>
                    <Badge variant={section.isActive ? 'success' : 'default'}>
                      {section.isActive ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant">
                    /{section.slug} · {(section.campaignIds ?? []).length}{' '}
                    kampanya · sıra {index + 1}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleActive(section)}
                >
                  {section.isActive ? 'Pasif yap' : 'Aktif yap'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing(section)}
                >
                  Düzenle
                </Button>
                <button
                  type="button"
                  onClick={() => setDeleting(section)}
                  className="rounded-lg p-2 text-error hover:bg-error-container/40"
                  title="Sil"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    delete
                  </span>
                </button>
              </div>
            </CardHeader>
            <CardBody>
              {(section.campaignIds ?? []).length === 0 ? (
                <p className="text-sm text-on-surface-variant">
                  Bu bölümde henüz kampanya yok. "Düzenle" ile kampanya ekleyin.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {section.campaignIds.map((cid) => (
                    <span
                      key={cid}
                      className="rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant"
                    >
                      {campaignMap[cid]?.title ?? cid.slice(0, 8) + '…'}
                    </span>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      <SectionFormModal
        isOpen={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        campaigns={campaigns ?? []}
        onSubmit={async (values) => {
          await createMutation.mutateAsync(values);
          toast.success('Bölüm oluşturuldu.');
          setCreateOpen(false);
        }}
        submitting={createMutation.isPending}
      />

      <SectionFormModal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        section={editing}
        campaigns={campaigns ?? []}
        onSubmit={async (values) => {
          await updateMutation.mutateAsync({ id: editing.id, values });
          toast.success('Bölüm güncellendi.');
          setEditing(null);
        }}
        submitting={updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Bölümü sil"
        description={`"${deleting?.title}" bölümü kalıcı olarak silinecek.`}
        confirmLabel="Evet, sil"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function SectionFormModal({
  isOpen,
  onClose,
  section,
  campaigns,
  onSubmit,
  submitting,
}) {
  const isEdit = !!section;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (section) {
        setTitle(section.title ?? '');
        setSlug(section.slug ?? '');
        setIsActive(section.isActive ?? true);
        setSelectedIds(section.campaignIds ?? []);
        setSlugTouched(true);
      } else {
        setTitle('');
        setSlug('');
        setIsActive(true);
        setSelectedIds([]);
        setSlugTouched(false);
      }
    }
  }, [isOpen, section]);

  useEffect(() => {
    if (!slugTouched && !isEdit) setSlug(slugify(title));
  }, [title, slugTouched, isEdit]);

  const toggleCampaign = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error('Başlık ve slug gerekli.');
      return;
    }
    await onSubmit({
      title: title.trim(),
      slug: slug.trim(),
      isActive,
      campaignIds: selectedIds,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Bölümü Düzenle' : 'Yeni Bölüm'}
      className="max-w-2xl"
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto">
        <TextField
          label="Başlık"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ramazan Kampanyaları"
          required
        />
        <TextField
          label="Slug"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="ramazan-kampanyalari"
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-outline-variant text-primary"
          />
          Aktif (ana sayfada göster)
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-on-surface">
              Kampanyalar
            </h4>
            <span className="text-xs text-on-surface-variant">
              {selectedIds.length} seçili
            </span>
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-outline-variant/30 p-2">
            {campaigns.length === 0 && (
              <p className="py-4 text-center text-xs text-on-surface-variant">
                Önce kampanya oluşturun.
              </p>
            )}
            {campaigns.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-surface-container-low"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(c.id)}
                  onChange={() => toggleCampaign(c.id)}
                  className="h-4 w-4 rounded border-outline-variant text-primary"
                />
                <div className="h-8 w-12 shrink-0 overflow-hidden rounded bg-surface-container">
                  {c.images?.[0] && (
                    <img
                      src={c.images[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm text-on-surface">
                    {c.title}
                  </span>
                  <span className="truncate text-[11px] text-on-surface-variant">
                    /{c.slug}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={submitting}>
          Vazgeç
        </Button>
        <Button onClick={handleSave} loading={submitting}>
          {isEdit ? 'Kaydet' : 'Oluştur'}
        </Button>
      </div>
    </Modal>
  );
}

export default HomepageSectionsPage;
export { HomepageSectionsPage as Component };
