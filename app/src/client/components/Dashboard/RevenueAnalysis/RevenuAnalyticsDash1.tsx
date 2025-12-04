import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./RevenuAnalyticsDash1.css";

type CustomerRow = {
  id: number;
  name: string;
  initial: string;
  momChange: string; // "+20.08%" or "-6.08%"
};

const revenueConcentrationData = [
  { name: "Top 20% Customers", value: 68, color: "#4F46E5" },
  { name: "Rest of the Customers", value: 32, color: "#C7D2FE" },
];

const growthCustomers: CustomerRow[] = [
  { id: 1, name: "Customer 1", initial: "C1", momChange: "+20.08%" },
  { id: 2, name: "Customer 2", initial: "C2", momChange: "+13.08%" },
  { id: 3, name: "Customer 3", initial: "C3", momChange: "+11.08%" },
  { id: 4, name: "Customer 4", initial: "C4", momChange: "+6.08%" },
  { id: 5, name: "Customer 5", initial: "C5", momChange: "+5.08%" },
];

const declineCustomers: CustomerRow[] = [
  { id: 1, name: "Customer 1", initial: "C1", momChange: "-6.08%" },
  { id: 2, name: "Customer 2", initial: "C2", momChange: "-6.08%" },
  { id: 3, name: "Customer 3", initial: "C3", momChange: "-6.08%" },
  { id: 4, name: "Customer 4", initial: "C4", momChange: "-6.08%" },
  { id: 5, name: "Customer 5", initial: "C5", momChange: "-6.08%" },
];

const RevenuAnalyticsDash1: React.FC = () => {
  return (
    <section className="rad1-section">
      <div className="rad1-grid">
        {/* LEFT COLUMN: two mini metrics + donut card */}
        <div className="rad1-left-col">
          <div className="rad1-mini-metrics">
            <div className="rad1-mini-card">
              <div className="rad1-mini-label">Revenue Growth % (MoM)</div>
              <div className="rad1-mini-value">12.1%</div>
            </div>
            <div className="rad1-mini-card">
              <div className="rad1-mini-label">will have to keep some metric here</div>
              <div className="rad1-mini-value">12.1%</div>
            </div>
          </div>

          <article className="rad1-card rad1-concentration-card">
            <div className="rad1-card-header">
              <span className="rad1-card-title">Revenue Concentration</span>
              <span className="rad1-updated">Updated 3 mins ago</span>
            </div>

            <div className="rad1-concentration-body">
              <div className="rad1-donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueConcentrationData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="45%"
                      outerRadius="80%"
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={3}
                    >
                      {revenueConcentrationData.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _n, entry: any) => [
                        `${value}%`,
                        entry.payload.name,
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="rad1-concentration-legend">
                {revenueConcentrationData.map((slice) => (
                  <div key={slice.name} className="rad1-legend-item">
                    <span
                      className="rad1-legend-dot"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="rad1-legend-label">{slice.name}</span>
                  </div>
                ))}
              </div>

              <p className="rad1-concentration-note">
                <span className="rad1-concentration-strong">
                  Top 20% customers
                </span>{" "}
                are generating 68% of total revenue
              </p>
            </div>
          </article>
        </div>

        {/* MIDDLE: Revenue Growth Customers */}
        <article className="rad1-card rad1-list-card rad1-growth-card">
          <div className="rad1-list-header">
            <div className="rad1-list-header-left">
              <div className="rad1-badge rad1-badge-growth">
                {/* simple growth icon */}
                <span className="rad1-badge-icon">📈</span>
              </div>
              <span className="rad1-card-title">Revenue Growth Customers</span>
            </div>
            <div className="rad1-list-header-right">
              <span className="rad1-updated">Updated 3 mins ago</span>
              <button className="rad1-view-btn">
                View All <span className="rad1-view-arrow">↗</span>
              </button>
            </div>
          </div>

          <div className="rad1-table-wrapper">
            <table className="rad1-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>MoM</th>
                </tr>
              </thead>
              <tbody>
                {growthCustomers.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="rad1-name-cell">
                        <div className="rad1-avatar">{row.initial}</div>
                        <span className="rad1-name-text">{row.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="rad1-mom-cell rad1-mom-up">
                        <span className="rad1-mom-value">{row.momChange}</span>
                        <span className="rad1-mom-arrow">
                          {/* green up-line icon (SVG from you) */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                          >
                            <path
                              d="M12 5.25H16.5M16.5 5.25V9.75M16.5 5.25L10.125 11.625L6.375 7.875L1.5 12.75"
                              stroke="#16A34A"
                              strokeWidth="1.35"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        {/* RIGHT: Revenue Decline Customers */}
        <article className="rad1-card rad1-list-card rad1-decline-card">
          <div className="rad1-list-header">
            <div className="rad1-list-header-left">
              <div className="rad1-badge rad1-badge-decline">
                <span className="rad1-badge-icon">📉</span>
              </div>
              <span className="rad1-card-title">Revenue Decline Customers</span>
            </div>
            <div className="rad1-list-header-right">
              <span className="rad1-updated">Updated 3 mins ago</span>
              <button className="rad1-view-btn">
                View All <span className="rad1-view-arrow">↗</span>
              </button>
            </div>
          </div>

          <div className="rad1-table-wrapper">
            <table className="rad1-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>MoM</th>
                </tr>
              </thead>
              <tbody>
                {declineCustomers.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="rad1-name-cell">
                        <div className="rad1-avatar">{row.initial}</div>
                        <span className="rad1-name-text">{row.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="rad1-mom-cell rad1-mom-down">
                        <span className="rad1-mom-value">
                          {row.momChange}
                        </span>
                        <span className="rad1-mom-arrow">
                          {/* red down arrow SVG from you */}
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
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  );
};

export default RevenuAnalyticsDash1;
