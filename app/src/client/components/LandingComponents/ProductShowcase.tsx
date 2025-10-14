import React from "react";
import "./ProductShowcase.css";

/** Pass your middle diagram as an imported SVG file */
type ProductShowcaseProps = {
  artSrc: string;                // e.g. import productArt from "./product-art.svg"
  onExplore?: () => void;
  title?: string;
  step?: string;
  blurbTitle?: string;
  blurbLines?: string[];
  leftItems?: Array<{ Icon: React.FC<React.SVGProps<SVGSVGElement>>; title: string; lines: string[] }>;
};

/* ───────────────────────────────── Icons (from your SVGs) ───────────────────────────────── */

export const TriangleA: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 58 61" fill="none" xmlns="http://www.w3.org/2000/svg" width={58} height={61} {...props}>
    <path d="M20.3979 49.9332C13.9546 48.8344 10.733 48.285 10.021 46.0486C9.30893 43.8122 11.6199 41.5013 16.2417 36.8794L35.6342 17.4869C40.6964 12.4248 43.2274 9.89372 45.5365 10.7357C47.8456 11.5776 48.1535 15.1438 48.7692 22.2762L50.7582 45.3152C51.1529 49.8867 51.3502 52.1725 49.9572 53.4546C48.5642 54.7368 46.3026 54.3511 41.7794 53.5797L20.3979 49.9332Z" stroke="url(#paint0_linear_9219_9930)" strokeWidth="1.99348"/>
    <path opacity="0.3" d="M14.7026 44.2379C8.25932 43.1391 5.0377 42.5897 4.32566 40.3533C3.61362 38.1169 5.92455 35.806 10.5464 31.1841L29.9389 11.7916C35.001 6.72947 37.5321 4.1984 39.8412 5.04034C42.1503 5.88229 42.4582 9.44849 43.0739 16.5809L45.0629 39.6199C45.4575 44.1914 45.6549 46.4772 44.2619 47.7593C42.8689 49.0415 40.6073 48.6558 36.0841 47.8844L14.7026 44.2379Z" stroke="url(#paint1_linear_9219_9930)" strokeWidth="1.99348"/>
    <defs>
      <linearGradient id="paint0_linear_9219_9930" x1="28.6559" y1="5.77637" x2="28.6559" y2="55.2573" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
      <linearGradient id="paint1_linear_9219_9930" x1="22.9606" y1="0.0810547" x2="22.9606" y2="49.562" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
    </defs>
  </svg>
);

export const TriangleB: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 45 47" fill="none" xmlns="http://www.w3.org/2000/svg" width={45} height={47} {...props}>
    <path d="M12.3979 41.2008C5.95464 40.102 2.73301 39.5525 2.02097 37.3162C1.30893 35.0798 3.61986 32.7689 8.24171 28.147L27.6342 8.75448C32.6964 3.69236 35.2274 1.16129 37.5365 2.00324C39.8456 2.84518 40.1535 6.41138 40.7692 13.5438L42.7582 36.5828C43.1529 41.1543 43.3502 43.4401 41.9572 44.7222C40.5642 46.0044 38.3026 45.6187 33.7794 44.8473L12.3979 41.2008Z" stroke="url(#paint0_linear_9558_43945)" strokeWidth="1.99348"/>
    <defs>
      <linearGradient id="paint0_linear_9558_43945" x1="20.6559" y1="-2.95605" x2="20.6559" y2="46.5249" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
    </defs>
  </svg>
);

