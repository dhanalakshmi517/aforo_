import React, { useEffect, useRef, useState } from "react";
import "./InsightCards.css";

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
  const [isMobile, setIsMobile] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const isAnimating = useRef(false);
  const animTimer = useRef<number | null>(null);

  // Detect mobile breakpoint (CSS uses same 900px)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const apply = () => setIsMobile(mq.matches);
    apply();

    if (mq.addEventListener) mq.addEventListener("change", apply);
    else mq.addListener(apply);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", apply);
      else mq.removeListener(apply);
    };
  }, []);

  // Smooth scroll the container to a specific card
  const scrollToCard = (index: number) => {
    const root = viewportRef.current;
    const el = cardRefs.current[index];
    if (!root || !el) return;

    isAnimating.current = true;
    setActive(index);

    root.scrollTo({ top: el.offsetTop, behavior: "smooth" });

    if (animTimer.current) window.clearTimeout(animTimer.current);
    animTimer.current = window.setTimeout(() => {
      isAnimating.current = false;
    }, 550);
  };

  // Observe active card inside the container
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (isAnimating.current) return;

        for (const e of entries) {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.index);
            if (!Number.isNaN(idx)) setActive(idx);
          }
        }
      },
      {
        root,
        threshold: isMobile ? 0.6 : 0.55,
        rootMargin: isMobile ? "0px 0px -40% 0px" : "-10% 0px -35% 0px",
      }
    );

    cardRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [isMobile]);

  // Desktop-only wheel pagination (mobile uses native scroll-snap)
  useEffect(() => {
    if (isMobile) return;

    const root = viewportRef.current;
    if (!root) return;

    let lastWheelAt = 0;

    const goForward = () => {
      if (isAnimating.current) return;
      const next = active + 1;
      if (next >= items.length) return;
      scrollToCard(next);
    };

    const goBackward = () => {
      if (isAnimating.current) return;
      const next = active - 1;
      if (next < 0) return;
      scrollToCard(next);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastWheelAt < 200) return;
      lastWheelAt = now;

      if (Math.abs(e.deltaY) < 10) return;

      if (e.deltaY > 0) goForward();
      else goBackward();
    };

    root.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      root.removeEventListener("wheel", onWheel as any);
    };
  }, [active, isMobile]);

  return (
    <section className="ic">
      <div className="ic__container" ref={viewportRef}>
        {items.map((it, idx) => (
          <article
            className={`ic__card ${active === idx ? "is-active" : ""}`}
            key={idx}
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            data-index={idx}
            style={{
              ["--i" as any]: idx,
              // Fixed z-index logic for proper desktop stacking
              zIndex: !isMobile
                ? active === idx
                  ? items.length + 1  // Active card gets highest z-index
                  : items.length - idx // Cards get decreasing z-index (later cards on top)
                : undefined,
            }}
          >
            <div className="ic__left">
              <h3 className="ic__title">{it.title}</h3>
              <p className="ic__body">{it.body}</p>
            </div>

            <div className="ic__right">
              <img src={it.image} alt={it.imageAlt ?? ""} />
            </div>
          </article>
        ))}

        {/* Desktop-only spacer, harmless on mobile */}
        <div className="ic__endSpacer" />
      </div>
    </section>
  );
}
