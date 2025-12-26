import * as React from "react";
import "./BottomActionBar.css";

type Position = "sticky" | "fixed";

type Props = {
  left?: React.ReactNode;   // e.g. <SecondaryButton ... />
  right?: React.ReactNode;  // e.g. <PrimaryButton ... />
  className?: string;

  /** sticky = stays at bottom of scroll container, fixed = stays at viewport bottom */
  position?: Position;

  /** padding inside the bar (matches your 16px feel) */
  paddingX?: number; // default 24
  paddingY?: number; // default 16
};

const BottomActionBar: React.FC<Props> = ({
  left,
  right,
  className = "",
  position = "sticky",
  paddingX = 24,
  paddingY = 16,
}) => {
  return (
    <div
      className={`af-bottom-actionbar af-bottom-actionbar--${position} ${className}`.trim()}
      style={
        {
          ["--af-bar-px" as any]: `${paddingX}px`,
          ["--af-bar-py" as any]: `${paddingY}px`,
        } as React.CSSProperties
      }
    >
      <div className="af-bottom-actionbar__inner">
        <div className="af-bottom-actionbar__left">{left}</div>
        <div className="af-bottom-actionbar__right">{right}</div>
      </div>
    </div>
  );
};

export default BottomActionBar;
