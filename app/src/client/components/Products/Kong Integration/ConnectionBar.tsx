// ConnectionBar.tsx
import * as React from "react";
import "./ConnectionBar.css";

import BackArrowButton from "../../componenetsss/BackArrowButton";
import SecondaryButton from "../../componenetsss/SecondaryButton";
import Spark from "../../componenetsss/Spark";
import Bell from "../../componenetsss/Bell";

type Props = {
  title?: string; // "Kong Integration"
  onBack?: () => void;

  rightActionLabel?: string; // "Manage Connection"
  onRightAction?: () => void;

  className?: string;
};

const ConnectionBar: React.FC<Props> = ({
  title = "Kong Integration",
  onBack,
  rightActionLabel = "Manage Connection",
  onRightAction,
  className = "",
}) => {
  return (
    <header className={`cbWrap ${className}`}>
      <div className="cbInner">
        {/* LEFT */}
        <div className="cbLeft">
          <BackArrowButton onClick={onBack} />
          <div className="cbTitle">{title}</div>
        </div>

        {/* RIGHT */}
        <div className="cbRight">
          <SecondaryButton className="cbManageBtn" onClick={onRightAction}>
            {rightActionLabel}
          </SecondaryButton>

          <button className="cbIconBtn" type="button" aria-label="Spark">
            <Spark />
          </button>

          <button className="cbIconBtn" type="button" aria-label="Notifications">
            <Bell />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ConnectionBar;
