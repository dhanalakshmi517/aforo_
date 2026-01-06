// ApigeeHintCard.tsx
import React, { useState } from "react";
import "./ApigeeHintCard.css";

import orgIdSvg from "./images/orgid.svg";
import environmentSvg from "./images/env.svg";
import jsonSvg from "./images/json.svg";
import InfoBadgeIcon from "../Products/Kong Integration/InfoBadgeIcon";

interface ApigeeHintCardProps {
  focusedField?: string | null;
}

const ApigeeHintCard: React.FC<ApigeeHintCardProps> = ({ focusedField }) => {
  const [orgIdImageLoading, setOrgIdImageLoading] = useState(true);
  const [environmentImageLoading, setEnvironmentImageLoading] = useState(true);
  const [analyticsImageLoading, setAnalyticsImageLoading] = useState(true);
  const [jsonImageLoading, setJsonImageLoading] = useState(true);

  const orgIdSteps = [
    "• Go to Google Cloud Console → Apigee.",
    "• Check the top-left org/project selector.",
    "• That name is your Org ID — paste it here.",
  ];

  const environmentSteps = [
    "• Open Apigee → any API Proxy.",
    "• Go to Overview → Deployments section.",
    "• The badge (dev/test/prod) is your environment.",
  ];

  const analyticsSteps = [
    "• Google Cloud Console → Apigee.",
    "• Admin → Organization Settings.",
    "• Under Analytics, you'll see Standard vs Basic.",
  ];

  const jsonSteps = [
    "• IAM & Admin → Service Accounts → select your account.",
    "• Keys → Add Key → Create new JSON key.",
    "• Download the file and upload it here.",
  ];

  if (focusedField === "orgId") {
    return (
      <div className="empty-card orgId-guide">
        <div className="guide-content">
          <div className="guide-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: "8px" }}
              aria-hidden="true"
            >
              <path
                d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z"
                stroke="#026BB0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            How to Enter Apigee Org ID
          </div>

          <div className="image-container">
            {orgIdImageLoading && (
              <div className="image-spinner">
                <div className="spinner"></div>
                <div className="loading-text">Loading...</div>
              </div>
            )}

            <img
              src={orgIdSvg}
              alt="Apigee Org ID guide"
              className="guide-image"
              onLoad={() => setOrgIdImageLoading(false)}
              style={{ display: orgIdImageLoading ? "none" : "block" }}
            />
          </div>

          <div className="empty-guide-steps">
            {orgIdSteps.map((step: string, index: number) => (
              <div key={index} className="empty-step-item">
                <span className="empty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (focusedField === "environment") {
    return (
      <div className="empty-card environment-guide">
        <div className="guide-content">
          <div className="guide-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: "8px" }}
              aria-hidden="true"
            >
              <path
                d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z"
                stroke="#026BB0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            How to Enter Environment
          </div>

          <div className="image-container">
            {environmentImageLoading && (
              <div className="image-spinner">
                <div className="spinner"></div>
                <div className="loading-text">Loading...</div>
              </div>
            )}

            <img
              src={environmentSvg}
              alt="Apigee environment guide"
              className="guide-image"
              onLoad={() => setEnvironmentImageLoading(false)}
              style={{ display: environmentImageLoading ? "none" : "block" }}
            />
          </div>

          <div className="empty-guide-steps">
            {environmentSteps.map((step: string, index: number) => (
              <div key={index} className="empty-step-item">
                <span className="empty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (focusedField === "analytics") {
    return (
      <div className="empty-card analytics-guide">
        <div className="guide-content">
          <div className="guide-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: "8px" }}
              aria-hidden="true"
            >
              <path
                d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z"
                stroke="#026BB0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            How to Select Analytics Mode
          </div>

          <div className="image-container">
            {analyticsImageLoading && (
              <div className="image-spinner">
                <div className="spinner"></div>
                <div className="loading-text">Loading...</div>
              </div>
            )}

            <img
              src={orgIdSvg}
              alt="Apigee analytics guide"
              className="guide-image"
              onLoad={() => setAnalyticsImageLoading(false)}
              style={{ display: analyticsImageLoading ? "none" : "block" }}
            />
          </div>

          <div className="empty-guide-steps">
            {analyticsSteps.map((step: string, index: number) => (
              <div key={index} className="empty-step-item">
                <span className="empty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (focusedField === "json") {
    return (
      <div className="empty-card json-guide">
        <div className="guide-content">
          <div className="guide-title">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ marginRight: "8px" }}
              aria-hidden="true"
            >
              <path
                d="M7.57484 7.49984C7.77076 6.94289 8.15746 6.47326 8.66647 6.17411C9.17547 5.87497 9.77392 5.76562 10.3558 5.86543C10.9377 5.96524 11.4655 6.26777 11.8457 6.71944C12.226 7.17111 12.434 7.74277 12.4332 8.33317C12.4332 9.99984 9.93317 10.8332 9.93317 10.8332M9.99984 14.1665H10.0082M18.3332 9.99984C18.3332 14.6022 14.6022 18.3332 9.99984 18.3332C5.39746 18.3332 1.6665 14.6022 1.6665 9.99984C1.6665 5.39746 5.39746 1.6665 9.99984 1.6665C14.6022 1.6665 18.3332 5.39746 18.3332 9.99984Z"
                stroke="#026BB0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            How to Upload JSON File
          </div>

          <div className="image-container">
            {jsonImageLoading && (
              <div className="image-spinner">
                <div className="spinner"></div>
                <div className="loading-text">Loading...</div>
              </div>
            )}

            <img
              src={jsonSvg}
              alt="Apigee JSON file guide"
              className="guide-image"
              onLoad={() => setJsonImageLoading(false)}
              style={{ display: jsonImageLoading ? "none" : "block" }}
            />
          </div>

          <div className="empty-guide-steps">
            {jsonSteps.map((step: string, index: number) => (
              <div key={index} className="empty-step-item">
                <span className="empty-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default empty state
  return (
    <div className="empty-card">
      <div className="empty-icon-wrapper">
        <InfoBadgeIcon />
      </div>

      <p className="primary-text">Tap any field to see what to enter.</p>
      <p className="secondary-text">We will guide you with some quick notes.</p>
    </div>
  );
};

export default ApigeeHintCard;
