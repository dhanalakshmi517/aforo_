import React from 'react';
import { GeneralFormData, Category, Status, ProductType, normalizeProductType } from './types';
import './EditProductForm.css';

interface GeneralFormProps {
  data: GeneralFormData;
  onChange: (newData: GeneralFormData) => void;
  loading: boolean;
}

const GeneralForm: React.FC<GeneralFormProps> = ({
  data,
  onChange,
  loading
}) => {
  const [tagKey, setTagKey] = React.useState('');
  const [tagValue, setTagValue] = React.useState('');

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

  return (
    <div className="general-form">
      <div className="edit-form-group">
        <label>Product Name</label>
        <input
          type="text"
          value={data.productName}
          onChange={(e) => onChange({ ...data, productName: e.target.value })}
          disabled={loading}
        />
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

      {/* <div className="edit-form-group">
        <label>Tags</label>
        <div className="tag-list">
          {Object.entries(data.tags || {}).map(([key, value]) => (
            <div key={key} className="tag-item">
              <span>{key}: {value}</span>
              <button
                onClick={() => handleRemoveTag(key)}
                disabled={loading}
                className="remove-tag-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="tag-input-container">
  <input
    type="text"
    className="key-input"
    placeholder="Key"
    value={tagKey}
    onChange={(e) => setTagKey(e.target.value)}
    disabled={loading}
  />
  <input
    type="text"
    className="value-input"
    placeholder="Value"
    value={tagValue}
    onChange={(e) => setTagValue(e.target.value)}
    disabled={loading}
  />
  <button
    onClick={handleAddTag}
    disabled={!tagKey || !tagValue || loading}
  >
    Add Tag
  </button>
</div>

      </div> */}
    </div>
  );
};

export default GeneralForm;
