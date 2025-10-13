// Default illustrations (replace paths with yours)
import managerArt from "../LandingComponents/manager.svg";
import financeArt from "../LandingComponents/finance.svg";
import analystArt from "../LandingComponents/analyst.svg";

import React from "react";
import "./AudienceSection.css";

type Props = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optionally override the three images */
  images?: Array<{ src: string; alt: string }>;
};

export default function AudienceSection({
  title = "The SaaS Billing Platform for Every Team",
  subtitle = (
    <>
      Aforo is built for teams who are tired of forcing their unique business
      models into rigid billing tools. Billing is not one-size-fits-all. Aforo
      is for anyone who feels their current system slows them down instead of
      powering growth.
    </>
  ),
  images = [
    { src: managerArt, alt: "Product Manager" },
    { src: financeArt, alt: "Finance Lead" },
    { src: analystArt, alt: "Engineer / Data Analyst" },
  ],
}: Props) {
  return (
    <section className="aud">
      <div className="aud__container">
        <header className="aud__header">
          <h2 className="aud__title">{title}</h2>
          <p className="aud__subtitle">{subtitle}</p>
        </header>

        {/* three images side-by-side */}
        <div className="aud__images">
          {images.map(({ src, alt }, i) => (
            <img key={i} className="aud__img" src={src} alt={alt} />
          ))}
        </div>
      </div>
    </section>
  );
}
