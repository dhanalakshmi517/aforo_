import React from "react";
import "./RevenueAnalyticsDash4.css";

type OverStatus = "ok" | "warning" | "critical";

interface UpsellRow {
  id: number;
  customerName: string;
  initial: string;
  plan: string;
  averageMrr: string;
  limitUsage: string; // "1000 / 1200"
  overLimitPercent: number;
  status: OverStatus;
}

const rows: UpsellRow[] = [
  {
    id: 1,
    customerName: "Customer 1",
    initial: "C1",
    plan: "Basic",
    averageMrr: "$2,400",
    limitUsage: "1000 / 1200",
    overLimitPercent: 75,
    status: "warning",
  },
  {
    id: 2,
    customerName: "Customer 2",
    initial: "C2",
    plan: "Pro",
    averageMrr: "$4,204",
    limitUsage: "1000 / 1500",
    overLimitPercent: 95,
    status: "critical",
  },
  {
    id: 3,
    customerName: "Customer 3",
    initial: "C3",
    plan: "Business",
    averageMrr: "$8,486",
    limitUsage: "10,000 / 20,000",
    overLimitPercent: 75,
    status: "ok",
  },
];

const statusDotClass = (status: OverStatus) => {
  switch (status) {
    case "ok":
      return "ra4-dot ra4-dot-green";
    case "warning":
      return "ra4-dot ra4-dot-amber";
    case "critical":
      return "ra4-dot ra4-dot-red";
    default:
      return "ra4-dot";
  }
};

const RevenueAnalyticsDash4: React.FC = () => {
  return (
    <section className="ra4-section">
      <article className="ra4-card">
        {/* Header row */}
        <div className="ra4-card-header">
          <div className="ra4-header-left">
            <div className="ra4-icon-box">
              <span className="ra4-icon">🧪</span>
            </div>
            <span className="ra4-title">
              Top 10 Upsell Opportunities (hitting limits)
            </span>
          </div>
          <div className="ra4-header-right">
            <span className="ra4-updated">Updated 3 mins ago</span>
            <button className="ra4-view-all">
              View All <span className="ra4-view-arrow">↗</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="ra4-table-wrapper">
          <table className="ra4-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Plan</th>
                <th>Average MRR</th>
                <th>Limit / Usage</th>
                <th>Over Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="ra4-name-cell">
                      <div className="ra4-avatar">{row.initial}</div>
                      <span className="ra4-name-text">{row.customerName}</span>
                    </div>
                  </td>
                  <td>{row.plan}</td>
                  <td>{row.averageMrr}</td>
                  <td>{row.limitUsage}</td>
                  <td>
                    <div className="ra4-over-limit">
                      <span className={statusDotClass(row.status)} />
                      <span className="ra4-over-text">
                        {row.overLimitPercent}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <button className="ra4-view-btn">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default RevenueAnalyticsDash4;
