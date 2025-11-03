import * as React from 'react';
import './Checkbox.css';

export interface CheckboxProps {
  id?: string;
  name?: string;
  label?: React.ReactNode;
  checked?: boolean;                 // controlled
  defaultChecked?: boolean;          // uncontrolled
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: number;                     // px, defaults to 16 (your SVGs)
  error?: string;
  required?: boolean;
}

const UncheckedIcon: React.FC<{ size: number }> = ({ size }) => (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12Z" stroke="#B3B8BC" stroke-width="1.2"/>
</svg>
);

const CheckedIcon: React.FC<{ size: number }> = ({ size }) => (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path fill-rule="evenodd" clip-rule="evenodd" d="M12 20C8.22876 20 6.34314 20 5.17158 18.8284C4 17.6569 4 15.7712 4 12C4 8.22876 4 6.34314 5.17158 5.17158C6.34314 4 8.22876 4 12 4C15.7712 4 17.6569 4 18.8284 5.17158C20 6.34314 20 8.22876 20 12C20 15.7712 20 17.6569 18.8284 18.8284C17.6569 20 15.7712 20 12 20ZM15.2242 9.57574C15.4586 9.81005 15.4586 10.19 15.2242 10.4242L11.2242 14.4242C10.9899 14.6586 10.6101 14.6586 10.3757 14.4242L8.77574 12.8242C8.54142 12.5899 8.54142 12.2101 8.77574 11.9758C9.01005 11.7414 9.38995 11.7414 9.62426 11.9758L10.8 13.1514L14.3758 9.57574C14.6101 9.34142 14.9899 9.34142 15.2242 9.57574Z" fill="#004B80"/>
</svg>
);

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, name, label, checked, defaultChecked, onChange, disabled, className = '', size = 16, error, required }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;

    const isControlled = typeof checked === 'boolean';
    const [inner, setInner] = React.useState<boolean>(defaultChecked ?? false);
    const isChecked = isControlled ? (checked as boolean) : inner;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.checked;
      if (!isControlled) setInner(next);
      onChange?.(next);
    };

    return (
      <label
        htmlFor={inputId}
        className={`af-checkbox ${disabled ? 'is-disabled' : ''} ${error ? 'has-error' : ''} ${className}`}
      >
        <input
          ref={ref}
          id={inputId}
          name={name}
          type="checkbox"
          className="af-checkbox__input"
          checked={isChecked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-required={required}
        />
        <span
          className="af-checkbox__box"
          style={{
            // unchecked uses border color; checked uses brand color via currentColor
            color: isChecked ? 'var(--af-checkbox-checked)' : 'var(--af-checkbox-border)'
          }}
          aria-hidden="true"
        >
          {isChecked ? <CheckedIcon size={size} /> : <UncheckedIcon size={size} />}
        </span>

        {label && (
          <span className="af-checkbox__label">
            {label}{required ? <span className="af-checkbox__req">*</span> : null}
          </span>
        )}

        {error && <span className="af-checkbox__error">{error}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
