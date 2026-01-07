// RealTimePaymentWidgets.tsx
import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import "./RealTimePaymentsWidgets.css";
import StatusBadge from "../../componenetsss/StatusBadge";

type TrackerStatus = "good" | "warn" | "bad";

type TrackerPoint = {
  id: string;
  status: TrackerStatus;
  label?: string;
};

type PaymentMethod = {
  name: string;
  value: number;
  color: string;
};

type Props = {
  updatedText?: string;

  // Usage ingestion tracker
  ingestionTitle?: string;
  ingestionBadgeText?: string; // "Good"
  ingestionBadgeTone?: TrackerStatus; // good/warn/bad
  tracker?: TrackerPoint[];

  // Success vs Fail
  ratioTitle?: string;
  successPct?: number; // 0..100
  failPct?: number; // 0..100

  // Donut
  donutTitle?: string;
  methods?: PaymentMethod[];
};

const DEFAULT_TRACKER: TrackerPoint[] = Array.from({ length: 44 }).map((_, i) => {
  // mostly green, a few warnings, one red like your screenshot vibe
  let status: TrackerStatus = "good";
  if (i === 8 || i === 22) status = "warn";
  if (i === 12) status = "bad";
  return { id: `t-${i}`, status, label: `Slot ${i + 1}` };
});

const DEFAULT_METHODS: PaymentMethod[] = [
  { name: "Razorpay", value: 32, color: "#66CCA5" },
  { name: "Stripe", value: 24, color: "#66B1CC" },
  { name: "Gateway 1", value: 28, color: "#6685CC" },
  { name: "Gateway 2", value: 16, color: "#C066CC" },
];

const STATUS_COLORS: Record<TrackerStatus, string> = {
  good: "#6AB349",
  warn: "#E2B226",
  bad: "#ED5142",
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function TrackerTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as { status: TrackerStatus; label?: string; idx: number };
  const label = p?.label ?? `Slot ${p.idx + 1}`;
  const statusText = p?.status === "good" ? "Good" : p?.status === "warn" ? "Warning" : "Failed";

  return (
    <div className="rtpw-tooltip">
      <div className="rtpw-tooltip-title">{label}</div>
      <div className="rtpw-tooltip-line">
        <span className="rtpw-tooltip-k">Status</span>
        <span className="rtpw-tooltip-v">{statusText}</span>
      </div>
    </div>
  );
}

