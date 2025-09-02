import React from "react";
import "./InputFields.css";

// Input Field
interface InputProps {
  label?: string;
  value: string;
  placeholder?: string;
  type?: string;
  onChange: (val: string) => void;
  pattern?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /** Pass `true` or a string for error. True shows "This field is required" */
  error?: string | boolean;
}

export const InputField: React.FC<InputProps> = ({
  label,
  value,
  placeholder,
  onChange,
  type = "text",
  pattern,
  inputMode,
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
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label || placeholder || type}
        className={`input-field ${error ? "error" : ""}`}
        pattern={pattern}
        inputMode={inputMode}
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
  error?: string | boolean;
}

export const TextareaField: React.FC<TextareaProps> = ({
  label,
  value,
  placeholder,
  onChange,
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
        className={`textarea-field ${error ? "error" : ""}`}
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
        aria-label={label || "select"}
        className={`select-field ${error ? "error" : ""}`}
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
