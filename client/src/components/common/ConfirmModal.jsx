/**
 * Render a confirmation modal with cancel and confirm actions.
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  // Do not render the modal while it is closed.
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl px-4 py-2.5 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-70 ${
              danger ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
