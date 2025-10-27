import React from "react";
import "./InputFields.css";

// Input Field
interface BaseInputProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;                 // ⬅️ ADDED
  /** Pass `true` or a string for error. True shows "This field is required" */
  error?: string | boolean;
  className?: string;
  disabled?: boolean;
}

interface TextInputProps extends BaseInputProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'date';
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
  autoComplete?: string;
}

interface NumberInputProps extends BaseInputProps {
  type: 'number';
  min?: string | number;
  max?: string | number;
  step?: string | number;
  inputMode?: 'numeric' | 'decimal';
}

interface CheckboxInputProps extends Omit<BaseInputProps, 'value'> {
  type: 'checkbox';
  value?: string;
  checked?: boolean;
  onChange: (val: string) => void;
}

type InputProps = TextInputProps | NumberInputProps | CheckboxInputProps;

export const InputField: React.FC<InputProps> = (props) => {
  const isCheckbox = props.type === 'checkbox';
  const {
    label,
    value = isCheckbox ? 'on' : '',
    placeholder,
    onChange,
    onBlur,
    onFocus,                              // ⬅️ ADDED
    type = 'text',
    error,
    className = '',
    autoComplete,
    ...rest
  } = props as BaseInputProps & { type?: string; checked?: boolean; autoComplete?: string };

  const errorMessage = error === true ? "This field is required" : error;

  return (
    <div className="com-form-group">
      {label && (
        <label className={`com-form-label ${error ? "label-error" : ""}`}>
          {label}
        </label>
      )}
      <input
        {...rest}
        type={type}
        value={value}
        checked={isCheckbox ? (props as CheckboxInputProps).checked : undefined}
        onChange={(e) => {
          if (isCheckbox) {
            onChange(e.target.checked ? 'true' : 'false');
          } else {
            onChange(e.target.value);
          }
        }}
        placeholder={placeholder}
        aria-label={label || placeholder || type}
        className={`com-input-field ${error ? "error" : ""} ${className}`.trim()}
        onBlur={onBlur}
        onFocus={onFocus}                   // ⬅️ FORWARDED
        autoComplete={autoComplete}
      />
      {error && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

// Textarea Field
interface TextareaProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;                    // ⬅️ ADDED (optional, for consistency)
  error?: string | boolean;
}

export const TextareaField: React.FC<TextareaProps> = ({
  label,
  value,
  placeholder,
  onChange,
  onBlur,
  onFocus,                                  // ⬅️ ADDED
  error,
}) => {
  const errorMessage = error === true ? "This field is required" : error;
  return (
    <div className="com-form-group">
      {label && (
        <label className={`com-form-label ${error ? "label-error" : ""}`}>
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label || placeholder || "textarea"}
        className={`com-textarea-field ${error ? "error" : ""}`}
        onBlur={onBlur}
        onFocus={onFocus}                   // ⬅️ FORWARDED
      />
      {error && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

// Select Field
interface SelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;                    // ⬅️ ADDED (optional, for consistency)
  options?: { label: string; value: string }[];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  error?: string | boolean;
}

export const SelectField: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  onBlur,
  onFocus,                                   // ⬅️ ADDED
  options = [],
  disabled = false,
  required = false,
  placeholder,
  error,
}) => {
  const errorMessage = error === true ? "This field is required" : error;
  return (
    <div className="com-form-group">
      {label && (
        <label className={`com-form-label ${error ? "label-error" : ""}`}>
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}                    // ⬅️ FORWARDED
        aria-label={label || "select"}
        className={`com-select-field ${error ? "error" : ""}`}
        disabled={disabled}
        required={required}
      >
        <option value="">{placeholder || "--Select--"}</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};
