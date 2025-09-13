import React from "react";
import "./IconButton.css";

type IconButtonProps = {
  variant: "settings" | "bell";   // which icon to render
  size?: "sm" | "md" | "lg";      // optional: tile size
  ariaLabel?: string;
  onClick?: () => void;           // optional: clickable, though no visual states
  className?: string;
};

const IconButton: React.FC<IconButtonProps> = ({
  variant,
  size = "md",
  ariaLabel,
  onClick,
  className = "",
}) => {
  const label = ariaLabel ?? (variant === "settings" ? "Settings" : "Notifications");

  return (
    <button
      type="button"
      className={["af-iconbtn", `af-iconbtn--${size}`, className].join(" ").trim()}
      aria-label={label}
      onClick={onClick}
    >
      <span className="af-iconbtn__icon" aria-hidden="true">
        {variant === "settings" ? (
          /* Gear */
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        ) : (
          /* Bell */
        
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M19 12a7 7 0 0 0-.09-1.1l2.02-1.56-2-3.46-2.45.6A7 7 0 0 0 14 5l-.5-2.5h-3L10 5a7 7 0 0 0-2.48 1.48l-2.45-.6-2 3.46 2.02 1.56A7 7 0 0 0 5 12c0 .37.03.73.09 1.1L3.07 14.7l2 3.46 2.45-.6A7 7 0 0 0 10 19l.5 2.5h3L14 19a7 7 0 0 0 2.48-1.48l2.45.6 2-3.46-2.02-1.56c.06-.36.09-.73.09-1.1Z"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        )}
      </span>
    </button>
  );
};

export default IconButton;
