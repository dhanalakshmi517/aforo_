import React from "react";
import "./CustomerOverviewStats.css";

type Trend = "up" | "down";

interface MetricCardProps {
  label: string;
  value: string | number;
  change: string; // e.g. "+2.15" or "-2.15"
  trend: Trend;
  subtitle?: string; // e.g. "from last 7 days"
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  change,
  trend,
  subtitle = "from last 7 days",
}) => {
  const isUp = trend === "up";

  return (
    <div className={`co-metric-card co-metric-card--${trend}`}>
      <div className="co-metric-header">
        <span className="co-metric-label">{label}</span>
        <span className="co-metric-toggle" />
      </div>

      <div className="co-metric-value">{value}</div>

      <div className="co-metric-trend-row">
        <span className={`co-metric-trend-icon co-metric-trend-icon--${trend}`}>
          {isUp ? (
            // GREEN UP ARROW
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="9"
              viewBox="0 0 17 9"
              fill="none"
            >
              <path
                d="M11.175 0.675049H15.675M15.675 0.675049V5.17505M15.675 0.675049L9.30005 7.05005L5.55005 3.30005L0.675049 8.17505"
                stroke="#6AB349"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // RED DOWN ARROW
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="17"
              height="9"
              viewBox="0 0 17 9"
              fill="none"
            >
              <path
                d="M5.17505 8.17505H0.67505M0.67505 8.17505V3.67505M0.67505 8.17505L7.05005 1.80005L10.8 5.55005L15.675 0.675049"
                stroke="#ED5142"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>

        <span className={`co-metric-change co-metric-change--${trend}`}>
          {change}
        </span>
        <span className="co-metric-subtitle">{subtitle}</span>
      </div>
    </div>
  );
};

const CustomerOverviewStats: React.FC = () => {
  return (
    <section className="co-metrics-row">
      <MetricCard label="Active Customers" value="38,985" change="+2.15" trend="up" />
      <MetricCard label="New Customers" value="38,985" change="+2.15" trend="up" />
      <MetricCard label="Churn Rate" value="38,985" change="-2.15" trend="down" />
      <MetricCard label="MRR" value="38,985" change="+2.15" trend="up" />
      <MetricCard label="APRC" value="38,985" change="+2.15" trend="up" />
    </section>
  );
};

export default CustomerOverviewStats;
