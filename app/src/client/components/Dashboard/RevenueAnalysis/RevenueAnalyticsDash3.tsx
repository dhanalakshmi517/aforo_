import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./RevenueAnalyticsDash3.css";

type PlanSlice = {
  name: string;
  value: number;
  color: string;
};

type IndustryRow = {
  id: number;
  name: string;
  revenue: string;
  mrr: string;
  customers: string;
  icons: string[];
};

const revenueByPlanData: PlanSlice[] = [
  { name: "Basic Plan", value: 25, color: "#22C55E" },
  { name: "Pro Plan", value: 30, color: "#0EA5E9" },
  { name: "Business Plan", value: 20, color: "#6366F1" },
  { name: "Enterprise Plan", value: 25, color: "#A855F7" },
];

const industries: IndustryRow[] = [
  {
    id: 1,
    name: "Technology",
    revenue: "$25,000",
    mrr: "$5,000",
    customers: "32,456",
    icons: ["🦊", "🦁", "🐼"],
  },
  {
    id: 2,
    name: "Finance",
    revenue: "$15,482",
    mrr: "$5,482",
    customers: "20,458",
    icons: ["🦊", "🦁", "🐼"],
  },
  {
    id: 3,
    name: "Healthcare",
    revenue: "$2,400",
    mrr: "$1,400",
    customers: "8,789",
    icons: ["🦊", "🦁", "🐼"],
  },
  {
    id: 4,
    name: "Education",
    revenue: "$5,855",
    mrr: "$2,855",
    customers: "11,757",
    icons: ["🦊", "🦁", "🐼"],
  },
  {
    id: 5,
    name: "Cinema",
    revenue: "$5,855",
    mrr: "$2,855",
    customers: "11,757",
    icons: ["🦊", "🦁", "🐼"],
  },
];

const RevenuAnalyticsDash3: React.FC = () => {
  return (
    <section className="rad3-section">
      <div className="rad3-grid">
        {/* LEFT COLUMN */}
        <div className="rad3-left-col">
          {/* Revenue by Plan card */}
          <article className="rad3-card rad3-plan-card">
            <div className="rad3-card-header">
              <span className="rad3-card-title">Revenue by Plan</span>
              <span className="rad3-updated">Updated 3 mins ago</span>
            </div>

            <div className="rad3-plan-body">
              <div className="rad3-plan-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueByPlanData}
                      dataKey="value"
                      nameKey="name"
                      startAngle={90}
                      endAngle={-270}
                      innerRadius="45%"
                      outerRadius="80%"
                      paddingAngle={3}
                    >
                      {revenueByPlanData.map((slice) => (
                        <Cell key={slice.name} fill={slice.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _name, entry: any) => [
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

              <div className="rad3-plan-legend">
                {revenueByPlanData.map((slice) => (
                  <div className="rad3-legend-item" key={slice.name}>
                    <span
                      className="rad3-legend-dot"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="rad3-legend-label">{slice.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* New customers tiles */}
          <div className="rad3-bottom-tiles">
            <div className="rad3-mini-card">
              <div className="rad3-mini-label">New Customers</div>
              <div className="rad3-mini-value">52,737</div>
              <div className="rad3-mini-sub">from last 90 days</div>
            </div>
            <div className="rad3-mini-card">
              <div className="rad3-mini-label">New Customers</div>
              <div className="rad3-mini-value">2,737</div>
              <div className="rad3-mini-sub">from last 90 days</div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Top 5 Industries by Revenue */}
        <article className="rad3-card rad3-industries-card">
          <div className="rad3-industries-header">
            <div className="rad3-industries-left">
              <div className="rad3-trophy">🏆</div>
              <span className="rad3-card-title">Top 5 Industries by Revenue</span>
            </div>
            <div className="rad3-industries-right">
              <span className="rad3-updated">Updated 3 mins ago</span>
              <button className="rad3-view-btn">
                View All <span className="rad3-view-arrow">↗</span>
              </button>
            </div>
          </div>

          <div className="rad3-table-wrapper">
            <table className="rad3-table">
              <thead>
                <tr>
                  <th>Industry Name</th>
                  <th>Total Revenue</th>
                  <th>MRR</th>
                  <th>No.Of Customers</th>
                </tr>
              </thead>
              <tbody>
                {industries.map((row) => (
                  <tr key={row.id}>
                    <td className="rad3-bold">{row.name}</td>
                    <td>{row.revenue}</td>
                    <td>{row.mrr}</td>
                    <td>
                      <div className="rad3-customer-cell">
                        <div className="rad3-avatar-stack">
                          {row.icons.map((ic, idx) => (
                            <span className="rad3-avatar" key={idx}>
                              {ic}
                            </span>
                          ))}
                        </div>
                        <span className="rad3-customer-count">
                          {row.customers}
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

export default RevenuAnalyticsDash3;
