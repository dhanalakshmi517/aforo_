// BillableMetricIcon.tsx
import * as React from "react";
import "./BillableMetricIcon.css";

type Props = {
  /** first row (ex: "GB") */
  topText: string;

  /** second row (ex: "Dropbox") */
  bottomText: string;

  /** fixed square size (px) */
  size?: number;

  /** optional: override color (hex like "#B8860B") */
  accentColor?: string;

  className?: string;
};

function hashToHue(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % 360;
}

function truncateTo3(text: string) {
  const t = (text ?? "").trim();
  return t.length > 3 ? `${t.slice(0, 3)}…` : t;
}

export default function BillableMetricIcon({
  topText,
  bottomText,
  size = 88,
  accentColor,
  className = "",
}: Props) {
  const seed = `${topText}::${bottomText}`;
  const hue = React.useMemo(() => hashToHue(seed), [seed]);

  // If no accentColor passed, generate a nice “random” one from the text
  const accent = accentColor ?? `hsl(${hue} 55% 42%)`;

  // light background derived from same hue (soft + premium)
  const bg = `hsl(${hue} 60% 96%)`;

  return (
    <div
      className={`bmIcon ${className}`}
      style={
        {
          width: size,
          height: size,
          "--bm-accent": accent,
          "--bm-bg": bg,
        } as React.CSSProperties
      }
      title={bottomText}
    >
      <div className="bmIcon-top">{topText}</div>
      <div className="bmIcon-bottom">{truncateTo3(bottomText)}</div>
    </div>
  );
}
