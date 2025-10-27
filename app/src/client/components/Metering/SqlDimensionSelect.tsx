import React from 'react';
import { SelectField } from '../componenetsss/Inputs';
import './ApiDimensionSelect.css';


type Props = {
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  label?: string;
};

const MAP: Record<string, string[]> = {
  QUERY_EXECUTION: ['QUERY_TYPE', 'EXECUTION_TIME', 'CACHED', 'ROW_COUNT_QUERY', 'USER_ID_QUERY'],
  CELL: ['QUERY_TYPE_CELL', 'EXECUTION_TIME_CELL', 'CACHED_CELL', 'ROW_COUNT_QUERY_CELL', 'USER_ID_QUERY_CELL'],
  ROW: ['ROW_COUNT_ROW', 'SOURCE_SYSTEM_ROW', 'SCHEMA_VERSION_ROW', 'IS_VALID_ROW'],
  MB: ['FILE_SIZE_MB', 'COMPRESSED', 'REGION_MB', 'TRANSFER_TYPE'],
};

const SqlDimensionSelect: React.FC<Props> = ({ unitOfMeasure, value, onChange, error, label }) => {
  const dims = MAP[unitOfMeasure.toUpperCase()] || [];
  const options = dims.map((d) => ({
    label: d,
    value: d,
  }));

  return (
    <SelectField
      label="Dimension"
      value={value}
      onChange={onChange}
      options={options}
      error={error}
      placeholder="--select--"
    />
  );
};

export default SqlDimensionSelect;
