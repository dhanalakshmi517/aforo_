import React from "react";
import "./RegionGuideCard.css";
import kong1Svg from "./kong1.svg";
import VerticalScrollbar from "../../componenetsss/VerticalScrollbar";

interface RegionGuideCardProps {
  isVisible: boolean;
}

const RegionGuideCard: React.FC<RegionGuideCardProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  const steps = [
    "Log in to your Kong Admin Portal.",
    "Go to Workspace Settings or Cluster Info.",
    "Check the Region/Cluster field — it shows which region your workspace or APIs are running in."
  ];

  return (
    <div className="region-guide-card">
      <div className="scroll-content">
        <div className="guide-title">How to Find Region In Kong</div>
        <div className="image-container">
          <img 
            src={kong1Svg} 
            alt="Kong region guide" 
            className="region-image"
          />
        </div>
        <div className="guide-steps">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <span className="step-text">{step}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="custom-scrollbar">
        <VerticalScrollbar height="100%" color="#D9DFE8" thickness={4} />
      </div>
    </div>
  );
};

export default RegionGuideCard;
