import React, { useEffect, useState } from 'react';
import { GeneralFormData, Category, Status, ProductType, normalizeProductType } from './types';
import './EditProductForm.css';

interface GeneralFormProps {
  data: GeneralFormData;
  onChange: (data: GeneralFormData, isNameEdited?: boolean) => void;
  loading: boolean;
  productId: string;
}

const GeneralForm: React.FC<GeneralFormProps> = ({
  data,
  onChange,
  loading,
  productId
}) => {
  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [isNameEdited, setIsNameEdited] = useState(false);

  useEffect(() => {
    if (!isNameEdited) {
      setNameError(undefined);
    }
  }, [isNameEdited]);

  // Only validate when the product name input changes
  const handleProductNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setIsNameEdited(true);
    onChange({ ...data, productName: newName }, true);
    await validateProductName(newName);
  };

  const handleAddTag = () => {
    if (tagKey && tagValue) {
      const newTags = { ...data.tags, [tagKey]: tagValue };
      onChange({ ...data, tags: newTags });
      setTagKey('');
      setTagValue('');
    }
  };

  const handleRemoveTag = (keyToRemove: string) => {
    const newTags = { ...data.tags };
    delete newTags[keyToRemove];
    onChange({ ...data, tags: newTags });
  };

  const validateProductName = async (productName: string) => {
    if (!isNameEdited) {
      setNameError(undefined);
      return;
    }

    if (productName.trim() === '') {
      setNameError('Product name is required');
      return;
    }
    try {
      const response = await fetch('http://13.230.194.245:8080/api/products');
      const products = await response.json();
      const isDuplicate = products.some((p: any) => p.productName?.toLowerCase() === productName.toLowerCase() && p.id !== productId);
      if (isDuplicate) {
        setNameError('Product name must be unique');
      } else {
        setNameError(undefined);
      }
    } catch (error) {
      console.error('Error checking product name:', error);
      setNameError('Error checking product name uniqueness');
    }
  };

  return (
    <div className="general-forms">
      <div className="edit-form-group">
        <label>Product Name</label>
        <input
          type="text"
          value={data.productName}
          onChange={handleProductNameChange}
          disabled={loading}
          className="form-inputs"
          placeholder="Enter Product Name"
        />
        {nameError && (
          <div className="error-message">{nameError}</div>
        )}
      </div>

      <div className="edit-form-group">
        <label>Product Type</label>
        <select
          value={normalizeProductType(data.productType)}
          onChange={(e) => onChange({ ...data, productType: normalizeProductType(e.target.value) })}
          disabled
        >
          <option value="">Select Product Type</option>
          <option value="api">API</option>
          <option value="flatfile">FlatFile</option>
          <option value="sqlresult">SQLResult</option>
          <option value="llmtoken">LLMToken</option>
        </select>
      </div>

      <div className="edit-form-group">
        <label>Description</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="edit-form-group">
        <label>Status</label>
        <select
          value={data.status}
          onChange={(e) => onChange({ ...data, status: e.target.value })}
          disabled={loading}
        >
          <option value="">Select Status</option>
          {Object.values(Status).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="edit-form-group">
        <label>Category</label>
        <select
          value={data.category}
          onChange={(e) => onChange({ ...data, category: e.target.value })}
          disabled={loading}
        >
          <option value="">Select Category</option>
          {Object.values(Category).map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="edit-form-group">
        <label>Version</label>
        <input
          type="text"
          value={data.version}
          onChange={(e) => onChange({ ...data, version: e.target.value })}
          disabled={loading}
        />
      </div>

      <div className="edit-form-group">
        <label>Visibility</label>
        <label className="switch">
          <input
            type="checkbox"
            checked={data.visibility}
            onChange={(e) => onChange({ ...data, visibility: e.target.checked })}
            disabled={loading}
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
};

export default GeneralForm;
