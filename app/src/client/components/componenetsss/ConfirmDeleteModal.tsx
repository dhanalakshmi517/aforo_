import React from "react";
import "./ConfirmDeleteModal.css";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  productName,
  onConfirm,
  onCancel,
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
          Are you sure you want to delete the <br /> product “{productName}”?
        </p>
        <p className="del-modal-subtitle">This action cannot be undone.</p>

        <div className="del-modal-actions">
          <button className="del-modal-btn del-modal-btn-discard" onClick={onCancel}>
            Discard
          </button>
          <button className="del-modal-btn del-modal-btn-delete" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