export const TriangleC: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg" width={48} height={56} {...props}>
    <path d="M15.5204 23.0563C11.2146 18.6197 9.06165 16.4013 9.72748 14.2233C10.3933 12.0453 13.4186 11.41 19.4692 10.1395L36.9083 6.47738C41.2537 5.56488 43.4265 5.10862 44.8561 6.28392C46.2857 7.45922 46.2583 9.67915 46.2035 14.119L45.9398 35.4781C45.8416 43.4258 45.7926 47.3996 43.3959 48.3542C40.9992 49.3088 38.2314 46.457 32.6958 40.7533L15.5204 23.0563Z" stroke="url(#paint0_linear_9219_9936)" strokeWidth="1.99348"/>
    <path opacity="0.3" d="M5.86502 31.678C6.23195 42.0989 6.41542 47.3094 9.18455 48.0397C11.9537 48.77 14.6829 44.3277 20.1414 35.4432L31.9673 16.1947C35.5603 10.3465 37.3568 7.42245 36.0675 5.38987C34.7782 3.35729 31.3674 3.73627 24.5456 4.49424L12.0907 5.87812C8.7198 6.25267 7.03434 6.43994 6.04565 7.58448C5.05696 8.72902 5.11663 10.4238 5.23598 13.8133L5.86502 31.678Z" stroke="url(#paint1_linear_9219_9936)" strokeWidth="1.99348"/>
    <defs>
      <linearGradient id="paint0_linear_9219_9936" x1="28.7866" y1="2.76834" x2="23.9225" y2="52.0097" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
      <linearGradient id="paint1_linear_9219_9936" x1="22.6053" y1="2.75195" x2="22.6053" y2="57.2166" gradientUnits="userSpaceOnUse">
        <stop stopColor="#C4E9F9"/><stop offset="1" stopColor="#0092DF"/>
      </linearGradient>
    </defs>
  </svg>
);

/* ───────────────────────────── Small building blocks ───────────────────────────── */

const LeftItem: React.FC<{ Icon: React.FC<React.SVGProps<SVGSVGElement>>; title: string; lines: string[] }> = ({ Icon, title, lines }) => (
  <div className="ph__leftItem">
    <Icon className="ph__leftIcon" />
    <div className="ph__leftCopy">
      <strong>{title}</strong>
      {lines.map((t, i) => <span key={i}>{t}</span>)}
    </div>
  </div>
);

const RightBlurb: React.FC<{ title: string; lines: string[] }> = ({ title, lines }) => (
  <div className="ph__blurb">
    <p className="ph__blurbTitle">{title}</p>
    {lines.map((l, i) => <p className="ph__blurbLine" key={i}>{l}</p>)}
  </div>
);

const StepBadge: React.FC<{ step: string }> = ({ step }) => (
  <div className="ph__step">
    <span className="ph__stepNum">{step}</span>
    <span className="ph__stepTicks" aria-hidden="true" />
  </div>
);

/* ───────────────────────────────── Main component ──────────────────────────────── */

export default function ProductShowcase({
  artSrc,
  onExplore,
  title = "PRODUCT",
  step = "01",
  blurbTitle = "Your service, packaged for billing.",
  blurbLines = [
    "Products represent what you sell — apps, subscriptions, or APIs."
  ],
  leftItems = [
    { Icon: TriangleA, title: "Define what you sell", lines: [""] },
    { Icon: TriangleB, title: "Create, manage, and price", lines: ["your offerings with", "clarity and scale."] },
    { Icon: TriangleC, title: "Every business starts", lines: ["with a product."] },
  ],
}: ProductShowcaseProps) {
  return (
    <section className="ph">
      <div className="ph__inner">
        {/* Left rail */}
        <aside className="ph__left">
          {leftItems.map((it, i) => (
            <LeftItem key={i} Icon={it.Icon} title={it.title} lines={it.lines} />
          ))}
        </aside>

        {/* Center */}
        <main className="ph__center">
          <h2 className="ph__title">{title}</h2>
          <div className="ph__artWrap">
            <img src={artSrc} alt="Product diagram" className="ph__art" />
            {/* Shadow ellipse below the center SVG */}
            <div className="ph__shadow" />
          </div>
        </main>

        {/* Right rail */}
        <aside className="ph__right">
          <RightBlurb title={blurbTitle} lines={blurbLines} />
          <StepBadge step={step} />
          {/* <button className="ph__cta" type="button" onClick={onExplore}>Explore Doc</button> */}
        </aside>
      </div>
    </section>
  );
}
