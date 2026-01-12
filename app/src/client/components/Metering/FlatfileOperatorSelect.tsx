import React from 'react';
import { DropdownField } from '../componenetsss/Inputs';

interface Props {
  dimension: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
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

const FlatfileOperatorSelect: React.FC<Props> = ({ dimension, value, onChange, error, disabled, label }) => {
  const ops = OP[dimension.toUpperCase()] || [];
  const options = ops.map((o) => ({
    label: o,
    value: o,
  }));

  return (
    <DropdownField
      label="Operator"
      value={value}
      onChange={onChange}
      options={options}
            required

      error={error}
      disabled={disabled}
      placeholder="--select--"
    />
  );
};

export default FlatfileOperatorSelect;
