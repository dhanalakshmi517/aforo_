import * as React from "react";
import "./QBIntegation.css";
import KongBar from "../../Products/Kong Integration/KongBar";
import qbpreview from "./qbpreview.svg";
import { connectQuickBooks, checkQuickBooksStatus, getCustomerOverview, disconnectQuickBooks } from "./QBAPI";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import SuccessQB from "./SuccessQB";
import QBFailed from "./QBFailed";

type Props = {
  title?: string;
  subtitle?: string;

  heroSrc?: string;
  heroAlt?: string;

  leftMarkSrc?: string;
  leftMarkAlt?: string;
  rightMarkSrc?: string;
  rightMarkAlt?: string;

  onBack?: () => void;
  onConnect?: () => void;

  onStar?: () => void;
  onBell?: () => void;

  connectLabel?: string;

  className?: string;
};

export default function QBIntegration({
  title = "Sync Aforo Billing Streams into QuickBooks",
  subtitle = `Effortlessly channel your Aforo billing data into QuickBooks. With secure, automated syncing,
you get instant access to revenue, customer activity, and product performance — no manual steps, just clean, ready-to-use insights.`,
  heroSrc = qbpreview,
  heroAlt = "QuickBooks preview",
  leftMarkSrc,
  leftMarkAlt = "Aforo",
  rightMarkSrc,
  rightMarkAlt = "QuickBooks",
  onBack,
  onConnect,
  onStar,
  onBell,
  connectLabel = "Connect Quickbooks",
  className = "",
}: Props) {
  // ✅ new UI state
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [showViewStatus, setShowViewStatus] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<boolean | null>(null);
  
  // Store timeout in ref to prevent it from being cleared
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Debug state changes
  React.useEffect(() => {
    console.log('State changed:', { isConnecting, showViewStatus, connectionStatus });
  }, [isConnecting, showViewStatus, connectionStatus]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleConnect = async () => {
    if (isConnecting) return;

    console.log('Starting connection process...');
    // Reset all states to show the initial connection page
    setConnectionStatus(null);
    setShowViewStatus(false);
    setIsConnecting(true);

    try {
      console.log('Calling connectQuickBooks API...');
      const response = await connectQuickBooks();
      console.log('API response:', response);

      if (response.authUrl) {
        console.log('Opening auth URL:', response.authUrl);
        window.open(response.authUrl, "_blank");
      }

      // Don't call onConnect() here - it navigates away and unmounts the component
      console.log('Setting 5-second timer...');

      timeoutRef.current = setTimeout(() => {
        console.log('5 seconds elapsed - Setting showViewStatus to true');
        setIsConnecting(false);
        setShowViewStatus(true);
      }, 5000);
    } catch (error) {
      console.error("Failed to connect to QuickBooks:", error);
      setIsConnecting(false);
    }
  };

  const handleNavigateToConnectPage = () => {
    // Just reset state to show the initial connection page without calling any API
    console.log('Navigating back to connect page...');
    setConnectionStatus(null);
    setShowViewStatus(false);
    setIsConnecting(false);
  };

  const handleViewStatus = async () => {
    console.log('View Status button clicked!');
    try {
      console.log('Calling checkQuickBooksStatus API...');
      const data = await checkQuickBooksStatus();
      console.log('API response:', data);
      // Use 'connected' field instead of 'status'
      setConnectionStatus(data.connected);
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setConnectionStatus(false);
    }
  };

  const handleViewCustomerSyncStatus = async () => {
    console.log('View Customer Sync Status clicked!');
    try {
      console.log('Calling getCustomerOverview API...');
      const data = await getCustomerOverview();
      console.log('Customer overview API response:', data);
      
      // Store customer data and navigate to QuickbooksIntegration
      // You could use localStorage, context, or pass via navigation state
      localStorage.setItem('customerData', JSON.stringify(data));
      
      // Navigate to QuickbooksIntegration page
      window.location.href = '/quickbooks-integration';
    } catch (error) {
      console.error('Failed to get customer overview:', error);
    }
  };

  const handleDisconnect = async () => {
    console.log('Disconnect clicked!');
    try {
      console.log('Calling disconnectQuickBooks API...');
      const response = await disconnectQuickBooks();
      console.log('Disconnect API response:', response);
      
      if (response.success) {
        console.log('QuickBooks disconnected successfully');
        // Reset connection status to show the initial connection screen
        setConnectionStatus(null);
        setShowViewStatus(false);
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Failed to disconnect QuickBooks:', error);
    }
  };

  return (
    <div className={`qbint-page ${className}`}>
      {connectionStatus === null ? (
        <>
          <KongBar
            title="QuickBooks Integration"
            onBack={onBack}
            onMagicClick={onStar}
            onBellClick={onBell}
          />

          <main className="qbint-main" role="main">
        <section
          className={`qbint-card ${isConnecting ? "qbint-card--connecting" : ""}`}
          aria-label="QuickBooks integration card"
        >
          <div className="qbint-cardBody">
            <div className="qbint-copy">
              <h1 className="qbint-h1">{title}</h1>
              <p className="qbint-p">{subtitle}</p>
            </div>

            <div className="qbint-heroWrap">
              <img className="qbint-hero" src={heroSrc} alt={heroAlt} />
            </div>
          </div>

          <div className="qbint-cardFooter">
            <div className="qbint-marks" aria-label="Integration marks">
              {leftMarkSrc ? (
                <img className="qbint-mark" src={leftMarkSrc} alt={leftMarkAlt} />
              ) : (
                <div className="qbint-markStub" aria-hidden="true">
                  {/* your svg */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="23" height="19" viewBox="0 0 23 19" fill="none">
                    <path
                      d="M9.06291 17.5641L7.33649 13.2135C6.94618 12.2299 6.75102 11.7382 6.90631 11.6483C7.06161 11.5585 7.39053 11.973 8.04837 12.8019L11.7653 17.4851C12.1597 17.9822 12.357 18.2307 12.6062 18.4047C12.7878 18.5315 12.9885 18.6284 13.2007 18.6919C13.4919 18.7789 13.8092 18.7789 14.4438 18.7789C17.9864 18.7789 19.7577 18.7789 20.7534 17.9834C21.4628 17.4166 21.9345 16.6049 22.0757 15.7079C22.274 14.4489 21.397 12.9099 19.6431 9.83196L18.8699 8.47519C15.7771 3.04762 14.2307 0.33383 11.9163 0.037962C11.5802 -0.00499916 11.2405 -0.0113082 10.9031 0.0191469C8.57925 0.228886 6.93316 2.88339 3.64098 8.1924L2.95857 9.29287C0.827786 12.729 -0.237605 14.4471 0.0446479 15.8563C0.193534 16.5997 0.571029 17.278 1.12434 17.7963C2.17329 18.7789 4.19487 18.7789 8.23803 18.7789C8.72371 18.7789 8.96655 18.7789 9.11055 18.6601C9.18701 18.597 9.24383 18.5133 9.27428 18.4189C9.33162 18.2413 9.24205 18.0156 9.06291 17.5641Z"
                      fill="#8BA4B8"
                    />
                  </svg>
                </div>
              )}

              <svg xmlns="http://www.w3.org/2000/svg" width="1" height="22" viewBox="0 0 1 22" fill="none" aria-hidden="true">
                <path d="M0.45459 0.45459V20.9091" stroke="#EEF1F6" strokeWidth="0.909091" strokeLinecap="round" />
              </svg>

              {rightMarkSrc ? (
                <img className="qbint-mark" src={rightMarkSrc} alt={rightMarkAlt} />
              ) : (
                <div className="qbint-markStub qbint-markStub--qb" aria-hidden="true">
                  {/* your QB svg */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18.7964 2.26014C21.2346 4.17039 22.7803 6.65208 23.5047 9.63847C23.8362 13.4965 22.9581 16.8029 20.4517 19.8019C18.0039 22.3822 15.051 23.3878 11.5484 23.5017C8.49393 23.4698 5.92086 22.2874 3.65845 20.2848C2.22288 18.8238 1.37767 17.2363 0.644956 15.3443C0.548644 15.1038 0.548644 15.1038 0.450386 14.8586C-0.462636 12.0404 0.0976391 8.90058 1.36684 6.3101C2.96285 3.49289 5.41858 1.50383 8.48043 0.411144C12.062 -0.544936 15.7624 0.204963 18.7964 2.26014Z"
                      fill="#2FA11F"
                    />
                    <path
                      d="M12.4358 4.17041C13.0313 4.28809 13.0313 4.28809 13.6389 4.40815C14.1273 5.13195 14.18 5.26468 14.1748 6.0753C14.1748 6.26564 14.1748 6.45597 14.1747 6.65208C14.1722 6.85641 14.1697 7.06074 14.1672 7.27126C14.1665 7.48133 14.1658 7.69139 14.1651 7.90783C14.1624 8.57884 14.1564 9.24978 14.1503 9.92077C14.1479 10.3757 14.1457 10.8306 14.1437 11.2855C14.1384 12.4007 14.1301 13.5158 14.1202 14.631C14.5039 14.6026 14.8873 14.5714 15.2707 14.5391C15.4843 14.522 15.6978 14.5049 15.9179 14.4874C16.9694 14.3248 17.6784 13.8356 18.3011 12.9965C18.619 11.9287 18.5679 11.2785 18.0304 10.2922C17.1564 9.23679 16.428 9.10648 15.0827 8.92523C15.0827 8.37605 15.0827 7.82687 15.0827 7.26104C16.5147 7.14315 17.5047 7.39505 18.6921 8.21201C19.8125 9.26626 20.4024 10.1465 20.4668 11.7038C20.453 13.0325 20.032 13.8647 19.1734 14.8688C17.1169 16.799 15.481 16.2952 12.4358 16.2952C12.4358 12.294 12.4358 8.29284 12.4358 4.17041Z"
                      fill="#F7FBF6"
                    />
                    <path
                      d="M11.2326 7.26079C11.2326 11.262 11.2326 15.2632 11.2326 19.3856C10.8356 19.3071 10.4386 19.2287 10.0295 19.1478C9.5411 18.424 9.48843 18.2913 9.49361 17.4807C9.49364 17.2904 9.49368 17.1 9.49372 16.9039C9.4962 16.6996 9.49868 16.4953 9.50124 16.2847C9.50192 16.0747 9.5026 15.8646 9.50331 15.6482C9.506 14.9772 9.51204 14.3062 9.51816 13.6352C9.52058 13.1803 9.52277 12.7254 9.52474 12.2705C9.53005 11.1553 9.53836 10.0402 9.54824 8.92498C9.12506 8.94939 8.70211 8.97769 8.2793 9.00763C8.04375 9.02297 7.80821 9.03831 7.56552 9.05412C6.55389 9.21952 6.14582 9.61774 5.45755 10.3514C5.08887 11.0799 5.16173 11.6867 5.21693 12.4911C5.61636 13.3593 6.05449 13.9282 6.90133 14.393C7.78028 14.5653 7.78028 14.78028 8.58573 14.6308C8.58573 15.1799 8.58573 15.7291 8.58573 16.295C7.09862 16.3981 6.15925 16.2704 4.9763 15.344C3.85265 14.272 3.28326 13.2256 3.20166 11.6887C3.24039 10.3316 3.70872 9.46779 4.66799 8.51357C6.80009 6.63467 7.68308 7.26079 11.2326 7.26079Z"
                      fill="#F7FBF7"
                    />
                  </svg>
                </div>
              )}
            </div>

            <PrimaryButton onClick={handleConnect} fullWidth={false} className="connect-btn-qb">
              {isConnecting ? "Connecting..." : connectLabel}
            </PrimaryButton>
          </div>

          {/* ✅ overlay on top of the same card */}
         {isConnecting && (
  <div className="qbint-overlay" role="status" aria-live="polite">
    <div className="qbint-overlayInline">
      <div className="qbint-spinner" aria-hidden="true" />
      <div className="qbint-overlayTitle">Connecting to QuickBooks</div>
    </div>
  </div>
)}

        {showViewStatus && (
          <div className="qbint-overlay qbint-overlay--viewStatus" role="status" aria-live="polite">
            <div className="qbint-overlayInline">
              <div className="qbint-overlayTitle">
                We're connecting your QuickBooks account. This may take a moment.
              </div>
              <PrimaryButton onClick={handleViewStatus} className="qbint-viewStatusBtn">
                View Status
              </PrimaryButton>
            </div>
          </div>
        )}
        </section>
          </main>
        </>
      ) : connectionStatus === true ? (
          <SuccessQB 
            onBack={onBack!} 
            onViewCustomerSyncStatus={handleViewCustomerSyncStatus}
            onDisconnect={handleDisconnect}
          />
        ) : (
          <QBFailed onBack={onBack!} onTryAgain={handleNavigateToConnectPage} />
        )}
    </div>
  );
}
