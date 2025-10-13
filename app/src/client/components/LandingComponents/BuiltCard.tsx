import React from "react";
import "./BuiltCard.css";

export type BuiltCardProps = {
  title: string;
  description: string;
  caption?: string;
  iconSvg?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const DefaultTriangleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="81"
    height="86"
    viewBox="0 0 81 86"
    fill="none"
    aria-hidden="true"
    className="bc-icon"
  >
    <path
      d="M28.651 70.0219C19.6009 68.4784 15.0758 67.7067 14.0757 64.5656C13.0756 61.4244 16.3215 58.1785 22.8133 51.6867L50.0516 24.4484C57.1618 17.3382 60.7169 13.7831 63.9602 14.9657C67.2034 16.1483 67.6359 21.1573 68.5007 31.1753L71.2944 63.5354C71.8488 69.9565 72.1259 73.1671 70.1694 74.968C68.2128 76.7689 65.0362 76.2271 58.683 75.1436L28.651 70.0219Z"
      stroke="#0B80C2"
      strokeWidth="2.8"
    />
    <path
      opacity="0.3"
      d="M20.651 62.0219C11.6009 60.4784 7.07585 59.7067 6.07573 56.5656C5.07562 53.4244 8.3215 50.1785 14.8133 43.6867L42.0516 16.4484C49.1618 9.33823 52.7169 5.78315 55.9602 6.96572C59.2034 8.14829 59.6359 13.1573 60.5007 23.1753L63.2944 55.5354C63.8488 61.9565 64.1259 65.1671 62.1694 66.968C60.2128 68.7689 57.0362 68.2271 50.683 67.1436L20.651 62.0219Z"
      stroke="#0B80C2"
      strokeWidth="2.8"
    />
  </svg>
);

export default function BuiltCard({
  title,
  description,
  caption,
  iconSvg,
  href,
  onClick,
  className = "",
}: BuiltCardProps) {
  const content = (
    <div className={`bc-card ${className}`}>
      <div className="bc-gradient-back" />
      <div className="bc-inner">
        <div className="bc-icon-wrap">{iconSvg ?? <DefaultTriangleIcon />}</div>
        <div className="bc-text">
          {caption && <div className="bc-caption">{caption}</div>}
          <h3 className="bc-title">{title}</h3>
          <p className="bc-desc">{description}</p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="bc-anchor" onClick={onClick}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" className="bc-button-reset" onClick={onClick}>
      {content}
    </button>
  );
}
