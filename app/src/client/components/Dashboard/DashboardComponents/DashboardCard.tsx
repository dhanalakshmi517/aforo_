import * as React from "react";
import "./DashboardCard.css";

export type DashboardCardProps = {
  title: string;
  subtitle: string;

  /** Use this for imported SVG/PNG paths: import img from "./x.svg" */
  imageSrc?: string;
  imageAlt?: string;

  /** If you want to pass <YourSvgComponent /> instead of imageSrc */
  imageNode?: React.ReactNode;

  /** Optional icon on the left of title */
  icon?: React.ReactNode;

  /** Clickable card */
  onClick?: () => void;

  /** Custom class */
  className?: string;

  /** Loading label shown until <img> loads */
  loadingText?: string;

  /** object-fit for <img> */
  imageFit?: "contain" | "cover";
};

const DefaultPeopleIcon = () => (
  <svg
    className="dcard-titleIcon"
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3Zm-8 0c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3Z"
      stroke="#25303D"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M6.2 20c.8-3 3-4.5 5.8-4.5S17 17 17.8 20"
      stroke="#25303D"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <path
      d="M16.2 20c.5-2 1.9-3.3 3.8-3.6 1.1-.2 2 .1 2.8.6"
      stroke="#25303D"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

export default function DashboardCard({
  title,
  subtitle,
  imageSrc,
  imageAlt = "",
  imageNode,
  icon,
  onClick,
  className = "",
  loadingText = "Loading Image...",
  imageFit = "contain",
}: DashboardCardProps) {
  const isClickable = !!onClick;

  // Only track loading if we are using <img src="...">
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    // reset when image changes
    setImgLoaded(false);
    setImgError(false);
  }, [imageSrc]);

  const showLoader = !!imageSrc && !imgLoaded && !imgError;

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!isClickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`dcard ${isClickable ? "is-clickable" : ""} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? title : undefined}
    >
      {/* Image / Thumbnail */}
      <div className="dcard-thumb" aria-label="dashboard-thumbnail">
        {imageNode ? (
          <div className="dcard-thumbInner">{imageNode}</div>
        ) : imageSrc ? (
          <>
            {showLoader && (
              <div className="dcard-loader" aria-live="polite">
                <span className="dcard-spinner" aria-hidden="true" />
                <span className="dcard-loaderText">{loadingText}</span>
              </div>
            )}

            {!imgError && (
              <img
                className={`dcard-img ${imgLoaded ? "is-loaded" : ""}`}
                src={imageSrc}
                alt={imageAlt}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
                draggable={false}
              />
            )}

            {imgError && (
              <div className="dcard-error">
                <span className="dcard-errorTitle">Image failed to load</span>
                <span className="dcard-errorSub">Check the SVG path/import.</span>
              </div>
            )}
          </>
        ) : (
          // If no image provided at all
          <div className="dcard-loader">
            <span className="dcard-spinner" aria-hidden="true" />
            <span className="dcard-loaderText">{loadingText}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="dcard-body">
        <div className="dcard-titleRow">
          {icon ?? <DefaultPeopleIcon />}
          <div className="dcard-title">{title}</div>
        </div>

        <div className="dcard-subtitle">{subtitle}</div>
      </div>
    </div>
  );
}
