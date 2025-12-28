import * as React from "react";
import "./SimpleFilterDropdown.css";
import Checkbox from "./Checkbox";
import Portal from "./Portal";

export type SimpleFilterOption = {
  id: string | number;
  label: string;
  disabled?: boolean;
};

type Props = {
  options: SimpleFilterOption[];
  value: Array<string | number>;
  onChange: (next: Array<string | number>) => void;
  className?: string;
  anchorTop?: number;
  anchorLeft?: number;
};

const hasId = (arr: Array<string | number>, id: string | number) =>
  arr.some((x) => String(x) === String(id));

const toggle = (arr: Array<string | number>, id: string | number) =>
  hasId(arr, id) ? arr.filter((x) => String(x) !== String(id)) : [...arr, id];

const SimpleFilterDropdown: React.FC<Props> = ({
  options,
  value,
  onChange,
  className = "",
  anchorTop = 0,
  anchorLeft = 0,
}) => {
  return (
    <Portal>
      <div
        className={`sfd-root ${className}`.trim()}
        role="listbox"
        aria-multiselectable="true"
        style={{
          position: "absolute",
          top: anchorTop,
          left: anchorLeft,
        }}
      >
        {options.map((opt) => {
          const checked = hasId(value, opt.id);
          const disabled = !!opt.disabled;

          return (
            <div
              key={String(opt.id)}
              className={`sfd-row ${checked ? "is-checked" : ""} ${disabled ? "is-disabled" : ""}`.trim()}
              onClick={() => {
                if (disabled) return;
                onChange(toggle(value, opt.id));
              }}
              style={{ cursor: disabled ? "not-allowed" : "pointer" }}
            >
              <div
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                }}
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onChange={(next) => {
                    if (disabled) return;
                    onChange(toggle(value, opt.id));
                  }}
                  className="sfd-checkbox"
                />
              </div>

              <span className="sfd-label">{opt.label}</span>
            </div>
          );
        })}
      </div>
    </Portal>
  );
};

export default SimpleFilterDropdown;
