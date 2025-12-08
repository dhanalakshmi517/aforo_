import React, { useState, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./RevenuAnalyticsDash1.css";
import VerticalScrollbar from "../../componenetsss/VerticalScrollbar";

type CustomerRow = {
  id: number;
  name: string;
  initial: string;
  momChange: string; // "+20.08%" or "-6.08%"
};

const revenueConcentrationData = [
  { name: "Top 20% Customers", value: 68, color: "#66CCA5" },
  { name: "Rest of the Customers", value: 32, color: "#6685CC" },
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
  const [showAllGrowth, setShowAllGrowth] = useState(false);
  const [showAllDecline, setShowAllDecline] = useState(false);
  const growthTableRef = useRef<HTMLDivElement>(null);
  const declineTableRef = useRef<HTMLDivElement>(null);

  const visibleGrowthCustomers = showAllGrowth ? growthCustomers : growthCustomers.slice(0, 4);
  const visibleDeclineCustomers = showAllDecline ? declineCustomers : declineCustomers.slice(0, 4);

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
              {/* <span className="rad1-updated">Updated 3 mins ago</span> */}
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

              <div className="rad1-concentration-right">
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
            </div>
          </article>
        </div>

        {/* MIDDLE: Revenue Growth Customers */}
        <article className="rad1-card rad1-list-card rad1-growth-card">
          <div className="rad1-list-header">
            <div className="rad1-list-header-left">
              <div className="rad1-badge rad1-badge-growth">
                {/* simple growth icon */}
                <span className="rad1-badge-icon"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" viewBox="0 0 18 20" fill="none">
  <path d="M10.75 7.286V4.75C10.75 3.68913 11.1714 2.67172 11.9216 1.92157C12.6717 1.17143 13.6891 0.75 14.75 0.75H16.25C16.3826 0.75 16.5098 0.802679 16.6036 0.896447C16.6973 0.990215 16.75 1.11739 16.75 1.25V2.75C16.75 3.81087 16.3286 4.82828 15.5784 5.57843C14.8283 6.32857 13.8109 6.75 12.75 6.75C11.6891 6.75 10.6717 7.17143 9.92157 7.92157C9.17143 8.67172 8.75 9.68913 8.75 10.75M8.75 10.75C8.75 12.75 9.75 13.75 9.75 15.75C9.75 16.8319 9.39911 17.8845 8.75 18.75M8.75 10.75C8.75 9.82144 8.49143 8.91122 8.00325 8.12134C7.51508 7.33146 6.8166 6.69313 5.98607 6.27786C5.15554 5.8626 4.22578 5.68681 3.30097 5.7702C2.37616 5.85359 1.49285 6.19286 0.75 6.75C0.75 7.67856 1.00857 8.58877 1.49675 9.37866C1.98492 10.1685 2.6834 10.8069 3.51393 11.2221C4.34446 11.6374 5.27422 11.8132 6.19903 11.7298C7.12384 11.6464 8.00715 11.3071 8.75 10.75ZM1.75 18.75H15.75" stroke="#389315" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
              </div>
              <span className="rad1-card-title">Revenue Growth Customers</span>
            </div>
            <div className="rad1-list-header-right">
              {/* <span className="rad1-updated">Updated 3 mins ago</span> */}
              <button className="rad1-view-btn" onClick={() => setShowAllGrowth((prev) => !prev)}>
                {showAllGrowth ? "View Less" : "View All"} <span className="rad1-view-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9" fill="none">
  <path d="M0.600098 7.6001L4.1001 4.1001L0.600098 0.600098" stroke="#2A455E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
              </button>
            </div>
          </div>

          <div className="rad1-scrollbar-container">
            <VerticalScrollbar height="100%" color="#D9DFE8" thickness={4} />
          </div>

          <div className={`rad1-table-wrapper ${showAllGrowth ? 'rad1-show-all' : ''}`} ref={growthTableRef}>
            <table className="rad1-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>MoM</th>
                </tr>
              </thead>
              <tbody>
                {visibleGrowthCustomers.map((row) => (
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
                <span className="rad1-badge-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none">
  <path d="M0.75 12.75L4.75 16.75M4.75 16.75L8.75 12.75M4.75 16.75V0.75M8.75 0.75H18.75M8.75 4.75H15.75M8.75 8.75H12.75" stroke="#ED5142" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
              </div>
              <span className="rad1-card-title">Revenue Decline Customers</span>
            </div>
            <div className="rad1-list-header-right">
              {/* <span className="rad1-updated">Updated 3 mins ago</span> */}
              <button className="rad1-view-btn" onClick={() => setShowAllDecline((prev) => !prev)}>
                {showAllDecline ? "View Less" : "View All"} <span className="rad1-view-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9" fill="none">
  <path d="M0.600098 7.6001L4.1001 4.1001L0.600098 0.600098" stroke="#2A455E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
              </button>
            </div>
          </div>

          <div className="rad1-scrollbar-container">
            <VerticalScrollbar height="100%" color="#D9DFE8" thickness={4} />
          </div>

          <div className={`rad1-table-wrapper ${showAllDecline ? 'rad1-show-all' : ''}`} ref={declineTableRef}>
            <table className="rad1-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>MoM</th>
                </tr>
              </thead>
              <tbody>
                {visibleDeclineCustomers.map((row) => (
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
