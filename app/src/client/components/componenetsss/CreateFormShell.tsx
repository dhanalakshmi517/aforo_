import * as React from "react";
import "./CreateFormShell.css";

type Props = {
  rail?: React.ReactNode;

  title?: string;
  locked?: boolean;
  titleRightNode?: React.ReactNode;

  children: React.ReactNode;

  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;

  /** When provided, footer shows this centered and hides buttons */
  footerHint?: React.ReactNode;

  className?: string;
};

const LockBadge = () => (
  <span className="cfsLock" aria-label="Locked">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M4.66667 7.33334V4.66668C4.66667 3.78262 5.01786 2.93478 5.64298 2.30965C6.2681 1.68453 7.11595 1.33334 8 1.33334C8.88406 1.33334 9.7319 1.68453 10.357 2.30965C10.9821 2.93478 11.3333 3.78262 11.3333 4.66668V7.33334M3.33333 7.33334H12.6667C13.403 7.33334 14 7.9303 14 8.66668V13.3333C14 14.0697 13.403 14.6667 12.6667 14.6667H3.33333C2.59695 14.6667 2 14.0697 2 13.3333V8.66668C2 7.9303 2.59695 7.33334 3.33333 7.33334Z"
        stroke="#75797E"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

export default function CreateFormShell({
  rail,
  title = "CONFIGURATION",
  locked = false,
  titleRightNode,
  children,
  footerLeft,
  footerRight,
  footerHint,
  className = "",
}: Props) {
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const showHint = Boolean(footerHint);

  return (
    <div className={`cfs ${className}`.trim()}>
      <div className="cfsCard">
        <aside className="cfsSide">{rail}</aside>

        <section className="cfsMain">
          {/* Header */}
          <div className="cfsMainTop">
            <div className="cfsMainTopLeft">
              <span className="cfsTitle">{title}</span>
              {locked && <LockBadge />}
            </div>

            {titleRightNode && (
              <div className="cfsMainTopRight">{titleRightNode}</div>
            )}
          </div>

          {/* ONLY BODY SCROLLS */}
          <div className="cfsBody">
            <div className="cfsBodyInner">{children}</div>
          </div>

          {/* Footer */}
          <div className={`cfsFooter ${showHint ? "cfsFooter--hint" : ""}`}>
            {showHint ? (
              <div className="cfsFooterHint">{footerHint}</div>
            ) : (
              <>
                <div className="cfsFooterLeft">{footerLeft}</div>
                <div className="cfsFooterRight">{footerRight}</div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
