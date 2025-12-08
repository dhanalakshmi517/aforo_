import React, { useState, useRef } from "react";
import "./TopHealthyCustomers.css";
import VerticalScrollbar from "../../componenetsss/VerticalScrollbar";

type ChurnRiskLevel = "Low";

interface HealthyCustomerRow {
  id: number;
  name: string;
  logoText: string;
  healthScore: number; // 0–100
  healthColor: string;
  lastActivity: string;
  avgMRR: string;
  usageGrowth: string; // e.g. "+6.08%"
  churnRisk: ChurnRiskLevel;
}

const healthyRows: HealthyCustomerRow[] = [
  {
    id: 1,
    name: "Customer 1",
    logoText: "AF",
    healthScore: 90,
    healthColor: "#22C55E",
    lastActivity: "A week ago",
    avgMRR: "$2,400",
    usageGrowth: "+6.08%",
    churnRisk: "Low",
  },
  {
    id: 2,
    name: "Customer 2",
    logoText: "AF",
    healthScore: 70,
    healthColor: "#EAB308",
    lastActivity: "20 days ago",
    avgMRR: "$4,204",
    usageGrowth: "+6.08%",
    churnRisk: "Low",
  },
  {
    id: 3,
    name: "Customer 3",
    logoText: "AF",
    healthScore: 100,
    healthColor: "#16A34A",
    lastActivity: "12 days ago",
    avgMRR: "$8,486",
    usageGrowth: "+6.08%",
    churnRisk: "Low",
  },
  // extras so “View All” actually expands
  {
    id: 4,
    name: "Customer 4",
    logoText: "AF",
    healthScore: 88,
    healthColor: "#22C55E",
    lastActivity: "Today",
    avgMRR: "$3,120",
    usageGrowth: "+4.50%",
    churnRisk: "Low",
  },
  {
    id: 5,
    name: "Customer 5",
    logoText: "AF",
    healthScore: 93,
    healthColor: "#16A34A",
    lastActivity: "2 days ago",
    avgMRR: "$5,020",
    usageGrowth: "+7.20%",
    churnRisk: "Low",
  },
  {
    id: 6,
    name: "Customer 6",
    logoText: "AF",
    healthScore: 85,
    healthColor: "#22C55E",
    lastActivity: "Today",
    avgMRR: "$6,480",
    usageGrowth: "+3.10%",
    churnRisk: "Low",
  },
];

const TopHealthyCustomers: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  const visibleRows = showAll ? healthyRows : healthyRows.slice(0, 4);

  return (
    <section className="thc-card">
      <div className="thc-card-header">
        <div className="thc-header-left">
          <div className="thc-trophy-icon">
            {/* simple trophy icon */}
            <span className="thc-trophy-symbol"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M8.75 13.41V15.036C8.74622 15.3786 8.65448 15.7145 8.48358 16.0115C8.31268 16.3085 8.06834 16.5566 7.774 16.732C7.14914 17.1948 6.64084 17.797 6.28948 18.4907C5.93813 19.1843 5.75341 19.9504 5.75 20.728M12.75 13.41V15.036C12.7538 15.3786 12.8455 15.7145 13.0164 16.0115C13.1873 16.3085 13.4317 16.5566 13.726 16.732C14.3509 17.1948 14.8592 17.797 15.2105 18.4907C15.5619 19.1843 15.7466 19.9504 15.75 20.728M16.75 7.75H18.25C18.913 7.75 19.5489 7.48661 20.0178 7.01777C20.4866 6.54893 20.75 5.91304 20.75 5.25C20.75 4.58696 20.4866 3.95107 20.0178 3.48223C19.5489 3.01339 18.913 2.75 18.25 2.75H16.75M16.75 7.75C16.75 9.3413 16.1179 10.8674 14.9926 11.9926C13.8674 13.1179 12.3413 13.75 10.75 13.75C9.1587 13.75 7.63258 13.1179 6.50736 11.9926C5.38214 10.8674 4.75 9.3413 4.75 7.75M16.75 7.75V1.75C16.75 1.48478 16.6446 1.23043 16.4571 1.04289C16.2696 0.855357 16.0152 0.75 15.75 0.75H5.75C5.48478 0.75 5.23043 0.855357 5.04289 1.04289C4.85536 1.23043 4.75 1.48478 4.75 1.75V7.75M2.75 20.75H18.75M4.75 7.75H3.25C2.58696 7.75 1.95107 7.48661 1.48223 7.01777C1.01339 6.54893 0.75 5.91304 0.75 5.25C0.75 4.58696 1.01339 3.95107 1.48223 3.48223C1.95107 3.01339 2.58696 2.75 3.25 2.75H4.75" stroke="#389315" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
          </div>
          <div className="thc-header-text">
            <div className="thc-header-title">Top Healthy Customers</div>
          </div>
        </div>

        <div className="thc-header-right">
          {/* <span className="thc-updated-text">View all › </span> */}
          <button
            className="thc-view-btn"
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "View Less" : "View All"}
            <span className="thc-view-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9" fill="none">
  <path d="M0.600098 7.6001L4.1001 4.1001L0.600098 0.600098" stroke="#2A455E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
          </button>
        </div>
      </div>

      <div className={`thc-table-wrapper ${showAll ? 'thc-show-all' : ''}`} ref={tableWrapperRef}>
        <div className="thc-scrollbar-container">
          <VerticalScrollbar height="100%" color="#D9DFE8" thickness={4} />
        </div>
        <table className="thc-table">
          <thead>
            <tr>
              <th className="thc-col-name">Customer Name</th>
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
                  <div className="thc-customer-cell">
                    <div className="thc-avatar">{row.logoText}</div>
                    <span className="thc-customer-name">{row.name}</span>
                  </div>
                </td>

                {/* health bar */}
                <td>
                  <div className="thc-health-wrapper">
                    <div className="thc-health-bar-bg">
                      <div
                        className="thc-health-bar-fill"
                        style={{
                          width: `${row.healthScore}%`,
                          backgroundColor: row.healthColor,
                        }}
                      />
                    </div>
                    <span className="thc-health-percent">
                      {row.healthScore}%
                    </span>
                  </div>
                </td>

                <td className="thc-col-text">{row.lastActivity}</td>
                <td className="thc-col-text">{row.avgMRR}</td>

                {/* Usage growth */}
                <td>
                  <div className="thc-usage-cell">
                    <span className="thc-usage-value">{row.usageGrowth}</span>
                    <span className="thc-usage-arrow">
                      {/* green up arrow */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="9"
                        viewBox="0 0 17 9"
                        fill="none"
                      >
                        <path
                          d="M11.175 0.675049H15.675M15.675 0.675049V5.17505M15.675 0.675049L9.30005 7.05005L5.55005 3.30005L0.675049 8.17505"
                          stroke="#16A34A"
                          strokeWidth="1.35"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                </td>

                {/* churn pill */}
                <td>
                  <span className="thc-pill-low">Low</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {showAll && <div className="thc-scroll-fade" aria-hidden="true" />}
      </div>
    </section>
  );
};

export default TopHealthyCustomers;
