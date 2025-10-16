import React, { useEffect, useRef, useState } from "react";
import "./ProductShowcaseScroll.css";
import TertiaryButton from "../componenetsss/TertiaryButton";

/* Center arts (update paths to match your project) */
import rateplan from "../LandingComponents/rateplan.svg";
import billable from "../LandingComponents/billable.svg";
import product from "../LandingComponents/product.svg";
import landcustomer from "../LandingComponents/landcustomer.svg";
import purchase from "../LandingComponents/purchase.svg";
import sitebuilder from "../LandingComponents/sitebuilder.svg";

/* ── Triangle SVGs ─────────────────────────────────────────────────────────── */
const TriangleA = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 58 61" fill="none" xmlns="http://www.w3.org/2000/svg" width={58} height={61} {...props}>
    <path d="M20.3979 49.9332C13.9546 48.8344 10.733 48.285 10.021 46.0486C9.30893 43.8122 11.6199 41.5013 16.2417 36.8794L35.6342 17.4869C40.6964 12.4248 43.2274 9.89372 45.5365 10.7357C47.8456 11.5776 48.1535 15.1438 48.7692 22.2762L50.7582 45.3152C51.1529 49.8867 51.3502 52.1725 49.9572 53.4546C48.5642 54.7368 46.3026 54.3511 41.7794 53.5797L20.3979 49.9332Z" stroke="url(#g1)" strokeWidth="1.99348"/>
    <path opacity="0.3" d="M14.7026 44.2379C8.25932 43.1391 5.0377 42.5897 4.32566 40.3533C3.61362 38.1169 5.92455 35.806 10.5464 31.1841L29.9389 11.7916C35.001 6.72947 37.5321 4.1984 39.8412 5.04034C42.1503 5.88229 42.4582 9.44849 43.0739 16.5809L45.0629 39.6199C45.4575 44.1914 45.6549 46.4772 44.2619 47.7593C42.8689 49.0415 40.6073 48.6558 36.0841 47.8844L14.7026 44.2379Z" stroke="url(#g2)" strokeWidth="1.99348"/>
    <defs>
      <linearGradient id="g1" x1="28.6559" y1="5.776" x2="28.6559" y2="55.257" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
      <linearGradient id="g2" x1="22.9606" y1="0.081" x2="22.9606" y2="49.562" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
    </defs>
  </svg>
);

const TriangleB = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="58" height="62" viewBox="0 0 58 62" fill="none">
  <path d="M20.3979 50.2008C13.9546 49.102 10.733 48.5525 10.021 46.3162C9.30893 44.0798 11.6199 41.7689 16.2417 37.147L35.6342 17.7545C40.6964 12.6924 43.2274 10.1613 45.5365 11.0032C47.8456 11.8452 48.1535 15.4114 48.7692 22.5438L50.7582 45.5828C51.1529 50.1543 51.3502 52.4401 49.9572 53.7222C48.5642 55.0044 46.3026 54.6187 41.7794 53.8473L20.3979 50.2008Z" stroke="url(#paint0_linear_9219_9933)" stroke-width="1.99348"/>
  <path opacity="0.3" d="M14.7026 44.5055C8.25932 43.4067 5.0377 42.8572 4.32566 40.6208C3.61362 38.3845 5.92455 36.0735 10.5464 31.4517L29.9389 12.0592C35.001 6.99704 37.5321 4.46598 39.8412 5.30792C42.1503 6.14986 42.4582 9.71606 43.0739 16.8485L45.0629 39.8874C45.4575 44.459 45.6549 46.7447 44.2619 48.0269C42.8689 49.3091 40.6073 48.9234 36.0841 48.152L14.7026 44.5055Z" stroke="url(#paint1_linear_9219_9933)" stroke-width="1.99348"/>
  <defs>
    <linearGradient id="paint0_linear_9219_9933" x1="28.6559" y1="6.04395" x2="28.6559" y2="55.5249" gradientUnits="userSpaceOnUse">
      <stop stop-color="#C4E9F9"/>
      <stop offset="1" stop-color="#0092DF"/>
    </linearGradient>
    <linearGradient id="paint1_linear_9219_9933" x1="22.9606" y1="0.348633" x2="22.9606" y2="49.8296" gradientUnits="userSpaceOnUse">
      <stop stop-color="#C4E9F9"/>
      <stop offset="1" stop-color="#0092DF"/>
    </linearGradient>
  </defs>
