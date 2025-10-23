import React from 'react';

interface Props {
  dimension: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const OPERATOR_MAP: Record<string, string[]> = {
  STATUS_CODE: ['=', '!=', '>', '<', '>=', '<='],
  METHOD: ['equals', 'contains', 'notEquals'],
  ENDPOINT: ['startsWith', 'contains', 'equals'],
  REGION_API: ['equals', 'notEquals', 'in'],
  RESPONSE_TIME: ['>', '<', '>=', '<='],
  API_KEY: ['equals', 'notEquals', 'contains'],
  REQUEST_ID: ['equals', 'contains'],
  USER_AGENT: ['contains', 'startsWith'],
  IP_ADDRESS: ['equals', 'contains', 'startsWith'],
  REGION_REQUEST: ['equals', 'in', 'notEquals'],
  TIMESTAMP: ['before', 'after', 'between'],
  TRANSACTION_ID: ['equals', 'notEquals'],
  STATUS: ['equals', 'notEquals', 'in'],
  AMOUNT: ['>', '<', '>=', '<='],
  CURRENCY: ['equals', 'notEquals'],
  PAYMENT_METHOD: ['equals', 'notEquals'],
  PAGE_URL: ['contains', 'startsWith', 'equals'],
  USER_ID: ['equals', 'notEquals', 'contains'],
  DEVICE: ['equals', 'in', 'notEquals'],
  BROWSER: ['equals', 'notEquals', 'in'],
  TIME_SPENT: ['>', '<', '>=', '<='],
  MODEL_NAME: ['equals', 'startsWith'],
  TOKEN_TYPE: ['equals', 'notEquals'],
  TOKEN_COUNT: ['>', '<', '>=', '<='],
  COMPUTE_TIER: ['equals', 'in'],
  USER_ID_TOKEN: ['equals', 'contains'],
  MODEL_NAME_PROMPT_TOKEN: ['equals', 'startsWith'],
  TOKEN_TYPE_PROMPT_TOKEN: ['equals', 'notEquals'],
  TOKEN_COUNT_PROMPT_TOKEN: ['>', '<', '>=', '<='],
  COMPUTE_TIER_PROMPT_TOKEN: ['equals', 'in'],
  USER_ID_PROMPT_TOKEN: ['equals', 'contains'],
  MODEL_NAME_COMPLETION_TOKEN: ['equals', 'startsWith'],
  TOKEN_TYPE_COMPLETION_TOKEN: ['equals', 'notEquals'],
  TOKEN_COUNT_COMPLETION_TOKEN: ['>', '<', '>=', '<='],
  COMPUTE_TIER_COMPLETION_TOKEN: ['equals', 'in'],
  USER_ID_COMPLETION_TOKEN: ['equals', 'contains'],
};

const ApiOperatorSelect: React.FC<Props> = ({ dimension, value, onChange, error }) => {
  const ops = OPERATOR_MAP[dimension.toUpperCase()] || [];
  return (
    <div>
      <select 
        className={error ? 'error' : ''} 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">--select--</option>
        {ops.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ApiOperatorSelect;
