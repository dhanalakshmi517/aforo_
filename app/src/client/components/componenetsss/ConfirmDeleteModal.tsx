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
      <div className="del-modal-container" onClick={(e) => e.stopPropagation()}>
        <p className="del-modal-title">
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



