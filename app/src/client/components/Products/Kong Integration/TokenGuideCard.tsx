import React from "react";
import "./TokenGuideCard.css";
import kongSvg from "./kong.svg";
import VerticalScrollbar from "../../componenetsss/VerticalScrollbar";

interface TokenGuideCardProps {
  isVisible: boolean;
}

const TokenGuideCard: React.FC<TokenGuideCardProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  const steps = [
    "Log in to Kong Admin Portal.",
    "Go to User Profile → API Tokens or Personal Access Tokens.",
    "Create or copy your token from there."
  ];

  return (
    <div className="token-guide-card">
      <div className="scroll-content">
        <div className="guide-title">How to Enter Personal Access Token</div>
        <div className="image-container">
          <img 
            src={kongSvg} 
            alt="Kong token guide" 
            className="token-image"
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

export default TokenGuideCard;
