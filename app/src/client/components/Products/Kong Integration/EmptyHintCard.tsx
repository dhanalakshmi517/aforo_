import React, { useState } from "react";
import "./EmptyHintCard.css";
import kong1Svg from "./kong1.svg";
import kongSvg from "./kong.svg";
import InfoBadgeIcon from "./InfoBadgeIcon";

interface EmptyHintCardProps {
  focusedField?: string | null;
}

const EmptyHintCard: React.FC<EmptyHintCardProps> = ({ focusedField }) => {
  const [regionImageLoading, setRegionImageLoading] = useState(true);
  const [tokenImageLoading, setTokenImageLoading] = useState(true);

  const regionSteps = [
    "• Log in to your Kong Admin Portal.",
    "• Go to Workspace Settings or Cluster Info.",
    "• Check the Region/Cluster field — it shows which region your workspace "
  ];

  const tokenSteps = [
    "• Log in to Kong Admin Portal.",
    "• Go to User Profile → API Tokens or Personal Access Tokens.",
    "• Create or copy your token from there."
  ];

  if (focusedField === "region") {
    return (
      <div className="empty-card region-guide">
        <div className="guide-content">
          <div className="guide-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{marginRight: '8px'}}>
              <path d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z" stroke="#026BB0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            How to Find Region In Kong
          </div>
          <div className="image-container">
            {regionImageLoading && (
              <div className="image-spinner">
                <div className="spinner"></div>
                <div className="loading-text">Loading...</div>
              </div>
            )}
            <img 
              src={kong1Svg} 
              alt="Kong region guide" 
              className="guide-image"
              onLoad={() => setRegionImageLoading(false)}
              style={{ display: regionImageLoading ? 'none' : 'block' }}
            />
          </div>
          <div className="empty-guide-steps">
            {regionSteps.map((step, index) => (
              <div key={index} className="empty-step-item">
                <span className="empty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (focusedField === "token") {
    return (
      <div className="empty-card token-guide">
        <div className="guide-content">
          <div className="guide-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{marginRight: '8px'}}>
              <path d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z" stroke="#026BB0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            How to Enter Personal Access Token
          </div>
          <div className="image-container">
            {tokenImageLoading && (
              <div className="image-spinner">
                <div className="spinner"></div>
                <div className="loading-text">Loading...</div>
              </div>
            )}
            <img 
              src={kongSvg} 
              alt="Kong token guide" 
              className="guide-image"
              onLoad={() => setTokenImageLoading(false)}
              style={{ display: tokenImageLoading ? 'none' : 'block' }}
            />
          </div>
          <div className="empty-guide-steps">
            {tokenSteps.map((step, index) => (
              <div key={index} className="empty-step-item">
                <span className="empty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default empty state - always show when no field is focused
  return (
    <div className="empty-card">
      <div className="empty-icon-wrapper">
        <InfoBadgeIcon />
      </div>

      <p className="primary-text">
        Tap any field to see what to enter.
      </p>
      <p className="secondary-text">
        We will guide you with some quick notes.
      </p>
    </div>
  );
};

export default EmptyHintCard;
