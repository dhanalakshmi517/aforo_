import React from 'react';

interface TagLabelInputProps {
  type: 'tag' | 'label';
  items: Record<string, any>;
  onAdd: (key: string, value: string) => void;
  onRemove: (key: string) => void;
}

const TagLabelInput: React.FC<TagLabelInputProps> = ({ 
  type, 
  items, 
  onAdd, 
  onRemove 
}) => {
  const [key, setKey] = React.useState('');
  const [value, setValue] = React.useState('');

  const handleAdd = () => {
    if (key && value) {
      onAdd(key, value);
      setKey('');
      setValue('');
    }
  };

  return (
    <div className="tag-label-input">
      <div className="input-group">
        <input
          type="text"
          placeholder="Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="form-control"
        />
        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="form-control"
        />
        <button 
          type="button"
          onClick={handleAdd}
          disabled={!key || !value || Object.keys(items).length >= 3}
          title={Object.keys(items).length >= 3 ? `Maximum 3 ${type}s allowed` : ''}
          className="btn btn-sm btn-outline-secondary"
        >
          ✚ Add
        </button>
      </div>
      
      <div className="items-container mt-2">
        {Object.entries(items).map(([itemKey, itemValue]) => (
          <div key={itemKey} className="d-inline-flex align-items-center bg-light rounded-pill px-3 py-1 me-2 mb-2">
            <span className="me-2 fw-medium">{itemKey}</span>
            <span className="me-2">=</span>
            <span className="me-2">{itemValue}</span>
            <button 
              type="button" 
              onClick={() => onRemove(itemKey)}
              className="btn-close btn-close-sm"
              aria-label={`Remove ${itemKey}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagLabelInput;
