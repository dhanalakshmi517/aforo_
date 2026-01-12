import React from 'react';
import {DropdownField } from '../../componenetsss/Inputs';

type Props = {
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
  label?: string;
};

const MAP: Record<string, string[]> = {
  FILE: ['FILE_NAME', 'FILE_TYPE', 'FILE_SIZE', 'UPLOAD_TIME', 'SOURCE'],
  DELIVERY: ['DELIVERY_ID', 'DELIVERY_STATUS', 'DELIVERY_REGION', 'DELIVERY_TIME'],
  MB: ['FILE_SIZE_MB', 'COMPRESSED', 'REGION_MB', 'TRANSFER_TYPE'],
  RECORD: ['ROW_COUNT','SOURCE_SYSTEM','SCHEMA_VERSION','IS_VALID'],
  ROW: ['ROW_COUNT_ROW','SOURCE_SYSTEM_ROW','SCHEMA_VERSION_ROW','IS_VALID_ROW'],
};
const EditFlatDimension: React.FC<Props> = ({ unitOfMeasure, value, onChange, label = "Dimension" }) => {
  const dims = MAP[unitOfMeasure.toUpperCase()] || [];
  const options = dims.map(dimension => ({
    label: dimension,
    value: dimension,
  }));

  return (
    <DropdownField
      label={label}
      value={value}
      onChange={onChange}
            required

      options={options}
      placeholder="--select--"
    />
  );
};

export default EditFlatDimension;
