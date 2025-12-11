import React, { useEffect, useRef } from "react";
import "./ProductCreatedSuccess.css";
import PrimaryButton from "./PrimaryButton";

type Props = {
  /**
   * Name of the thing that was created (product or metric).
   * For backwards compatibility this is still called productName.
   */
  productName?: string;

  /** Default handler for the primary button in the original product flow */
  onGoAllProducts?: () => void;

  /** Optional override for the title text */
  titleOverride?: string;

  /** Optional override for the subtitle (small paragraph under title) */
  subtitleOverride?: string;

  /** Optional override for the bullet/step lines */
  stepsOverride?: string[];

  /** Optional override for the primary button label */
  primaryLabelOverride?: string;

  /** Optional override for the primary button click handler */
  onPrimaryClick?: () => void;
};

const ProductCreatedSuccess: React.FC<Props> = ({
  productName = "Google Maps API",
  onGoAllProducts,
  titleOverride,
  subtitleOverride,
  stepsOverride,
  primaryLabelOverride,
  onPrimaryClick,
}) => {
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    // Kick the animation when the component mounts
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    // Force layout to ensure the dashoffset is taken into account
    // then let CSS transition handle the draw.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    path.getBoundingClientRect();
    path.style.strokeDashoffset = "0";
  }, []);

  const effectiveTitle =
    titleOverride ?? `“${productName}” Product Created ${"Successfully"}`;

  const effectiveSubtitle =
    subtitleOverride ?? "To start selling, please complete the next steps:";

  const effectiveSteps =
    stepsOverride ?? [
      "• Add billable metrics to track usage.",
      "• Create rate plans for those metrics.",
      "• Market & sell to move the product live.",
    ];

  const effectivePrimaryLabel = primaryLabelOverride ?? "Go to All Products";

  const handlePrimary = onPrimaryClick ?? onGoAllProducts;

  return (
    <div className="pcs-wrap">
      <div className="pcs-card">
        <div className="pcs-hero">
          {/* Green circle */}
          <div className="pcs-circle">
            {/* Orbiting dots */}
            {/* {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45) * (Math.PI / 180); // Convert to radians
              const x = Math.cos(angle) * 75; // 75px radius
              const y = Math.sin(angle) * 75;
              return (
                <span 
                  key={i} 
                  className="pcs-dot" 
                  style={{ 
                    ["--i" as any]: i,
                    transform: `translate(${x}px, ${y}px)`
                  }} 
                />
              );
            })} */}
            {/* Animated checkmark */}
            <svg
              className="pcs-check"
              viewBox="0 0 64 64"
              aria-hidden="true"
              focusable="false"
            >
              <path
                ref={pathRef}
                d="M18 34 L28 44 L47 24"
                stroke="white"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2 className="pcs-title">{effectiveTitle}</h2>

        <p className="pcs-sub">{effectiveSubtitle}</p>
        <ul className="pcs-steps">
          {effectiveSteps.map((line, idx) => (
            <li key={idx}>{line}</li>
          ))}
        </ul>

        <PrimaryButton
          onClick={handlePrimary}
          aria-label={effectivePrimaryLabel}
        >
          {effectivePrimaryLabel}
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ProductCreatedSuccess;
