import * as React from "react";
import "./IngestionToggle.css";

export type IngestionToggleValue = "manual" | "realtime";

type Option = {
  label: string;
  value: IngestionToggleValue;
  disabled?: boolean;
};

type Props = {
  value: IngestionToggleValue;
  onChange: (value: IngestionToggleValue) => void;
  leftLabel?: string;   // default "Manual"
  rightLabel?: string;  // default "Real-Time"
  className?: string;
};

export default function IngestionToggle({
  value,
  onChange,
  leftLabel = "Manual",
  rightLabel = "Real-Time",
  className = "",
}: Props) {
  const options: Option[] = [
    { label: leftLabel, value: "manual" },
    { label: rightLabel, value: "realtime" },
  ];

  return (
    <div className={`it-toggle ${className}`} role="tablist" aria-label="Ingestion mode">
      {options.map((opt) => {
        const active = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            className={`it-seg ${active ? "is-active" : ""}`}
            onClick={() => onChange(opt.value)}
            role="tab"
            aria-selected={active}
            disabled={!!opt.disabled}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
