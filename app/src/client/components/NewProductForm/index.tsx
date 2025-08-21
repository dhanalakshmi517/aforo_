import React from 'react';
import NewProductForm from './NewProductForm.fixed';

interface NewProductFormWrapperProps {
  onSubmit: (formData: any) => Promise<void>;
  onClose: () => void;
}

const NewProductFormWrapper: React.FC<NewProductFormWrapperProps> = ({ onSubmit, onClose }) => {
  return (
    <div>
      <NewProductForm onSubmit={onSubmit} onClose={onClose} />
    </div>
  );
};

export default NewProductFormWrapper;
