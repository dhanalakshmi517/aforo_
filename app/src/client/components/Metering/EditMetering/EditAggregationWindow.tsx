// EditAggregationWindow.tsx

import React from 'react';
import { SelectField, SelectOption } from '../../componenetsss/Inputs';

interface EditAggregationWindowProps {
  label?: string;
  productType: string;
  unitOfMeasure: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  optional?: boolean;
}

/**
 * Displays appropriate aggregation-window options based on product type + unit-of-measure.
 * Currently only API product rules are defined as per requirements.
 */
const EditAggregationWindow: React.FC<EditAggregationWindowProps> = ({
  label,
  productType,
  unitOfMeasure,
  value,
  onChange,
  error,
  optional,
}) => {
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
        options = noMinute;
        break;
      case 'HIT':
        options = noDayMinute;
        break;
      default:
        options = null;
    }
  } else if (type === 'LLMTOKEN') {
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
  } else if (type === 'FLATFILE') {
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
  } else if (type === 'SQLRESULT') {
    switch (uom) {
      case 'ROW':
        options = ['PER_QUERY', 'PER_HOUR', 'PER_DAY'];
        break;
      case 'QUERY_EXECUTION':
        options = ['PER_HOUR', 'PER_DAY', 'PER_MONTH'];
        break;
      case 'CELL':
      case 'MB':
        options = ['PER_QUERY', 'PER_DAY', 'PER_MONTH'];
        break;
      default:
        options = null;
    }
  }

  // Provide a sensible default set if no rules matched so that we always
  // present a dropdown instead of reverting to free-text.
  if (!options) {
    options = ['PER_EVENT', 'PER_MINUTE', 'PER_HOUR', 'PER_DAY'];
  }
  if (value && !options.includes(value)) {
    options = [value, ...options];
  }

  // convert to SelectOption objects for SelectField component
  const selectOptions: SelectOption[] = options.map((opt) => ({ label: opt, value: opt }));

  return (
    <SelectField
      label={label}
      value={value}
      onChange={onChange}
      options={selectOptions}
      placeholderOption="--select--"
      error={error}
      optional={optional}
    />
  );
};
export default EditAggregationWindow;
