import React, { useState, useEffect } from 'react';
import DeleteIconButton from '../componenetsss/DeleteIconButton';
import './UsageConditionForm.css';
import ApiDimensionSelect from './ApiDimensionSelect';
import ApiOperatorSelect from './ApiOperatorSelect';
import FlatfileDimensionSelect from './FlatfileDimensionSelect';
import FlatfileOperatorSelect from './FlatfileOperatorSelect';
import SqlDimensionSelect from './SqlDimensionSelect';
import SqlOperatorSelect from './SqlOperatorSelect';
import LlmDimensionSelect from './LlmDimensionSelect';
import LlmOperatorSelect from './LlmOperatorSelect';
import { InputField, SelectField } from '../Components/InputFields';
import SecondaryButton from '../componenetsss/SecondaryButton';

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
  // Convert conditions to filters format
  const conditionsToFilters = (conditions: { dimension: string; operator: string; value: string }[]) => {
    return conditions.length > 0 
      ? conditions.map((c, i) => ({
          id: i,
          usageCondition: c.dimension,
          customCondition: '',
          operator: c.operator || '',
          value: c.value || ''
        }))
      : [defaultCondition()];
  };

  const [filters, setFilters] = useState<FilterCondition[]>(() => {
    console.log('Initializing filters with conditions:', conditions);
    return conditionsToFilters(conditions);
  });

  // Update local filters when parent conditions change
  useEffect(() => {
    console.log('Parent conditions changed:', conditions);
    if (JSON.stringify(conditions) !== JSON.stringify(filters.map(f => ({
      dimension: f.usageCondition,
      operator: f.operator,
      value: f.value
    })))) {
      console.log('Updating filters from parent conditions');
      setFilters(conditionsToFilters(conditions));
    }
  }, [conditions]);

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
  useEffect(() => {
    const mapped = filters.map(f => ({ dimension: f.usageCondition, operator: f.operator, value: f.value }));
    console.log('Syncing filters to parent conditions:', mapped);
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
            <p>USAGE CONDITION {index + 1}</p>
            <DeleteIconButton
              onClick={() => handleRemove(filter.id)}
              disabled={locked}
              title="Delete filter condition"
            />
          </div>

          <div className="condition-row">
            <div className="condition-field">
              {(() => {
                const commonProps = { 
                  value: filter.usageCondition, 
                  onChange: (val: string) => handleChange(filter.id, 'usageCondition', val), 
                  error: errors[`${index}.dimension`],
                  disabled: locked,
                  label: 'Dimension'
                };
                
                if (isApi)   return <ApiDimensionSelect unitOfMeasure={upperUom} {...commonProps} />;
                if (isFlat)  return <FlatfileDimensionSelect unitOfMeasure={upperUom} {...commonProps} />;
                if (isSql)   return <SqlDimensionSelect unitOfMeasure={upperUom} {...commonProps} />;
                if (isLlm)   return <LlmDimensionSelect unitOfMeasure={upperUom} {...commonProps} />;
                
                return (
                  <div className={`input-container ${locked ? 'disabled' : ''}`}>
                    <InputField
                      label="Dimensions"
                      placeholder="Dimension"
                      value={filter.usageCondition}
                      onChange={(val) => handleChange(filter.id, 'usageCondition', val)}
                      error={errors[`${index}.dimension`]}
                      className={locked ? 'disabled-input' : ''}
                    />
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="operator-value-group">
            <div className="operator-field">
              {(() => {
                if (!filter.usageCondition) {
                  return (
                    <div className="select-container">
                      <SelectField
                        label="Operator"
                        placeholder="--select--"
                        value=""
                        onChange={() => {}}
                        options={[{ label:'--select--', value:'' }]}
                        disabled={true}
                        error={errors[`${index}.operator`]}
                      />
                    </div>
                  );
                }
                
                const operatorProps = {
                  dimension: filter.usageCondition,
                  value: filter.operator,
                  onChange: (val: string) => handleChange(filter.id, 'operator', val),
                  error: errors[`${index}.operator`],
                  disabled: locked,
                  label: 'Operator'
                };

                if (isApi)  return <ApiOperatorSelect {...operatorProps} />;
                if (isFlat) return <FlatfileOperatorSelect {...operatorProps} />;
                if (isSql)  return <SqlOperatorSelect {...operatorProps} />;
                if (isLlm)  return <LlmOperatorSelect {...operatorProps} />;
                
                return (
                  <SelectField
                    label="Operator"
                    value={filter.operator}
                    onChange={(val) => handleChange(filter.id, 'operator', val)}
                    options={[
                      { label: 'Equals', value: '=' },
                      { label: 'Not Equals', value: '!=' },
                      { label: 'Greater Than', value: '>' },
                      { label: 'Less Than', value: '<' },
                      { label: 'Greater Than or Equal', value: '>=' },
                      { label: 'Less Than or Equal', value: '<=' }
                    ]}
                    disabled={locked || !filter.usageCondition}
                    error={errors[`${index}.operator`]}
                  />
                );
              })()}
            </div>

            <div className="value-field">
              <div className={`input-container ${locked || !filter.operator ? 'disabled' : ''}`}>
                <InputField
                  label="Value"
                  placeholder="Value"
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  className={locked || !filter.operator ? 'disabled-input' : ''}
                  error={errors[`${index}.value`]}
                  disabled={locked || !filter.operator}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <SecondaryButton 
        onClick={handleAdd} 
        disabled={locked}
        className="add-btn"
      >
        + Add Filter
      </SecondaryButton>

      <div className="billing-section">
        <SelectField
          label="Select Billing Criteria"
          value={billingCriteria}
          onChange={(val) => {
            onBillingCriteriaChange(val);
          }}
          options={[
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
