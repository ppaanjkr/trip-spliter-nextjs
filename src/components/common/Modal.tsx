type ModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
};

export default function Modal({
  open,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
  onConfirm,
  onCancel,
}: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/30">
      <div className="w-[80%] max-w-75 rounded-2xl bg-white px-6 py-5 text-center">
        {/* {title && (
          <div className="pb-1 text-base font-semibold text-[#2D3135]">
            {title}
          </div>
        )} */}

        <h3 className="px-0 pb-5 pt-2 text-md font-semibold text-[#2D3135]">
          {message}
        </h3>

        <div className="flex gap-2.5">
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-[14px] border-0 bg-[#f1f1f1] px-4 py-3 text-sm text-[#2D3135]"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-[14px] border-0 bg-[#ffe4ef] px-4 py-3 text-sm text-[#2D3135]"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}