import { cn } from '../../../lib/utils';
import { Spinner } from '../../../components/ui';

/**
 * Basit ama esnek tablo bileşeni.
 *
 * Kullanım:
 *   <DataTable
 *     columns={[
 *       { key: 'title', header: 'Başlık' },
 *       { key: 'price', header: 'Fiyat', render: (row) => formatPrice(row.price), align: 'right' },
 *       { key: 'actions', header: '', render: (row) => <...>, width: 'w-24' },
 *     ]}
 *     rows={campaigns}
 *     rowKey={(row) => row.id}
 *     loading={isLoading}
 *     emptyMessage="Henüz kampanya yok."
 *     onRowClick={(row) => navigate(...)}
 *   />
 */
export default function DataTable({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyMessage = 'Kayıt bulunamadı.',
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-outline-variant/20 bg-surface-container-lowest py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest py-16 text-center text-sm text-on-surface-variant">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-on-surface-variant',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.width,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/15">
            {rows.map((row) => {
              const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey];
              return (
                <tr
                  key={key}
                  className={cn(
                    'transition-colors',
                    onRowClick && 'cursor-pointer hover:bg-surface-container-low',
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'px-4 py-3 text-on-surface',
                        col.align === 'right' && 'text-right',
                        col.align === 'center' && 'text-center',
                        col.cellClassName,
                      )}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
