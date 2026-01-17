import * as React from "react";
import "./QBBar.css"; // Reuse the same CSS
import BackArrowButton from "../../componenetsss/BackArrowButton";
import Spark from "../../componenetsss/Spark";
import Bell from "../../componenetsss/Bell";
import PrimaryButton from "../../componenetsss/PrimaryButton";

type QBBarProps = {
  title?: string;
  onBack?: () => void;

  /** right-side actions */
  onMagicClick?: () => void;
  onBellClick?: () => void;
  onDisconnect?: () => void;
  rightActionLabel?: string;

  /** optional: hide icons */
  showMagic?: boolean;
  showBell?: boolean;

  /** optional */
  className?: string;
  sticky?: boolean;
};

const QBBar: React.FC<QBBarProps> = ({
  title = "QuickBooks Integration",
  onBack,
  onMagicClick,
  onBellClick,
  onDisconnect,
  rightActionLabel,
  showMagic = true,
  showBell = true,
  className = "",
  sticky = true,
}) => {
  return (
    <header
      className={[
        "kongbar",
        sticky ? "kongbar--sticky" : "",
        className,
      ].join(" ")}
      role="banner"
    >
      <div className="kongbar__inner">
        <div className="kongbar__left">
          <BackArrowButton
            onClick={onBack}
            ariaLabel="Go back"
          />

          <div className="kongbar__titleWrap">
            <div className="kongbar__title" title={title}>
              {title}
            </div>
          </div>
        </div>

        <div className="kongbar__right" aria-label="Header actions">
          {showMagic && (
            <Spark
              onClick={onMagicClick}
              ariaLabel="Magic actions"
            />
          )}

          {showBell && (
            <Bell
              onClick={onBellClick}
              ariaLabel="Notifications"
            />
          )}

          {onDisconnect && rightActionLabel && (
            <PrimaryButton
              onClick={onDisconnect}
              className="skDisconnectButton"
            >
              {rightActionLabel}
            </PrimaryButton>
          )}
        </div>
      </div>
    </header>
  );
};

export default QBBar;
