import * as React from "react";
import "./Inputs.css";

/** ---------- Shared Types ---------- */
export type CommonProps = {
  id?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
  optional?: boolean;
};

export type InputFieldProps = CommonProps & {
  type?: React.HTMLInputTypeAttribute;
  value: string | number | readonly string[] | undefined;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  checked?: boolean;
  min?: number;
  max?: number;
  step?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
};

export type TextareaFieldProps = CommonProps & {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  onBlur?: () => void;
  onFocus?: () => void;
};

export type SelectOption = { label: string; value: string; disabled?: boolean };
export type SelectFieldProps = CommonProps & {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholderOption?: string;
  onBlur?: () => void;
};

/** ---------- Input ---------- */
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      id,
      name,
      label,
      placeholder,
      required,
      disabled,
      readOnly,
      helperText,
      error,
      type = "text",
      value,
      onChange,
      onBlur,
      onFocus,
      className,
      checked,
      min,
      max,
      step,
      inputMode,
      autoComplete,
      optional,
    },
    ref
  ) => {
    const [writing, setWriting] = React.useState(false);
    const controlId = id || React.useId();

    return (
      <div className={`if-field ${className ?? ""}`}>
        {label && (
          <label htmlFor={controlId} className={`if-label ${error ? 'is-error' : ''}`}>
            {label}{required && <span className="if-required">*</span>}{optional && <span className="if-optional">(Optional)</span>}
          </label>
        )}
        <input
          ref={ref}
          id={controlId}
          name={name}
          type={type}
          value={value ?? ""}
          placeholder={writing || (value && String(value).trim()) ? "" : placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          checked={checked}
          min={min as any}
          max={max as any}
          step={step as any}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={(e) =>
            onChange(
              e.currentTarget.type === "checkbox"
                ? (e.currentTarget as HTMLInputElement).checked.toString()
                : e.currentTarget.value
            )
          }
          onFocus={() => {
            setWriting(true);
            onFocus?.();
          }}
          onBlur={() => {
            setWriting(false);
            onBlur?.();
          }}
          className={[
            "if-control",
            "custom-input",
            writing ? "is-writing" : "",
            error ? "is-error" : "",
            disabled ? "is-disabled" : "",
          ].join(" ").trim()}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${controlId}-error` : helperText ? `${controlId}-help` : undefined
          }
        />
        <div className="if-msg">
          {error ? (
            <span id={`${controlId}-error`} className="if-error">
              {error}
            </span>
          ) : helperText ? (
            <span id={`${controlId}-help`} className="if-help">
              {helperText}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);
InputField.displayName = "InputField";

/** ---------- Select (native caret) ---------- */
export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({
    id,
    name,
    label,
    placeholder = "Select…",
    placeholderOption = "Select…",
    required,
    disabled,
    readOnly,
    helperText,
    error,
    value,
    onChange,
    options,
    onBlur,
    className,
    optional,
  },
    ref
  ) => {
    const [writing, setWriting] = React.useState(false);
    const [isOpen, setIsOpen] = React.useState(false);
    const controlId = id || React.useId();
    const selectRef = React.useRef<HTMLSelectElement>(null);

    // Handle click outside to close dropdown
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div className={`if-field ${className ?? ""}`}>
        {label && (
          <label htmlFor={controlId} className={`if-label ${error ? 'is-error' : ''}`}>
            {label}{required && <span className="if-required">*</span>}{optional && <span className="if-optional">(Optional)</span>}
          </label>
        )}

        <div className={`if-select-wrapper ${isOpen ? 'is-open' : ''}`}>
          <select
            ref={(node) => {
              if (node) {
                // @ts-ignore - We know this is safe
                selectRef.current = node;
                if (typeof ref === 'function') {
                  ref(node);
                } else if (ref) {
                  // @ts-ignore - We know this is safe
                  ref.current = node;
                }
              }
            }}
            id={controlId}
            name={name}
            required={required}
            disabled={disabled || readOnly}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setWriting(true);
              setIsOpen(true);
            }}
            onBlur={(e) => {
              setWriting(false);
              onBlur?.();
            }}
            onClick={() => setIsOpen(!isOpen)}
            className={[
              "if-control",
              "if-select",
              "custom-select",
              writing ? "is-writing" : "",
              error ? "is-error" : "",
              disabled ? "is-disabled" : " ",
            ].join(" ").trim()}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${controlId}-error` : helperText ? `${controlId}-help` : undefined
            }
          >
            {!value && (
              <option value="" disabled hidden>
                {placeholderOption}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="if-msg">
          {error ? (
            <span id={`${controlId}-error`} className="if-error">
              {error}
            </span>
          ) : helperText ? (
            <span id={`${controlId}-help`} className="if-help">
              {helperText}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);
SelectField.displayName = "SelectField";

/** ---------- Custom Dropdown (headless listbox) ---------- */
export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
};

export type DropdownFieldProps = CommonProps & {
  value?: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
};

export const DropdownField: React.FC<DropdownFieldProps> = ({
  id,
  name,
  label,
  placeholder = "Placeholder",
  required,
  disabled,
  helperText,
  error,
  value,
  onChange,
  options,
  className,
  optional,
}) => {
  const controlId = id || React.useId();
  const listboxId = `${controlId}-listbox`;
  const [open, setOpen] = React.useState(false);
  const [writing, setWriting] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : 0;
  });
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  React.useEffect(() => {
    setActiveIndex((i) => Math.min(Math.max(i, 0), options.length - 1));
  }, [options.length]);

  const move = (dir: 1 | -1) => {
    let i = activeIndex;
    if (!options.length) return;
    do {
      i = (i + dir + options.length) % options.length;
    } while (options[i]?.disabled && i !== activeIndex);
    setActiveIndex(i);
  };

  const selectAt = (i: number) => {
    const opt = options[i];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        move(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) setOpen(true);
        move(-1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (!open) setOpen(true);
        else selectAt(activeIndex);
        break;
      case "Escape":
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`if-field ${className ?? ""} dd-wrap`} ref={wrapperRef}>
      {label && (
        <label htmlFor={controlId} className={`if-label ${error ? 'is-error' : ''}`}>
          {label} {required ? "*" : null}{optional && <span style={{ color: 'var(--text-text-medium, #7B97AE)', fontFamily: 'var(--type-font-family-primary, "IBM Plex Sans")', fontSize: 'var(--fontsize-body-md, 14px)', fontStyle: 'normal', fontWeight: 400, lineHeight: 'var(--line-height-body-md, 20px)' }}> (Optional)</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        id={controlId}
        name={name}
        type="button"
        className={[
          "if-control",
          "dd-trigger",
          writing || open ? "is-writing" : "",
          error ? "is-error" : "",
          disabled ? "is-disabled" : "",
        ].join(" ").trim()}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => {
          if (!disabled) setOpen((o) => !o);
        }}
        onFocus={() => setWriting(true)}
        onBlur={() => setWriting(false)}
        onKeyDown={onKeyDown}
      >
        <span className={selected ? "dd-value" : "dd-placeholder"}>
          {selected ? (
            <>
              {selected.icon && <span className="dd-icon">{selected.icon}</span>}
              {selected.label}
            </>
          ) : (
            placeholder
          )}
        </span>
        <span className={`dd-caret ${open ? "rot" : ""}`} aria-hidden>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Menu */}
      {open && (
        <div id={listboxId} role="listbox" className="dd-menu" aria-labelledby={controlId} tabIndex={-1}>
          {options.map((opt, i) => {
            const isSel = opt.value === value;
            const isDis = !!opt.disabled;
            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSel}
                aria-disabled={isDis}
                className={[
                  "dd-item",
                  isSel ? "is-selected" : "",
                  isDis ? "is-disabled" : "",
                  i === activeIndex ? "is-active" : "",
                ].join(" ").trim()}
                onMouseEnter={() => !isDis && setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => !isDis && selectAt(i)}
              >
                {opt.icon && <span className="dd-item-icon">{opt.icon}</span>}
                <span className="dd-item-label">{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="if-msg">
        {error ? (
          <span className="if-error">{error}</span>
        ) : helperText ? (
          <span className="if-help">{helperText}</span>
        ) : null}
      </div>
    </div>
  );
};

/** ---------- Textarea ---------- */
export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      id,
      name,
      label,
      placeholder,
      required,
      disabled,
      readOnly,
      helperText,
      error,
      rows = 4,
      value,
      onChange,
      onBlur,
      onFocus,
      className,
      optional,
    },
    ref
  ) => {
    const [writing, setWriting] = React.useState(false);
    const controlId = id || React.useId();

    return (
      <div className={`if-field ${className ?? ""}`}>
        {label && (
          <label htmlFor={controlId} className={`if-label ${error ? 'is-error' : ''}`}>
            {label}{required && <span className="if-required">*</span>}{optional && <span className="if-optional">(Optional)</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={controlId}
          name={name}
          rows={rows}
          value={value}
          placeholder={value && value.trim() ? "" : placeholder}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setWriting(true);
            onFocus?.();
          }}
          onBlur={() => {
            setWriting(false);
            onBlur?.();
          }}
          className={[
            "if-control",
            "if-textarea",
            writing ? "is-writing" : "",
            error ? "is-error" : "",
            disabled ? "is-disabled" : "",
          ].join(" ").trim()}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${controlId}-error` : helperText ? `${controlId}-help` : undefined
          }
        />
        <div className="if-msg">
          {error ? (
            <span id={`${controlId}-error`} className="if-error">
              {error}
            </span>
          ) : helperText ? (
            <span id={`${controlId}-help`} className="if-help">
              {helperText}
            </span>
          ) : null}
        </div>
      </div>
    );
  }
);
TextareaField.displayName = "TextareaField";

