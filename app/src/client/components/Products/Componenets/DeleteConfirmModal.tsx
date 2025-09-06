import React from "react";
import "./DeleteConfirmModal.css";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  productName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <h2 className="modal-title">
          Are you sure you want to delete the product "{productName}"?
        </h2>
        <p className="modal-text">This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>
            Discard
          </button>
          <button className="btn btn-delete" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;



