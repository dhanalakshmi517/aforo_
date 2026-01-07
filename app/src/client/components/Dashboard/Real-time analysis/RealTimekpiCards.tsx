import * as React from "react";
import "./RealTimeKpiCards.css";

type TrendDirection = "up" | "down";

export type KpiCardItem = {
  id: string;
  title: string;
  value: string;
  trend?: {
    direction: TrendDirection;
    deltaText: string; // "+2.15"
    metaText: string;  // "from last 7 days"
  };
  variant?: "neutral" | "violet" | "mint" | "sky";
};

type Props = {
  items?: KpiCardItem[];
  className?: string;
};

const defaultItems: KpiCardItem[] = [
  {
    id: "ingestion",
    title: "Ingestion Events",
    value: "23M",
    trend: { direction: "up", deltaText: "+2.15", metaText: "from last 7 days" },
    variant: "neutral",
  },
  {
    id: "revenue",
    title: "Live Revenue",
    value: "$85",
    trend: { direction: "up", deltaText: "+2.15", metaText: "Last 20 Min" },
    variant: "violet",
  },
  {
    id: "activeUsers",
    title: "Active Users Now",
    value: "$85",
    trend: { direction: "up", deltaText: "+2.15", metaText: "Last 20 Min" },
    variant: "mint",
  },
  {
    id: "signups",
    title: "New Signups",
    value: "40",
    trend: { direction: "up", deltaText: "+2.15", metaText: "from last 7 days" },
    variant: "sky",
  },
  {
    id: "successPay",
    title: "Successful Payments",
    value: "20",
    trend: { direction: "down", deltaText: "-2.15", metaText: "from last 7 days" },
    variant: "neutral",
  },
  {
    id: "failedPay",
    title: "Failed Payments",
    value: "2",
    trend: { direction: "down", deltaText: "-2.15", metaText: "from last 7 days" },
    variant: "neutral",
  },
];

const ArrowIcon: React.FC<{ direction: TrendDirection }> = ({ direction }) => {
  const isUp = direction === "up";
  return (
    <svg
      className="rtkpi-trend-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      {isUp ? (
        <path d="M12 5.25H16.5M16.5 5.25V9.75M16.5 5.25L10.125 11.625L6.375 7.875L1.5 12.75" stroke="#6AB349" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>

      ) : (
  <path d="M5.17481 8.17505H0.674806M0.674806 8.17505V3.67505M0.674806 8.17505L7.04981 1.80005L10.7998 5.55005L15.6748 0.675049" stroke="#ED5142" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
      )}
    </svg>
  );
};

const RealTimeKpiCards: React.FC<Props> = ({ items = defaultItems, className = "" }) => {
  return (
    <div className={`rtkpi-row ${className}`.trim()} role="list" aria-label="Realtime KPIs">
      {items.map((it) => {
        const trendDir = it.trend?.direction;
        return (
          <div
            key={it.id}
            role="listitem"
            className={`rtkpi-card v-${it.variant || "neutral"}`}
          >
            <div className="rtkpi-title">{it.title}</div>

            <div className="rtkpi-value">{it.value}</div>

            {it.trend ? (
              <div
                className={`rtkpi-trend ${trendDir === "up" ? "is-up" : "is-down"}`}
              >
                <span className="rtkpi-trend-left">
                  <ArrowIcon direction={it.trend.direction} />
                  <span className="rtkpi-trend-delta">{it.trend.deltaText}</span>
                </span>
                <span className="rtkpi-trend-meta">{it.trend.metaText}</span>
              </div>
            ) : (
              <div className="rtkpi-trend is-muted">—</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RealTimeKpiCards;
