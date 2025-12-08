import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import "./RevenueAnalyticsDash2.css";

type GrowthPoint = {
  month: string;
  value: number; // percentage 0–100
  color: string;
};

const growthData: GrowthPoint[] = [
  { month: "Apr", value: 92, color: "#66CCA5" },
  { month: "May", value: 90, color: "#6685CC" },
  { month: "Jun", value: 93, color: "#66CCA5" },
  { month: "Jul", value: 85, color: "#66B1CC" },
  { month: "Aug", value: 92, color: "#6685CC" },
  { month: "Sep", value: 88, color: "#8566CC" },
  { month: "Oct", value: 96, color: "#66CCA5" },
  { month: "Nov", value: 82, color: "#A8C5DA" },
  { month: "Dec", value: 94, color: "#A1E3CB" },
];

const RevenuAnalyticsDash2: React.FC = () => {
  return (
    <section className="rad2-section">
      <article className="rad2-card">
        <div className="rad2-card-header">
          <span className="rad2-title">Revenue Growth% (MoM)</span>
        </div>

        <div className="rad2-chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={growthData}
              margin={{ top: 10, right: 30, left: -10, bottom: 10 }}
            >
              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                domain={[0, 100]}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
                  fontSize: 12,
                }}
                formatter={(value: number) => [`${value}%`, "MoM Growth"]}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {growthData.map((point) => (
                  <Cell key={point.month} fill={point.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
};

export default RevenuAnalyticsDash2;
