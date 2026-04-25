import { Modal, Button } from '../../../components/ui';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Emin misiniz?',
  description,
  confirmLabel = 'Evet, onayla',
  cancelLabel = 'Vazgeç',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        {description && (
          <p className="text-sm text-on-surface-variant">{description}</p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
