import * as React from "react";
import "./ModeSwitch.css";

export type ModeSwitchValue = "manual" | "realtime";

type Props = {
  value: ModeSwitchValue;
  onChange: (v: ModeSwitchValue) => void;

  leftLabel?: string;
  rightLabel?: string;

  disabled?: boolean;

  /** Optional fixed width like Figma */
  width?: number | string;

  className?: string;
};

export default function ModeSwitch({
  value,
  onChange,
  leftLabel = "Manual",
  rightLabel = "Real-Time",
  disabled = false,
  width = 520,
  className = "",
}: Props) {
  const isLeft = value === "manual";

  const set = (v: ModeSwitchValue) => {
    if (disabled) return;
    if (v !== value) onChange(v);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "ArrowLeft") set("manual");
    if (e.key === "ArrowRight") set("realtime");
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      set(isLeft ? "realtime" : "manual");
    }
  };

  return (
    <div
      className={`afModeSwitch ${disabled ? "is-disabled" : ""} ${className}`}
      style={{ width: typeof width === "number" ? `${width}px` : width }}
      role="tablist"
      aria-label="Mode switch"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={onKeyDown}
    >
      <div
        className="afModeSwitchThumb"
        style={{ transform: isLeft ? "translateX(0)" : "translateX(100%)" }}
        aria-hidden="true"
      />

      <button
        type="button"
        className={`afModeSwitchBtn ${isLeft ? "is-active" : ""}`}
        onClick={() => set("manual")}
        role="tab"
        aria-selected={isLeft}
        tabIndex={-1}
        disabled={disabled}
      >
        {leftLabel}
      </button>

      <button
        type="button"
        className={`afModeSwitchBtn ${!isLeft ? "is-active" : ""}`}
        onClick={() => set("realtime")}
        role="tab"
        aria-selected={!isLeft}
        tabIndex={-1}
        disabled={disabled}
      >
        {rightLabel}
      </button>
    </div>
  );
}
