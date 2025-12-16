import React, { useRef, useState, useEffect } from "react";
import "./Tooltip.css";
import Portal from "./Portal";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = "top",
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let top = rect.top;
    let left = rect.left + rect.width / 2;

    if (position === "bottom") {
      top = rect.bottom + 8; // 8px offset below trigger
    } else if (position === "top") {
      top = rect.top - 8; // we'll adjust with CSS transform
    }

    setCoords({ top, left });
  }, [visible, position]);

  return (
    <div
      ref={containerRef}
      className="tooltip-container"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && coords && (
        <Portal>
          <div
            className={`tooltip-box ${position}`}
            style={{ top: coords.top, left: coords.left }}
          >
            {content}
            <span className={`tooltip-arrow ${position}`} />
          </div>
        </Portal>
      )}
    </div>
  );
};

export default Tooltip;
