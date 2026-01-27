import * as React from "react";
import "./ProductIconTile.css";

type Props = {
  /** Center icon (SVG). Prefer stroke/fill="currentColor" in the SVG. */
  icon: React.ReactNode;

  /** Main accent color (drives back plate + outer tint). Example: "#D06CE0" */
  accent?: string;

  /** Icon color (applied via CSS `color`). */
  iconColor?: string;

  /** Outer tile size (px). Default matches the screenshot feel. */
  size?: number;

  /** Inner padding around the plates (px). Default 8 (as your Figma shows). */
  padding?: number;

  /** Outer background opacity (tinted). */
  bgOpacity?: number;

  /** Outer border opacity (tinted). */
  borderOpacity?: number;

  /** Back plate size (px). */
  backPlateSize?: number;

  /** Back plate offset (px). */
  backOffsetX?: number;
  backOffsetY?: number;

  /** Front plate offset (px). */
  frontOffsetX?: number;
  frontOffsetY?: number;

  /** Front glass plate width/height/padding exactly from your spec */
  frontW?: number;
  frontH?: number;
  frontPadY?: number;
  frontPadX?: number;

  /** Front blur strength */
  blurPx?: number;

  className?: string;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "").trim();
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return {
    r: (n >> 16) & 255,
    g: (n >> 8) & 255,
    b: n & 255,
  };
}

function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp01(a)})`;
}

/** Mix two hex colors: t=0 => a, t=1 => b */
function mixHex(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const tt = clamp01(t);
  const r = Math.round(A.r + (B.r - A.r) * tt);
  const g = Math.round(A.g + (B.g - A.g) * tt);
  const b2 = Math.round(A.b + (B.b - A.b) * tt);
  return `#${[r, g, b2].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export default function ProductIconTile({
  icon,
  accent = "#D06CE0",
  iconColor = "#FFFFFF",

  size = 96,
  padding = 8,

  bgOpacity = 0.08,
  borderOpacity = 0.16,

  backPlateSize = 54,
  backOffsetX = -6,
  backOffsetY = -6,

  frontOffsetX = 0,
  frontOffsetY = 0,

  // exact from your spec
  frontW = 31.232,
  frontH = 28.286,
  frontPadY = 1.661,
  frontPadX = 3.321,

  blurPx = 3.875000238418579,

  className = "",
}: Props) {
  // A “soft tint” derived from accent
  const bg = rgba(accent, bgOpacity);
  const border = rgba(accent, borderOpacity);

  // Glass fill: a lightened accent with low alpha (matches your rgba(202,171,213,0.10) vibe)
  const glassTint = mixHex(accent, "#FFFFFF", 0.65);
  const glassBg = rgba(glassTint, 0.10);

  return (
    <div
      className={`pti ${className}`}
      style={
        {
          ["--pti-size" as any]: `${size}px`,
          ["--pti-pad" as any]: `${padding}px`,
          ["--pti-bg" as any]: bg,
          ["--pti-border" as any]: border,

          ["--pti-accent" as any]: accent,
          ["--pti-icon" as any]: iconColor,

          ["--pti-back-size" as any]: `${backPlateSize}px`,
          ["--pti-back-x" as any]: `${backOffsetX}px`,
          ["--pti-back-y" as any]: `${backOffsetY}px`,

          ["--pti-front-x" as any]: `${frontOffsetX}px`,
          ["--pti-front-y" as any]: `${frontOffsetY}px`,

          ["--pti-front-w" as any]: `${frontW}px`,
          ["--pti-front-h" as any]: `${frontH}px`,
          ["--pti-front-py" as any]: `${frontPadY}px`,
          ["--pti-front-px" as any]: `${frontPadX}px`,

          ["--pti-glass-bg" as any]: glassBg,
          ["--pti-blur" as any]: `${blurPx}px`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <div className="ptiStack">
        <div className="ptiBackPlate" />
        <div className="ptiFrontPlate">
          <span className="ptiIcon">{icon}</span>
        </div>
      </div>
    </div>
  );
}
