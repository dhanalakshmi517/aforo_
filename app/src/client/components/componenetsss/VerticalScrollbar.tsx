// VerticalScrollbar.tsx
import * as React from "react";

type VerticalScrollbarProps = {
  /** Height of the scrollbar (e.g. 49, "100%", "80px") */
  height?: number | string;
  /** Stroke color of the bar */
  color?: string;
  /** Thickness in px */
  thickness?: number;
  /** Optional extra classes for layout */
  className?: string;
};

const VerticalScrollbar: React.FC<VerticalScrollbarProps> = ({
  height = 49,
  color = "#D9DFE8",
  thickness = 4,
  className = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={thickness}
      height={height}
      viewBox="0 0 4 49"
      fill="none"
    >
      <path
        d="M2 2V47"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default VerticalScrollbar;
