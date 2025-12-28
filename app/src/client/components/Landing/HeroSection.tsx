// HeroSection.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import heroArt from "../LandingComponents/hero.svg";

type HeroSectionProps = {
  title?: React.ReactNode;
  subtitle?: string | React.ReactNode;
  ctaLabel?: string;
  onCtaClick?: () => void;
  heroImageSrc?: string;
};

const defaultTitleDesktop = (
  <>
    <span className="land-hero__title-line">Meter. Monetize. Multiply.</span>
    <br />
    Built for APIs, LLMs, and
    <br />
    modern data products.
  </>
);

/**
 * ✅ Mobile title MUST match your screenshot line-by-line:
 * Meter. Monetise.
 * Multiply.
 * Built for APIs,
 * LLMs, and modern
 * Data Products.
 */
const defaultTitleMobile = (
  <>
    Meter. Monetise.
    <br />
    Multiply.
    <br />
    Built for APIs,
    <br />
    LLMs, and modern
    <br />
    Data Products.
  </>
);

const defaultSubtitle =
  "Stop adapting your product to rigid billing platforms.\n Our system adapts to you — across APIs, LLMs, SQL, and file delivery.\nTrack every signal, apply dynamic pricing, and bill instantly.";

export default function HeroSection({
  title,
  subtitle = defaultSubtitle,
  ctaLabel = "Contact Sales",
  onCtaClick,
  heroImageSrc,
}: HeroSectionProps) {
  const navigate = useNavigate();
  const imgSrc = heroImageSrc ?? heroArt;

  // ✅ Mobile detection (<= 768px)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setIsMobile(mq.matches);

    onChange();
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  const effectiveTitle = title ?? (isMobile ? defaultTitleMobile : defaultTitleDesktop);

  const handleContactClick = () => {
    if (onCtaClick) onCtaClick();
    else navigate("/contact-sales");
  };

  return (
    <section className="land-hero">
      <div className="land-hero__copy">
        <h1 className="land-hero__title">{effectiveTitle}</h1>

        <p className="land-hero__subtitle">
          {typeof subtitle === "string"
            ? subtitle.split("\n").map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))
            : subtitle}
        </p>

        <div className="land-hero__actions">
          <button className="land-hero__cta" onClick={handleContactClick}>
            {ctaLabel}
          </button>
        </div>
      </div>

      {/* ✅ Desktop only image */}
      {!isMobile && (
        <img
          className="land-hero__img"
          src={imgSrc}
          alt="Usage-based pricing cards and product types"
          loading="eager"
          decoding="async"
        />
      )}
    </section>
  );
}
