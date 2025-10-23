import React from 'react';
import './ApiDimensionSelect.css';

type Props = {
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
};

const DIMENSION_MAP: Record<string, string[]> = {
  API_CALL: ['STATUS_CODE', 'METHOD', 'ENDPOINT', 'REGION_API', 'RESPONSE_TIME', 'API_KEY'],
  REQUEST: ['REQUEST_ID', 'USER_AGENT', 'IP_ADDRESS', 'REGION_REQUEST', 'TIMESTAMP'],
  TRANSACTION: ['TRANSACTION_ID', 'STATUS', 'AMOUNT', 'CURRENCY', 'PAYMENT_METHOD'],
  HIT: ['PAGE_URL', 'USER_ID', 'DEVICE', 'BROWSER', 'TIME_SPENT'],
  TOKEN: ['MODEL_NAME', 'TOKEN_TYPE', 'TOKEN_COUNT', 'COMPUTE_TIER', 'USER_ID_TOKEN'],
  PROMPT_TOKEN: ['MODEL_NAME_PROMPT_TOKEN', 'TOKEN_TYPE_PROMPT_TOKEN', 'TOKEN_COUNT_PROMPT_TOKEN', 'COMPUTE_TIER_PROMPT_TOKEN', 'USER_ID_PROMPT_TOKEN'],
  COMPLETION_TOKEN: ['MODEL_NAME_COMPLETION_TOKEN', 'TOKEN_TYPE_COMPLETION_TOKEN', 'TOKEN_COUNT_COMPLETION_TOKEN', 'COMPUTE_TIER_COMPLETION_TOKEN', 'USER_ID_COMPLETION_TOKEN'],
};

const ApiDimensionSelect: React.FC<Props> = ({ unitOfMeasure, value, onChange, error }) => {
  const dims = DIMENSION_MAP[unitOfMeasure.toUpperCase()] || [];
  return (
    <div>
      <select 
        className={`dimension-select ${error ? 'error' : ''}`} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">--select--</option>
        {dims.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ApiDimensionSelect;
