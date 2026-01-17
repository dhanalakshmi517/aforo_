// SuccessQB.tsx
import * as React from "react";
import "./SuccessQB.css"; // ✅ reuse the same CSS (classnames unchanged)
import QBBar from "./QBBar";
import QBMark from "../../componenetsss/QBMark";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import { useNavigate } from "react-router-dom";
import { disconnectQuickBooks, getCustomerOverviewForDisplay } from "./QBAPI";

type SuccessQBProps = {
  onBack: () => void;

  title?: string; // default: "Connected To Quickbooks"
  subtitle?: string;

  onViewCustomerSyncStatus?: () => void;
  onDisconnect?: () => void;
  isViewDisabled?: boolean;
  isDisconnectDisabled?: boolean;
};

const SuccessQB: React.FC<SuccessQBProps> = ({
  onBack,
  title = "Connected To Quickbooks",
  subtitle =
    "You are successfully connected to Apigee. You can now import API\nproducts and manage them seamlessly.",
  onViewCustomerSyncStatus,
  onDisconnect,
  isViewDisabled = false,
  isDisconnectDisabled = false,
}) => {
  const navigate = useNavigate();

  const handleViewSyncStatus = async () => {
    try {
      await getCustomerOverviewForDisplay();
      
      // Navigate to QuickbooksIntegration component
      navigate("/quickbooks-sync-status");
    } catch (error) {
      console.error('Failed to view customer sync status:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log('Disconnecting QuickBooks...');
      const response = await disconnectQuickBooks();
      console.log('Disconnect response:', response);
      
      // Always navigate after disconnect attempt, regardless of response
      console.log('Navigating to first page...');
      navigate("/quickbooks-integration");
      
      if (response && response.success) {
        console.log('QuickBooks disconnected successfully');
      } else {
        console.log('Disconnect response was not successful:', response);
      }
    } catch (error) {
      console.error('Failed to disconnect QuickBooks:', error);
      // Still navigate even if there's an error
      console.log('Error occurred, but still navigating to first page...');
      navigate("/quickbooks-integration");
    }
  };
  return (
    <div className="skPage">
      <QBBar 
        onBack={onBack} 
        showMagic={false}
        showBell={false}
      />

      <div className="skFrame">
        <div className="skCard">
          <div className="skInner">
            {/* LEFT VISUAL */}
            <div className="skLeft">
              <QBMark />
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
                <div 
                  className="skSyncBadge" 
                  aria-hidden="true"
                  onClick={handleDisconnect}
                  style={{ cursor: 'pointer' }}
                  title="Disconnect"
                >
                  <SyncBadgeIcon />
                </div>

                <PrimaryButton
                  onClick={handleViewSyncStatus}
                  disabled={isViewDisabled}
                  className="skPrimaryButton skPrimaryButton--qb"
                >
                  View Customer Sync Status 
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
   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18" fill="none">
  <g clip-path="url(#clip0_16254_35814)">
    <path d="M12.5602 8.88294L13.7068 7.64294H13.6935C14.3073 6.95118 14.6435 6.02277 14.6285 5.06155C14.6135 4.10033 14.2485 3.18487 13.6135 2.51616C12.9915 1.86367 12.161 1.49906 11.2968 1.49906C10.4327 1.49906 9.6022 1.86367 8.98016 2.51616L7.8335 3.75616M3.44683 8.52037L2.30683 9.76037C1.69308 10.4521 1.35678 11.3805 1.37178 12.3418C1.38678 13.303 1.75185 14.2184 2.38683 14.8872C3.00886 15.5396 3.83934 15.9043 4.7035 15.9043C5.56766 15.9043 6.39813 15.5396 7.02016 14.8872L8.16016 13.6472M5.3335 1.4502V3.62563M1.3335 5.80107H3.3335M10.6668 13.7777V15.9531M12.6668 11.6022H14.6668" stroke="#ED5142" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_16254_35814">
      <rect width="16" height="17.4035" fill="white"/>
    </clipPath>
  </defs>
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
