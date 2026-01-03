import * as React from "react";
import { Card, Flex, Text, Badge } from "@tremor/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import "./BillableHeatmapAndRevenue.css";

type Level = 0 | 1 | 2; // 0=low, 1=medium, 2=high

type HeatmapRow = {
  metricName: string;
  uomLabel?: string;
  values: number[];
};

type TooltipState = {
  open: boolean;
  x: number; // px within heatmap area
  y: number; // px within heatmap area
  time: string;
  metricName: string;
  value: number;
  bucket: "low" | "medium" | "high";
};

type HeatmapProps = {
  title?: string;
  statusText?: string;
  updatedText?: string;
  rows?: HeatmapRow[];
  timeTicks?: { label: string; col: number }[]; // 1-based col index
};

type RevenueRow = {
  name: string;
  value: number;
  max: number; // for track (110M in your screenshot)
  band: "low" | "mid" | "high";
};

type RevenueProps = {
  title?: string;
  updatedText?: string;
  rows?: RevenueRow[];
  xTicks?: number[]; // e.g. [0,10,20,...,110]
};

const DEFAULT_HEATMAP_ROWS: HeatmapRow[] = [
  { metricName: "API Calls", uomLabel: "API Calls", values: [800, 1200, 2200, 900, 1100, 7800, 2400, 1900, 8200, 9000, 10200, 7600, 3200, 4500] },
  { metricName: "Storage GB", uomLabel: "GB", values: [600, 900, 1400, 1000, 1800, 2600, 3100, 2900, 5200, 6100, 7400, 8800, 9300, 1200] },
  { metricName: "Data Transfer", uomLabel: "GB", values: [900, 1300, 1600, 2500, 3200, 4000, 9800, 5200, 4100, 2300, 1900, 2600, 7200, 8500] },
  { metricName: "Requests", uomLabel: "Requests", values: [500, 700, 900, 1200, 3500, 4200, 6100, 8300, 9100, 10400, 11900, 13100, 14500, 6700] },
  { metricName: "Compute Hours", uomLabel: "Hours", values: [450, 800, 1200, 1600, 2100, 2800, 3300, 4100, 5200, 7400, 9800, 12000, 15000, 3400] },
];

const DEFAULT_HEATMAP_TICKS = [
  { label: "09:00", col: 1 },
  { label: "10:00", col: 3 },
  { label: "11:00", col: 5 },
  { label: "12:00", col: 7 },
  { label: "13:00", col: 9 },
  { label: "14:00", col: 11 },
  { label: "15:00", col: 14 },
];

const formatExact = (n: number) => new Intl.NumberFormat().format(n);

const getBucket = (v: number): "low" | "medium" | "high" => {
  if (v <= 1000) return "low";
  if (v <= 10000) return "medium";
  return "high";
};

const bucketText: Record<"low" | "medium" | "high", string> = {
  low: "Low",
  medium: "Medium", 
  high: "High",
};

const defaultTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
];

const DEFAULT_REVENUE_ROWS: RevenueRow[] = [
  { name: "Rate plan 1", value: 100, max: 110, band: "low" },
  { name: "Rate plan 2", value: 85, max: 110, band: "low" },
  { name: "Rate plan 3", value: 75, max: 110, band: "low" },
  { name: "Rate plan 4", value: 72, max: 110, band: "low" },

  { name: "Rate plan 5", value: 70, max: 110, band: "mid" },
  { name: "Rate plan 6", value: 68, max: 110, band: "mid" },
  { name: "Rate plan 7", value: 62, max: 110, band: "mid" },
  { name: "Rate plan 8", value: 58, max: 110, band: "mid" },

  { name: "Rate plan 9", value: 44, max: 110, band: "high" },
  { name: "Rate plan 10", value: 42, max: 110, band: "high" },
  { name: "Rate plan 11", value: 41, max: 110, band: "high" },
];

const DEFAULT_XTICKS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

function formatM(n: number) {
  return n === 0 ? "0" : `${n}M`;
}

