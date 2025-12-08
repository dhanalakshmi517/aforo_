import React, { useState } from "react";
import "./TopAtRiskCustomers.css";

type ChurnRiskLevel = "At Risk" | "High" | "Very High";

interface CustomerRow {
  id: number;
  name: string;
  logoText: string;
  healthScore: number; // 0-100
  healthColor: string;
  lastActivity: string;
  avgMRR: string;
  usageDecline: string; // e.g. "-6.08%"
  churnRisk: ChurnRiskLevel;
}

const rows: CustomerRow[] = [
  {
    id: 1,
    name: "Customer 1",
    logoText: "AF",
    healthScore: 50,
    healthColor: "#D1A300",
    lastActivity: "A week ago",
    avgMRR: "$2,400",
    usageDecline: "-6.08%",
    churnRisk: "At Risk",
  },
  {
    id: 2,
    name: "Customer 2",
    logoText: "AF",
    healthScore: 25,
    healthColor: "#EF4444",
    lastActivity: "20 days ago",
    avgMRR: "$4,204",
    usageDecline: "-6.08%",
    churnRisk: "High",
  },
  {
    id: 3,
    name: "Customer 3",
    logoText: "AF",
    healthScore: 25,
    healthColor: "#EF4444",
    lastActivity: "12 days ago",
    avgMRR: "$8,486",
    usageDecline: "-6.08%",
    churnRisk: "Very High",
  },
  {
    id: 4,
    name: "Customer 4",
    logoText: "AF",
    healthScore: 70,
    healthColor: "#22C55E",
    lastActivity: "Today",
    avgMRR: "$1,980",
    usageDecline: "-3.20%",
    churnRisk: "At Risk",
  },
  {
    id: 5,
    name: "Customer 5",
    logoText: "AF",
    healthScore: 40,
    healthColor: "#F97316",
    lastActivity: "2 weeks ago",
    avgMRR: "$3,140",
    usageDecline: "-4.52%",
    churnRisk: "High",
  },
  {
    id: 6,
    name: "Customer 6",
    logoText: "AF",
    healthScore: 30,
    healthColor: "#EF4444",
    lastActivity: "1 month ago",
    avgMRR: "$5,010",
    usageDecline: "-7.90%",
    churnRisk: "Very High",
  },
];

const TopAtRiskCustomers: React.FC = () => {
  const [showAll, setShowAll] = useState(false);

  const visibleRows = showAll ? rows : rows.slice(0, 4);

  const handleToggle = () => setShowAll((prev) => !prev);

  return (
    <section className="tar-card">
      <div className="tar-card-header">
        <div className="tar-header-left">
          <div className="tar-warning-icon">
            {/* simple warning icon */}
            <span className="tar-warning-symbol"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22 20" fill="none">
  <path d="M10.768 6.7639V10.7639M10.768 14.7639H10.778M20.498 15.7639L12.498 1.7639C12.3236 1.4561 12.0706 1.20008 11.7649 1.02197C11.4592 0.843846 11.1118 0.75 10.758 0.75C10.4042 0.75 10.0568 0.843846 9.75107 1.02197C9.44539 1.20008 9.19243 1.4561 9.018 1.7639L1.018 15.7639C0.841678 16.0693 0.749224 16.4158 0.750005 16.7684C0.750786 17.121 0.844774 17.4671 1.02244 17.7717C1.20011 18.0763 1.45514 18.3285 1.76169 18.5027C2.06824 18.677 2.4154 18.7671 2.768 18.7639H18.768C19.1189 18.7635 19.4635 18.6709 19.7673 18.4952C20.071 18.3195 20.3232 18.067 20.4985 17.763C20.6738 17.459 20.766 17.1143 20.7659 16.7634C20.7659 16.4125 20.6734 16.0678 20.498 15.7639Z" stroke="#C29017" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
          </div>
          <div className="tar-header-text">
            <div className="tar-header-title">Top 10 Customers At-Risk</div>
          </div>
        </div>

        <div className="tar-header-right">
          <span className="tar-updated-text">Updated 3 mins ago</span>
          <button className="tar-view-btn" onClick={handleToggle}>
            {showAll ? "View Less" : "View All"}
            <span className="tar-view-arrow">›</span>
          </button>
        </div>
      </div>

      <div className="tar-table-wrapper">
        <table className="tar-table">
          <thead>
            <tr>
              <th className="tar-col-name">Customer Name</th>
              <th>Health Score</th>
              <th>Last Activity</th>
              <th>Average MRR</th>
              <th>Usage Decline</th>
              <th>Churn Risk</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row.id}>
                {/* Customer name / avatar */}
                <td>
                  <div className="tar-customer-cell">
                    <div className="tar-avatar">{row.logoText}</div>
                    <span className="tar-customer-name">{row.name}</span>
                  </div>
                </td>

                {/* Health score with bar */}
                <td>
                  <div className="tar-health-wrapper">
                    <div className="tar-health-bar-bg">
                      <div
                        className="tar-health-bar-fill"
                        style={{
                          width: `${row.healthScore}%`,
                          backgroundColor: row.healthColor,
                        }}
                      />
                    </div>
                    <span className="tar-health-percent">
                      {row.healthScore}%
                    </span>
                  </div>
                </td>

                {/* Last activity */}
                <td className="tar-col-text">{row.lastActivity}</td>

                {/* Average MRR */}
                <td className="tar-col-text">{row.avgMRR}</td>

                {/* Usage decline */}
                <td>
                  <div className="tar-usage-cell">
                    <span className="tar-usage-value">{row.usageDecline}</span>
                    <span className="tar-usage-arrow">
                      {/* red down arrow */}
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
                  <span className={`tar-pill tar-pill-${row.churnRisk}`}>
                    {row.churnRisk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* nice internal scroll when expanded */}
        {showAll && (
          <div className="tar-scroll-fade" aria-hidden="true"></div>
        )}
      </div>
    </section>
  );
};

export default TopAtRiskCustomers;
