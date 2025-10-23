import React from 'react';

interface Props {
  dimension: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const OP: Record<string, string[]> = {
  // base token
  MODEL_NAME: ['equals', 'startsWith'],
  TOKEN_TYPE: ['equals', 'notEquals'],
  TOKEN_COUNT: ['>', '<', '>=', '<='],
  COMPUTE_TIER: ['equals', 'in'],
  USER_ID_TOKEN: ['equals', 'contains'],

  // completion token
  MODEL_NAME_COMPLETION_TOKEN: ['equals', 'startsWith'],
  TOKEN_TYPE_COMPLETION_TOKEN: ['equals', 'notEquals'],
  TOKEN_COUNT_COMPLETION_TOKEN: ['>', '<', '>=', '<='],
  COMPUTE_TIER_COMPLETION_TOKEN: ['equals', 'in'],
  USER_ID_COMPLETION_TOKEN: ['equals', 'contains'],

  // prompt token
  MODEL_NAME_PROMPT_TOKEN: ['equals', 'startsWith'],
  TOKEN_TYPE_PROMPT_TOKEN: ['equals', 'notEquals'],
  TOKEN_COUNT_PROMPT_TOKEN: ['>', '<', '>=', '<='],
  COMPUTE_TIER_PROMPT_TOKEN: ['equals', 'in'],
  USER_ID_PROMPT_TOKEN: ['equals', 'contains'],
};

const LlmOperatorSelect: React.FC<Props> = ({ dimension, value, onChange, error }) => {
  const ops = OP[dimension.toUpperCase()] || [];
  return (
    <div>
      <select 
        className={error ? 'error' : ''} 
        value={value} 
        onChange={e=>onChange(e.target.value)}
      >
        <option value="">--select--</option>
        {ops.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default LlmOperatorSelect;
