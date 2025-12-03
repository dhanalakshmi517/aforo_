import React, { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import "./NewVsExistingAndIndustries.css";

const bubbleData = [
  { name: "Existing Customers", value: 52737, color: "#34D399" },
  { name: "New Customers", value: 2737, color: "#6EE7B7" },
];

const industries = [
  {
    id: 1,
    name: "Technology",
    revenue: "$25,000",
    mrr: "$5,000",
    customers: "32,456",
    icons: ["🦉", "🦁", "🐼"],
  },
  {
    id: 2,
    name: "Finance",
    revenue: "$15,482",
    mrr: "$5,482",
    customers: "20,458",
    icons: ["🦉", "🦁", "🐼"],
  },
  {
    id: 3,
    name: "Healthcare",
    revenue: "$2,400",
    mrr: "$1,400",
    customers: "8,789",
    icons: ["🦉", "🦁", "🐼"],
  },
  {
    id: 4,
    name: "Education",
    revenue: "$5,855",
    mrr: "$2,855",
    customers: "11,757",
    icons: ["🦉", "🦁", "🐼"],
  },
    {
    id: 5,
    name: "Education",
    revenue: "$5,855",
    mrr: "$2,855",
    customers: "11,757",
    icons: ["🦉", "🦁", "🐼"],
  },
    {
    id: 6,
    name: "Education",
    revenue: "$5,855",
    mrr: "$2,855",
    customers: "11,757",
    icons: ["🦉", "🦁", "🐼"],
  },
    {
    id: 7,
    name: "Education",
    revenue: "$5,855",
    mrr: "$2,855",
    customers: "11,757",
    icons: ["🦉", "🦁", "🐼"],
  },
    {
    id: 8,
    name: "Education",
    revenue: "$5,855",
    mrr: "$2,855",
    customers: "11,757",
    icons: ["🦉", "🦁", "🐼"],
  },
];

const NewVsExistingAndIndustries: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? industries : industries.slice(0, 4);

  return (
    <section className="nve-section">

      {/* GRID */}
      <div className="nve-grid">

        {/* LEFT CARD */}
        <div className="nve-card nve-left">
          <div className="nve-card-header">
            <span className="nve-title">New vs Existing Customers</span>
            <span className="nve-updated">Updated 3 mins ago</span>
          </div>

          <div className="nve-left-body">
            {/* Bubble Donut */}
            <div className="nve-bubble-chart">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bubbleData}
                    dataKey="value"
                    nameKey="name"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius="40%"
                    outerRadius="80%"
                    paddingAngle={3}
                  >
                    {bubbleData.map((s) => (
                      <Cell key={s.name} fill={s.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number, _n, entry: any) => [
                      v.toLocaleString(),
                      entry.payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="nve-left-legend">
              {bubbleData.map((item) => (
                <div className="nve-legend-row" key={item.name}>
                  <span
                    className="nve-dot"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="nve-legend-text">{item.name}</span>
                </div>
              ))}

              <div className="nve-info-text">
                <span className="nve-blue-text">8% New Customers</span>{" "}
                added in last 30 days
              </div>
            </div>

            {/* Stats bottom */}
            <div className="nve-bottom-grid">
              <div className="nve-bottom-box">
                <span className="nve-bottom-label">Total Existing Customers</span>
                <span className="nve-bottom-value">52,737</span>
              </div>

              <div className="nve-bottom-box">
                <span className="nve-bottom-label">New Customers (Last 30 days)</span>
                <span className="nve-bottom-value">2,737</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="nve-card nve-right">
          <div className="nve-card-header-row">
            <div className="nve-right-header-left">
              <div className="nve-trophy"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M10 14.66V16.286C9.99622 16.6286 9.90448 16.9645 9.73358 17.2615C9.56268 17.5585 9.31834 17.8066 9.024 17.982C8.39914 18.4448 7.89084 19.047 7.53948 19.7407C7.18813 20.4343 7.00341 21.2004 7 21.978M14 14.66V16.286C14.0038 16.6286 14.0955 16.9645 14.2664 17.2615C14.4373 17.5585 14.6817 17.8066 14.976 17.982C15.6009 18.4448 16.1092 19.047 16.4605 19.7407C16.8119 20.4343 16.9966 21.2004 17 21.978M18 9H19.5C20.163 9 20.7989 8.73661 21.2678 8.26777C21.7366 7.79893 22 7.16304 22 6.5C22 5.83696 21.7366 5.20107 21.2678 4.73223C20.7989 4.26339 20.163 4 19.5 4H18M18 9C18 10.5913 17.3679 12.1174 16.2426 13.2426C15.1174 14.3679 13.5913 15 12 15C10.4087 15 8.88258 14.3679 7.75736 13.2426C6.63214 12.1174 6 10.5913 6 9M18 9V3C18 2.73478 17.8946 2.48043 17.7071 2.29289C17.5196 2.10536 17.2652 2 17 2H7C6.73478 2 6.48043 2.10536 6.29289 2.29289C6.10536 2.48043 6 2.73478 6 3V9M4 22H20M6 9H4.5C3.83696 9 3.20107 8.73661 2.73223 8.26777C2.26339 7.79893 2 7.16304 2 6.5C2 5.83696 2.26339 5.20107 2.73223 4.73223C3.20107 4.26339 3.83696 4 4.5 4H6" stroke="#389315" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></div>
              <span className="nve-title">Top 5 Industries</span>
            </div>

            <div className="nve-right-header-right">
              <span className="nve-updated">Updated 3 mins ago</span>
              <button
                className="nve-view-btn"
                onClick={() => setShowAll((p) => !p)}
              >
                {showAll ? "View Less" : "View All"} ↗
              </button>
            </div>
          </div>

          <div className="nve-table-wrapper">
            <table className="nve-table">
              <thead>
                <tr>
                  <th>Industry Name</th>
                  <th>Total Revenue</th>
                  <th>MRR</th>
                  <th>No.Of Customers</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((row) => (
                  <tr key={row.id}>
                    <td className="nve-bold">{row.name}</td>
                    <td>{row.revenue}</td>
                    <td>{row.mrr}</td>

                    <td>
                      <div className="nve-customers-cell">
                        <div className="nve-avatar-stack">
                          {row.icons.map((ic, i) => (
                            <span key={i} className="nve-avatar">
                              {ic}
                            </span>
                          ))}
                        </div>
                        <span className="nve-customer-count">{row.customers}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showAll && <div className="nve-scroll-fade"></div>}
          </div>
        </div>

      </div>

    </section>
  );
};

export default NewVsExistingAndIndustries;
