// ApigeeBar.tsx
import * as React from "react";
import "./ApigeeBar.css";
import BackArrowButton from "../componenetsss/BackArrowButton";
import Spark from "../componenetsss/Spark";
import Bell from "../componenetsss/Bell";

type ApigeeBarProps = {
  title?: string;
  onBack?: () => void;

  /** right-side actions */
  onMagicClick?: () => void;
  onBellClick?: () => void;

  /** optional: hide icons */
  showMagic?: boolean;
  showBell?: boolean;

  /** optional */
  className?: string;
  sticky?: boolean;
};

const ApigeeBar: React.FC<ApigeeBarProps> = ({
  title = "Apigee Integration",
  onBack,
  onMagicClick,
  onBellClick,
  showMagic = true,
  showBell = true,
  className = "",
  sticky = true,
}) => {
  return (
    <header
      className={["kongbar", sticky ? "kongbar--sticky" : "", className].join(" ")}
      role="banner"
    >
      <div className="kongbar__inner">
        <div className="kongbar__left">
          <BackArrowButton onClick={onBack} ariaLabel="Go back" />

          <div className="kongbar__titleWrap">
            <div className="kongbar__title" title={title}>
              {title}
            </div>
          </div>
        </div>

        <div className="kongbar__right" aria-label="Header actions">
          {showMagic && <Spark onClick={onMagicClick} ariaLabel="Magic actions" />}

          {showBell && <Bell onClick={onBellClick} ariaLabel="Notifications" />}
        </div>
      </div>
    </header>
  );
};

export default ApigeeBar;
