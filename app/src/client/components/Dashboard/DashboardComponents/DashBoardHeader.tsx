import * as React from "react";
import Spark from "../../componenetsss/Spark";
import Bell from "../../componenetsss/Bell";
import "./DashBoardHeader.css";

export interface DashBoardHeaderProps {
  title: string;
  onAddClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  showAdd?: boolean;
}

const DashBoardHeader: React.FC<DashBoardHeaderProps> = ({
  title,
  onAddClick,
  onSettingsClick,
  onNotificationsClick,
  showAdd = true,
}) => {
  return (
    <header className="dsh-wrap">
      <div className="dsh-inner">
        <h2 className="dsh-title">{title}</h2>

        <div className="dsh-actions">
         

          <Spark state="default" onClick={onSettingsClick} ariaLabel="Settings" />
          <Bell
            state="default"
            onClick={onNotificationsClick || (() => {})}
            ariaLabel="Notifications"
          />
        </div>
      </div>
    </header>
  );
};

export default DashBoardHeader;
