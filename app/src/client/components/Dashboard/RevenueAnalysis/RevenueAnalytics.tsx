import React, { useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import "./RevenueAnalytics.css";

type MonthlyRevenue = {
  month: string;
  value: number; // in millions
};

type TopCustomer = {
  id: number;
  name: string;
  initial: string;
  mrr: string;
  mom: string;
  totalRevenue: string;
};

const revenueData: MonthlyRevenue[] = [
  { month: "Jan", value: 9.2 },
  { month: "Feb", value: 15.4 },
  { month: "Mar", value: 18.8 },
  { month: "Apr", value: 14.1 },
  { month: "May", value: 20.25 },
  { month: "Jun", value: 18.6 },
  { month: "Jul", value: 24.3 },
];


const topCustomers: TopCustomer[] = [
  { id: 1, name: "Customer 1", initial: "C1", mrr: "$20M", mom: "$20M", totalRevenue: "$20M" },
  { id: 2, name: "Customer 2", initial: "C2", mrr: "$11M", mom: "$11M", totalRevenue: "$11M" },
  { id: 3, name: "Customer 3", initial: "C3", mrr: "$10M", mom: "$10M", totalRevenue: "$10M" },
  { id: 4, name: "Customer 4", initial: "C4", mrr: "$8M",  mom: "$8M",  totalRevenue: "$8M"  },
  { id: 5, name: "Customer 5", initial: "C5", mrr: "$7M",  mom: "$7M",  totalRevenue: "$7M"  },
  { id: 6, name: "Customer 6", initial: "C6", mrr: "$6M",  mom: "$6M",  totalRevenue: "$6M"  },
];

const RevenueAnalytics: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleCustomers = showAll ? topCustomers : topCustomers.slice(0, 4);

  return (
    <section className="revA-section">
      {/* Section heading */}
      <div className="revA-header">
        <h2>Revenue Analytics</h2>
        <button className="revA-info-btn" aria-label="Revenue analytics info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <g clip-path="url(#clip0_13844_22832)">
    <path d="M8.00016 10.6666V7.99992M8.00016 5.33325H8.00683M14.6668 7.99992C14.6668 11.6818 11.6821 14.6666 8.00016 14.6666C4.31826 14.6666 1.3335 11.6818 1.3335 7.99992C1.3335 4.31802 4.31826 1.33325 8.00016 1.33325C11.6821 1.33325 14.6668 4.31802 14.6668 7.99992Z" stroke="#0262A1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_13844_22832">
      <rect width="16" height="16" fill="white"/>
    </clipPath>
  </defs>
</svg>
        </button>
      </div>

      <div className="revA-grid">
        {/* LEFT: MRR CHART */}
        <article className="revA-card revA-card-left">
          <div className="revA-card-top">
            <div className="revA-card-title-row">
              <span className="revA-card-title">Monthly Recurring Revenue</span>
              <button
                className="revA-info-inline"
                aria-label="What is MRR?"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <g clip-path="url(#clip0_13844_22832)">
    <path d="M8.00016 10.6666V7.99992M8.00016 5.33325H8.00683M14.6668 7.99992C14.6668 11.6818 11.6821 14.6666 8.00016 14.6666C4.31826 14.6666 1.3335 11.6818 1.3335 7.99992C1.3335 4.31802 4.31826 1.33325 8.00016 1.33325C11.6821 1.33325 14.6668 4.31802 14.6668 7.99992Z" stroke="#0262A1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_13844_22832">
      <rect width="16" height="16" fill="white"/>
    </clipPath>
  </defs>
</svg>
              </button>
            </div>
            <span className="revA-kebab">⋯</span>
          </div>

          <div className="revA-chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: "#94A3B8", fontSize: 11 }}
                  domain={[0, 35]}
                  tickFormatter={(v) => `${v}M`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
                    fontSize: 12,
                  }}
                  cursor={{ stroke: "#CBD5F5", strokeWidth: 2 }}
                  formatter={(value: number) => [`$${value.toFixed(2)}M`, "MRR"]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#5271FF"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                    stroke: "#1E3A8A",
                    strokeWidth: 2,
                    fill: "#ffffff",
                  }}
                />
                {/* Highlight May point with custom bubble like the mock */}
                <ReferenceDot
                 
                  r={0}
                  isFront
                  label={{
                    position: "top",
                    content: (props: any) => {
                      const { viewBox } = props;
                      if (!viewBox) return null;
                      const { x, y } = viewBox;
                      return (
                        <g>
                          <foreignObject
                            x={x - 40}
                            y={y - 60}
                            width={120}
                            height={48}
                          >
                            <div className="revA-point-label">
                            
                              <div className="revA-point-label-value">
                              </div>
                            </div>
                          </foreignObject>
                        </g>
                      );
                    },
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            <p className="revA-footnote">
              MRR is the predictable revenue your business earns every month
              from active subscriptions.
            </p>
          </div>
        </article>

        {/* RIGHT: TOP CUSTOMERS TABLE */}
        <article className="revA-card revA-card-right">
          <div className="revA-right-header">
            <div className="revA-right-header-left">
              <div className="revA-trophy">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M8.75 13.41V15.036C8.74622 15.3786 8.65448 15.7145 8.48358 16.0115C8.31268 16.3085 8.06834 16.5566 7.774 16.732C7.14914 17.1948 6.64084 17.797 6.28948 18.4907C5.93813 19.1843 5.75341 19.9504 5.75 20.728M12.75 13.41V15.036C12.7538 15.3786 12.8455 15.7145 13.0164 16.0115C13.1873 16.3085 13.4317 16.5566 13.726 16.732C14.3509 17.1948 14.8592 17.797 15.2105 18.4907C15.5619 19.1843 15.7466 19.9504 15.75 20.728M16.75 7.75H18.25C18.913 7.75 19.5489 7.48661 20.0178 7.01777C20.4866 6.54893 20.75 5.91304 20.75 5.25C20.75 4.58696 20.4866 3.95107 20.0178 3.48223C19.5489 3.01339 18.913 2.75 18.25 2.75H16.75M16.75 7.75C16.75 9.3413 16.1179 10.8674 14.9926 11.9926C13.8674 13.1179 12.3413 13.75 10.75 13.75C9.1587 13.75 7.63258 13.1179 6.50736 11.9926C5.38214 10.8674 4.75 9.3413 4.75 7.75M16.75 7.75V1.75C16.75 1.48478 16.6446 1.23043 16.4571 1.04289C16.2696 0.855357 16.0152 0.75 15.75 0.75H5.75C5.48478 0.75 5.23043 0.855357 5.04289 1.04289C4.85536 1.23043 4.75 1.48478 4.75 1.75V7.75M2.75 20.75H18.75M4.75 7.75H3.25C2.58696 7.75 1.95107 7.48661 1.48223 7.01777C1.01339 6.54893 0.75 5.91304 0.75 5.25C0.75 4.58696 1.01339 3.95107 1.48223 3.48223C1.95107 3.01339 2.58696 2.75 3.25 2.75H4.75" stroke="#389315" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
              </div>
              <span className="revA-card-title">
                Top 10 Customers by Revenue
              </span>
            </div>

            <div className="revA-right-header-right">
              <span className="revA-updated">Updated 3 mins ago</span>
              <button
                className="revA-view-btn"
                onClick={() => setShowAll((prev) => !prev)}
              >
                {showAll ? "View Less" : "View All"}
                <span className="revA-view-arrow">↗</span>
              </button>
            </div>
          </div>

          <div className="revA-table-wrapper">
            <table className="revA-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>MRR</th>
                  <th>MoM</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {visibleCustomers.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="revA-name-cell">
                        <div className="revA-avatar">
                          {row.initial}
                        </div>
                        <span className="revA-name-text">{row.name}</span>
                      </div>
                    </td>
                    <td>{row.mrr}</td>
                    <td>{row.mom}</td>
                    <td>{row.totalRevenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showAll && <div className="revA-scroll-fade" aria-hidden="true" />}
          </div>
        </article>
      </div>
    </section>
  );
};

export default RevenueAnalytics;
