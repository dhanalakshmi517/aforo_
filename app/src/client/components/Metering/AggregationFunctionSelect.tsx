import React from 'react';
import { DropdownField, InputField } from '../componenetsss/Inputs';

interface AggregationFunctionSelectProps {
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
 * Renders an aggregation-function field that adapts to the chosen Unit-of-Measure.
 *
 * Rules (as requested by UX):
 *   • API_CALL, REQUEST, HIT  → dropdown with only "COUNT"
 *   • TRANSACTION            → dropdown with "COUNT" and "DISTINCT_COUNT"
 *   • Anything else          → free-text input so user can type a custom function.
 */
const AggregationFunctionSelect: React.FC<AggregationFunctionSelectProps> = ({
  label,
  productType,
  unitOfMeasure,
  value,
  onChange,
  error,
  optional,
  disabled
}) => {
  // If either field is not yet selected, show a disabled placeholder dropdown so the layout remains consistent
  if (!productType || !unitOfMeasure) {
    return (
      <DropdownField
        label={label}
        value=""
        onChange={() => { }}
        options={[{ label: '-- select product/unit first --', value: '', disabled: true }]}
        disabled
        optional={optional}
      />
    );
  }

  const upperUOM = unitOfMeasure.toUpperCase();
  const upperType = productType.toUpperCase();

  let options: string[] | null = null;

  // --- API product rules ---
  if (upperType === 'API') {
    if (['API_CALL', 'REQUEST', 'HIT'].includes(upperUOM)) {
      options = ['COUNT'];
    } else if (upperUOM === 'TRANSACTION') {
      options = ['COUNT', 'DISTINCT_COUNT'];
    }
  }
  // --- FLATFILE product rules ---
  else if (upperType === 'FLATFILE') {
    if (['FILE', 'DELIVERY'].includes(upperUOM)) {
      options = ['COUNT'];
    } else if (upperUOM === 'MB') {
      options = ['SUM', 'AVG', 'MAX'];
    } else if (['RECORD', 'ROW'].includes(upperUOM)) {
      options = ['SUM', 'COUNT'];
    }
  }
  // --- SQLRESULT product rules ---
  else if (upperType === 'SQLRESULT') {
    if (upperUOM === 'ROW') {
      options = ['SUM', 'COUNT', 'AVG', 'MAX'];
    } else if (upperUOM === 'QUERY_EXECUTION') {
      options = ['COUNT', 'AVG', 'MAX'];
    } else if (upperUOM === 'CELL') {
      options = ['SUM', 'AVG'];
    } else if (upperUOM === 'MB') {
      options = ['SUM', 'AVG', 'MAX'];
    }
  }
  // --- LLM TOKEN rules ---
  else if (upperType === 'LLMTOKEN') {
    if (upperUOM === 'TOKEN') {
      options = ['SUM', 'AVG', 'MAX'];
    } else if (upperUOM === 'PROMPT_TOKEN' || upperUOM === 'COMPLETION_TOKEN') {
      options = ['SUM', 'AVG'];
    }
  }

  if (options) {
    return (
      <DropdownField
        label={label}
        value={value}
        onChange={onChange}
        placeholder="Select aggregation function"
        options={[
          { label: '-- Select --', value: '', disabled: false },
          ...options.map(opt => ({ label: opt, value: opt }))
        ]}
        error={error}
        optional={optional}
        disabled={disabled}
      />
    );
  }

  // fallback: free text
  return (
    <InputField
      value={value}
      onChange={onChange}
      placeholder="Aggregation Function"
      error={error}
      optional={optional}
      disabled={disabled}
    />
  );
};

export default AggregationFunctionSelect;