</svg>
);

const TriangleC = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={48} height={56} {...props}>
    <path d="M15.5204 23.0563C11.2146 18.6197 9.06165 16.4013 9.72748 14.2233C10.3933 12.0453 13.4186 11.41 19.4692 10.1395L36.9083 6.47738C41.2537 5.56488 43.4265 5.10862 44.8561 6.28392C46.2857 7.45922 46.2583 9.67915 46.2035 14.119L45.9398 35.4781C45.8416 43.4258 45.7926 47.3996 43.3959 48.3542C40.9992 49.3088 38.2314 46.457 32.6958 40.7533L15.5204 23.0563Z" stroke="url(#g4)" strokeWidth="1.99348"/>
    <path opacity="0.3" d="M5.86502 31.678C6.23195 42.0989 6.41542 47.3094 9.18455 48.0397C11.9537 48.77 14.6829 44.3277 20.1414 35.4432L31.9673 16.1947C35.5603 10.3465 37.3568 7.42245 36.0675 5.38987C34.7782 3.35729 31.3674 3.73627 24.5456 4.49424L12.0907 5.87812C8.7198 6.25267 7.03434 6.43994 6.04565 7.58448C5.05696 8.72902 5.11663 10.4238 5.23598 13.8133L5.86502 31.678Z" stroke="url(#g5)" strokeWidth="1.99348"/>
    <defs>
      <linearGradient id="g4" x1="28.7866" y1="2.768" x2="23.9225" y2="52.01" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
      <linearGradient id="g5" x1="22.6053" y1="2.752" x2="22.6053" y2="57.217" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ── Types & slide data ─────────────────────────────────────────────────────── */
type LeftItem = { icon: "A" | "B" | "C"; title: string; lines: string[] };
type Slide = {
  title: string;
  step: string;
  art: string;
  left: LeftItem[];
  blurbTitle: string;
  blurbLines: string[];
};

const ICON = { A: TriangleA, B: TriangleB, C: TriangleC };

const SLIDES: Slide[] = [
  { title:"PRODUCT", step:"01", art:product,
    left:[{icon:"A",title:"Define what you\nsell",lines:[""]},
          {icon:"B",title:"Create, manage,\nand price your\nofferings with\nclarity and scale.",lines:[""]},
          {icon:"C",title:"Every business\nstarts with a\nproduct.",lines:[""]}],
    blurbTitle:"Your service, packaged\nfor billing. Products\nrepresent what you sell\napps, subscriptions, or\nAPIs.",
    blurbLines:[] },
  
  { title:"BILLABLE METRICS", step:"02", art:billable,
    left:[{icon:"A",title:"Billable units\nturn raw activity\ninto revenue.",lines:[""]},
          {icon:"A",title:"Define what\ncounts—API\ncalls, seats, or\nstorage—and bill\nwith precision.",lines:[""]}
        ],
    blurbTitle:"The smallest measurable\npiece of usage. Minutes,\nrequests,users—anything\nyou can meter.",
    blurbLines:[] },
    { title:"RATE PLAN", step:"03", art:rateplan,
    left:[{icon:"A",title:"Rate plans adapt\nyour product to\ncustomer needs.",lines:[""]},
          {icon:"A",title:"Design Flexible\nPricing",lines:[""]},
          {icon:"C",title:"Experiment, iterate, and\nlaunch models that\nscale with your\nbusiness.",lines:[""]}],
    blurbTitle:"The people or\nbusinesses you bill.\nManage their accounts,\nhistory, and invoices\nin one place.",
    blurbLines:[] },
  { title:"CUSTOMERS", step:"04", art:landcustomer,
    left:[{icon:"A",title:"Centralize Customer Management",lines:[""]},
          {icon:"A",title:"From sign-up to\nbilling, keep every customer\nrecord organized.",lines:[""]},
          {icon:"C",title:"Track usage,payments,\nand relationships\nseamlessly.",lines:[""]}],
    blurbTitle:"The people or\nbusinesses you bill.\nManage their accounts,\nhistory, and invoices\nin one place.",
    blurbLines:[] },
  { title:"PURCHASE", step:"05", art:purchase,
    left:[{icon:"A",title:"Capture Every Purchase",lines:[""]},
          {icon:"A",title:"Purchases connect\nproducts to customers.",lines:[""]},
          {icon:"C",title:"Manage subscriptions,\nrenewals, and\nupgrades without complexity.",lines:[""]}],
    blurbTitle:"A customer’s subscription\nor contract.\nThe link between your\nproduct,pricing,\n and billing.",
    blurbLines:[] },
  { title:"SITE BUILDER", step:"06", art:sitebuilder,
    left:[{icon:"A",title:"Sell With Zero Friction",lines:[""]},
          {icon:"A",title:"Launch a branded\nsales site without\ncode.",lines:[""]},
          {icon:"C",title:"Let customers\nbrowse,subscribe,\npay—all in one place.",lines:[""]}],
    blurbTitle:"No-code storefront\nfor your services.\nCreate, customize,\nand launch a sales-ready \nsite instantly.",
    blurbLines:[] }
];

