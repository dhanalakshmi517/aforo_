import React, { useEffect, useMemo, useRef, useState } from "react";
import "./FAQSection.css";

export type FAQItem = { q: string; a: string };

type FAQSectionProps = {
  title?: React.ReactNode;
  blurb?: React.ReactNode;
  items: FAQItem[];
};

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
      <br /> about our services, project process,
      <br /> and technical expertise?
    </>
  ),
  items,
}: FAQSectionProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  // Create stable ids for observer
  const ids = useMemo(() => items.map((_, i) => `faq-card-${i}`), [items]);

  // Observe which card is most centered in view
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(track.querySelectorAll<HTMLElement>("[data-card-idx]"));

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry with largest intersection ratio
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (best) {
          const idx = Number((best.target as HTMLElement).dataset.cardIdx || 0);
          setActive(idx);
        }
      },
      {
        root: track,
        threshold: [0.25, 0.5, 0.75, 0.95],
      }
    );

    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items]);

  const scrollByOne = (dir: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card-idx]");
    const cardWidth = card ? card.offsetWidth : 320;
    track.scrollBy({ left: dir * (cardWidth + 24), behavior: "smooth" });
  };

  return (
    <section className="faq">
      <div className="faq__container">
        <div className="faq__header">
          <h2 className="faq__title">{title}</h2>

          <div className="faq__aside">
            <p className="faq__blurb">{blurb}</p>
            <div className="faq__nav">
              <button
                className="faq__navbtn"
                aria-label="Previous"
                onClick={() => scrollByOne(-1)}
              >
                ←
              </button>
              <button
                className="faq__navbtn"
                aria-label="Next"
                onClick={() => scrollByOne(1)}
              >
                →
              </button>
            </div>
          </div>
        </div>

        <div className="faq__marquee">
          <div className="faq__track" ref={trackRef}>
            {items.map((it, i) => (
              <article
                key={ids[i]}
                data-card-idx={i}
                className={`faq-card ${active === i ? "is-active" : ""}`}
              >
                <div className="faq-card__inner">
                  <h3 className="faq-card__q">{it.q}</h3>
                  <p className="faq-card__a">{it.a}</p>
                </div>
              </article>
            ))}
            {/* optional: ghost spacing at end for nice end snap */}
            <div className="faq__endpad" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
