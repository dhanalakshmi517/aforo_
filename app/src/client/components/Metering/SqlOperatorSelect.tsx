import React from 'react';

interface Props {
  dimension: string;
  value: string;
  onChange: (val: string) => void;
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

const SqlOperatorSelect: React.FC<Props> = ({ dimension, value, onChange }) => {
  const ops = OP[dimension.toUpperCase()] || [];
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      <option value="">--select--</option>
      {ops.map(o => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
};

export default SqlOperatorSelect;
