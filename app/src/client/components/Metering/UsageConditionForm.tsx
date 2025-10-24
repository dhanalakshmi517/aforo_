import React, { useState } from 'react';
import './UsageConditionForm.css';
import ApiDimensionSelect from './ApiDimensionSelect';
import ApiOperatorSelect from './ApiOperatorSelect';
import FlatfileDimensionSelect from './FlatfileDimensionSelect';
import FlatfileOperatorSelect from './FlatfileOperatorSelect';
import SqlDimensionSelect from './SqlDimensionSelect';
import SqlOperatorSelect from './SqlOperatorSelect';
import LlmDimensionSelect from './LlmDimensionSelect';
import LlmOperatorSelect from './LlmOperatorSelect';
import { InputField, SelectField } from '../componenetsss/Inputs';

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

interface UsageConditionFormProps {
  productType: string;
  unitOfMeasure: string;
  conditions: {
    dimension: string;
    operator: string;
    value: string;
  }[];
  setConditions: React.Dispatch<React.SetStateAction<{
    dimension: string;
    operator: string;
    value: string;
  }[]>>;
  billingCriteria: string;
  onBillingCriteriaChange: (val: string) => void;

  // inline validation
  errors?: Record<string, string>;
  billingError?: string;
  onFieldEdited?: (errorKey: string) => void;

  // NEW: lock state from parent
  locked?: boolean;
}

