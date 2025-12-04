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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <g clip-path="url(#clip0_13844_23246)">
    <path d="M8.00016 10.6668V8.00016M8.00016 5.3335H8.00683M14.6668 8.00016C14.6668 11.6821 11.6821 14.6668 8.00016 14.6668C4.31826 14.6668 1.3335 11.6821 1.3335 8.00016C1.3335 4.31826 4.31826 1.3335 8.00016 1.3335C11.6821 1.3335 14.6668 4.31826 14.6668 8.00016Z" stroke="#0262A1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_13844_23246">
      <rect width="16" height="16" fill="white"/>
    </clipPath>
  </defs>
</svg>
        </button>
      </div>

      <article className="go-card">
        <div className="go-card-header">
          <div className="go-card-header-left">
            <div className="go-icon-box">
              {/* simple growth icon; swap for SVG if you want */}
              <span className="go-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22 20" fill="none">
  <path d="M10.75 13.75V18.75M14.75 11.75V18.75M18.75 7.75V18.75M20.75 0.75L12.104 9.396C12.0576 9.44256 12.0024 9.47951 11.9416 9.50471C11.8809 9.52992 11.8158 9.54289 11.75 9.54289C11.6842 9.54289 11.6191 9.52992 11.5584 9.50471C11.4976 9.47951 11.4424 9.44256 11.396 9.396L8.104 6.104C8.01024 6.01026 7.88308 5.95761 7.7505 5.95761C7.61792 5.95761 7.49076 6.01026 7.397 6.104L0.75 12.75M2.75 15.75V18.75M6.75 11.75V18.75" stroke="#66B1CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
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
