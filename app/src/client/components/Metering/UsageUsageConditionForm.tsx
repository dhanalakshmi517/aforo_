import React, { useState } from 'react';
import './ConditionForm.css';

const UsageConditionForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fieldName: '',
    operator: '',
    values: '',
    logicalCombiner: '',
    caseSensitive: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleCaseSensitivity = () => {
    setFormData((prev) => ({
      ...prev,
      caseSensitive: !prev.caseSensitive,
    }));
  };

  return (
    <div className="usage-form-wrapper">
      <div className="form-cards">
        <div className="forms-groups">
          <label>Field Name</label>
          <input
            type="text"
            name="fieldName"
            placeholder="Placeholder"
            value={formData.fieldName}
            onChange={handleChange}
          />
        </div>

        <div className="forms-groups">
          <label>Operator</label>
          <select
            name="operator"
            value={formData.operator}
            onChange={handleChange}
          >
            <option value="">Placeholder</option>
          </select>
        </div>

        <div className="forms-groups">
          <label>Value(s)</label>
          <select
            name="values"
            value={formData.values}
            onChange={handleChange}
          >
            <option value="">--select--</option>
          </select>
        </div>

        <div className="forms-groups">
          <label>Logical Combiner</label>
          <select
            name="logicalCombiner"
            value={formData.logicalCombiner}
            onChange={handleChange}
          >
            <option value="">--select--</option>
          </select>
        </div>

        <div className="forms-groups">
          <label>Case Sensitivity</label>
          <div className="toggle-switch" onClick={toggleCaseSensitivity}>
            <div className={`switch-track ${formData.caseSensitive ? 'inactive' : 'active'}`}>
              <div className={`switch-thumb ${formData.caseSensitive ? 'inactive' : 'active'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageConditionForm;
