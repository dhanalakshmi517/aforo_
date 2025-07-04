import React from 'react';
import Swal from 'sweetalert2';
import "./EditProductForm.css";

interface FormActionsProps {
  onClose: () => void;
  onSubmit: () => void;
  onNext: () => void;
  onBack: () => void;
  activeTab: 'general' | 'metadata' | 'configuration';
  loading: boolean;
  isLastTab: boolean;
  onSaveSuccess: () => void;
  onSaveError: (error: string) => void;
}

const FormActions: React.FC<FormActionsProps> = ({
  onClose,
  onSubmit,
  onNext,
  onBack,
  activeTab,
  loading,
  isLastTab,
  onSaveSuccess,
  onSaveError
}) => {
  const handleNext = async () => {
    if (isLastTab) {
      try {
        await onSubmit();
        onSaveSuccess();
        Swal.fire({
          title: 'Success!',
          text: 'Product updated successfully',
          icon: 'success'
        });
      } catch (error) {
        onSaveError(error instanceof Error ? error.message : 'Failed to update product');
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update product',
          icon: 'error'
        });
      }
    } else {
      onNext();
    }
  };

  return (
    <div className="editButtonGroup">
      <button
        type="button"
        onClick={() => {
          if (activeTab === 'general') {
            onClose();
          } else {
            onBack();
          }
        }}
        disabled={loading}
        className="cancelButton"
      >
        {activeTab === 'general' ? 'Cancel' : 'Back'}
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={loading}
        className="saveButton"
      >
        {isLastTab ? 'Submit' : 'Next'}
      </button>
    </div>
  );
};

export default FormActions;
