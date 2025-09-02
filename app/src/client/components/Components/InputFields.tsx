import React from "react";
import "./InputFields.css";

// Input Field
interface InputProps {
  label?: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (val: string) => void;
  /** HTML input pattern attribute */
  pattern?: string;
  /** HTML inputMode attribute e.g., 'numeric' */
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: string;
}

export const InputField: React.FC<InputProps> = ({ label, value, placeholder, onChange, type = 'text', pattern, inputMode, error }) => (
  <div className="com-form-group">
    {label && <label className="com-form-label">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label || placeholder || type}
      className="input-field"
      pattern={pattern}
      inputMode={inputMode}
    />
  </div>
);

// Textarea Field
interface TextareaProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
  error?: string;
}

export const TextareaField: React.FC<TextareaProps> = ({ label, value, placeholder, onChange, error }) => (
  <div className="com-form-group">
    {label && <label className="com-form-label">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label || placeholder || 'textarea'}
      className={`textarea-field ${error ? 'error' : ''}`}
    />
    {error && <div className="error-message">{error}</div>}
  </div>
);

// Select Field
interface SelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  required?: boolean;
}

export const SelectField: React.FC<SelectProps> = ({ label, value, onChange, options = [], disabled = false, required = false }) => (
  <div className="com-form-group">
    {label && <label className="com-form-label">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label || 'select'}
      className="select-field"
      disabled={disabled}
      required={required}
    >
      <option value="">--Select--</option>
      {options.map((opt, idx) => (
        <option key={idx} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);
