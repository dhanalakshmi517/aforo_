import React from 'react';

type Props = {
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
};

const MAP: Record<string, string[]> = {
  QUERY_EXECUTION: ['QUERY_TYPE', 'EXECUTION_TIME', 'CACHED', 'ROW_COUNT_QUERY', 'USER_ID_QUERY'],
  CELL: ['QUERY_TYPE_CELL', 'EXECUTION_TIME_CELL', 'CACHED_CELL', 'ROW_COUNT_QUERY_CELL', 'USER_ID_QUERY_CELL'],
  ROW: ['ROW_COUNT_ROW', 'SOURCE_SYSTEM_ROW', 'SCHEMA_VERSION_ROW', 'IS_VALID_ROW'],
  MB: ['FILE_SIZE_MB', 'COMPRESSED', 'REGION_MB', 'TRANSFER_TYPE'],
};

const EditSqlDimension: React.FC<Props> = ({ unitOfMeasure, value, onChange }) => {
  const dims = MAP[unitOfMeasure.toUpperCase()] || [];

  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">--select--</option>
      {dims.map(d => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
};

export default EditSqlDimension;
