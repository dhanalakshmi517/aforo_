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
              {filter.usageCondition === 'REGION_API' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'us-east-1', value: 'us-east-1' },
                    { label: 'us-west-1', value: 'us-west-1' },
                    { label: 'us-west-2', value: 'us-west-2' },
                    { label: 'eu-west-1', value: 'eu-west-1' },
                    { label: 'eu-central-1', value: 'eu-central-1' },
                    { label: 'ap-southeast-1', value: 'ap-southeast-1' },
                    { label: 'ap-northeast-1', value: 'ap-northeast-1' },
                    { label: 'ap-south-1', value: 'ap-south-1' },
                    { label: 'sa-east-1', value: 'sa-east-1' },
                    { label: 'ca-central-1', value: 'ca-central-1' },
                    { label: 'me-south-1', value: 'me-south-1' },
                    { label: 'af-south-1', value: 'af-south-1' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'FILE_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'pdf', value: 'pdf' },
                    { label: 'doc', value: 'doc' },
                    { label: 'docx', value: 'docx' },
                    { label: 'xls', value: 'xls' },
                    { label: 'xlsx', value: 'xlsx' },
                    { label: 'ppt', value: 'ppt' },
                    { label: 'pptx', value: 'pptx' },
                    { label: 'txt', value: 'txt' },
                    { label: 'csv', value: 'csv' },
                    { label: 'json', value: 'json' },
                    { label: 'xml', value: 'xml' },
                    { label: 'html', value: 'html' },
                    { label: 'css', value: 'css' },
                    { label: 'js', value: 'js' },
                    { label: 'jpg', value: 'jpg' },
                    { label: 'jpeg', value: 'jpeg' },
                    { label: 'png', value: 'png' },
                    { label: 'gif', value: 'gif' },
                    { label: 'svg', value: 'svg' },
                    { label: 'mp4', value: 'mp4' },
                    { label: 'mp3', value: 'mp3' },
                    { label: 'zip', value: 'zip' },
                    { label: 'rar', value: 'rar' },
                    { label: 'tar', value: 'tar' },
                    { label: 'gz', value: 'gz' },
                    { label: '7z', value: '7z' },
                    { label: 'other', value: 'other' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'SOURCE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'web', value: 'web' },
                    { label: 'api', value: 'api' },
                    { label: 'mobile_app', value: 'mobile_app' },
                    { label: 'batch', value: 'batch' },
                    { label: 'realtime', value: 'realtime' },
                    { label: 'manual', value: 'manual' },
                    { label: 'scheduled', value: 'scheduled' },
                    { label: 'webhook', value: 'webhook' },
                    { label: 'import', value: 'import' },
                    { label: 'export', value: 'export' },
                    { label: 'sync', value: 'sync' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'QUERY_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'select', value: 'select' },
                    { label: 'insert', value: 'insert' },
                    { label: 'update', value: 'update' },
                    { label: 'delete', value: 'delete' },
                    { label: 'create', value: 'create' },
                    { label: 'alter', value: 'alter' },
                    { label: 'drop', value: 'drop' },
                    { label: 'truncate', value: 'truncate' },
                    { label: 'merge', value: 'merge' },
                    { label: 'upsert', value: 'upsert' },
                    { label: 'bulk_insert', value: 'bulk_insert' },
                    { label: 'view', value: 'view' },
                    { label: 'stored_procedure', value: 'stored_procedure' },
                    { label: 'function', value: 'function' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'CACHED' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'true', value: 'true' },
                    { label: 'false', value: 'false' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'TOKEN_TYPE_PROMPT_TOKEN' || filter.usageCondition === 'TOKEN_TYPE' || filter.usageCondition === 'TOKEN_TYPE_COMPLETION_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'input', value: 'input' },
                    { label: 'output', value: 'output' },
                    { label: 'total', value: 'total' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'COMPUTE_TIER_PROMPT_TOKEN' || filter.usageCondition === 'COMPUTE_TIER' || filter.usageCondition === 'COMPUTE_TIER_COMPLETION_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'free', value: 'free' },
                    { label: 'standard', value: 'standard' },
                    { label: 'premium', value: 'premium' },
                    { label: 'enterprise', value: 'enterprise' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'STATUS' || filter.usageCondition === 'DELIVERY_STATUS' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'pending', value: 'pending' },
                    { label: 'processing', value: 'processing' },
                    { label: 'completed', value: 'completed' },
                    { label: 'failed', value: 'failed' },
                    { label: 'cancelled', value: 'cancelled' },
                    { label: 'success', value: 'success' },
                    { label: 'error', value: 'error' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'CURRENCY' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'USD', value: 'USD' },
                    { label: 'EUR', value: 'EUR' },
                    { label: 'GBP', value: 'GBP' },
                    { label: 'JPY', value: 'JPY' },
                    { label: 'INR', value: 'INR' },
                    { label: 'AUD', value: 'AUD' },
                    { label: 'CAD', value: 'CAD' },
                    { label: 'CHF', value: 'CHF' },
                    { label: 'CNY', value: 'CNY' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'PAYMENT_METHOD' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'credit_card', value: 'credit_card' },
                    { label: 'debit_card', value: 'debit_card' },
                    { label: 'paypal', value: 'paypal' },
                    { label: 'bank_transfer', value: 'bank_transfer' },
                    { label: 'wire_transfer', value: 'wire_transfer' },
                    { label: 'crypto', value: 'crypto' },
                    { label: 'wallet', value: 'wallet' },
                    { label: 'cash', value: 'cash' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'DEVICE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'desktop', value: 'desktop' },
                    { label: 'mobile', value: 'mobile' },
                    { label: 'tablet', value: 'tablet' },
                    { label: 'smartwatch', value: 'smartwatch' },
                    { label: 'tv', value: 'tv' },
                    { label: 'iot', value: 'iot' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'BROWSER' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'chrome', value: 'chrome' },
                    { label: 'firefox', value: 'firefox' },
                    { label: 'safari', value: 'safari' },
                    { label: 'edge', value: 'edge' },
                    { label: 'opera', value: 'opera' },
                    { label: 'brave', value: 'brave' },
                    { label: 'other', value: 'other' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'TRANSFER_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'upload', value: 'upload' },
                    { label: 'download', value: 'download' },
                    { label: 'sync', value: 'sync' },
                    { label: 'backup', value: 'backup' },
                    { label: 'restore', value: 'restore' },
                    { label: 'migration', value: 'migration' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'REGION_REQUEST' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'us-east-1', value: 'us-east-1' },
                    { label: 'us-west-1', value: 'us-west-1' },
                    { label: 'us-west-2', value: 'us-west-2' },
                    { label: 'eu-west-1', value: 'eu-west-1' },
                    { label: 'eu-central-1', value: 'eu-central-1' },
                    { label: 'ap-southeast-1', value: 'ap-southeast-1' },
                    { label: 'ap-northeast-1', value: 'ap-northeast-1' },
                    { label: 'ap-south-1', value: 'ap-south-1' },
                    { label: 'sa-east-1', value: 'sa-east-1' },
                    { label: 'ca-central-1', value: 'ca-central-1' },
                    { label: 'me-south-1', value: 'me-south-1' },
                    { label: 'af-south-1', value: 'af-south-1' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'FILE_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'pdf', value: 'pdf' },
                    { label: 'doc', value: 'doc' },
                    { label: 'docx', value: 'docx' },
                    { label: 'xls', value: 'xls' },
                    { label: 'xlsx', value: 'xlsx' },
                    { label: 'ppt', value: 'ppt' },
                    { label: 'pptx', value: 'pptx' },
                    { label: 'txt', value: 'txt' },
                    { label: 'csv', value: 'csv' },
                    { label: 'json', value: 'json' },
                    { label: 'xml', value: 'xml' },
                    { label: 'html', value: 'html' },
                    { label: 'css', value: 'css' },
                    { label: 'js', value: 'js' },
                    { label: 'jpg', value: 'jpg' },
                    { label: 'jpeg', value: 'jpeg' },
                    { label: 'png', value: 'png' },
                    { label: 'gif', value: 'gif' },
                    { label: 'svg', value: 'svg' },
                    { label: 'mp4', value: 'mp4' },
                    { label: 'mp3', value: 'mp3' },
                    { label: 'zip', value: 'zip' },
                    { label: 'rar', value: 'rar' },
                    { label: 'tar', value: 'tar' },
                    { label: 'gz', value: 'gz' },
                    { label: '7z', value: '7z' },
                    { label: 'other', value: 'other' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'SOURCE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'web', value: 'web' },
                    { label: 'api', value: 'api' },
                    { label: 'mobile_app', value: 'mobile_app' },
                    { label: 'batch', value: 'batch' },
                    { label: 'realtime', value: 'realtime' },
                    { label: 'manual', value: 'manual' },
                    { label: 'scheduled', value: 'scheduled' },
                    { label: 'webhook', value: 'webhook' },
                    { label: 'import', value: 'import' },
                    { label: 'export', value: 'export' },
                    { label: 'sync', value: 'sync' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'DELIVERY_STATUS' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'pending', value: 'pending' },
                    { label: 'processing', value: 'processing' },
                    { label: 'completed', value: 'completed' },
                    { label: 'failed', value: 'failed' },
                    { label: 'cancelled', value: 'cancelled' },
                    { label: 'success', value: 'success' },
                    { label: 'error', value: 'error' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'DELIVERY_REGION' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'us-east-1', value: 'us-east-1' },
                    { label: 'us-west-1', value: 'us-west-1' },
                    { label: 'us-west-2', value: 'us-west-2' },
                    { label: 'eu-west-1', value: 'eu-west-1' },
                    { label: 'eu-central-1', value: 'eu-central-1' },
                    { label: 'ap-southeast-1', value: 'ap-southeast-1' },
                    { label: 'ap-northeast-1', value: 'ap-northeast-1' },
                    { label: 'ap-south-1', value: 'ap-south-1' },
                    { label: 'sa-east-1', value: 'sa-east-1' },
                    { label: 'ca-central-1', value: 'ca-central-1' },
                    { label: 'me-south-1', value: 'me-south-1' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'TRANSFER_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'upload', value: 'upload' },
                    { label: 'download', value: 'download' },
                    { label: 'sync', value: 'sync' },
                    { label: 'backup', value: 'backup' },
                    { label: 'restore', value: 'restore' },
                    { label: 'migration', value: 'migration' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'QUERY_TYPE_CELL' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'select', value: 'select' },
                    { label: 'insert', value: 'insert' },
                    { label: 'update', value: 'update' },
                    { label: 'delete', value: 'delete' },
                    { label: 'create', value: 'create' },
                    { label: 'alter', value: 'alter' },
                    { label: 'drop', value: 'drop' },
                    { label: 'truncate', value: 'truncate' },
                    { label: 'merge', value: 'merge' },
                    { label: 'upsert', value: 'upsert' },
                    { label: 'bulk_insert', value: 'bulk_insert' },
                    { label: 'view', value: 'view' },
                    { label: 'stored_procedure', value: 'stored_procedure' },
                    { label: 'function', value: 'function' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'CACHED_CELL' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'true', value: 'true' },
                    { label: 'false', value: 'false' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'REGION_MB' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'us-east-1', value: 'us-east-1' },
                    { label: 'us-west-1', value: 'us-west-1' },
                    { label: 'us-west-2', value: 'us-west-2' },
                    { label: 'eu-west-1', value: 'eu-west-1' },
                    { label: 'eu-central-1', value: 'eu-central-1' },
                    { label: 'ap-southeast-1', value: 'ap-southeast-1' },
                    { label: 'ap-northeast-1', value: 'ap-northeast-1' },
                    { label: 'ap-south-1', value: 'ap-south-1' },
                    { label: 'sa-east-1', value: 'sa-east-1' },
                    { label: 'ca-central-1', value: 'ca-central-1' },
                    { label: 'me-south-1', value: 'me-south-1' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'QUERY_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'select', value: 'select' },
                    { label: 'insert', value: 'insert' },
                    { label: 'update', value: 'update' },
                    { label: 'delete', value: 'delete' },
                    { label: 'create', value: 'create' },
                    { label: 'alter', value: 'alter' },
                    { label: 'drop', value: 'drop' },
                    { label: 'truncate', value: 'truncate' },
                    { label: 'merge', value: 'merge' },
                    { label: 'upsert', value: 'upsert' },
                    { label: 'bulk_insert', value: 'bulk_insert' },
                    { label: 'view', value: 'view' },
                    { label: 'stored_procedure', value: 'stored_procedure' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'CACHED' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'true', value: 'true' },
                    { label: 'false', value: 'false' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'TOKEN_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'prompt', value: 'prompt' },
                    { label: 'completion', value: 'completion' },
                    { label: 'input', value: 'input' },
                    { label: 'output', value: 'output' },
                    { label: 'total', value: 'total' },
                    { label: 'system', value: 'system' },
                    { label: 'user', value: 'user' },
                    { label: 'assistant', value: 'assistant' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'COMPUTE_TIER' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'standard', value: 'standard' },
                    { label: 'premium', value: 'premium' },
                    { label: 'enterprise', value: 'enterprise' },
                    { label: 'free', value: 'free' },
                    { label: 'trial', value: 'trial' },
                    { label: 'batch', value: 'batch' },
                    { label: 'realtime', value: 'realtime' },
                    { label: 'priority', value: 'priority' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'TOKEN_TYPE_PROMPT_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'prompt', value: 'prompt' },
                    { label: 'completion', value: 'completion' },
                    { label: 'input', value: 'input' },
                    { label: 'output', value: 'output' },
                    { label: 'total', value: 'total' },
                    { label: 'system', value: 'system' },
                    { label: 'user', value: 'user' },
                    { label: 'assistant', value: 'assistant' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'COMPUTE_TIER_PROMPT_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'standard', value: 'standard' },
                    { label: 'premium', value: 'premium' },
                    { label: 'enterprise', value: 'enterprise' },
                    { label: 'free', value: 'free' },
                    { label: 'trial', value: 'trial' },
                    { label: 'batch', value: 'batch' },
                    { label: 'realtime', value: 'realtime' },
                    { label: 'priority', value: 'priority' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'TOKEN_TYPE_COMPLETION_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'prompt', value: 'prompt' },
                    { label: 'completion', value: 'completion' },
                    { label: 'input', value: 'input' },
                    { label: 'output', value: 'output' },
                    { label: 'total', value: 'total' },
                    { label: 'system', value: 'system' },
                    { label: 'user', value: 'user' },
                    { label: 'assistant', value: 'assistant' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : filter.usageCondition === 'COMPUTE_TIER_COMPLETION_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'standard', value: 'standard' },
                    { label: 'premium', value: 'premium' },
                    { label: 'enterprise', value: 'enterprise' },
                    { label: 'free', value: 'free' },
                    { label: 'trial', value: 'trial' },
                    { label: 'batch', value: 'batch' },
                    { label: 'realtime', value: 'realtime' },
                    { label: 'priority', value: 'priority' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
              ) : (
                <>
                <InputField
                  label="Value"
                  placeholder="Value"
                  required={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS'}
                  value={filter.value}
                  onChange={(val) => {
                    // For STATUS_CODE dimension, only allow numbers
                    if (filter.usageCondition === 'STATUS_CODE') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For METHOD and ENDPOINT dimensions, only allow non-numeric strings (no numbers)
                    else if (filter.usageCondition === 'METHOD' || filter.usageCondition === 'ENDPOINT') {
                      const nonNumericOnly = val.replace(/\d/g, '');
                      handleChange(filter.id, 'value', nonNumericOnly);
                    }
                    // For RESPONSE_TIME dimension, only allow numbers (including decimals like 100, 250.5, 1000, 50.25)
                    else if (filter.usageCondition === 'RESPONSE_TIME') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      // Prevent multiple decimal points
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For FILE_SIZE dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'FILE_SIZE') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      // Prevent multiple decimal points
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For UPLOAD_TIME dimension, format as MM/DD/YYYY
                    else if (filter.usageCondition === 'UPLOAD_TIME') {
                      const numericOnly = val.replace(/\D/g, '');
                      let formatted = numericOnly;
                      if (numericOnly.length >= 2) {
                        formatted = numericOnly.slice(0, 2) + '/' + numericOnly.slice(2);
                      }
                      if (numericOnly.length >= 4) {
                        formatted = numericOnly.slice(0, 2) + '/' + numericOnly.slice(2, 4) + '/' + numericOnly.slice(4, 8);
                      }
                      handleChange(filter.id, 'value', formatted);
                    }
                    // For DELIVERY_TIME dimension, format as MM/DD/YYYY
                    else if (filter.usageCondition === 'DELIVERY_TIME') {
                      const numericOnly = val.replace(/\D/g, '');
                      let formatted = numericOnly;
                      if (numericOnly.length >= 2) {
                        formatted = numericOnly.slice(0, 2) + '/' + numericOnly.slice(2);
                      }
                      if (numericOnly.length >= 4) {
                        formatted = numericOnly.slice(0, 2) + '/' + numericOnly.slice(2, 4) + '/' + numericOnly.slice(4, 8);
                      }
                      handleChange(filter.id, 'value', formatted);
                    }
                    // For FILE_NAME dimension, only allow non-empty strings (no spaces only)
                    else if (filter.usageCondition === 'FILE_NAME') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For EXECUTION_TIME dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'EXECUTION_TIME') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For ROW_COUNT dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'ROW_COUNT') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      // Prevent multiple decimal points
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For USER_ID dimension, only allow non-empty strings (no spaces only)
                    else if (filter.usageCondition === 'USER_ID') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For MODEL_NAME_PROMPT_TOKEN dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'MODEL_NAME_PROMPT_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For TOKEN_TYPE_PROMPT_TOKEN dimension, handled by dropdown above
                    else if (filter.usageCondition === 'TOKEN_TYPE_PROMPT_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For TOKEN_COUNT_PROMPT_TOKEN dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'TOKEN_COUNT_PROMPT_TOKEN') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For COMPUTE_TIER_PROMPT_TOKEN dimension, handled by dropdown above
                    else if (filter.usageCondition === 'COMPUTE_TIER_PROMPT_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For USER_ID_PROMPT_TOKEN dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'USER_ID_PROMPT_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For TOKEN_COUNT dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'TOKEN_COUNT') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For MODEL_NAME dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'MODEL_NAME') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For USER_ID_TOKEN dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'USER_ID_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For TOKEN_TYPE dimension, handled by dropdown above
                    else if (filter.usageCondition === 'TOKEN_TYPE') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For COMPUTE_TIER dimension, handled by dropdown above
                    else if (filter.usageCondition === 'COMPUTE_TIER') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For TOKEN_COUNT_PROMPT_TOKEN dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'TOKEN_COUNT_PROMPT_TOKEN') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For TOKEN_COUNT_COMPLETION_TOKEN dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'TOKEN_COUNT_COMPLETION_TOKEN') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For MODEL_NAME_COMPLETION_TOKEN dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'MODEL_NAME_COMPLETION_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For TOKEN_TYPE_COMPLETION_TOKEN dimension, handled by dropdown above
                    else if (filter.usageCondition === 'TOKEN_TYPE_COMPLETION_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For TOKEN_COUNT_COMPLETION_TOKEN dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'TOKEN_COUNT_COMPLETION_TOKEN') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For COMPUTE_TIER_COMPLETION_TOKEN dimension, handled by dropdown above
                    else if (filter.usageCondition === 'COMPUTE_TIER_COMPLETION_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For USER_ID_COMPLETION_TOKEN dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'USER_ID_COMPLETION_TOKEN') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For REQUEST_ID dimension, only allow numbers
                    else if (filter.usageCondition === 'REQUEST_ID') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For USER_AGENT dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'USER_AGENT') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For IP_ADDRESS dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'IP_ADDRESS') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For REGION_REQUEST dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'REGION_REQUEST') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For TIMESTAMP dimension, only allow numbers (including decimals for Unix timestamps)
                    else if (filter.usageCondition === 'TIMESTAMP') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      // Prevent multiple decimal points
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For TRANSACTION_ID dimension, only allow numbers (integers)
                    else if (filter.usageCondition === 'TRANSACTION_ID') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For AMOUNT dimension, only allow numbers (integers)
                    else if (filter.usageCondition === 'AMOUNT') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For PAGE_URL dimension, only allow numbers (integers)
                    else if (filter.usageCondition === 'PAGE_URL') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For TIME_SPENT dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'TIME_SPENT') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      // Prevent multiple decimal points
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For DELIVERY_ID dimension, only allow numbers (integers)
                    else if (filter.usageCondition === 'DELIVERY_ID') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For DELIVERY_REGION dimension, handled by dropdown above
                    else if (filter.usageCondition === 'DELIVERY_REGION') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For DELIVERY_TIME dimension, only allow numbers (integers)
                    else if (filter.usageCondition === 'DELIVERY_TIME') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For FILE_SIZE_MB dimension, only allow numbers (integers)
                    else if (filter.usageCondition === 'FILE_SIZE_MB') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For COMPRESSED dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'COMPRESSED') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For REGION_MB dimension, handled by dropdown above
                    else if (filter.usageCondition === 'REGION_MB') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For SOURCE_SYSTEM dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'SOURCE_SYSTEM') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For SCHEMA_VERSION dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'SCHEMA_VERSION') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For IS_VALID dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'IS_VALID') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For ROW_COUNT_QUERY dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'ROW_COUNT_QUERY') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      // Prevent multiple decimal points
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For USER_ID_QUERY dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'USER_ID_QUERY') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For QUERY_TYPE_CELL dimension, handled by dropdown above
                    else if (filter.usageCondition === 'QUERY_TYPE_CELL') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For EXECUTION_TIME_CELL dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'EXECUTION_TIME_CELL') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For CACHED_CELL dimension, handled by dropdown above
                    else if (filter.usageCondition === 'CACHED_CELL') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For ROW_COUNT_QUERY_CELL dimension, only allow numbers (including decimals)
                    else if (filter.usageCondition === 'ROW_COUNT_QUERY_CELL') {
                      const numericWithDecimal = val.replace(/[^\d.]/g, '');
                      const parts = numericWithDecimal.split('.');
                      const validNumber = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericWithDecimal;
                      handleChange(filter.id, 'value', validNumber);
                    }
                    // For USER_ID_QUERY_CELL dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'USER_ID_QUERY_CELL') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For ROW_COUNT_ROW dimension, only allow numbers (integers)
                    else if (filter.usageCondition === 'ROW_COUNT_ROW') {
                      const numericOnly = val.replace(/\D/g, '');
                      handleChange(filter.id, 'value', numericOnly);
                    }
                    // For SOURCE_SYSTEM_ROW dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'SOURCE_SYSTEM_ROW') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For SCHEMA_VERSION_ROW dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'SCHEMA_VERSION_ROW') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For IS_VALID_ROW dimension, only allow non-empty strings
                    else if (filter.usageCondition === 'IS_VALID_ROW') {
                      handleChange(filter.id, 'value', val);
                    }
                    // For API_KEY dimension, only allow non-empty strings (no spaces only)
                    else if (filter.usageCondition === 'API_KEY') {
                      handleChange(filter.id, 'value', val);
                    } else {
                      handleChange(filter.id, 'value', val);
                    }
                  }}
                  type={filter.usageCondition === 'STATUS_CODE' || filter.usageCondition === 'FILE_SIZE' || filter.usageCondition === 'EXECUTION_TIME' || filter.usageCondition === 'ROW_COUNT' ? 'number' : 'text'}
                  inputMode={filter.usageCondition === 'STATUS_CODE' || filter.usageCondition === 'FILE_SIZE' || filter.usageCondition === 'EXECUTION_TIME' || filter.usageCondition === 'ROW_COUNT' ? 'numeric' : undefined}
                  className={locked || !filter.operator ? 'disabled-input' : ''}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                  disabled={locked || !filter.operator}
                />
                {/* Inline validation message for number fields - show hint for these dimensions */}
                {['STATUS_CODE', 'REQUEST_ID', 'TRANSACTION_ID', 'AMOUNT', 'PAGE_URL', 'DELIVERY_ID', 'DELIVERY_TIME', 'FILE_SIZE_MB', 'ROW_COUNT_ROW', 'EXECUTION_TIME_CELL', 'ROW_COUNT_QUERY_CELL', 'FILE_SIZE', 'EXECUTION_TIME', 'ROW_COUNT_QUERY', 'TOKEN_COUNT', 'TOKEN_COUNT_PROMPT_TOKEN', 'TOKEN_COUNT_COMPLETION_TOKEN', 'RESPONSE_TIME', 'UPLOAD_TIME', 'TIMESTAMP', 'TIME_SPENT'].includes(filter.usageCondition) && (
                  <div style={{ fontSize: '10px', color: '#FFA500', marginTop: '-8px' }}>
                     Numbers only
                  </div>
                )}
                {/* Inline validation message for string fields that shouldn't have numbers */}
                {['METHOD', 'ENDPOINT', 'FILE_NAME', 'USER_AGENT', 'IP_ADDRESS', 'REGION_REQUEST', 'MODEL_NAME', 'USER_ID', 'MODEL_NAME_PROMPT_TOKEN', 'USER_ID_PROMPT_TOKEN', 'MODEL_NAME_COMPLETION_TOKEN', 'USER_ID_COMPLETION_TOKEN', 'COMPRESSED', 'SOURCE_SYSTEM_ROW', 'SCHEMA_VERSION_ROW', 'IS_VALID_ROW', 'USER_ID_QUERY'].includes(filter.usageCondition) && filter.value && /\d/.test(filter.value) && (
                  <div style={{ fontSize: '10px', color: '#FFA500', marginTop: '-8px' }}>
                    Text only
                  </div>
                )}
                </>
              )}
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
