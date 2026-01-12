import React from "react";
import SecondaryButton from "./SecondaryButton";
import DeleteSolidButton from "./DeleteSolidButton";
import "./ConfirmDeleteModal.css";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  productName: string;
  entityType?: string; // e.g., "product", "customer", "item"
  onConfirm: () => void;
  onCancel: () => void;
  /** Optional label override for the left (secondary) button. Default: "Discard" */
  discardLabel?: string;
  /** Optional label override for the right (primary delete) button. Default: "Yes, Delete" */
  confirmLabel?: string;
  /** Optional title text override for discard vs delete behavior */
  title?: string;
  /** Optional subtitle text override */
  subtitle?: string;
  /** Use discard styling instead of delete styling */
  isDiscardMode?: boolean;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  productName,
  entityType = "product",
  onConfirm,
  onCancel,
  discardLabel = "Discard",
  confirmLabel = "Yes, Delete",
  title,
  subtitle,
  isDiscardMode = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="del-modal-overlay" onClick={onCancel}>
      <div
        className="del-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="del-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) */}
        <button
          className="del-modal-close"
          aria-label="Close dialog"
          onClick={onCancel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path
              d="M9 1L1 9M1 1L9 9"
              stroke="#373B40"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <p id="del-modal-title" className="del-modal-title">
          {title || (isDiscardMode 
            ? `Are you sure you want to discard the ${entityType} "${productName}"?`
            : `Are you sure you want to delete the ${entityType} "${productName}"?`
          )}
        </p>
        <p className="del-modal-subtitle">
          {subtitle || (isDiscardMode 
            ? "This action cannot be undone."
            : "This action cannot be undone."
          )}
        </p>

        <div className="del-modal-actions">
          <SecondaryButton fullWidth onClick={onCancel}>
            {discardLabel}
          </SecondaryButton>
          <DeleteSolidButton 
            label={confirmLabel}
            onClick={onConfirm}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
