import React, { useState } from "react";
import "./EmptyHintCard.css";
import InfoBadgeIcon from "../componenetsss/InfoBadgeIcon";

interface EmptyHintCardProps {
  focusedField?: string | null;
}

const EmptyHintCard: React.FC<EmptyHintCardProps> = ({ focusedField }) => {
  const [orgIdImageLoading, setOrgIdImageLoading] = useState(true);
  const [envImageLoading, setEnvImageLoading] = useState(true);
  const [analyticsImageLoading, setAnalyticsImageLoading] = useState(true);

  const orgIdSteps = [
    "• Log in to your Apigee account.",
    "• Go to Admin → Organization Settings.",
    "• Find the Organization ID in the organization details section."
  ];

  const envSteps = [
    "• Log in to your Apigee account.",
    "• Go to Admin → Environments.",
    "• Select your environment and note the environment name (e.g., 'dev', 'prod')."
  ];

  const analyticsSteps = [
    "• Log in to your Apigee account.",
    "• Go to Admin → Organization Settings.",
    "• Check Analytics settings to choose between STANDARD or BASIC mode."
  ];

  if (focusedField === "orgId") {
    return (
      <div className="ahEmpty-card ahOrgId-guide">
        <div className="ahGuide-content">
          <div className="ahGuide-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{marginRight: '8px'}}>
              <path d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z" stroke="#026BB0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            How to Find Organization ID in Apigee
          </div>
          <div className="ahImage-container">
            <div className="ahImage-placeholder">
              <span>Organization ID Guide</span>
            </div>
          </div>
          <div className="ahEmpty-guide-steps">
            {orgIdSteps.map((step, index) => (
              <div key={index} className="ahEmpty-step-item">
                <span className="ahEmpty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (focusedField === "environment") {
    return (
      <div className="ahEmpty-card ahEnv-guide">
        <div className="ahGuide-content">
          <div className="ahGuide-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{marginRight: '8px'}}>
              <path d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z" stroke="#026BB0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            How to Find Environment in Apigee
          </div>
          <div className="ahImage-container">
            <div className="ahImage-placeholder">
              <span>Environment Guide</span>
            </div>
          </div>
          <div className="ahEmpty-guide-steps">
            {envSteps.map((step, index) => (
              <div key={index} className="ahEmpty-step-item">
                <span className="ahEmpty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (focusedField === "analytics") {
    return (
      <div className="ahEmpty-card ahAnalytics-guide">
        <div className="ahGuide-content">
          <div className="ahGuide-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{marginRight: '8px'}}>
              <path d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z" stroke="#026BB0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            How to Choose Analytics Mode
          </div>
          <div className="ahImage-container">
            <div className="ahImage-placeholder">
              <span>Analytics Mode Guide</span>
            </div>
          </div>
          <div className="ahEmpty-guide-steps">
            {analyticsSteps.map((step, index) => (
              <div key={index} className="ahEmpty-step-item">
                <span className="ahEmpty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default empty state - always show when no field is focused
  return (
    <div className="ahEmpty-card">
      <div className="ahEmpty-icon-wrapper">
        <InfoBadgeIcon />
      </div>

      <p className="ahPrimary-text">
        Tap any field to see what to enter.
      </p>
      <p className="ahSecondary-text">
        We will guide you with some quick notes.
      </p>
    </div>
  );
};

export default EmptyHintCard;
