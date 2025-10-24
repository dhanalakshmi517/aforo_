import React from 'react';

interface Props {
  dimension: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
}

const OP: Record<string, string[]> = {
  // FILE UOM
  FILE_NAME: ['equals', 'contains', 'endsWith'],
  FILE_TYPE: ['equals', 'notEquals', 'in'],
  FILE_SIZE: ['>', '<', '>=', '<='],
  UPLOAD_TIME: ['before', 'after', 'between'],
  SOURCE: ['equals', 'notEquals', 'in'],
  // DELIVERY UOM
  DELIVERY_ID: ['equals', 'notEquals'],
  DELIVERY_STATUS: ['equals', 'notEquals', 'in'],
  DELIVERY_REGION: ['equals', 'in', 'notEquals'],
  DELIVERY_TIME: ['before', 'after', 'between'],
  // MB UOM
  FILE_SIZE_MB: ['>', '<', '>=', '<='],
  COMPRESSED: ['is true', 'is false'],
  TRANSFER_TYPE: ['equals', 'notEquals', 'in'],
  REGION_MB: ['equals', 'in', 'notEquals'],
  // RECORD UOM
  ROW_COUNT: ['>', '<', '>=', '<='],
  SOURCE_SYSTEM: ['equals', 'notEquals'],
  SCHEMA_VERSION: ['equals', 'startsWith'],
  IS_VALID: ['is true', 'is false'],
  // ROW UOM (distinct keys)
  ROW_COUNT_ROW: ['>', '<', '>=', '<='],
  SOURCE_SYSTEM_ROW: ['equals', 'notEquals'],
  SCHEMA_VERSION_ROW: ['equals', 'startsWith'],
  IS_VALID_ROW: ['is true', 'is false'],
};

const FlatfileOperatorSelect: React.FC<Props> = ({ dimension, value, onChange, error, disabled }) => {
  const ops = OP[dimension.toUpperCase()] || [];
  return (
    <div>
      <select 
        className={error ? 'error' : ''} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">--select--</option>
        {ops.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FlatfileOperatorSelect;
