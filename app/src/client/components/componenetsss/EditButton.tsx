import React from "react";
import "./EditButton.css";

export type EditButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  label?: string;           // defaults to "Edit"
  title?: string;
  type?: "button" | "submit" | "reset";
};

const PenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M6.94668 12.5612L13.2625 12.5612M10.0176 1.0679C10.2969 0.788535 10.6758 0.631592 11.0709 0.631592C11.466 0.631592 11.8449 0.788535 12.1242 1.0679C12.4036 1.34726 12.5605 1.72615 12.5605 2.12123C12.5605 2.51631 12.4036 2.8952 12.1242 3.17456L3.69615 11.6033C3.5292 11.7703 3.32284 11.8924 3.09615 11.9584L1.08071 12.5465C1.02033 12.5641 0.956321 12.5652 0.895388 12.5496C0.834455 12.5339 0.778839 12.5022 0.734361 12.4578C0.689884 12.4133 0.65818 12.3577 0.642569 12.2967C0.626959 12.2358 0.628015 12.1718 0.645627 12.1114L1.2337 10.096C1.29982 9.86953 1.42194 9.66342 1.58878 9.49667L10.0176 1.0679Z"
      stroke="currentColor"         /* uses button text color */
      strokeWidth="1.26316"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const cx = (...c: Array<string | false | undefined>) => c.filter(Boolean).join(" ");

const EditButton: React.FC<EditButtonProps> = ({
  onClick,
  disabled,
  className,
  label = "Edit",
  title,
  type = "button",
}) => {
  return (
    <button
      type={type}
      title={title ?? label}
      className={cx("af-edit-btn", disabled && "af-edit-btn--disabled", className)}
      onClick={onClick}
      disabled={disabled}
    >
      <PenIcon className="af-edit-btn__icon" />
      <span className="af-edit-btn__text">{label}</span>
    </button>
  );
};

export default EditButton;
