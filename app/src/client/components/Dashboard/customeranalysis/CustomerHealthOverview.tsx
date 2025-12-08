import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
} from "recharts";
import "./CustomerHealthOverview.css";

type DonutSlice = {
  name: string;
  value: number;
  color: string;
};

type HealthPoint = {
  month: string;
  score: number;
};

const donutData: DonutSlice[] = [
  { name: "Healthy Customers", value: 70, color: "#389315" },
  { name: "At-Risk Customers", value: 20, color: "#E2B226" },
  { name: "Churn Customers", value: 10, color: "#ED5142" },
];

const healthStats = [
  {
    title: "Healthy Customers",
    value: "2,456",
    desc: "Strong engagement & payments",
    color: "#EDF7E6",
    textColor: "#19222D",
  },
  {
    title: "Customers At-Risk",
    value: "456",
    desc: "Delayed Payments",
    color: "#FFF1C8",
    textColor: "#19222D",
  },
  {
    title: "Churning Customers",
    value: "56",
    desc: "Low activity & ignored payments",
    color: "#FFF7F5",
    textColor: "#19222D",
  },
];

const healthTrendData: HealthPoint[] = [
  { month: "Jan", score: 48 },
  { month: "Feb", score: 62 },
  { month: "Mar", score: 71 },
  { month: "Apr", score: 64 },
  { month: "May", score: 79 },
  { month: "Jun", score: 72 },
  { month: "Jul", score: 87 },
];

const CustomerHealthOverview: React.FC = () => {
  const lastPoint = healthTrendData[healthTrendData.length - 1];

  return (
    <section className="ch-section">
      {/* Section header */}
      <div className="ch-header">
        <h2>Customer Health Overview</h2>
        <button className="ch-info-btn" aria-label="Customer health info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <g clip-path="url(#clip0_13772_21182)">
    <path d="M8.00016 10.6666V7.99992M8.00016 5.33325H8.00683M14.6668 7.99992C14.6668 11.6818 11.6821 14.6666 8.00016 14.6666C4.31826 14.6666 1.3335 11.6818 1.3335 7.99992C1.3335 4.31802 4.31826 1.33325 8.00016 1.33325C11.6821 1.33325 14.6668 4.31802 14.6668 7.99992Z" stroke="#0262A1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_13772_21182">
      <rect width="16" height="16" fill="white"/>
    </clipPath>
  </defs>
</svg>
        </button>
      </div>

      <div className="ch-grid">
        {/* LEFT CARD */}
        <div className="ch-card ch-card-left">
          <div className="ch-card-top">
            <div className="ch-card-title">Customer Health Score</div>
            <div className="ch-updated-text">Updated 3 mins ago</div>
          </div>

          <div className="ch-left-body">
            <div className="ch-donut-column">
              <div className="ch-donut-chart">
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={donutData}
        dataKey="value"
        nameKey="name"          // <-- add this
        startAngle={90}
        endAngle={-270}
        innerRadius="55%"
        outerRadius="80%"
        paddingAngle={2}
        cornerRadius={6}
      >
        {donutData.map((slice) => (
          <Cell key={slice.name} fill={slice.color} />
        ))}
      </Pie>

      {/* Tooltip for DONUT */}
      <Tooltip
        contentStyle={{
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
          fontSize: 12,
          backgroundColor: "#ffffff",
          padding: "8px 12px",
        }}
      />
    </PieChart>
  </ResponsiveContainer>
</div>


              <div className="ch-legend">
                {donutData.map((slice) => (
                  <div key={slice.name} className="ch-legend-item">
                    <span
                      className="ch-legend-dot"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="ch-legend-label">{slice.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ch-stats-column">
              {healthStats.map((stat) => (
                <div
                  key={stat.title}
                  className="ch-health-stat"
                  style={{
                    backgroundColor: stat.color,
                    color: stat.textColor,
                  }}
                >
                  <div className="ch-health-stat-title">{stat.title}</div>
                  <div className="ch-health-stat-value">{stat.value}</div>
                  <div className="ch-health-stat-desc">{stat.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="ch-card ch-card-right">
          <div className="ch-right-top">
            <div className="ch-card-title-row">
              <span className="ch-card-title">Customer Health Overview</span>
              <button className="ch-info-inline" aria-label="Chart info">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <g clip-path="url(#clip0_13808_20917)">
    <path d="M8.00016 10.6666V7.99992M8.00016 5.33325H8.00683M14.6668 7.99992C14.6668 11.6818 11.6821 14.6666 8.00016 14.6666C4.31826 14.6666 1.3335 11.6818 1.3335 7.99992C1.3335 4.31802 4.31826 1.33325 8.00016 1.33325C11.6821 1.33325 14.6668 4.31802 14.6668 7.99992Z" stroke="#1D7AFC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_13808_20917">
      <rect width="16" height="16" fill="white"/>
    </clipPath>
  </defs>
</svg>
              </button>
                            <button className="ch-pill">MoM</button>

            </div>

            {/* <div className="ch-right-actions">
              <button className="ch-pill">MoM</button>
             
            </div> */}
          </div>

          <div className="ch-chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={healthTrendData}
                margin={{ top: 10, right: 30, left: -15, bottom: 0 }}
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
                  domain={[25, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
                    fontSize: 12,
                  }}
                  cursor={{ stroke: "#CBD5F5", strokeWidth: 2 }}
                  formatter={(value: number) => [`${value}%`, "Health Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
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
                {/* Highlight last point with a dot + label bubble */}
                <ReferenceDot
                  x={lastPoint.month}
                  y={lastPoint.score}
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
                          <foreignObject x={x - 40} y={y - 60} width={120} height={40}>
                            <div className="ch-point-label">
                              
                              <div className="ch-point-label-value">
                                {lastPoint.score}%
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

            <div className="ch-chart-footnote">
              MRR is the predictable revenue your business earns every month
              from active subscriptions.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerHealthOverview;
