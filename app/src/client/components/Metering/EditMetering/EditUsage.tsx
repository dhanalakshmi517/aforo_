import React, { useState } from 'react';
import './ConditionForm.css';
import EditApiDimension from './EditApiDimension';
import EditApiOperator from './EditApiOperator';
import EditFlatDimension from './EditFlatDimension';
import EditFlatOperator from './EditFlatOperator';
import EditSqlDimension from './EditSqlDimension';
import EditSqlOperator from './EditSqlOperator';
import EditLlmDimension from './EditLlmDimension';
import EditLlmOperator from './EditLlmOperator';
import { DropdownField, InputField, SelectOption } from '../../componenetsss/Inputs';
import DeleteIconButton from '../../componenetsss/DeleteIconButton';
import SecondaryButton from '../../componenetsss/SecondaryButton';

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

interface EditUsageProps {
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
  errors?: Record<string, string>;
  onFieldEdited?: (errorKey: string) => void;
}

const EditUsage: React.FC<EditUsageProps> = ({ productType, unitOfMeasure, conditions, setConditions, billingCriteria, onBillingCriteriaChange, errors = {}, onFieldEdited }) => {
  const [filters, setFilters] = useState<FilterCondition[]>(conditions.length ? conditions.map((c, i) => ({
    id: i,
    usageCondition: c.dimension,
    customCondition: '',
    operator: c.operator,
    value: c.value
  })) : [defaultCondition()]);

  const handleChange = (id: number, field: keyof FilterCondition, val: string) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: val } : f))
    );
    const index = filters.findIndex(f => f.id === id);
    if (index >= 0 && onFieldEdited) {
      const fieldName = field === 'usageCondition' ? 'dimension' : field;
      onFieldEdited(`${index}.${fieldName}`);
    }
  };

  const handleAdd = () => {
    setFilters((prev) => [...prev, defaultCondition()]);
  };

  const handleRemove = (id: number) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  React.useEffect(() => {
    const mapped = filters.map(f => ({ dimension: f.usageCondition, operator: f.operator, value: f.value }));
    setConditions(mapped);
  }, [filters, setConditions]);

  return (
    <div className="usage-form-container">
       <div className="billing-section">
        <DropdownField
          label="Select Billing Criteria"
          required
          value={billingCriteria}
          onChange={onBillingCriteriaChange}
          options={[
            { label: '--select--', value: '' },
            { label: 'Bill based on usage conditions', value: 'BILL_BASED_ON_USAGE_CONDITIONS' },
            { label: 'Bill excluding usage conditions', value: 'BILL_EXCLUDING_USAGE_CONDITIONS' },
          ]}
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
      
      {filters.map((filter, index) => (
        <div key={filter.id} className="filter-box">
          <div className="filter-header">
            <p>FILTER CONDITION {index + 1}</p>
            <DeleteIconButton onClick={() => handleRemove(filter.id)} />
          </div>

          {(() => {
            const upperType = productType.toUpperCase();
            const upperUom = unitOfMeasure.toUpperCase();
            const isApi = upperType === 'API' && ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'].includes(upperUom);
            const isFlat = upperType === 'FLATFILE' && ['FILE', 'DELIVERY', 'MB', 'RECORD', 'ROW'].includes(upperUom);
            const isSql = upperType === 'SQLRESULT' && ['QUERY_EXECUTION', 'CELL', 'ROW', 'MB'].includes(upperUom);
            const isLlm = upperType === 'LLMTOKEN' && ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN'].includes(upperUom);
            
            if (isApi) return <EditApiDimension unitOfMeasure={upperUom} value={filter.usageCondition} onChange={(val: string) => handleChange(filter.id, 'usageCondition', val)} />;
            if (isFlat) return <EditFlatDimension unitOfMeasure={upperUom} value={filter.usageCondition} onChange={(val: string) => handleChange(filter.id, 'usageCondition', val)} />;
            if (isSql) return <EditSqlDimension unitOfMeasure={upperUom} value={filter.usageCondition} onChange={(val: string) => handleChange(filter.id, 'usageCondition', val)} />;
            if (isLlm) return <EditLlmDimension unitOfMeasure={upperUom} value={filter.usageCondition} onChange={(val: string) => handleChange(filter.id, 'usageCondition', val)} />;
            
            let genericDims = ['CUSTOM'];
            if (filter.usageCondition && !genericDims.includes(filter.usageCondition)) {
              genericDims = [filter.usageCondition, ...genericDims];
            }
            return (
              <DropdownField
                label="Dimensions"
                value={filter.usageCondition}
                onChange={(val) => handleChange(filter.id, 'usageCondition', val)}
                options={genericDims.map((d) => ({ label: d, value: d } as SelectOption))}
                error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.usageCondition`] : undefined}
              />
            );
          })()}

          <div className="row">
            <div className="column">
              {(() => {
                const upperType = productType.toUpperCase();
                const upperUom = unitOfMeasure.toUpperCase();
                const isApi = upperType === 'API' && ['API_CALL', 'REQUEST', 'TRANSACTION', 'HIT'].includes(upperUom);
                const isFlat = upperType === 'FLATFILE' && ['FILE', 'DELIVERY', 'MB', 'RECORD', 'ROW'].includes(upperUom);
                const isSql = upperType === 'SQLRESULT' && ['QUERY_EXECUTION', 'CELL', 'ROW', 'MB'].includes(upperUom);
                const isLlm = upperType === 'LLMTOKEN' && ['TOKEN', 'PROMPT_TOKEN', 'COMPLETION_TOKEN'].includes(upperUom);
                
                if (isApi) return <EditApiOperator dimension={filter.usageCondition} value={filter.operator} onChange={(val: string) => handleChange(filter.id, 'operator', val)} />;
                if (isFlat) return <EditFlatOperator dimension={filter.usageCondition} value={filter.operator} onChange={(val: string) => handleChange(filter.id, 'operator', val)} />;
                if (isSql) return <EditSqlOperator dimension={filter.usageCondition} value={filter.operator} onChange={(val: string) => handleChange(filter.id, 'operator', val)} />;
                if (isLlm) return <EditLlmOperator dimension={filter.usageCondition} value={filter.operator} onChange={(val: string) => handleChange(filter.id, 'operator', val)} />;
                
                let genericOps = ['=', '!=', '>', '<'];
                if (filter.operator && !genericOps.includes(filter.operator)) {
                  genericOps = [filter.operator, ...genericOps];
                }
                return (
                  <DropdownField
                    label="Operator"
                    value={filter.operator}
                    onChange={(val) => handleChange(filter.id, 'operator', val)}
                    options={genericOps.map((o) => ({ label: o, value: o } as SelectOption))}
                    error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.operator`] : undefined}
                  />
                );
              })()}
            </div>

            <div className="column">
              {filter.usageCondition === 'REGION_API' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'FILE_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'SOURCE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'QUERY_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'CACHED' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'true', value: 'true' },
                    { label: 'false', value: 'false' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                />
              ) : filter.usageCondition === 'TOKEN_TYPE_PROMPT_TOKEN' || filter.usageCondition === 'TOKEN_TYPE' || filter.usageCondition === 'TOKEN_TYPE_COMPLETION_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'input', value: 'input' },
                    { label: 'output', value: 'output' },
                    { label: 'total', value: 'total' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                />
              ) : filter.usageCondition === 'COMPUTE_TIER_PROMPT_TOKEN' || filter.usageCondition === 'COMPUTE_TIER' || filter.usageCondition === 'COMPUTE_TIER_COMPLETION_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'free', value: 'free' },
                    { label: 'standard', value: 'standard' },
                    { label: 'premium', value: 'premium' },
                    { label: 'enterprise', value: 'enterprise' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                />
              ) : filter.usageCondition === 'STATUS' || filter.usageCondition === 'DELIVERY_STATUS' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'CURRENCY' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'PAYMENT_METHOD' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'DEVICE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'BROWSER' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'TRANSFER_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'REGION_REQUEST' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'FILE_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'SOURCE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'DELIVERY_STATUS' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'DELIVERY_REGION' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'TRANSFER_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'QUERY_TYPE_CELL' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'CACHED_CELL' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'true', value: 'true' },
                    { label: 'false', value: 'false' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                />
              ) : filter.usageCondition === 'REGION_MB' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'QUERY_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'CACHED' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
                  value={filter.value}
                  onChange={(val) => handleChange(filter.id, 'value', val)}
                  options={[
                    { label: 'true', value: 'true' },
                    { label: 'false', value: 'false' }
                  ]}
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
                />
              ) : filter.usageCondition === 'TOKEN_TYPE' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'COMPUTE_TIER' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'TOKEN_TYPE_PROMPT_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'COMPUTE_TIER_PROMPT_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'TOKEN_TYPE_COMPLETION_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : filter.usageCondition === 'COMPUTE_TIER_COMPLETION_TOKEN' ? (
                <DropdownField
                  label="Value"
                  placeholder="--select--"
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
                />
              ) : (
                <>
                <InputField
                  label="Value"
                  type="text"
                  placeholder="Enter value"
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
                  error={billingCriteria === 'BILL_BASED_ON_USAGE_CONDITIONS' ? errors[`${index}.value`] : undefined}
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
      ))}

      <SecondaryButton className="add-btn" onClick={handleAdd}>
        Add Usage
      </SecondaryButton>

     
    </div>
  );
};

export default EditUsage;
