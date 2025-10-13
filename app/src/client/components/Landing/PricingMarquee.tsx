import React from "react";
import "./PricingMarquee.css";

/** import your finished SVG cards (all text is inside the svgs) */
import frame1 from "../LandingComponents/frame1.svg";
import frame2 from "../LandingComponents/frame2.svg";
import frame3 from "../LandingComponents/frame3.svg";
import frame4 from "../LandingComponents/frame4.svg";
import frame5 from "../LandingComponents/frame5.svg";
import frame6 from "../LandingComponents/frame6.svg";
import frame7 from "../LandingComponents/frame7.svg";
import frame8 from "../LandingComponents/frame8.svg";
import frame9 from "../LandingComponents/frame9.svg";



const CARDS = [
  frame1,
  frame2,
  frame3,
  frame4,
  frame5,
  frame6,
  frame7,
  frame8,
  frame9,
];

export default function PricingMarquee() {
  // duplicate for perfect seamless loop
  const LOOP = [...CARDS, ...CARDS];

  return (
    <section className="pm">
      <div className="pm__container">
        <header className="pm__header">
          <h2 className="pm__title">Flexible Pricing Solutions</h2>
          <p className="pm__subtitle">
            Not every customer fits into the same box, and neither should your pricing.
            Mix and match models without the headache.
          </p>
        </header>

        <div className="pm__marquee" aria-label="Pricing cards">
          <div className="pm__track">
            {LOOP.map((src, i) => (
              <figure
                key={`${src}-${i}`}
                className={`pm-card ${i % 2 === 0 ? "pm-card--floatA" : "pm-card--floatB"}`}
              >
                <img className="pm-card__img" src={src} alt="" aria-hidden="true" />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
