// EditSqlOperator.tsx

import React from 'react';
import { DropdownField } from '../../componenetsss/Inputs';

interface Props {
  dimension: string;
  value: string;
  onChange: (val: string) => void;
  label?: string;
}

const OP: Record<string, string[]> = {
  // QUERY_EXECUTION / CELL
  QUERY_TYPE: ['equals', 'notEquals', 'in'],
  EXECUTION_TIME: ['>', '<', '>=', '<='],
  CACHED: ['is true', 'is false'],
  ROW_COUNT_QUERY: ['>', '<', '>=', '<='],
  USER_ID_QUERY: ['equals', 'contains'],
  // CELL (same operators as query execution)
  QUERY_TYPE_CELL: ['equals', 'notEquals', 'in'],
  EXECUTION_TIME_CELL: ['>', '<', '>=', '<='],
  CACHED_CELL: ['is true', 'is false'],
  ROW_COUNT_QUERY_CELL: ['>', '<', '>=', '<='],
  USER_ID_QUERY_CELL: ['equals', 'contains'],
  // ROW
  ROW_COUNT_ROW: ['>', '<', '>=', '<='],
  SOURCE_SYSTEM_ROW: ['equals', 'notEquals'],
  SCHEMA_VERSION_ROW: ['equals', 'startsWith'],
  IS_VALID_ROW: ['is true', 'is false'],
  // MB
  FILE_SIZE_MB: ['>', '<', '>=', '<='],
  COMPRESSED: ['is true', 'is false'],
  REGION_MB: ['equals', 'in'],
  TRANSFER_TYPE: ['equals', 'notEquals', 'in'],
  //REGION_MB
};

const EditSqlOperator: React.FC<Props> = ({ dimension, value, onChange, label = "Operator" }) => {
  const ops = OP[dimension.toUpperCase()] || [];
  const options = ops.map(o => ({
    label: o,
    value: o,
  }));
  
  return (
    <DropdownField
      label={label}
      value={value}
      onChange={onChange}
      options={options}
            required

      placeholder="--select--"
    />
  );
};

export default EditSqlOperator;
