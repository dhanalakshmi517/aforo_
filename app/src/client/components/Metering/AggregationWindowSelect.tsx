import React from 'react';
import { SelectField, InputField } from '../componenetsss/Inputs';

interface AggregationWindowSelectProps {
  label?: string;
  productType: string;
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  optional?: boolean;
  disabled?: boolean;
}

/**
 * Displays appropriate aggregation-window options based on product type + unit-of-measure.
 * Currently only API product rules are defined as per requirements.
 */
const AggregationWindowSelect: React.FC<AggregationWindowSelectProps> = ({
  label,
  productType,
  unitOfMeasure,
  value,
  onChange,
  error,
  optional,
  disabled
}) => {
  // Show placeholder dropdown until product/unit are selected so UI stays consistent
  if (!productType || !unitOfMeasure) {
    return (
      <SelectField
        label={label}
        value=""
        onChange={() => { }}
        options={[{ label: '-- select product/unit first --', value: '', disabled: true }]}
        disabled
        optional={optional}
      />
    );
  }

  const type = productType.toUpperCase();
  const uom = unitOfMeasure.toUpperCase();

  let options: string[] | null = null;

  if (type === 'API') {
    const common = ['PER_EVENT', 'PER_MINUTE', 'PER_HOUR', 'PER_DAY'];
    const noMinute = ['PER_EVENT', 'PER_HOUR', 'PER_DAY'];
    const noDayMinute = ['PER_EVENT', 'PER_MINUTE', 'PER_HOUR'];

    switch (uom) {
      case 'API_CALL':
      case 'REQUEST':
        options = common;
        break;
      case 'TRANSACTION':
        options = noMinute; // per_event, per_hour, per_day
        break;
      case 'HIT':
        options = noDayMinute; // per_event, per_minute, per_hour
        break;
      default:
        options = null;
    }
  }
  // --- LLM TOKEN rules ---
  else if (type === 'LLMTOKEN') {
    const all = ['PER_EVENT', 'PER_MINUTE', 'PER_HOUR', 'PER_DAY'];
    const noMinute = ['PER_EVENT', 'PER_HOUR', 'PER_DAY'];
    switch (uom) {
      case 'TOKEN':
        options = all;
        break;
      case 'PROMPT_TOKEN':
      case 'COMPLETION_TOKEN':
        options = noMinute;
        break;
      default:
        options = null;
    }
  }
  // --- FLATFILE rules ---
  else if (type === 'FLATFILE') {
    switch (uom) {
      case 'FILE':
        options = ['PER_EVENT', 'PER_DAY', 'PER_WEEK', 'PER_MONTH'];
        break;
      case 'DELIVERY':
        options = ['PER_DAY', 'PER_WEEK', 'PER_MONTH'];
        break;
      case 'MB':
        options = ['PER_DELIVERY', 'PER_DAY', 'PER_MONTH'];
        break;
      case 'RECORD':
        options = ['PER_FILE', 'PER_DELIVERY', 'PER_DAY'];
        break;
      case 'ROW':
        options = ['PER_FILE', 'PER_DAY', 'PER_MONTH'];
        break;
      default:
        options = null;
    }
  }
  // --- SQLRESULT rules ---
  else if (type === 'SQLRESULT') {
    switch (uom) {
      case 'ROW':
        options = ['PER_QUERY', 'PER_HOUR', 'PER_DAY'];
        break;
      case 'QUERY_EXECUTION':
        options = ['PER_HOUR', 'PER_DAY', 'PER_MONTH'];
        break;
      case 'CELL':
        options = ['PER_QUERY', 'PER_DAY', 'PER_MONTH'];
        break;
      case 'MB':
        options = ['PER_QUERY', 'PER_DAY', 'PER_MONTH'];
        break;
      default:
        options = null;
    }
  }

  if (options) {
    return (
      <SelectField
        label={label}
        value={value}
        onChange={onChange}
        options={options.map(opt => ({ label: opt, value: opt }))}
        error={error}
        optional={optional}
        disabled={disabled}
      />
    );
  }

  // Fallback free text
  return (
    <InputField
      value={value}
      onChange={onChange}
      placeholder="Aggregation Window"
      error={error}
      optional={optional}
      disabled={disabled}
    />
  );
};

export default AggregationWindowSelect;
