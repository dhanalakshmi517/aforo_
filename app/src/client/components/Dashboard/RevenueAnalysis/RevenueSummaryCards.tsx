import React from "react";
import "./RevenueSummaryCards.css";

type TrendDirection = "up" | "down";

interface RevenueMetric {
  id: string;
  label: string;
  value: string;
  change: string;          // e.g. "+2.15"
  direction: TrendDirection;
  bg: string;
}

const metrics: RevenueMetric[] = [
  {
    id: "active-paying",
    label: "Active Paying Customers",
    value: "38,985",
    change: "+2.15",
    direction: "up",
    bg: "#EEF6F7",
  },
  {
    id: "mrr",
    label: "MRR",
    value: "$38,985",
    change: "+2.15",
    direction: "up",
    bg: "#F0EEF7",
  },
  {
    id: "net-new",
    label: "Net New Revenue",
    value: "$18,985",
    change: "+2.15",
    direction: "up",
    bg: "#EEF3F7",
  },
  {
    id: "growth",
    label: "Revenue Growth % (MoM)",
    value: "22%",
    change: "-2.15",
    direction: "down",
    bg: "#EEEFF7",
  },
];

const RevenueSummaryCards: React.FC = () => {
  return (
    <section className="rev-metrics">
      {metrics.map((m) => (
        <article
          key={m.id}
          className="rev-card"
          style={{ backgroundColor: m.bg }}
        >
          <div className="rev-card-header">
            <span className="rev-label">{m.label}</span>
            {/* <button
              className="rev-checkbox"
              aria-label={`Toggle ${m.label} in chart`}
            >
              <span className="rev-checkbox-inner" />
            </button> */}
          </div>

          <div className="rev-value-row">
            <span className="rev-value">{m.value}</span>
          </div>

          <div className="rev-trend-row">
            <span className="rev-trend-icon">
              {m.direction === "up" ? (
                // green up trend SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                >
                  <path
                    d="M12 5.25H16.5M16.5 5.25V9.75M16.5 5.25L10.125 11.625L6.375 7.875L1.5 12.75"
                    stroke="#6AB349"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                // red down arrow SVG
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="17"
                  height="9"
                  viewBox="0 0 17 9"
                  fill="none"
                >
                  <path
                    d="M5.17481 8.17505H0.674806M0.674806 8.17505V3.67505M0.674806 8.17505L7.04981 1.80005L10.7998 5.55005L15.6748 0.675049"
                    stroke="#ED5142"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>

            <span
              className={
                m.direction === "up"
                  ? "rev-trend-text rev-trend-up"
                  : "rev-trend-text rev-trend-down"
              }
            >
              {m.change}
            </span>
            <span className="rev-trend-sub">from last 7 days</span>
          </div>
        </article>
      ))}
    </section>
  );
};

export default RevenueSummaryCards;
