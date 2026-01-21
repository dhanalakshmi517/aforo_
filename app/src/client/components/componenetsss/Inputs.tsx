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

export type FileFieldProps = CommonProps & {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
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
  placeholder?: string;
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : -1;
  });
  const [menuPos, setMenuPos] = React.useState({ top: 0, left: 0, width: 0 });
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const selected = options.find((o) => o.value === value);
  
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((opt) => 
      opt.label.toLowerCase().includes(query) || opt.value.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  React.useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [open]);

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  React.useEffect(() => {
    setActiveIndex((i) => {
      if (i === -1) return -1;
      return Math.min(Math.max(i, 0), filteredOptions.length - 1);
    });
  }, [filteredOptions.length]);

  const move = (dir: 1 | -1) => {
    let i = activeIndex === -1 ? (dir === 1 ? 0 : filteredOptions.length - 1) : activeIndex;
    if (!filteredOptions.length) return;
    do {
      i = (i + dir + filteredOptions.length) % filteredOptions.length;
    } while (filteredOptions[i]?.disabled && i !== activeIndex);
    setActiveIndex(i);
  };

  const selectAt = (i: number) => {
    const opt = filteredOptions[i];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setSearchQuery("");
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
        setSearchQuery("");
        break;
      case "Backspace":
        e.preventDefault();
        setSearchQuery((q) => q.slice(0, -1));
        if (!open) setOpen(true);
        break;
      default:
        // Handle regular character input for search
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          const newQuery = searchQuery + e.key;
          setSearchQuery(newQuery);
          if (!open) setOpen(true);
        }
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

      <button
        ref={buttonRef}
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
        <span className={selected || searchQuery ? "dd-value" : "dd-placeholder"}>
          {searchQuery ? (
            searchQuery
          ) : selected ? (
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
        <div 
          id={listboxId} 
          role="listbox" 
          className="dd-menu" 
          aria-labelledby={controlId} 
          tabIndex={-1}
          style={{
            top: `${menuPos.top}px`,
            left: `${menuPos.left}px`,
            width: `${menuPos.width}px`,
          }}
        >
          {filteredOptions.map((opt, i) => {
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

/** ---------- Fixed Width Dropdown ---------- */
export type FixedDropdownFieldProps = CommonProps & {
  value?: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  width?: 'small' | 'medium'; // small: 150px, medium: 320px
};

export const FixedDropdownField: React.FC<FixedDropdownFieldProps> = ({
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
  width = 'small',
}) => {
  const controlId = id || React.useId();
  const listboxId = `${controlId}-listbox`;
  const [open, setOpen] = React.useState(false);
  const [writing, setWriting] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number>(() => {
    const idx = options.findIndex((o) => o.value === value);
    return idx >= 0 ? idx : -1;
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
    setActiveIndex((i) => {
      if (i === -1) return -1;
      return Math.min(Math.max(i, 0), options.length - 1);
    });
  }, [options.length]);

  const move = (dir: 1 | -1) => {
    let i = activeIndex === -1 ? (dir === 1 ? 0 : options.length - 1) : activeIndex;
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

  const widthClass = width === 'small' ? 'dd-fixed-small' : 'dd-fixed-medium';

  return (
    <div className={`if-field ${className ?? ""} dd-wrap ${widthClass}`} ref={wrapperRef}>
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
        <div id={listboxId} role="listbox" className="dd-menu dd-fixed-menu" aria-labelledby={controlId} tabIndex={-1}>
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

/** ---------- File Upload ---------- */
export const FileField = React.forwardRef<HTMLInputElement, FileFieldProps>(
  (
    {
      id,
      name,
      label,
      placeholder = "Choose file...",
      required,
      disabled,
      readOnly,
      helperText,
      error,
      value,
      onChange,
      accept,
      multiple = false,
      maxSize,
      onBlur,
      onFocus,
      className,
      optional,
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const [fileName, setFileName] = React.useState<string>("");
    const controlId = id || React.useId();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (value) {
        setFileName(value.name);
      } else {
        setFileName("");
      }
    }, [value]);

    const handleFileChange = (file: File | null) => {
      if (file) {
        // Check file size if maxSize is specified
        if (maxSize && file.size > maxSize) {
          const sizeInMB = (maxSize / 1024 / 1024).toFixed(1);
          // You could add an error state here
          console.error(`File size exceeds ${sizeInMB}MB limit`);
          return;
        }
      }
      onChange(file);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFileChange(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0] || null;
      handleFileChange(file);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
    };

    const handleClick = () => {
      if (!disabled && !readOnly) {
        fileInputRef.current?.click();
      }
    };

    const handleRemove = () => {
      onChange(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    return (
      <div className={`if-field ${className ?? ""}`}>
        {label && (
          <label htmlFor={controlId} className={`if-label ${error ? 'is-error' : ''}`}>
            {label}{required && <span className="if-required">*</span>}{optional && <span className="if-optional">(Optional)</span>}
          </label>
        )}

        <div
          className={[
            "if-file-wrapper",
            isDragging ? "is-dragging" : "",
            error ? "is-error" : "",
            disabled ? "is-disabled" : "",
          ].join(" ").trim()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={ref}
            id={controlId}
            name={name}
            type="file"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            readOnly={readOnly}
            onChange={handleInputChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className="if-file-input"
            aria-invalid={!!error}
            aria-describedby={
              error ? `${controlId}-error` : helperText ? `${controlId}-help` : undefined
            }
          />

          <div className="if-file-content">
            <div className="if-file-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 10V9a2 2 0 012-2h6a2 2 0 012 2v1M8 14v.01M12 14v.01M16 14v.01M8 18v.01M12 18v.01M16 18v.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="if-file-text">
              {fileName ? (
                <span className="if-file-name">{fileName}</span>
              ) : (
                <span className="if-file-placeholder">{placeholder}</span>
              )}
              {!fileName && (
                <span className="if-file-hint">or drag and drop</span>
              )}
            </div>

            {fileName && !disabled && !readOnly && (
              <button
                type="button"
                className="if-file-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                aria-label="Remove file"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
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
FileField.displayName = "FileField";