/* ── Component ──────────────────────────────────────────────────────────────── */
export default function ProductShowcaseScroll() {
  const [active, setActive] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimating = useRef(false);

  /* Observe which slide is in view to set active state */
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.index);
            setActive(idx);
          }
        });
      },
      { root, threshold: 0.6 }
    );

    slideRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* Wheel/touch pagination (no visible scrollbar) */
  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    let touchStartY = 0;

    const goTo = (next: number) => {
      if (isAnimating.current) return;
      if (next < 0 || next >= SLIDES.length) return;
      isAnimating.current = true;
      slideRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setTimeout(() => { isAnimating.current = false; }, 600);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 10) return;
      goTo(active + (e.deltaY > 0 ? 1 : -1));
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = touchStartY - e.touches[0].clientY;
      if (Math.abs(dy) < 24) return;
      e.preventDefault();
      goTo(active + (dy > 0 ? 1 : -1));
      touchStartY = e.touches[0].clientY;
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

  const currentSlide = SLIDES[active];

  return (
    <section className="ph ph--card">
      <div className="ph__container">
        {/* Left column - fixed, content changes based on active */}
        <aside className="ph__left">
          {currentSlide.left.map((li, i) => {
            const Icon = ICON[li.icon];
            return (
              <div className="ph__leftItem" key={i}>
                <Icon className="ph__leftIcon" />
                <div className="ph__leftCopy">
                  <strong>{li.title}</strong>
                  {li.lines.map((ln, k) => <span key={k}>{ln}</span>)}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Center column - scrollable */}
        <div className="ph__viewport" ref={viewportRef}>
          {SLIDES.map((s, idx) => (
            <div
              key={idx}
              ref={(el) => (slideRefs.current[idx] = el)}
              data-index={idx}
              className={`ph__slide ${active === idx ? "is-active" : ""}`}
            >
              <main className="ph__center">
                <h2 className="ph__title">{s.title}</h2>
                <div className="ph__artWrap">
                  <img src={s.art} alt={`${s.title} diagram`} className="ph__art" />
                  <div className="ph__shadow" />
                </div>
              </main>
            </div>
          ))}
        </div>

        {/* Right column - fixed, content changes based on active */}
        <aside className="ph__right">
          <div className="ph__blurb">
            <p className="ph__blurbTitle">{currentSlide.blurbTitle}</p>
            {currentSlide.blurbLines.map((l, i) => <p className="ph__blurbLine" key={i}>{l}</p>)}
          </div>
          <div className="ph__bottomSection">
            <div className="ph__stepContainer">
              <div className="ph__stepNumCenter">
                <span className="ph__stepNum">{currentSlide.step}</span>
              </div>
              <div className="ph__stepTicks" aria-hidden="true">
                {SLIDES.map((_, tickIdx) => (
                  <svg 
                    key={tickIdx}
                    xmlns="http://www.w3.org/2000/svg" 
                    width={tickIdx === active ? "15" : "13"} 
                    height={tickIdx === active ? "4" : "2"} 
                    viewBox={tickIdx === active ? "0 0 15 4" : "0 0 13 2"} 
                    fill="none"
                  >
                    <path 
                      d={tickIdx === active ? "M2 1.97363H13" : "M1 0.973633H12"} 
                      stroke={tickIdx === active ? "#025A94" : "#B0CBEE"} 
                      strokeWidth={tickIdx === active ? "3" : "1"}
                      strokeLinecap="round"
                    />
                  </svg>
                ))}
              </div>
            </div>
            <div className="ph__ctaButton">
              {/* <TertiaryButton onClick={() => {}}>
                Explore Doc
              </TertiaryButton> */}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
