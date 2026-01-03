// InfoBadgeIcon.tsx
import * as React from "react";
import "./InfoBadgeIcon.css";

type Props = {
  className?: string;
};

const InfoBadgeIcon: React.FC<Props> = ({ className = "" }) => {
  return (
    <span className={`ibiWrap ${className}`} aria-hidden="true">
     <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
  <path d="M9.16658 12.4999V9.16658M9.16658 5.83325H9.17492M17.4999 9.16658C17.4999 13.769 13.769 17.4999 9.16658 17.4999C4.56421 17.4999 0.833252 13.769 0.833252 9.16658C0.833252 4.56421 4.56421 0.833252 9.16658 0.833252C13.769 0.833252 17.4999 4.56421 17.4999 9.16658Z" stroke="#026BB0" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    </span>
  );
};

export default InfoBadgeIcon;
