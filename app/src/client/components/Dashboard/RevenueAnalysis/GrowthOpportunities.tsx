import React from "react";
import "./GrowthOpportunities.css";

type AlertLevel = "Moderate" | "High" | "Very High";

interface GrowthRow {
  id: number;
  customerName: string;
  initial: string;
  plan: string;
  averageMrr: string;
  usagePercent: number;
  alert: AlertLevel;
}

const rows: GrowthRow[] = [
  {
    id: 1,
    customerName: "Customer 1",
    initial: "C1",
    plan: "Basic",
    averageMrr: "$2,400",
    usagePercent: 25,
    alert: "Moderate",
  },
  {
    id: 2,
    customerName: "Customer 2",
    initial: "C2",
    plan: "Pro",
    averageMrr: "$4,204",
    usagePercent: 70,
    alert: "High",
  },
  {
    id: 3,
    customerName: "Customer 3",
    initial: "C3",
    plan: "Business",
    averageMrr: "$8,486",
    usagePercent: 90,
    alert: "Very High",
  },
];

const getUsageClass = (percent: number): string => {
  if (percent <= 40) return "go-usage-fill go-usage-green";
  if (percent <= 75) return "go-usage-fill go-usage-amber";
  return "go-usage-fill go-usage-red";
};

const getAlertClass = (alert: AlertLevel): string => {
  switch (alert) {
    case "Moderate":
      return "go-alert-pill go-alert-moderate";
    case "High":
      return "go-alert-pill go-alert-high";
    case "Very High":
      return "go-alert-pill go-alert-veryhigh";
    default:
      return "go-alert-pill";
  }
};

const GrowthOpportunities: React.FC = () => {
  return (
    <section className="go-section">
      {/* Section heading */}
      <div className="go-header">
        <h2>Growth Opportunities</h2>
        <button className="go-info-btn" aria-label="Growth opportunities info">
          i
        </button>
      </div>

      <article className="go-card">
        <div className="go-card-header">
          <div className="go-card-header-left">
            <div className="go-icon-box">
              {/* simple growth icon; swap for SVG if you want */}
              <span className="go-icon">📈</span>
            </div>
            <span className="go-card-title">
              Top 10 Expansion Candidates (ready to upgrade)
            </span>
          </div>

          <div className="go-card-header-right">
            <span className="go-updated">Updated 3 mins ago</span>
            <button className="go-view-all">
              View All <span className="go-view-arrow">↗</span>
            </button>
          </div>
        </div>

        <div className="go-table-wrapper">
          <table className="go-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Plan</th>
                <th>Average MRR</th>
                <th>Usage Limit</th>
                <th>Alert</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {/* Customer name */}
                  <td>
                    <div className="go-name-cell">
                      <div className="go-avatar">{row.initial}</div>
                      <span className="go-name-text">{row.customerName}</span>
                    </div>
                  </td>

                  {/* Plan */}
                  <td>{row.plan}</td>

                  {/* Average MRR */}
                  <td>{row.averageMrr}</td>

                  {/* Usage Limit */}
                  <td>
                    <div className="go-usage-cell">
                      <div className="go-usage-bar">
                        <div
                          className={getUsageClass(row.usagePercent)}
                          style={{ width: `${row.usagePercent}%` }}
                        />
                      </div>
                      <span className="go-usage-percent">
                        {row.usagePercent}%
                      </span>
                    </div>
                  </td>

                  {/* Alert */}
                  <td>
                    <span className={getAlertClass(row.alert)}>
                      {row.alert}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <button className="go-view-btn">View</button>
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

export default GrowthOpportunities;
