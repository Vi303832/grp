import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader, DataTable, SelectField } from '../components';
import { Badge, Button, Input, Modal } from '../../../components/ui';
import { formatDate } from '../../../lib/utils';
import { useAdminUsers, useSetUserRole } from './useAdminUsers';

const ROLE_LABELS = {
  user: { label: 'Kullanıcı', variant: 'default' },
  business: { label: 'İşletme', variant: 'info' },
  admin: { label: 'Admin', variant: 'primary' },
};

function UserListPage() {
  const { data: users, isLoading } = useAdminUsers();
  const setRole = useSetUserRole();

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [newRole, setNewRole] = useState('user');

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        u.uid?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const openRoleModal = (user) => {
    setEditing(user);
    setNewRole(user.role ?? 'user');
  };

  const handleSaveRole = async () => {
    if (!editing) return;
    try {
      await setRole.mutateAsync({ targetUid: editing.uid, role: newRole });
      toast.success(`Rol güncellendi: ${ROLE_LABELS[newRole].label}`);
      setEditing(null);
    } catch (err) {
      toast.error(`Güncellenemedi: ${err.message ?? err}`);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kullanıcılar"
        description="Tüm kayıtlı kullanıcıları görüntüleyin ve rollerini yönetin."
      />

      <div className="mb-4">
        <Input
          type="search"
          placeholder="İsim / email / UID ara…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        loading={isLoading}
        rows={filtered}
        rowKey="uid"
        emptyMessage="Kullanıcı bulunamadı."
        columns={[
          {
            key: 'displayName',
            header: 'Kullanıcı',
            render: (u) => (
              <div className="flex flex-col">
                <span className="font-medium text-on-surface">
                  {u.displayName || '(isimsiz)'}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {u.email}
                </span>
              </div>
            ),
          },
          {
            key: 'role',
            header: 'Rol',
            render: (u) => {
              const info = ROLE_LABELS[u.role] ?? ROLE_LABELS.user;
              return <Badge variant={info.variant}>{info.label}</Badge>;
            },
          },
          {
            key: 'cityId',
            header: 'Şehir',
            render: (u) => (
              <span className="text-xs text-on-surface-variant">
                {u.cityId ?? '—'}
              </span>
            ),
          },
          {
            key: 'createdAt',
            header: 'Kayıt',
            render: (u) => (
              <span className="text-xs text-on-surface-variant">
                {formatDate(u.createdAt)}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            align: 'right',
            render: (u) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openRoleModal(u)}
              >
                Rol Değiştir
              </Button>
            ),
          },
        ]}
      />

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title="Kullanıcı Rolü"
      >
        {editing && (
          <div className="space-y-4">
            <div className="rounded-lg bg-surface-container-low p-3 text-sm">
              <div className="font-medium text-on-surface">
                {editing.displayName || '(isimsiz)'}
              </div>
              <div className="text-xs text-on-surface-variant">
                {editing.email}
              </div>
            </div>

            <SelectField
              label="Rol"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="user">Kullanıcı</option>
              <option value="business">İşletme</option>
              <option value="admin">Admin</option>
            </SelectField>

            <p className="text-xs text-on-surface-variant">
              Rol değişikliği anında custom claim'e yazılır. Kullanıcının
              değişikliği görmesi için bir kez yeniden giriş yapması gerekir.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Vazgeç
              </Button>
              <Button onClick={handleSaveRole} loading={setRole.isPending}>
                Kaydet
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default UserListPage;
export { UserListPage as Component };
