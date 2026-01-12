import * as React from "react";
import "./IntegrationCard.css";
import SecondaryButton from "./SecondaryButton";

type Props = {
  name: string;
  description: string;

  /** pass img src OR a ReactNode (svg/component) */
  logo: string | React.ReactNode;
  logoAlt?: string;

  actionLabel?: string; // default: "Connect"
  onAction?: () => void;

  onMenuClick?: () => void;
  menuAriaLabel?: string;

  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

const KebabIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="9" cy="3.5" r="1.35" fill="currentColor" />
    <circle cx="9" cy="9" r="1.35" fill="currentColor" />
    <circle cx="9" cy="14.5" r="1.35" fill="currentColor" />
  </svg>
);

const isString = (v: unknown): v is string => typeof v === "string";

const IntegrationCard: React.FC<Props> = ({
  name,
  description,
  logo,
  logoAlt = "",
  actionLabel = "Connect",
  onAction,
  onMenuClick,
  menuAriaLabel = "More options",
  disabled = false,
  className = "",
  style,
}) => {
  return (
    <div
      className={`aff-integration-card ${disabled ? "is-disabled" : ""} ${className}`.trim()}
      style={style}
    >
      <button
        type="button"
        className="integration-card__menu"
        onClick={onMenuClick}
        aria-label={menuAriaLabel}
        disabled={disabled}
      >
        {/* <KebabIcon /> */}
      </button>

      <div className="integration-card__top">
        <div className="integration-card__logoBox" aria-hidden={!isString(logo) ? true : undefined}>
          {isString(logo) ? (
            <img className="integration-card__logoImg" src={logo} alt={logoAlt} />
          ) : (
            <div className="integration-card__logoNode">{logo}</div>
          )}
        </div>

        <div className="integration-card__meta">
          <div className="integration-card__name" title={name}>
            {name}
          </div>
          <div className="integration-card__desc" title={description}>
            {description}
          </div>
        </div>
      </div>

      <SecondaryButton
        onClick={onAction}
        disabled={disabled}
        className="integration-card__action__po"
      >
        <span className="integration-card__plus" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
  <path d="M0.75 4.83333H8.91667M4.83333 0.75V8.91667" stroke="#034A7D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        </span>
        <span className="integration-card__actionText">{actionLabel}</span>
      </SecondaryButton>
    </div>
  );
};

export default IntegrationCard;
