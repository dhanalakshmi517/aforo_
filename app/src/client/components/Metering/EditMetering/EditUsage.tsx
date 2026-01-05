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
import { SelectField, InputField, SelectOption } from '../../componenetsss/Inputs';
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
}

const EditUsage: React.FC<EditUsageProps> = ({ productType, unitOfMeasure, conditions, setConditions, billingCriteria, onBillingCriteriaChange }) => {
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
        <SelectField
          label="Select Billing Criteria"
          required
          value={billingCriteria}
          onChange={onBillingCriteriaChange}
          options={[
            { label: '--select--', value: '' },
            { label: 'Bill based on usage conditions', value: 'BILL_BASED_ON_USAGE_CONDITIONS' },
            { label: 'Bill excluding usage conditions', value: 'BILL_EXCLUDING_USAGE_CONDITIONS' },
          ]}
          placeholderOption="--select--"
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
              <SelectField
                label="Dimensions"
                value={filter.usageCondition}
                onChange={(val) => handleChange(filter.id, 'usageCondition', val)}
                options={genericDims.map((d) => ({ label: d, value: d } as SelectOption))}
                placeholderOption="--select--"
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
                  <SelectField
                    label="Operator"
                    value={filter.operator}
                    onChange={(val) => handleChange(filter.id, 'operator', val)}
                    options={genericOps.map((o) => ({ label: o, value: o } as SelectOption))}
                    placeholderOption="--select--"
                  />
                );
              })()}
            </div>

            <div className="column">
                      <label>Value</label>

              <InputField
                type="text"
                placeholder="Enter value"
                value={filter.value}
                onChange={(val) => handleChange(filter.id, 'value', val)}
              />
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
