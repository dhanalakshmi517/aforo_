import React from "react";
import "./InputFields.css";

// Input Field
interface InputProps {
  label?: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (val: string) => void;
}

export const InputField: React.FC<InputProps> = ({ label, value, placeholder, onChange, type = 'text' }) => (
  <div className="com-form-group">
    {label && <label className="com-form-label">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label || placeholder || type}
      className="input-field"
    />
  </div>
);

// Textarea Field
interface TextareaProps {
  label?: string;
  value: string;
  placeholder?: string;
  onChange: (val: string) => void;
}

export const TextareaField: React.FC<TextareaProps> = ({ label, value, placeholder, onChange }) => (
  <div className="com-form-group">
    {label && <label className="com-form-label">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label || placeholder || 'textarea'}
      className="textarea-field"
    />
  </div>
);

// Select Field
interface SelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options?: { label: string; value: string }[];
  disabled?: boolean;
}

export const SelectField: React.FC<SelectProps> = ({ label, value, onChange, options = [], disabled = false }) => (
  <div className="com-form-group">
    {label && <label className="com-form-label">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label || 'select'}
      className="select-field"
      disabled={disabled}
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
