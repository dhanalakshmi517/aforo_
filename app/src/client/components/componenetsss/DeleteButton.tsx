import React from "react";
import "./DeleteButton.css";

export type DeleteButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string; // default: "Delete"
  title?: string;
  type?: "button" | "submit" | "reset";
  variant?: "soft" | "solid"; // soft = light pill (default), solid = filled red
  customIcon?: React.ReactNode; // optional custom icon to replace trash icon
};

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="16" viewBox="0 0 14 16" fill="none">
  <path d="M0.630005 3.42996H13.2299M11.8299 3.42996V13.2298C11.8299 13.9298 11.1299 14.6298 10.4299 14.6298H3.42997C2.72998 14.6298 2.02999 13.9298 2.02999 13.2298V3.42996M4.12996 3.42996V2.02998C4.12996 1.32999 4.82996 0.629993 5.52995 0.629993H8.32992C9.02991 0.629993 9.7299 1.32999 9.7299 2.02998V3.42996M5.52995 6.92992V11.1299M8.32992 6.92992V11.1299" stroke="#ED5142" stroke-width="1.25999" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled,
  className,
  label = "Delete",
  title,
  type = "button",
  variant = "soft",
  customIcon,
}) => {
  return (
    <button
      type={type}
      title={title ?? label}
      className={cx(
        "af-del-btn",
        variant === "solid" && "af-del-btn--solid",
        disabled && "af-del-btn--disabled",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {customIcon ? (
        <span className="af-del-btn__icon">{customIcon}</span>
      ) : (
        <TrashIcon className="af-del-btn__icon" />
      )}
      <span className="af-del-btn__text">{label}</span>
    </button>
  );
};

export default DeleteButton;
