import React from 'react';
import { SelectField } from '../../componenetsss/Inputs';

type Props = {
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
  label?: string;
};

const MAP: Record<string, string[]> = {
  QUERY_EXECUTION: ['QUERY_TYPE', 'EXECUTION_TIME', 'CACHED', 'ROW_COUNT_QUERY', 'USER_ID_QUERY'],
  CELL: ['QUERY_TYPE_CELL', 'EXECUTION_TIME_CELL', 'CACHED_CELL', 'ROW_COUNT_QUERY_CELL', 'USER_ID_QUERY_CELL'],
  ROW: ['ROW_COUNT_ROW', 'SOURCE_SYSTEM_ROW', 'SCHEMA_VERSION_ROW', 'IS_VALID_ROW'],
  MB: ['FILE_SIZE_MB', 'COMPRESSED', 'REGION_MB', 'TRANSFER_TYPE'],
};

const EditSqlDimension: React.FC<Props> = ({ unitOfMeasure, value, onChange, label = "Dimension" }) => {
  const dims = MAP[unitOfMeasure.toUpperCase()] || [];
  const options = dims.map(d => ({
    label: d,
    value: d,
  }));

  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      placeholder="--select--"
    />
  );
};

export default EditSqlDimension;
