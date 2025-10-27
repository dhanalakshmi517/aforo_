import React from 'react';
import { SelectField } from '../../componenetsss/Inputs';

type Props = {
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
  label?: string;
};

const MAP: Record<string, string[]> = {
  TOKEN: ['MODEL_NAME','TOKEN_TYPE','TOKEN_COUNT','COMPUTE_TIER','USER_ID_TOKEN'],
  PROMPT_TOKEN: ['MODEL_NAME_PROMPT_TOKEN','TOKEN_TYPE_PROMPT_TOKEN','TOKEN_COUNT_PROMPT_TOKEN','COMPUTE_TIER_PROMPT_TOKEN','USER_ID_PROMPT_TOKEN'],
  COMPLETION_TOKEN: ['MODEL_NAME_COMPLETION_TOKEN','TOKEN_TYPE_COMPLETION_TOKEN','TOKEN_COUNT_COMPLETION_TOKEN','COMPUTE_TIER_COMPLETION_TOKEN','USER_ID_COMPLETION_TOKEN'],
};
const EditLlmDimension: React.FC<Props> = ({ unitOfMeasure, value, onChange, label = "Dimension" }) => {
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

export default EditLlmDimension;
