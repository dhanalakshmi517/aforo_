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
import { InputField, DropdownField } from '../componenetsss/Inputs';
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

  const [deleteError, setDeleteError] = useState<string>('');
  const [billingCriteriaError, setBillingCriteriaError] = useState<string>('');

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
    if (!billingCriteria) {
      setBillingCriteriaError('Please select billing criteria before adding usage conditions.');
      return;
    }
    setBillingCriteriaError('');
    setFilters((prev) => [...prev, defaultCondition()]);
  };

  const handleRemove = (id: number) => {
    // Prevent deletion if it's the last condition and billing requires conditions
    if (filters.length === 1 && billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS') {
      setDeleteError('Add at least one usage condition to proceed with billing based on usage conditions.');
      return;
    }
    setDeleteError('');
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const upperType = (productType || '').toUpperCase();
  const upperUom = (unitOfMeasure || '').toUpperCase();

  const isApi = upperType === 'API' && ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'].includes(upperUom);
  const isFlat = upperType === 'FLATFILE' && ['FILE', 'DELIVERY', 'MB', 'RECORD', 'ROW'].includes(upperUom);
  const isSql = upperType === 'SQLRESULT' && ['QUERY_EXECUTION', 'CELL', 'ROW', 'MB'].includes(upperUom);
  const isLlm = upperType === 'LLMTOKEN' && ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN'].includes(upperUom);

  // Sync local filters to parent whenever they change
  useEffect(() => {
    const mapped = filters.map(f => ({ dimension: f.usageCondition, operator: f.operator, value: f.value }));
    console.log('🔄 SYNCING FILTERS TO PARENT:', {
      productType: upperType,
      unitOfMeasure: upperUom,
      isFlat,
      filters,
      mapped
    });
    setConditions(mapped);
  }, [filters, setConditions, upperType, upperUom, isFlat]);

  // Clear billing criteria error when billing criteria is selected
  useEffect(() => {
    if (billingCriteriaError && billingCriteria) {
      setBillingCriteriaError('');
    }
  }, [billingCriteria, billingCriteriaError]);

  // Clear delete error when billing criteria changes or when conditions are added
  useEffect(() => {
    if (deleteError) {
      if (billingCriteria !== 'BILL_BASED_ON_USAGE_CONDITIONS' || filters.length > 1) {
        setDeleteError('');
      }
    }
  }, [billingCriteria, filters.length, deleteError]);

  // Clear billing error when all required conditions are filled
  useEffect(() => {
    if (billingError && billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS') {
      const allConditionsFilled = filters.every(filter => 
        filter.usageCondition && filter.operator && filter.value
      );
      if (allConditionsFilled && filters.length > 0 && onFieldEdited) {
        onFieldEdited('billingCriteria');
      }
    }
  }, [filters, billingCriteria, billingError, onFieldEdited]);

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

      {/* Billing section at the top */}
      <div className="billing-section">
        <DropdownField
          label="Select Billing Criteria"
          value={billingCriteria}
          placeholder='Select Billing Criteria'
          required
          onChange={(val) => {
            onBillingCriteriaChange(val);
            // Clear billing error when billing criteria is changed
            if (billingError && onFieldEdited) {
              onFieldEdited('billingCriteria');
            }
          }}
          options={[
            { label: 'Bill based on usage conditions', value: 'BILL_BASED_ON_USAGE_CONDITIONS' },
            { label: 'Bill excluding usage conditions', value: 'BILL_EXCLUDING_USAGE_CONDITIONS' }
          ]}
          error={billingError}
          disabled={locked}
        />
        <p className="billing-note">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <g clipPath="url(#clip0_5214_8669)">
              <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#1D7AFC" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
              <clipPath id="clip0_5214_8669">
                <rect width="12" height="12" fill="white" />
              </clipPath>
            </defs>
          </svg>
          Note: Multiple usage conditions must all be true (AND logic).
        </p>
      </div>

      {/* Show usage condition filters only when "Bill based on usage conditions" is selected */}
      {billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' && (
        <div className="filters-container">
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
              console.log('Debug - billingCriteria:', billingCriteria, 'Type:', typeof billingCriteria);
              console.log('Debug - Should show asterisk:', billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS');
              
              const commonProps = {
                value: filter.usageCondition,
                onChange: (val: string) => handleChange(filter.id, 'usageCondition', val),
                error: billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.dimension`] : undefined,
                disabled: locked,
                label: 'Dimension',
                required: billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'
              };

              if (isApi) return <ApiDimensionSelect unitOfMeasure={upperUom} {...commonProps} />;
              if (isFlat) return <FlatfileDimensionSelect unitOfMeasure={upperUom} {...commonProps} />;
              if (isSql) return <SqlDimensionSelect unitOfMeasure={upperUom} {...commonProps} />;
              if (isLlm) return <LlmDimensionSelect unitOfMeasure={upperUom} {...commonProps} />;

              return (
                <div className={`input-container ${locked ? 'disabled' : ''}`}>
                  <InputField
                    label="Dimension"
                    placeholder="Dimension"
                    value={filter.usageCondition}
                    required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                    onChange={(val) => handleChange(filter.id, 'usageCondition', val)}
                    error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.dimension`] : undefined}
                    className={locked ? 'disabled-input' : ''}
                    disabled={locked}
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
                    <DropdownField
                      label="Operator"
                      placeholder="--select--"
                      required
                      value=""
                      className="operator-usage"
                      onChange={() => { }}
                      options={[{ label: '--select--', value: '' }]}
                      disabled={true}
                      error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.operator`] : undefined}
                    />
                  </div>
                );
              }

              const operatorProps = {
                dimension: filter.usageCondition,
                value: filter.operator,
                onChange: (val: string) => handleChange(filter.id, 'operator', val),
                error: billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.operator`] : undefined,
                disabled: locked,
                label: 'Operator',
                required: billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'
              };

              if (isApi) return <ApiOperatorSelect {...operatorProps} />;
              if (isFlat) return <FlatfileOperatorSelect {...operatorProps} />;
              if (isSql) return <SqlOperatorSelect {...operatorProps} />;
              if (isLlm) return <LlmOperatorSelect {...operatorProps} />;

              return (
                <DropdownField
                  label="Operator"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
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
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.operator`] : undefined}
                />
              );
            })()}
          </div>

          <div className="value-field">
            <div className={`input-container ${locked || !filter.operator ? 'disabled' : ''}`}>
              <InputField
                label="Value"
                placeholder="Value"
                required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                value={filter.value}
                onChange={(val) => handleChange(filter.id, 'value', val)}
                className={locked || !filter.operator ? 'disabled-input' : ''}
                error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                disabled={locked || !filter.operator}
              />
            </div>
          </div>
        </div>
      </div>
    ))}
      </div>
      )}

      {deleteError && (
        <div style={{ color: '#D32F2F', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M5.59961 3.6V5.6M5.59961 7.6H5.60461M10.5996 5.6C10.5996 2.83858 8.36103 0.6 5.59961 0.6C2.83819 0.6 0.599609 2.83858 0.599609 5.6C0.599609 8.36142 2.83819 10.6 5.59961 10.6C8.36103 10.6 10.5996 8.36142 10.5996 5.6Z" stroke="#ED5142" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {deleteError}
        </div>
      )}

      <SecondaryButton
        onClick={handleAdd}
        disabled={locked}
        className="add-btn"
      >
        + Add Usage
      </SecondaryButton>

      {billingCriteriaError && (
        <div style={{ color: '#D32F2F', fontSize: '14px', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M5.59961 3.6V5.6M5.59961 7.6H5.60461M10.5996 5.6C10.5996 2.83858 8.36103 0.6 5.59961 0.6C2.83819 0.6 0.599609 2.83858 0.599609 5.6C0.599609 8.36142 2.83819 10.6 5.59961 10.6C8.36103 10.6 10.5996 8.36142 10.5996 5.6Z" stroke="#ED5142" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {billingCriteriaError}
        </div>
      )}
    </div>
  );
};

export default UsageConditionForm;
