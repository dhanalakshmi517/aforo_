// ApigeeSuccess.tsx
import * as React from "react";
import "./ApigeeSuccess.css"; // reuse the exact same CSS (or create ApigeeSuccess.css with same classes)
import ApigeeBar from "./ApigeeBar";
import IntegrationBlurMark from "../componenetsss/IntegrationBlurMark";
import PrimaryButton from "../componenetsss/PrimaryButton";
import DeleteButton from "../componenetsss/DeleteButton";
import ReviewComponent from "../componenetsss/ReviewComponent";

type CredentialRow = {
  label: string;
  value: string;
};

type ApigeeSuccessProps = {
  onBack: () => void;

  title?: string; // default: "Connected To Apigee"
  subtitle?: string;

  credentialsTitle?: string; // default: "APIGEE CREDENTIALS"
  credentials?: CredentialRow[];

  onDisconnect?: () => void;
  onImportProducts?: () => void;

  isDisconnectDisabled?: boolean;
  isImportDisabled?: boolean;
};

const ApigeeSuccess: React.FC<ApigeeSuccessProps> = ({
  onBack,
  title = "Connected To Apigee",
  subtitle = "You are successfully connected to Apigee. You can now import API\nproducts and manage them seamlessly.",
  credentialsTitle = "APIGEE CREDENTIALS",
  credentials = [],
  onDisconnect,
  onImportProducts,
  isDisconnectDisabled = false,
  isImportDisabled = false,
}) => {
  return (
    <div className="skPage">
      <ApigeeBar onBack={onBack} title="Apigee Integration" />

      <div className="skFrame">
        <div className="skCard">
          <div className="skInner">
            {/* LEFT VISUAL */}
            <div className="skLeft">
              <IntegrationBlurMark />
            </div>

            {/* RIGHT PANEL */}
            <div className="skRight">
              <div className="skTitle">{title}</div>

              <div className="skSubtitle">
                {subtitle.split("\n").map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx !== subtitle.split("\n").length - 1 ? <br /> : null}
                  </React.Fragment>
                ))}
              </div>

              <ReviewComponent
                title={credentialsTitle}
                rows={credentials}
                className="skReviewComponent"
              />

              <div className="skActions">
                <DeleteButton
                  label="Disconnect"
                  onClick={onDisconnect}
                  disabled={isDisconnectDisabled}
                  customIcon={<DisconnectIcon />}
                  variant="soft"
                  className="skDisconnectButton"
                />

                <PrimaryButton
                  onClick={onImportProducts}
                  disabled={isImportDisabled}
                  className="skPrimaryButton"
                >
                  Import Products →
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApigeeSuccess;

/* ---------------- icons ---------------- */

function DisconnectIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 16 18" fill="none">
      <g clipPath="url(#clip0_15609_26671)">
        <path
          d="M12.5597 8.88294L13.7063 7.64294H13.693C14.3068 6.95118 14.6431 6.02277 14.6281 5.06155C14.6131 4.10033 14.248 3.18487 13.613 2.51616C12.991 1.86367 12.1605 1.49906 11.2963 1.49906C10.4322 1.49906 9.60171 1.86367 8.97967 2.51616L7.83301 3.75616M3.44634 8.52037L2.30634 9.76037C1.69259 10.4521 1.35629 11.3805 1.37129 12.3418C1.38629 13.303 1.75136 14.2184 2.38634 14.8872C3.00838 15.5396 3.83885 15.9043 4.70301 15.9043C5.56717 15.9043 6.39764 15.5396 7.01967 14.8872L8.15967 13.6472M5.33301 1.4502V3.62563M1.33301 5.80107H3.33301M10.6663 13.7777V15.9531M12.6663 11.6022H14.6663"
          stroke="#ED5142"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_15609_26671">
          <rect width="16" height="17.4035" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
