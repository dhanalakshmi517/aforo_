import React from "react";
import "./Notification.css";

type NotificationType = "success" | "error";

interface NotificationProps {
  type: NotificationType;
  /** Optional: the entity name to show inside the message, e.g. "Data Set Prod" */
  name?: string;
  /** Optional: override title; defaults to "Failed to Save Changes" / "Changes Saved" */
  title?: string;
  /** Optional: override message; defaults to the sentences below the title */
  message?: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  type,
  name,
  title,
  message,
  onClose,
}) => {
  const resolvedTitle =
    title ?? (type === "error" ? "Failed to Save Changes" : "Changes Saved");

  const resolvedMessage =
    message ??
    (type === "error"
      ? `We couldn’t save the updates to “${name ?? "this item"}”. Please try again.`
      : `The updates to “${name ?? "this item"}” have been saved successfully.`);

  return (
    <div
      className={`toast-card ${type === "error" ? "toast-error" : "toast-success"}`}
      role="status"
    >
      <div className="toast-icon">
        {type === "error" ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none" aria-hidden>
            <path
              d="M11 6.00005V10M11 14H11.01M6.9 18C8.80858 18.9791 11.0041 19.2443 13.0909 18.7478C15.1777 18.2514 17.0186 17.0259 18.2818 15.2922C19.545 13.5586 20.1474 11.4308 19.9806 9.29221C19.8137 7.15366 18.8886 5.14502 17.3718 3.62824C15.855 2.11146 13.8464 1.1863 11.7078 1.01946C9.56929 0.852628 7.44147 1.45509 5.70782 2.71829C3.97417 3.98149 2.74869 5.82236 2.25222 7.90916C1.75575 9.99596 2.02094 12.1915 3 14.1L1 20L6.9 18Z"
              stroke="#ED5142" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="13" viewBox="0 0 18 13" fill="none" aria-hidden>
            <path d="M17 1L6 12L1 7" stroke="#6AB349" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <div className="toast-body">
        <p className="toast-title">{resolvedTitle}</p>
        <p className="toast-message">{resolvedMessage}</p>
      </div>

      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M9 1L1 9M1 1L9 9" stroke="#373B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
