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

const highlightPoint = revenueData[4]; // May

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
          i
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
                i
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
                  x={highlightPoint.month}
                  y={highlightPoint.value}
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
                              <div className="revA-point-label-date">
                                May 10, 2025
                              </div>
                              <div className="revA-point-label-value">
                                ${highlightPoint.value.toFixed(2)}M
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
                🏆
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
