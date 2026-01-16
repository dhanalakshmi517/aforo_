// QBFailed.tsx
import * as React from "react";
import "./QBFailed.css";
import QBBar from "./QBBar";

type Props = {
  onBack: () => void;
  onTryAgain: () => void;

  title?: string; // "Connection Failed"
  message?: string; // 2 lines text
  buttonText?: string; // "Try Again"
};

const QBFailed: React.FC<Props> = ({
  onBack,
  onTryAgain,
  title = "Connection Failed",
  message = "Failed to connect to QuickBooks. Please check your\ncredentials, network connection, or try again later.",
  buttonText = "Try Again",
}) => {
  return (
    <div className="cfPage">
      <QBBar onBack={onBack} />

      <div className="cfFrame">
        <div className="cfCard">
          <div className="cfContent">
            <div className="cfIcon" aria-hidden="true">
              <FailureSvg />
            </div>

            <div className="cfTitle">{title}</div>

            <div className="cfMessage">
              {message.split("\n").map((line, idx) => (
                <React.Fragment key={idx}>
                  {line}
                  {idx !== message.split("\n").length - 1 ? <br /> : null}
                </React.Fragment>
              ))}
            </div>

            <button type="button" className="cfBtn" onClick={onTryAgain}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QBFailed;

function FailureSvg() {
  const gid = React.useId().replace(/:/g, "");
  const gradId = `paint0_linear_${gid}`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="204" height="204" viewBox="0 0 204 204" fill="none">
      <path
        d="M162.003 103.792L177.197 88.6867H177.02C185.152 80.26 189.608 68.9506 189.409 57.2415C189.211 45.5325 184.374 34.3808 175.96 26.235C167.718 18.2867 156.714 13.8453 145.264 13.8453C133.814 13.8453 122.81 18.2867 114.568 26.235L99.375 41.34M41.2517 99.375L26.1467 114.48C18.0144 122.907 13.5585 134.216 13.7572 145.925C13.956 157.634 18.7931 168.786 27.2067 176.932C35.4486 184.88 46.4524 189.321 57.9025 189.321C69.3526 189.321 80.3564 184.88 88.5983 176.932L103.703 161.827M66.25 13.25V39.75M13.25 66.25H39.75M136.917 163.417V189.917M163.417 136.917H189.917"
        stroke={`url(#${gradId})`}
        strokeWidth="26.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id={gradId} x1="101.583" y1="13.25" x2="101.583" y2="189.917" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E36E63" />
          <stop offset="1" stopColor="#FFEDEB" />
        </linearGradient>
      </defs>
    </svg>
  );
}
