import React, { useEffect, useRef, useState } from "react";
import "./InsightCards.css";

/* Replace these with your real assets (PNG/SVG) */
import imgA from "../LandingComponents/insight-1.svg";
import imgB from "../LandingComponents/insight-2.svg";
import imgC from "../LandingComponents/insight-3.svg";
import imgD from "../LandingComponents/insight-4.svg";

type CardItem = {
  title: React.ReactNode;
  body: React.ReactNode;
  image: string;
  imageAlt?: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
};

const items: CardItem[] = [
  {
    title: (
      <>
        See your product exactly the way your
        <br /> customers experience it
      </>
    ),
    body: (
      <>
        Measure what matters for your product’s success. From feature adoption to
        usage trends, get a clear picture of how customers interact with your
        product. Optimize performance and drive innovation.
      </>
    ),
    image: imgA,
    imageAlt: "Experience widgets",
    ctaLabel: "Explore",
  },
  {
    title: (
      <>
        Turn complex revenue data into simple,
        <br /> actionable insights
      </>
    ),
    body: (
      <>
        Gain complete visibility into your growth. Monitor revenue streams,
        identify top drivers, and forecast with accuracy. Unlock smarter
        decisions with clear, actionable revenue insights.
      </>
    ),
    image: imgB,
    imageAlt: "Revenue widgets",
    ctaLabel: "Explore",
  },
  {
    title: (
      <>
        Keep your business in control with live,
        <br /> real-time visibility
      </>
    ),
    body: (
      <>
        Stay on top of performance with live insights. Track usage,
        transactions, and system health in real-time to quickly spot anomalies.
      </>
    ),
    image: imgC,
    imageAlt: "Real-time widgets",
    ctaLabel: "Explore",
  },
  {
    title: (
      <>
        See the bigger picture behind customer
        <br /> behavior
      </>
    ),
    body: (
      <>
        Understand your customers better with data-driven insights. Analyze user
        behavior, engagement, and retention patterns to optimize experiences.
      </>
    ),
    image: imgD,
    imageAlt: "Customer insights",
    ctaLabel: "Explore",
  },
];

export default function InsightCards() {
  const [active, setActive] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const isAnimating = useRef(false);
  const animTimer = useRef<number | null>(null);

  // Utility: smooth scroll container to card's top
  const scrollToCard = (index: number) => {
    const root = viewportRef.current;
    const el = cardRefs.current[index];
    if (!root || !el) return;

    // lock during animation
    isAnimating.current = true;
    setActive(index); // reflect state immediately

    const top = el.offsetTop; // works well with sticky stacking
    root.scrollTo({ top, behavior: "smooth" });

    if (animTimer.current) window.clearTimeout(animTimer.current);
    animTimer.current = window.setTimeout(() => {
      isAnimating.current = false;
    }, 600);
  };

  /* Observe which card is in view to set active state (kept, but tolerant) */
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        // Ignore observer updates during our programmatic scroll to avoid jitter
        if (isAnimating.current) return;

        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.index);
            setActive(idx);
          }
        });
      },
      {
        root,
        threshold: 0.55,
        rootMargin: "-10% 0px -35% 0px",
      }
    );

    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Wheel/touch step pagination (separate forward/backward handling)
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    let touchStartY = 0;
    let lastWheelAt = 0;

    // Forward scrolling (1 → 2 → 3 → 4)
    const goForward = () => {
      if (isAnimating.current) return;
      const next = active + 1;
      if (next >= items.length) return;
      scrollToCard(next);
    };

    // Backward scrolling (4 → 3 → 2 → 1)
    const goBackward = () => {
      if (isAnimating.current) return;
      const next = active - 1;
      if (next < 0) return;
      scrollToCard(next);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelAt < 200) return; // throttle
      lastWheelAt = now;

      if (Math.abs(e.deltaY) < 10) return;
      
      if (e.deltaY > 0) {
        goForward(); // scroll down = next card
      } else {
        goBackward(); // scroll up = previous card
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 24) return;
      e.preventDefault();
      
      if (dy > 0) {
        goForward(); // swipe up = next card
      } else {
        goBackward(); // swipe down = previous card
      }
      touchStartY = e.touches[0].clientY; // update so you can keep swiping
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      root.removeEventListener("wheel", onWheel as any);
      root.removeEventListener("touchstart", onTouchStart as any);
      root.removeEventListener("touchmove", onTouchMove as any);
    };
  }, [active]);

  return (
    <section className="ic">
      <div className="ic__container" ref={viewportRef}>
        {items.map((it, idx) => (
          <article
            className={`ic__card ${active === idx ? "is-active" : ""}`}
            key={idx}
            ref={(el) => (cardRefs.current[idx] = el)}
            data-index={idx}
            style={{ 
              ["--i" as any]: idx,
              zIndex: active === idx ? items.length : (idx < active ? idx + 1 : 0)
            }}
          >
            <div className="ic__left">
              <h3 className="ic__title">{it.title}</h3>
              <p className="ic__body">{it.body}</p>

              {/* {it.ctaLabel && (
                <button
                  className="ic__cta"
                  type="button"
                  onClick={it.onCtaClick}
                >
                  {it.ctaLabel}
                  <span className="ic__ctaArrow" aria-hidden>
                    →
                  </span>
                </button>
              )} */}
            </div>

            <div className="ic__right">
              <img src={it.image} alt={it.imageAlt ?? ""} />
            </div>
          </article>
        ))}
        {/* spacer so the last sticky card can unstick nicely */}
        <div className="ic__endSpacer" />
      </div>
    </section>
  );
}
