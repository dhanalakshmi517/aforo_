import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./CustomerSegmentation.css";

type CompanySlice = {
  name: string;
  value: number;
  color: string;
};

type RevenueBucket = {
  band: string;
  label: string;
  customers: number;
  color: string;
};

const companySizeData: CompanySlice[] = [
  { name: "Startups", value: 35, color: "#66CCA5" },
  { name: "SMB", value: 40, color: "#66B1CC" },
  { name: "Enterprise", value: 25, color: "#6685CC" },
];

const revenueBuckets: RevenueBucket[] = [
  { band: "Low", label: "Low (<10K$)", customers: 32446, color: "#6685CC" },
  {
    band: "Med",
    label: "Medium (10K$ - 100K$)",
    customers: 82446,
    color: "#8566CC",
  },
  { band: "High", label: "High (>100K$)", customers: 22446, color: "#66CCA5" },
];


const CustomerSegmentation: React.FC = () => {
  return (
    <section className="cs-section">
      {/* Section heading */}
      <div className="cs-header">
        <h2>Customer Segmentation</h2>
        <button className="cs-info-btn" aria-label="Customer segmentation info">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <g clip-path="url(#clip0_13772_22068)">
    <path d="M7.99992 10.6668V8.00016M7.99992 5.3335H8.00659M14.6666 8.00016C14.6666 11.6821 11.6818 14.6668 7.99992 14.6668C4.31802 14.6668 1.33325 11.6821 1.33325 8.00016C1.33325 4.31826 4.31802 1.3335 7.99992 1.3335C11.6818 1.3335 14.6666 4.31826 14.6666 8.00016Z" stroke="#0262A1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_13772_22068">
      <rect width="16" height="16" fill="white"/>
    </clipPath>
  </defs>
</svg>
        </button>
      </div>

      <div className="cs-grid">
        {/* COMPANY SIZE CARD */}
        <div className="cs-card cs-card-company">
          <div className="cs-card-top">
            <span className="cs-card-title">Company Size</span>
            <span className="cs-updated-text">Updated 7 mins ago</span>
          </div>

          <div className="cs-company-body">
            <div className="cs-company-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companySizeData}
                    dataKey="value"
                    nameKey="name"
                    startAngle={90}
                    endAngle={-270}
                    innerRadius="55%"
                    outerRadius="80%"
                    paddingAngle={2}
                            cornerRadius={6}

                  >
                    {companySizeData.map((slice) => (
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

            <div className="cs-company-legend">
              {companySizeData.map((slice) => (
                <div key={slice.name} className="cs-legend-item">
                  <span
                    className="cs-legend-dot"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="cs-legend-label">{slice.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CUSTOMERS BY REVENUE CARD */}
        <div className="cs-card cs-card-revenue">
          <div className="cs-card-top">
            <span className="cs-card-title">Customers by Revenue</span>
            <span className="cs-updated-text">Updated 7 mins ago</span>
          </div>

          <div className="cs-revenue-body">
            <div className="cs-revenue-chart">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={revenueBuckets}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    stroke="#E5E7EB"
                    horizontal={true}
                    vertical={false}
                    strokeDasharray="3 3"
                  />
                  <YAxis
                    dataKey="band"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748B", fontSize: 11 }}
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 8px 20px rgba(15, 23, 42, 0.12)",
                      fontSize: 12,
                    }}
                    formatter={(value: number, _name, entry: any) => [
                      value.toLocaleString(),
                      entry.payload.label,
                    ]}
                  />
                  <Bar
                    dataKey="customers"
                    radius={[6, 6, 6, 6]}
                    isAnimationActive={false}
                    maxBarSize={40}
                  >
                    {revenueBuckets.map((row) => (
                      <Cell key={row.band} fill={row.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="cs-revenue-scale">
              <span>20K</span>
              <span>40K</span>
              <span>60K</span>
              <span>80K</span>
              <span>100K</span>
              <span>120K</span>
              <span>140K</span>
            </div>

            <div className="cs-revenue-legend-row">
              {revenueBuckets.map((bucket) => (
                <div key={bucket.band} className="cs-legend-item">
                  <span
                    className="cs-legend-dot"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span className="cs-legend-label">{bucket.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerSegmentation;
