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
  FILE: ['FILE_NAME', 'FILE_TYPE', 'FILE_SIZE', 'UPLOAD_TIME', 'SOURCE'],
  DELIVERY: ['DELIVERY_ID', 'DELIVERY_STATUS', 'DELIVERY_REGION', 'DELIVERY_TIME'],
  MB: ['FILE_SIZE_MB', 'COMPRESSED', 'REGION_MB', 'TRANSFER_TYPE'],
  RECORD: ['ROW_COUNT','SOURCE_SYSTEM','SCHEMA_VERSION','IS_VALID'],
  ROW: ['ROW_COUNT_ROW','SOURCE_SYSTEM_ROW','SCHEMA_VERSION_ROW','IS_VALID_ROW'],
};

const FlatfileDimensionSelect: React.FC<Props> = ({ unitOfMeasure, value, onChange, error, label }) => {
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
            required

      error={error}
      placeholder="--select--"
    />
  );
};

export default FlatfileDimensionSelect;