function DonutLegend({ payload }: any) {
  // Split into two rows
  const midPoint = Math.ceil(payload?.length / 2);
  const firstRow = payload?.slice(0, midPoint);
  const secondRow = payload?.slice(midPoint);

  return (
    <div className="rtpw-legend">
      <div className="rtpw-legend-row">
        {firstRow?.map((entry: any) => (
          <div className="rtpw-legend-item" key={entry.value}>
            <span className="rtpw-legend-dot" style={{ background: entry.color }} />
            <span className="rtpw-legend-text">{entry.value}</span>
          </div>
        ))}
      </div>
      <div className="rtpw-legend-row">
        {secondRow?.map((entry: any) => (
          <div className="rtpw-legend-item" key={entry.value}>
            <span className="rtpw-legend-dot" style={{ background: entry.color }} />
            <span className="rtpw-legend-text">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const RealTimePaymentWidgets: React.FC<Props> = ({
  updatedText = "Updated 3 mins ago",

  ingestionTitle = "Usage Ingestion",
  ingestionBadgeText = "Good",
  ingestionBadgeTone = "good",
  tracker = DEFAULT_TRACKER,

  ratioTitle = "Payments Success Vs Fail Ratio",
  successPct = 95,
  failPct = 5,

  donutTitle = "Payments by Method",
  methods = DEFAULT_METHODS,
}) => {
  const safeSuccess = clamp(successPct, 0, 100);
  const safeFail = clamp(failPct, 0, 100 - safeSuccess);
  const ratioData = [{ name: "ratio", success: safeSuccess, fail: safeFail }];

  const trackerData = tracker.map((t, idx) => ({
    idx,
    id: t.id,
    v: 1,
    status: t.status,
    label: t.label,
  }));

  return (
    <section className="rtpw-section">
      <div className="rtpw-grid">
        {/* LEFT COLUMN */}
        <div className="rtpw-left">
          {/* Usage Ingestion (Tracker) */}
          <article className="rtpw-card rtpw-card--tracker">
            <header className="rtpw-card-head">
              <div className="rtpw-head-left">
                <h3 className="rtpw-title">{ingestionTitle}</h3>
                <StatusBadge 
                  label={ingestionBadgeText} 
                  variant="active" 
                  size="md"
                  aria-label={`Ingestion status: ${ingestionBadgeText}`}
                />
              </div>
            </header>

            <div className="rtpw-tracker-wrap" aria-label="Usage ingestion tracker">
              <ResponsiveContainer width="100%" height={54}>
                <BarChart
                  data={trackerData}
                  margin={{ top: 8, right: 10, bottom: 0, left: 10 }}
                  barCategoryGap={4}
                >
                  <XAxis dataKey="idx" hide />
                  <YAxis hide domain={[0, 1]} />
                  <Tooltip
                    cursor={false}
                    content={<TrackerTooltip />}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Bar dataKey="v" barSize={21}>
                    {trackerData.map((p) => (
                      <Cell key={p.id} fill={STATUS_COLORS[p.status]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          {/* Payments Success vs Fail (Progress bar via Recharts) */}
          <article className="rtpw-card rtpw-card--ratio">
            <header className="rtpw-card-head rtpw-card-head--tight">
              <h3 className="rtpw-title">{ratioTitle}</h3>
            </header>

            <div className="rtpw-ratio-meta" aria-hidden="true">
              <span className="rtpw-ratio-left">0</span>
              <span className="rtpw-ratio-right">
                <span className="rtpw-ratio-strong">{safeSuccess}</span>
                <span className="rtpw-ratio-dim">{"  "}100</span>
              </span>
            </div>

            <div className="rtpw-ratio-wrap" aria-label="Payments success vs fail ratio">
              <ResponsiveContainer width="100%" height={44}>
                <BarChart data={ratioData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barGap={4}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    cursor={false}
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null;
                      const s = payload.find((x: any) => x.dataKey === "success")?.value ?? 0;
                      const f = payload.find((x: any) => x.dataKey === "fail")?.value ?? 0;
                      return (
                        <div className="rtpw-tooltip">
                          <div className="rtpw-tooltip-title">Payments</div>
                          <div className="rtpw-tooltip-line">
                            <span className="rtpw-tooltip-k">Success</span>
                            <span className="rtpw-tooltip-v">{s}%</span>
                          </div>
                          <div className="rtpw-tooltip-line">
                            <span className="rtpw-tooltip-k">Fail</span>
                            <span className="rtpw-tooltip-v">{f}%</span>
                          </div>
                        </div>
                      );
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Bar dataKey="success" stackId="a" fill="#67B348" />
                  <Bar dataKey="fail" stackId="a" fill="#E14B3B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </div>

        {/* RIGHT COLUMN (Donut) */}
        <aside className="rtpw-card rtpw-card--donut">
          <header className="rtpw-card-head rtpw-card-head--split">
            <h3 className="rtpw-title">{donutTitle}</h3>
            <span className="rtpw-updated">{updatedText}</span>
          </header>

          <div className="rtpw-donut-wrap">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0];
                    return (
                      <div className="rtpw-tooltip">
                        <div className="rtpw-tooltip-title">{p.name}</div>
                        <div className="rtpw-tooltip-line">
                          <span className="rtpw-tooltip-k">Share</span>
                          <span className="rtpw-tooltip-v">{p.value}%</span>
                        </div>
                      </div>
                    );
                  }}
                  wrapperStyle={{ outline: "none" }}
                />
                <Pie
                  data={methods}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="45%"
                  outerRadius="85%"
                  paddingAngle={1}
                  cornerRadius={8}
                  stroke="#ffffff"
                  strokeWidth={4}
                  isAnimationActive={false}
                >
                  {methods.map((m) => (
                    <Cell key={m.name} fill={m.color} />
                  ))}
                </Pie>

                <Legend
                  verticalAlign="bottom"
                  align="center"
                  content={<DonutLegend />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default RealTimePaymentWidgets;
