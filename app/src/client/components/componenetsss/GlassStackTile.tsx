import * as React from "react";
import "./GlassStackTile.css";

const DEFAULT_COLORS = ["#BBBBBB"];

type Props = {
  frontIcon: React.ReactNode;
  backIcon?: React.ReactNode;

  backColor?: string;
  colorIndex?: number;

  size?: number;     // front tile size
  offset?: number;   // how much the front shifts down-right
  offsetY?: number;  // vertical offset for front tile (negative = up)
  className?: string;
};

export default function GlassStackTile({
  frontIcon,
  backIcon,
  backColor,
  colorIndex,
  size = 80,
  offset = 10,
  className = "",
  offsetY = -3,
}: Props) {
  const resolvedColor = React.useMemo(() => {
    if (backColor) return backColor;
    if (typeof colorIndex === "number") return DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
    return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
  }, [backColor, colorIndex]);

  return (
    <div
      className={`gst ${className}`}
      style={{
        ["--gst-size" as any]: `${size}px`,
        ["--gst-offset" as any]: `${offset}px`,
        ["--gst-offset-y" as any]: `${offsetY}px`,
        ["--gst-back" as any]: resolvedColor,
      }}
    >
      <div className="gst-back">{backIcon ? <div className="gst-icon">{backIcon}</div> : null}</div>
      <div className="gst-front">
        <div className="gst-icon">{frontIcon}</div>
      </div>
    </div>
  );
}