const BillableUnitHeatmapCard: React.FC<HeatmapProps> = ({
  title = "Billable Unit Heatmap",
  statusText = "Good",
  updatedText,
  rows = DEFAULT_HEATMAP_ROWS,
  timeTicks = DEFAULT_HEATMAP_TICKS,
}) => {
  const heatmapRef = React.useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = React.useState<TooltipState>({
    open: false,
    x: 0,
    y: 0,
    time: "",
    metricName: "",
    value: 0,
    bucket: "low",
  });

  const closeTooltip = React.useCallback(() => {
    setTooltip((t) => ({ ...t, open: false }));
  }, []);

  const openTooltip = React.useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      metricName: string,
      time: string,
      value: number
    ) => {
      const host = heatmapRef.current;
      if (!host) return;

      const hostRect = host.getBoundingClientRect();
      const cellRect = e.currentTarget.getBoundingClientRect();

      // anchor tooltip center above the cell
      let x = cellRect.left - hostRect.left + cellRect.width / 2;
      let y = cellRect.top - hostRect.top;

      // prevent "top cut" (simple clamp)
      y = Math.max(86, y);

      setTooltip({
        open: true,
        x,
        y,
        time,
        metricName,
        value,
        bucket: getBucket(value),
      });
    },
    []
  );

  const cols = rows[0]?.values.length ?? 0;

  return (
    <Card className="bhr-card">
      <Flex justifyContent="between" alignItems="start" className="bhr-head">
        <Flex alignItems="center" className="bhr-head-left">
          <Text className="bhr-title">{title}</Text>
          <Badge className="bhr-badge" color="green">
            {statusText}
          </Badge>
        </Flex>
        {updatedText ? <Text className="bhr-updated">{updatedText}</Text> : null}
      </Flex>

      <div 
        ref={heatmapRef}
        className="bhr-heatmap-wrap"
        onMouseLeave={closeTooltip}
      >
        <div className="bhr-y">
          {rows.map((row, i) => (
            <div key={`${row.metricName}-${i}`} className="bhr-y-label">
              {row.uomLabel ?? row.metricName}
            </div>
          ))}
        </div>

        <div 
          className="bhr-heatmap" 
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          role="grid"
          aria-label="Billable unit heatmap"
        >
          {rows.map((row, rIdx) =>
            row.values.map((value, cIdx) => {
              const bucket = getBucket(value);
              const time = defaultTimes[cIdx] || `Time ${cIdx + 1}`;
              
              return (
                <button
                  key={`${rIdx}-${cIdx}`}
                  type="button"
                  className={`bhr-cell is-${bucket}`}
                  role="gridcell"
                  aria-label={`${row.metricName} • ${row.uomLabel ?? row.metricName} at ${time}: ${formatExact(value)} (${bucketText[bucket]})`}
                  onMouseEnter={(e) => openTooltip(e, row.metricName, time, value)}
                  onFocus={(e) => openTooltip(e as any, row.metricName, time, value)}
                  onBlur={closeTooltip}
                />
              );
            })
          )}
        </div>

        {/* Tooltip */}
        {tooltip.open && (
          <div
            className="bhr-tooltip"
            style={{ left: tooltip.x, top: tooltip.y }}
            role="status"
            aria-live="polite"
          >
            <div className="bhr-tooltip-title">{tooltip.time}</div>
            <div className="bhr-tooltip-metric">{tooltip.metricName}</div>
            <div className="bhr-tooltip-value">
              Value: <span>{formatExact(tooltip.value)}</span>
            </div>
            <div className={`bhr-bucket is-${tooltip.bucket}`}>
              {bucketText[tooltip.bucket]}
            </div>
          </div>
        )}
      </div>

      <div className="bhr-x" style={{ gridTemplateColumns: `56px repeat(${cols}, 1fr)` }}>
        <div />
        {timeTicks.map((t) => (
          <div
            key={`${t.label}-${t.col}`}
            className="bhr-x-tick"
            style={{ gridColumn: `${t.col + 1} / span 1` }}
          >
            {t.label}
          </div>
        ))}
      </div>

      <div className="bhr-legend">
        <div className="bhr-legend-item">
          <span className="bhr-dot dot-low" />
          <span>Low (&lt;1000)</span>
        </div>
        <div className="bhr-legend-item">
          <span className="bhr-dot dot-mid" />
          <span>Medium (1000 - 10000)</span>
        </div>
        <div className="bhr-legend-item">
          <span className="bhr-dot dot-high" />
          <span>High (&gt;10000)</span>
        </div>
      </div>
    </Card>
  );
};

const RevenueByPlanCard: React.FC<RevenueProps> = ({
  title = "Revenue by Plan",
  updatedText = "Updated 3 mins ago",
  rows = DEFAULT_REVENUE_ROWS,
  xTicks = DEFAULT_XTICKS,
}) => {
  const max = rows[0]?.max ?? 110;

  // Custom tooltip for the revenue bars
  const RevenueTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0]?.payload;
    return (
      <div className="bhr-revenue-tooltip">
        <div className="bhr-revenue-tooltip-title">{data.name}</div>
        <div className="bhr-revenue-tooltip-value">
          Revenue: <span>{formatM(data.value)}M</span>
        </div>
      </div>
    );
  };

  // Color mapping for bands
  const bandColors: Record<string, string> = {
    low: "#59c79a",
    mid: "#5b79d3", 
    high: "#c05bd3",
  };

  return (
    <Card className="bhr-card">
      <Flex justifyContent="between" alignItems="start" className="bhr-head">
        <Text className="bhr-title">{title}</Text>
        <Text className="bhr-updated">{updatedText}</Text>
      </Flex>

      <div className="bhr-chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={rows}
            margin={{ top: 20, right: 30, left: 90, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              domain={[0, max]} 
              ticks={xTicks}
              tickFormatter={formatM}
              tick={{ fontSize: 10, fill: "#a7b3c2" }}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              tick={{ fontSize: 10, fill: "#19222d" }}
              width={85}
            />
            <Tooltip content={<RevenueTooltip />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {rows.map((row, index) => (
                <Cell key={`cell-${index}`} fill={bandColors[row.band]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bhr-legend bhr-legend-right">
        <div className="bhr-legend-item">
          <span className="bhr-dot dot-low" />
          <span>Low (&lt;1000)</span>
        </div>
        <div className="bhr-legend-item">
          <span className="bhr-dot dot-mid" />
          <span>Medium (1000 - 10000)</span>
        </div>
        <div className="bhr-legend-item">
          <span className="bhr-dot dot-high" />
          <span>High (&gt;10000)</span>
        </div>
      </div>
    </Card>
  );
};

const BillableHeatmapAndRevenue: React.FC = () => {
  return (
    <div className="bhr-grid">
      <BillableUnitHeatmapCard />
      <RevenueByPlanCard />
    </div>
  );
};

export default BillableHeatmapAndRevenue;
