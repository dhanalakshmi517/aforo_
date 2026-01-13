// SuccessQB.tsx
import * as React from "react";
import "./SuccessQB.css"; // ✅ reuse the same CSS (classnames unchanged)
import QBBar from "./QBBar";
import IntegrationBlurMark from "../../componenetsss/IntegrationBlurMark";
import PrimaryButton from "../../componenetsss/PrimaryButton";

type SuccessQBProps = {
  onBack: () => void;

  title?: string; // default: "Connected To Quickbooks"
  subtitle?: string;

  onViewCustomerSyncStatus?: () => void;
  isViewDisabled?: boolean;
};

const SuccessQB: React.FC<SuccessQBProps> = ({
  onBack,
  title = "Connected To Quickbooks",
  subtitle =
    "You are successfully connected to Apigee. You can now import API\nproducts and manage them seamlessly.",
  onViewCustomerSyncStatus,
  isViewDisabled = false,
}) => {
  return (
    <div className="skPage">
      <QBBar onBack={onBack} />

      <div className="skFrame">
        <div className="skCard">
          <div className="skInner">
            {/* LEFT VISUAL */}
            <div className="skLeft">
              <IntegrationBlurMark />
            </div>

            {/* RIGHT PANEL */}
            <div className="skRight skRight--qb">
              <div className="skTitle">{title}</div>

              <div className="skSubtitle">
                {subtitle.split("\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx !== subtitle.split("\n").length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </div>

              <div className="skActions skActions--qb">
                {/* small pink icon box (left of button) */}
                <div className="skSyncBadge" aria-hidden="true">
                  <SyncBadgeIcon />
                </div>

                <PrimaryButton
                  onClick={onViewCustomerSyncStatus}
                  disabled={isViewDisabled}
                  className="skPrimaryButton skPrimaryButton--qb"
                >
                  View Customer Sync Status <ChevronRightIcon />
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessQB;

/* ---------------- icons ---------------- */

function SyncBadgeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M7 7.5a6.5 6.5 0 0 1 10.9 3.2"
        stroke="#ED5142"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 6v4h-4"
        stroke="#ED5142"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 16.5a6.5 6.5 0 0 1-10.9-3.2"
        stroke="#ED5142"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6 18v-4h4"
        stroke="#ED5142"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M10 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
