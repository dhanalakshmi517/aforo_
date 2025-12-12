import React from 'react';
import { SelectField } from '../../componenetsss/Inputs';

interface AggregationFunctionSelectProps {
  label?: string;
  productType: string;
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  optional?: boolean;
}

/**
 * Renders an aggregation-function field that adapts to the chosen Unit-of-Measure.
 *
 * Rules (as requested by UX):
 *   • API_CALL, REQUEST, HIT  → dropdown with only "COUNT"
 *   • TRANSACTION            → dropdown with "COUNT" and "DISTINCT_COUNT"
 *   • Anything else          → free-text input so user can type a custom function.
 */
const AggregationFunctionSelect: React.FC<AggregationFunctionSelectProps> = ({ label, productType, unitOfMeasure, value, onChange, error, optional }) => {
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

  if (!options) {
    options = ['COUNT', 'SUM', 'AVG'];
  }
  if (value && !options.includes(value)) {
    options = [value, ...options];
  }
  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={[{ label: '--select--', value: '', disabled: true }, ...options.map(opt => ({ label: opt, value: opt }))]}
      error={error}
      optional={optional}
    />
  );
};

export default AggregationFunctionSelect;
