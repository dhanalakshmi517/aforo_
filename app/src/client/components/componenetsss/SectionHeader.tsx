import * as React from "react";
import "./SectionHeader.css";

type Props = {
  title: string;          // "GENERAL DETAILS"
  className?: string;
};

const SectionHeader: React.FC<Props> = ({ title, className = "" }) => {
  return (
    <div className={`sh-root ${className}`.trim()} role="heading" aria-level={2}>
      <span className="sh-title">{title}</span>
    </div>
  );
};

export default SectionHeader;
