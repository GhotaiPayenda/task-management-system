import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import { Spinner } from './Loader';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete item',
  description,
  confirmLabel = 'Delete',
  loading = false,
  tone = 'danger',
  children,
  confirmDisabled = false,
}) {
  const Icon = tone === 'danger' ? Trash2 : AlertTriangle;

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} title={title} size="sm">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            tone === 'danger' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          {description && <p className="text-sm leading-6 text-slate-600">{description}</p>}
          {children}
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          type="button"
          className={tone === 'danger' ? 'btn-danger' : 'btn-primary'}
          onClick={onConfirm}
          disabled={loading || confirmDisabled}
        >
          {loading && <Spinner className="h-4 w-4" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
