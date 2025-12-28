import React, { useState, useRef } from "react";
import "./FAQSection.css";

export type FAQItem = {
  q: string;
  a: string;
};

type Props = {
  title?: React.ReactNode;
  blurb?: React.ReactNode;
  items: FAQItem[];
};

const ChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M5.5 8L10 12.5L14.5 8"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function FAQSection({
  title = (
    <>
      Frequently
      <br />
      Asked Questions
    </>
  ),
  blurb = (
    <>
      Find answers to common questions
      <br />
      about our services, project process,
      <br />
      and technical expertise.
    </>
  ),
  items,
}: Props) {
  // Desktop behavior (keep exactly as-is)
  const [active, setActive] = useState<number | null>(0);
  const rowRef = useRef<HTMLDivElement>(null);

  const scrollByOne = (direction: -1 | 1) => {
    const newActive = active !== null ? active + direction : 0;
    if (newActive >= 0 && newActive < items.length) {
      setActive(newActive);
      if (!rowRef.current) return;
      const cardWidth = 245;
      rowRef.current.scrollBy({
        left: direction * cardWidth,
        behavior: "smooth",
      });
    }
  };

  // Mobile behavior (accordion)
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);
  const toggleMobile = (idx: number) => {
    setMobileOpen((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="faq">
      {/* ===================== DESKTOP (UNCHANGED) ===================== */}
      <div className="faq__desktop">
        <div className="faq__head">
          <h2 className="faq__title">{title}</h2>

          <div className="faq__right">
            <p className="faq__blurb">{blurb}</p>

            <div className="faq__nav">
              <button
                className="faq__navBtn"
                onClick={() => scrollByOne(-1)}
                aria-label="Previous"
                disabled={active === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                  <path
                    d="M12.668 8.64583H3.33464M3.33464 8.64583L8.0013 13.3125M3.33464 8.64583L8.0013 3.97917"
                    stroke="#025A94"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                className="faq__navBtn"
                onClick={() => scrollByOne(1)}
                aria-label="Next"
                disabled={active === items.length - 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none">
                  <path
                    d="M1.33203 5.64583H10.6654M10.6654 5.64583L5.9987 10.3125M10.6654 5.64583L5.9987 0.979168"
                    stroke="#025A94"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          ref={rowRef}
          className={`faq__row ${active !== null ? "has-active" : ""}`}
          onMouseLeave={() => setActive(null)}
        >
          {items.map((it, i) => {
            const isActive = active === i;
            return (
              <article
                key={i}
                className={`faq__card ${isActive ? "is-active" : ""}`}
                onMouseEnter={() => setActive(i)}
                role="button"
                tabIndex={0}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <div className="faq__bg" aria-hidden />
                <div className="faq__content">
                  <h3 className="faq__q">{it.q}</h3>
                  <p className="faq__a">{it.a}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ===================== MOBILE (MATCHES IMAGE) ===================== */}
      <div className="faq__mobile" aria-label="FAQ">
        <h2 className="faqM__title">FAQ</h2>

        <div className="faqM__list">
          {items.map((it, idx) => {
            const isOpen = mobileOpen === idx;
            return (
              <div className={`faqM__item ${isOpen ? "is-open" : ""}`} key={idx}>
                <button
                  type="button"
                  className="faqM__qBtn"
                  aria-expanded={isOpen}
                  onClick={() => toggleMobile(idx)}
                >
                  <span className="faqM__qText">{it.q}</span>
                  <ChevronDown className="faqM__chev" />
                </button>

                <div className="faqM__aWrap" data-open={isOpen ? "true" : "false"}>
                  <div className="faqM__aInner">
                    <p className="faqM__a">{it.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