const UsageConditionForm: React.FC<UsageConditionFormProps> = ({
  productType,
  unitOfMeasure,
  conditions,
  setConditions,
  billingCriteria,
  onBillingCriteriaChange,
  errors = {},
  billingError,
  onFieldEdited,
  locked = false,
}) => {
  const [filters, setFilters] = useState<FilterCondition[]>(
    conditions.length
      ? conditions.map((c, i) => ({ id: i, usageCondition: c.dimension, customCondition: '', operator: c.operator, value: c.value }))
      : [defaultCondition()]
  );

  const handleChange = (id: number, field: keyof FilterCondition, val: string) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: val } : f))
    );
    const index = filters.findIndex(f => f.id === id);
    if (index >= 0 && onFieldEdited) onFieldEdited(`${index}.${field === 'usageCondition' ? 'dimension' : field}`);
  };

  const handleAdd = () => {
    setFilters((prev) => [...prev, defaultCondition()]);
  };

  const handleRemove = (id: number) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  // Sync local filters to parent whenever they change
  React.useEffect(() => {
    const mapped = filters.map(f => ({ dimension: f.usageCondition, operator: f.operator, value: f.value }));
    setConditions(mapped);
  }, [filters, setConditions]);

  const upperType = (productType || '').toUpperCase();
  const upperUom  = (unitOfMeasure || '').toUpperCase();

  const isApi  = upperType === 'API'       && ['API_CALL','REQUEST','TRANSACTION','HIT'].includes(upperUom);
  const isFlat = upperType === 'FLATFILE'  && ['FILE','DELIVERY','MB','RECORD','ROW'].includes(upperUom);
  const isSql  = upperType === 'SQLRESULT' && ['QUERY_EXECUTION','CELL','ROW','MB'].includes(upperUom);
  const isLlm  = upperType === 'LLMTOKEN'  && ['TOKEN','PROMPT_TOKEN','COMPLETION_TOKEN'].includes(upperUom);

  return (
    <div
      className={`usage-form-container ${locked ? 'is-locked' : ''}`}
      style={{ position: 'relative', opacity: locked ? 0.6 : 1 }}
      aria-disabled={locked}
    >
      {/* overlay that blocks all interactions while locked */}
      {locked && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'auto',
            background: 'transparent',
            borderRadius: 12
          }}
        />
      )}

      {filters.map((filter, index) => (
        <div key={filter.id} className="filter-box">
          <div className="filter-header">
            <p>FILTER CONDITION {index + 1}</p>
            <button className="delete-btn" onClick={() => handleRemove(filter.id)} disabled={locked}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 3.99992H14M12.6667 3.99992V13.3333C12.6667 13.9999 12 14.6666 11.3333 14.6666H4.66667C4 14.6666 3.33333 13.9999 3.33333 13.3333V3.99992M5.33333 3.99992V2.66659C5.33333 1.99992 6 1.33325 6.66667 1.33325H9.33333C10 1.33325 10.6667 1.99992 10.6667 2.66659V3.99992M6.66667 7.33325V11.3333M9.33333 7.33325V11.3333" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <label>Dimensions</label>
          {(() => {
            const commonProps = { value: filter.usageCondition, onChange: (val: string) => handleChange(filter.id, 'usageCondition', val), error: errors[`${index}.dimension`] };
            if (isApi)   return <ApiDimensionSelect  unitOfMeasure={upperUom} {...commonProps as any} disabled={locked} />;
            if (isFlat)  return <FlatfileDimensionSelect unitOfMeasure={upperUom} {...commonProps as any} disabled={locked} />;
            if (isSql)   return <SqlDimensionSelect  unitOfMeasure={upperUom} {...commonProps as any} disabled={locked} />;
            if (isLlm)   return <LlmDimensionSelect  unitOfMeasure={upperUom} {...commonProps as any} disabled={locked} />;
            return (
              <InputField
                placeholder="Dimension"
                value={filter.usageCondition}
                onChange={(val) => handleChange(filter.id, 'usageCondition', val)}
                error={errors[`${index}.dimension`]}
                disabled={locked}
              />
            );
          })()}

          <div className="row">
            <div className="column">
              <label>Operator</label>
              {(() => {
                if (!filter.usageCondition) {
                  return (
                    <SelectField
                      placeholder="--select--"
                      value=""
                      onChange={() => {}}
                      options={[{ label:'--select--', value:'', disabled:true }]}
                      disabled
                      error={errors[`${index}.operator`]}
                    />
                  );
                }
                if (isApi)  return <ApiOperatorSelect  dimension={filter.usageCondition} value={filter.operator} onChange={val => handleChange(filter.id, 'operator', val)} error={errors[`${index}.operator`]} disabled={locked} />;
                if (isFlat) return <FlatfileOperatorSelect dimension={filter.usageCondition} value={filter.operator} onChange={val => handleChange(filter.id, 'operator', val)} error={errors[`${index}.operator`]} disabled={locked} />;
                if (isSql)  return <SqlOperatorSelect  dimension={filter.usageCondition} value={filter.operator} onChange={val => handleChange(filter.id, 'operator', val)} error={errors[`${index}.operator`]} disabled={locked} />;
                if (isLlm)  return <LlmOperatorSelect  dimension={filter.usageCondition} value={filter.operator} onChange={val => handleChange(filter.id, 'operator', val)} error={errors[`${index}.operator`]} disabled={locked} />;
                return (
                  <InputField
                    placeholder="Operator"
                    value={filter.operator}
                    onChange={(val) => handleChange(filter.id, 'operator', val)}
                    disabled={locked || !filter.usageCondition}
                    error={errors[`${index}.operator`]}
                  />
                );
              })()}
            </div>

            <div className="column">
              <label>Value</label>
              <InputField
                placeholder="Value"
                value={filter.value}
                onChange={(val) => handleChange(filter.id, 'value', val)}
                disabled={locked || !filter.operator}
                error={errors[`${index}.value`]}
              />
            </div>
          </div>
        </div>
      ))}

      <button className="add-btn" onClick={handleAdd} disabled={locked}>Add Filter</button>

      <div className="billing-section">
        <label>Select Billing Criteria</label>
        <SelectField
          value={billingCriteria}
          onChange={(val) => {
            onBillingCriteriaChange(val);
          }}
          options={[
            {label:'--select--',value:'',disabled:true},
            {label:'Bill based on usage conditions',value:'BILL_BASED_ON_USAGE_CONDITIONS'},
            {label:'Bill excluding usage conditions',value:'BILL_EXCLUDING_USAGE_CONDITIONS'}
          ]}
          error={billingError}
          disabled={locked}
        />
        <p className="billing-note">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <g clipPath="url(#clip0_5214_8669)">
              <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_5214_8669">
                <rect width="12" height="12" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          Note: Multiple usage conditions must all be true (AND logic).
        </p>
      </div>
    </div>
  );
};

export default UsageConditionForm;
