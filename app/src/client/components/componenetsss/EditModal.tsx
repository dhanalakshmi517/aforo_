import React, { useEffect } from "react";
import "./EditModal.css";

type EditModalProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  cancelLabel?: string; // default: "No, Cancel"
  saveLabel?: string;   // default: "Yes, Save Changes"
  onClose?: () => void; // X or backdrop
  onCancel: () => void; // left button
  onSave: () => void;   // right button
  saving?: boolean;
  disableBackdropClose?: boolean;
};

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  title = "Do you want to save changes?",
  description = "If you go back now, your progress will be lost. Save these changes to continue.",
  cancelLabel = "No, Cancel",
  saveLabel = "Yes, Save Changes",
  onClose,
  onCancel,
  onSave,
  saving = false,
  disableBackdropClose = false,
}) => {
  // ESC closes when allowed
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !disableBackdropClose && onClose) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, disableBackdropClose]);

  if (!isOpen) return null;

  return (
    <div
      className="editmodal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editmodal-title"
      aria-describedby="editmodal-desc"
      onClick={() => {
        if (!disableBackdropClose && onClose) onClose(); // ✅ click outside closes + stay
      }}
    >
      <div className="editmodal__container" onClick={(e) => e.stopPropagation()}>
        {!disableBackdropClose && (
          <button
            type="button"
            className="editmodal__close"
            aria-label="Close"
            onClick={onClose}       // ✅ X closes + stay
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="#6B7280" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <h3 id="editmodal-title" className="editmodal__title">{title}</h3>
        <p id="editmodal-desc" className="editmodal__desc">{description}</p>

        <div className="editmodal__actions">
          <button
            type="button"
            className="editmodal__btn editmodal__btn--cancel"
            onClick={onCancel}
            disabled={saving}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="editmodal__btn editmodal__btn--primary"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
