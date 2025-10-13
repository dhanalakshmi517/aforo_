// HeroSection.tsx
import React from "react";
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

const defaultTitle = (
  <>
    <span className="land-hero__title-line">Meter. Monetize. Multiply.</span>
    <br />
    Built for APIs, LLMs, and
    <br />
    modern data products.
  </>
);

const defaultSubtitle =
  "Stop adapting your product to rigid billing platforms.\n Our system adapts to you — across APIs, LLMs, SQL, and file delivery.\nTrack every signal, apply dynamic pricing, and bill instantly.";

export default function HeroSection({
  title = defaultTitle,
  subtitle = defaultSubtitle,
  ctaLabel = "Contact Sales",
  onCtaClick,
  heroImageSrc,
}: HeroSectionProps) {
  const navigate = useNavigate();
  const imgSrc = heroImageSrc ?? heroArt;

  const handleContactClick = () => {
    if (onCtaClick) onCtaClick();
    else navigate("/contact-sales");
  };

  return (
    <section className="land-hero">
      {/* single copy block */}
      <div className="land-hero__copy">
        <h1 className="land-hero__title">{title}</h1>

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

      {/* single image element */}
      <img
        className="land-hero__img"
        src={imgSrc}
        alt="Usage-based pricing cards and product types"
        loading="eager"
        decoding="async"
      />
    </section>
  );
}
