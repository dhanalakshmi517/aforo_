import * as React from "react";
import "./MiniScrollbar.css";

type Props = {
  /** Ref of the scrollable container (must have overflow: auto/scroll) */
  containerRef: React.RefObject<HTMLElement>;
  /** Optional: place it at right or left edge */
  side?: "right" | "left";
  /** Optional className for wrapper */
  className?: string;
  /** Padding from edge in px */
  inset?: number;
  /** Hide when no overflow */
  autoHide?: boolean;
};

export default function MiniScrollbar({
  containerRef,
  side = "right",
  className = "",
  inset = 12,
  autoHide = true,
}: Props) {
  const [state, setState] = React.useState({
    visible: false,
    topPx: 0,
    thumbPx: 48, // matches your svg height vibe
    trackPx: 0,
  });

  const recompute = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    const hasOverflow = scrollHeight > clientHeight + 1;
    const trackPx = clientHeight;

    // Thumb size proportional; clamp so it never becomes a needle
    const rawThumb = (clientHeight / scrollHeight) * trackPx;
    const thumbPx = Math.max(32, Math.min(64, rawThumb)); // tune if you want

    // Scroll progress -> thumb position
    const maxScrollTop = Math.max(1, scrollHeight - clientHeight);
    const progress = scrollTop / maxScrollTop;

    const maxTop = Math.max(0, trackPx - thumbPx);
    const topPx = Math.round(progress * maxTop);

    setState({
      visible: hasOverflow,
      topPx,
      thumbPx,
      trackPx,
    });
  }, [containerRef]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    recompute();

    const onScroll = () => recompute();
    el.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => recompute());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [containerRef, recompute]);

  if (autoHide && !state.visible) return null;

  return (
    <div
      className={`msb ${side === "left" ? "msb-left" : "msb-right"} ${className}`}
      style={{ insetInlineEnd: side === "right" ? inset : undefined, insetInlineStart: side === "left" ? inset : undefined }}
      aria-hidden="true"
    >
      <div className="msb-track" style={{ height: state.trackPx }}>
        <div className="msb-thumb" style={{ transform: `translateY(${state.topPx}px)` }}>
          {/* Your exact SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="4" height={state.thumbPx} viewBox={`0 0 4 ${state.thumbPx}`} fill="none">
            <path d={`M2 2V${Math.max(2, state.thumbPx - 2)}`} stroke="#D9DFE8" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
