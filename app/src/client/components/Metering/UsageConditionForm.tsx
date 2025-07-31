import React, { useState } from 'react';
import './UsageConditionForm.css';

interface FilterCondition {
  id: number;
  usageCondition: string;
  customCondition: string;
  operator: string;
  value: string;
}

const defaultCondition = (): FilterCondition => ({
  id: Date.now(),
  usageCondition: '',
  customCondition: '',
  operator: '',
  value: '',
});

const UsageConditionForm: React.FC = () => {
  const [filters, setFilters] = useState<FilterCondition[]>([defaultCondition()]);

  const handleChange = (id: number, field: keyof FilterCondition, val: string) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: val } : f))
    );
  };

  const handleAdd = () => {
    setFilters((prev) => [...prev, defaultCondition()]);
  };

  const handleRemove = (id: number) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="usage-form-container">
      {filters.map((filter, index) => (
        <div key={filter.id} className="filter-box">
          <div className="filter-header">
            <p>FILTER CONDITION {index + 1}</p>
            <button className="delete-btn" onClick={() => handleRemove(filter.id)}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M2 3.99992H14M12.6667 3.99992V13.3333C12.6667 13.9999 12 14.6666 11.3333 14.6666H4.66667C4 14.6666 3.33333 13.9999 3.33333 13.3333V3.99992M5.33333 3.99992V2.66659C5.33333 1.99992 6 1.33325 6.66667 1.33325H9.33333C10 1.33325 10.6667 1.99992 10.6667 2.66659V3.99992M6.66667 7.33325V11.3333M9.33333 7.33325V11.3333" stroke="#E34935" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></button>
          </div>

          <label>Usage Condition</label>
          <select
            value={filter.usageCondition}
            onChange={(e) => handleChange(filter.id, 'usageCondition', e.target.value)}
          >
            <option value="">--select--</option>
            <option value="Custom Condition">Custom Condition</option>
            <option value="Standard Condition">Standard Condition</option>
          </select>

          <div className="choose-dimension"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <g clip-path="url(#clip0_4454_10823)">
    <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_4454_10823">
      <rect width="12" height="12" fill="white"/>
    </clipPath>
  </defs>
</svg> Choose Dimension</div>

          {filter.usageCondition === 'Custom Condition' && (
            <>
              <label>Enter Custom Condition</label>
              <input
                type="text"
                value={filter.customCondition}
                placeholder="e.g. Response Time"
                onChange={(e) => handleChange(filter.id, 'customCondition', e.target.value)}
              />
            </>
          )}

          <div className="row">
            <div className="column">
              <label>Operator</label>
              <select
                value={filter.operator}
                onChange={(e) => handleChange(filter.id, 'operator', e.target.value)}
              >
                <option value="">--select--</option>
                <option value=">">Greater Than</option>
                <option value="<">Less Than</option>
                <option value="=">Equal To</option>
              </select>
            </div>

            <div className="column">
              <label>Value</label>
              <input
                type="text"
                placeholder="--select--"
                value={filter.value}
                onChange={(e) => handleChange(filter.id, 'value', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <button className="add-btn" onClick={handleAdd}>Add Filter</button>
    </div>
  );
};

export default UsageConditionForm;
