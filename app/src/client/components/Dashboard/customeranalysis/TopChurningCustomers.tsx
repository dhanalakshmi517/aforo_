import React, { useState } from "react";
import "./TopChurningCustomers.css";

type ChurnRiskLevel = "High" | "Very High";

interface ChurningCustomerRow {
  id: number;
  name: string;
  logoText: string;
  healthScore: number; // 0–100
  lastActivity: string;
  avgMRR: string;
  usageDecline: string; // "-6.08%"
  churnRisk: ChurnRiskLevel;
}

const churningRows: ChurningCustomerRow[] = [
  {
    id: 1,
    name: "Customer 1",
    logoText: "AF",
    healthScore: 25,
    lastActivity: "A week ago",
    avgMRR: "$2,400",
    usageDecline: "-6.08%",
    churnRisk: "Very High",
  },
  {
    id: 2,
    name: "Customer 2",
    logoText: "AF",
    healthScore: 25,
    lastActivity: "20 days ago",
    avgMRR: "$4,204",
    usageDecline: "-6.08%",
    churnRisk: "Very High",
  },
  {
    id: 3,
    name: "Customer 3",
    logoText: "AF",
    healthScore: 25,
    lastActivity: "12 days ago",
    avgMRR: "$8,486",
    usageDecline: "-6.08%",
    churnRisk: "High",
  },
  {
    id: 4,
    name: "Customer 4",
    logoText: "AF",
    healthScore: 30,
    lastActivity: "Today",
    avgMRR: "$3,230",
    usageDecline: "-5.20%",
    churnRisk: "High",
  },
  {
    id: 5,
    name: "Customer 5",
    logoText: "AF",
    healthScore: 20,
    lastActivity: "3 weeks ago",
    avgMRR: "$1,980",
    usageDecline: "-7.80%",
    churnRisk: "Very High",
  },
  {
    id: 6,
    name: "Customer 6",
    logoText: "AF",
    healthScore: 18,
    lastActivity: "1 month ago",
    avgMRR: "$5,420",
    usageDecline: "-9.15%",
    churnRisk: "Very High",
  },
];

const TopChurningCustomers: React.FC = () => {
  const [showAll, setShowAll] = useState(false);

  const visibleRows = showAll ? churningRows : churningRows.slice(0, 4);

  return (
    <section className="tcc-card">
      <div className="tcc-card-header">
        <div className="tcc-header-left">
          <div className="tcc-flag-icon">
            {/* simple flag icon */}
            <span className="tcc-flag-symbol"><svg xmlns="http://www.w3.org/2000/svg" width="15" height="22" viewBox="0 0 15 22" fill="none">
  <path d="M0.750244 20.7507V1.5507C0.750123 1.41312 0.785489 1.27782 0.852926 1.15789C0.920362 1.03797 1.01759 0.937456 1.13521 0.866077C1.25284 0.794698 1.38688 0.754862 1.5244 0.750418C1.66192 0.745973 1.79826 0.77707 1.92024 0.840705L13.3002 6.5307C13.4355 6.59621 13.5496 6.69849 13.6294 6.82583C13.7092 6.95317 13.7515 7.10042 13.7515 7.2507C13.7515 7.40099 13.7092 7.54824 13.6294 7.67557C13.5496 7.80291 13.4355 7.9052 13.3002 7.9707L0.750244 14.2507" stroke="#ED5142" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
          </div>
          <div className="tcc-header-text">
            <div className="tcc-header-title">Top 10 Churning Customers</div>
          </div>
        </div>

        <div className="tcc-header-right">
          <span className="tcc-updated-text">Updated 3 mins ago</span>
          <button
            className="tcc-view-btn"
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "View Less" : "View All"}
            <span className="tcc-view-arrow">↗</span>
          </button>
        </div>
      </div>

      <div className="tcc-table-wrapper">
        <table className="tcc-table">
          <thead>
            <tr>
              <th className="tcc-col-name">Customer Name</th>
              <th>Health Score</th>
              <th>Last Activity</th>
              <th>Average MRR</th>
              <th>Usage</th>
              <th>Churn Risk</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                {/* name + avatar */}
                <td>
                  <div className="tcc-customer-cell">
                    <div className="tcc-avatar">{row.logoText}</div>
                    <span className="tcc-customer-name">{row.name}</span>
                  </div>
                </td>

                {/* health bar */}
                <td>
                  <div className="tcc-health-wrapper">
                    <div className="tcc-health-bar-bg">
                      <div
                        className="tcc-health-bar-fill"
                        style={{
                          width: `${row.healthScore}%`,
                        }}
                      />
                    </div>
                    <span className="tcc-health-percent">
                      {row.healthScore}%
                    </span>
                  </div>
                </td>

                <td className="tcc-col-text">{row.lastActivity}</td>
                <td className="tcc-col-text">{row.avgMRR}</td>

                {/* Usage decline */}
                <td>
                  <div className="tcc-usage-cell">
                    <span className="tcc-usage-value">{row.usageDecline}</span>
                    <span className="tcc-usage-arrow">
                      {/* red down arrow (your SVG) */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="9"
                        viewBox="0 0 17 9"
                        fill="none"
                      >
                        <path
                          d="M11.1748 8.17505H15.6748M15.6748 8.17505V3.67505M15.6748 8.17505L9.2998 1.80005L5.5498 5.55005L0.674805 0.675049"
                          stroke="#ED5142"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </td>

                {/* Churn risk pill */}
                <td>
                  <span
                    className={
                      row.churnRisk === "Very High"
                        ? "tcc-pill-very-high"
                        : "tcc-pill-high"
                    }
                  >
                    {row.churnRisk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAll && <div className="tcc-scroll-fade" aria-hidden="true" />}
      </div>
    </section>
  );
};

export default TopChurningCustomers;
