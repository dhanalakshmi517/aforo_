// SelectCard.tsx
import * as React from "react";
import "./SelectCard.css";
import Checkbox from "./Checkbox";

type Props = {
  title: string;
  subtitle?: string;
  description?: string;

  /** disabled state (1st card) */
  disabled?: boolean;

  /** selected state (3rd card) */
  selected?: boolean;

  /** shows only when disabled (top-right like “Imported”) */
  disabledBadgeText?: string;

  className?: string;
  onClick?: () => void;
};

export default function SelectCard({
  title,
  subtitle = "Product id name or code",
  description = "Description lorem lorem lorem lorem lorem lorem lorem lorem Description lorem l...",
  disabled = false,
  selected = false,
  disabledBadgeText = "Imported",
  className = "",
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={[
        "sc",
        disabled ? "sc--disabled" : selected ? "sc--selected" : "sc--default",
        className,
      ].join(" ")}
      disabled={disabled}
      aria-disabled={disabled}
      aria-pressed={selected}
      onClick={() => {
        if (disabled) return;
        onClick?.();
      }}
    >
      <div className="scTopRow">
        <div className="scTitle">{title}</div>

        {disabled ? (
          <div className="scBadge">{disabledBadgeText}</div>
        ) : selected ? (
          <Checkbox
            checked={true}
            disabled={false}
            size={18}
            className="scCheckbox"
          />
        ) : null}
      </div>

      <div className="scSubtitle">{subtitle}</div>
      <div className="scDesc">{description}</div>
    </button>
  );
}
