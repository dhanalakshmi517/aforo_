import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import VerticalScrollbar from "../../componenetsss/VerticalScrollbar";
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
  { name: "Basic Plan", value: 25, color: "#66B1CC" },
  { name: "Pro Plan", value: 30, color: "#6685CC" },
  { name: "Business Plan", value: 20, color: "#66CCA5" },
  { name: "Enterprise Plan", value: 25, color: "#C066CC" },
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
              {/* <span className="rad3-updated">Updated 3 mins ago</span> */}
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
        cornerRadius={6}
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
              <div className="rad3-trophy"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M8.75 13.41V15.036C8.74622 15.3786 8.65448 15.7145 8.48358 16.0115C8.31268 16.3085 8.06834 16.5566 7.774 16.732C7.14914 17.1948 6.64084 17.797 6.28948 18.4907C5.93813 19.1843 5.75341 19.9504 5.75 20.728M12.75 13.41V15.036C12.7538 15.3786 12.8455 15.7145 13.0164 16.0115C13.1873 16.3085 13.4317 16.5566 13.726 16.732C14.3509 17.1948 14.8592 17.797 15.2105 18.4907C15.5619 19.1843 15.7466 19.9504 15.75 20.728M16.75 7.75H18.25C18.913 7.75 19.5489 7.48661 20.0178 7.01777C20.4866 6.54893 20.75 5.91304 20.75 5.25C20.75 4.58696 20.4866 3.95107 20.0178 3.48223C19.5489 3.01339 18.913 2.75 18.25 2.75H16.75M16.75 7.75C16.75 9.3413 16.1179 10.8674 14.9926 11.9926C13.8674 13.1179 12.3413 13.75 10.75 13.75C9.1587 13.75 7.63258 13.1179 6.50736 11.9926C5.38214 10.8674 4.75 9.3413 4.75 7.75M16.75 7.75V1.75C16.75 1.48478 16.6446 1.23043 16.4571 1.04289C16.2696 0.855357 16.0152 0.75 15.75 0.75H5.75C5.48478 0.75 5.23043 0.855357 5.04289 1.04289C4.85536 1.23043 4.75 1.48478 4.75 1.75V7.75M2.75 20.75H18.75M4.75 7.75H3.25C2.58696 7.75 1.95107 7.48661 1.48223 7.01777C1.01339 6.54893 0.75 5.91304 0.75 5.25C0.75 4.58696 1.01339 3.95107 1.48223 3.48223C1.95107 3.01339 2.58696 2.75 3.25 2.75H4.75" stroke="#389315" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></div>
              <span className="rad3-card-title">Top Industries by Revenue</span>
            </div>
            <div className="rad3-industries-right">
              {/* <span className="rad3-updated">Updated 3 mins ago</span> */}
              <button className="rad3-view-btn">
                View All <span className="rad3-view-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9" fill="none">
  <path d="M0.600098 7.6001L4.1001 4.1001L0.600098 0.600098" stroke="#2A455E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
              </button>
            </div>
          </div>

          <div className="rad3-table-container">
            <div className="rad3-scroll-area">
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
            <VerticalScrollbar className="rad3-vertical-scrollbar" height="100%" />
          </div>
        </article>
      </div>
    </section>
  );
};

export default RevenuAnalyticsDash3;
