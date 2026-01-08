import * as React from "react";
import { Card, Flex, Text, Badge } from "@tremor/react";
import StatusBadge from "../../componenetsss/StatusBadge";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import "./ProductUsageTrends.css";

type Level = "low" | "medium" | "high";

type HeatPoint = {
  x: number; // column index
  y: number; // row index
  value: number;
  colLabel: string; // month label
  rowLabel: string; // API Calls / GB ...
  level: Level;
};

type SegmentRow = {
  name: string;
  value: number;
  max: number; // background track
  color: string; // per-row color
};

type Props = {
  leftTitle?: string;
  leftStatus?: string; // "Good"
  leftUpdated?: string;

  rightTitle?: string;
  rightUpdated?: string;

  rows?: string[];
  cols?: string[]; // month labels for each column
  matrix?: number[][];

  segmentRows?: SegmentRow[];
  className?: string;
};

const GAP = 4; // ✅ requested
const Y_AXIS_W = 86;

const HEAT_MARGIN = { top: 10, right: 8, bottom: 34, left: 0 };
const BAR_MARGIN = { top: 10, right: 20, bottom: 28, left: 0 };

function levelFromValue(v: number): Level {
  if (v < 100) return "low";
  if (v < 1000) return "medium";
  return "high";
}
function heatFill(level: Level) {
  if (level === "low") return "#CFE0F6";
  if (level === "medium") return "#7FA4E9";
  return "#2E55D3";
}
function fmtMoneyM(v: number) {
  if (v === 0) return "0";
  return `${Math.round(v / 1_000_000)}M`;
}

function useElementSize<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setSize({ width: Math.round(cr.width), height: Math.round(cr.height) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}

/* -------------------- SAMPLE DATA (matches screenshot vibe) -------------------- */
function buildColsSample() {
  // Many columns, month labels repeated like your screenshot
  const make = (label: string, n: number) => Array.from({ length: n }, () => label);
  return [
    ...make("Jan", 6),
    ...make("Feb", 6),
    ...make("Mar", 6),
    ...make("Apr", 10),
    ...make("May", 8),
    ...make("Jun", 6),
    ...make("Jul", 6),
  ];
}
function buildHeatSample() {
  const rows = ["API Calls", "GB", "API Calls", "API Calls", "API Calls", "API Calls", "API Calls"];
  const cols = buildColsSample();

  const matrix = rows.map((_, r) =>
    cols.map((m, c) => {
      const base = Math.floor(Math.random() * 140);

      const febSpike = m === "Feb" && Math.random() < 0.35 ? 600 + Math.floor(Math.random() * 600) : 0;
      const aprBand = m === "Apr" && r >= 3 ? 300 + Math.floor(Math.random() * 500) : 0;
      const julWall = m === "Jul" && r >= 2 ? 900 + Math.floor(Math.random() * 900) : 0;

      const rare = Math.random() < 0.03 ? 1200 + Math.floor(Math.random() * 700) : 0;

      return base + febSpike + aprBand + julWall + rare;
    })
  );

  return { rows, cols, matrix };
}

function buildSegmentSample(): SegmentRow[] {
  const max = 110_000_000;
  return [
    { name: "Drive 34", value: 102_000_000, max, color: "#54C48C" },
    { name: "Product 2", value: 90_000_000, max, color: "#7D61D1" },
    { name: "Prod 2", value: 84_000_000, max, color: "#5D78C8" },
    { name: "Prox 5", value: 74_000_000, max, color: "#5AA7C8" },
  ];
}

/* -------------------- TOOLTIPS -------------------- */
function HeatTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: HeatPoint = payload[0].payload;

  return (
    <div className="put-tt">
      <div className="put-ttTop">
        <span className="put-ttDot" style={{ background: heatFill(p.level) }} />
        <span className="put-ttTitle">{p.rowLabel}</span>
      </div>

      <div className="put-ttRow">
        <span className="put-ttK">Month</span>
        <span className="put-ttV">{p.colLabel}</span>
      </div>

      <div className="put-ttRow">
        <span className="put-ttK">Usage</span>
        <span className="put-ttV">{p.value.toLocaleString()}</span>
      </div>

      <div className="put-ttHint">
        {p.level === "low" ? "Low (<100)" : p.level === "medium" ? "Medium (100–1000)" : "High (>1000)"}
      </div>
    </div>
  );
}

function SegmentTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: SegmentRow = payload[0].payload;

  return (
    <div className="put-tt">
      <div className="put-ttTop">
        <span className="put-ttDot" style={{ background: p.color }} />
        <span className="put-ttTitle">{p.name}</span>
      </div>

      <div className="put-ttRow">
        <span className="put-ttK">Revenue</span>
        <span className="put-ttV">{fmtMoneyM(p.value)}</span>
      </div>
    </div>
  );
}

export default function ProductUsageTrends({
  leftTitle = "Product Usage Trends",
  leftStatus = "Good",
  leftUpdated = "Updated 3 mins ago",

  rightTitle = "Top products by segment",
  rightUpdated = "Updated 3 mins ago",

  rows,
  cols,
  matrix,
  segmentRows,
  className = "",
}: Props) {
  const sample = React.useMemo(() => buildHeatSample(), []);
  const finalRows = rows ?? sample.rows;
  const finalCols = cols ?? sample.cols;
  const finalMatrix = matrix ?? sample.matrix;

  const segData = segmentRows ?? buildSegmentSample();

  const points: HeatPoint[] = React.useMemo(() => {
    const out: HeatPoint[] = [];
    for (let r = 0; r < finalRows.length; r++) {
      for (let c = 0; c < finalCols.length; c++) {
        const v = finalMatrix?.[r]?.[c] ?? 0;
        out.push({
          x: c,
          y: r,
          value: v,
          colLabel: finalCols[c],
          rowLabel: finalRows[r],
          level: levelFromValue(v),
        });
      }
    }
    return out;
  }, [finalRows, finalCols, finalMatrix]);

  // ✅ Heatmap area drives “auto height” cell sizing
  const { ref: heatRef, width: heatW, height: heatH } = useElementSize<HTMLDivElement>();

  // ✅ compute cell sizes so: gap = 4px, no centering, fills available area
  const colsCount = Math.max(1, finalCols.length);
  const rowsCount = Math.max(1, finalRows.length);

  const plotW = Math.max(1, heatW - HEAT_MARGIN.left - HEAT_MARGIN.right - Y_AXIS_W);
  const plotH = Math.max(1, heatH - HEAT_MARGIN.top - HEAT_MARGIN.bottom);

  const stepX = plotW / colsCount;
  const stepY = plotH / rowsCount;

  const cellW = Math.max(6, Math.floor(stepX - GAP * 2));
  const cellH = Math.max(12, Math.floor(stepY - GAP * 2));

  // show fewer ticks (months) so it looks like the screenshot (Jan..Jul spaced)
  const monthTickIdx = React.useMemo(() => {
    const idx: number[] = [];
    let last = "";
    for (let i = 0; i < finalCols.length; i++) {
      const m = finalCols[i];
      if (m !== last) idx.push(i);
      last = m;
    }
    return idx;
  }, [finalCols]);

  return (
    <div className={`put-grid ${className}`}>
      {/* LEFT CARD */}
      <Card className="put-card">
        <div className="put-cardInner">
          <div className="put-head">
            <div className="put-titleRow">
              <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                <Text className="put-title">{leftTitle}</Text>
                <StatusBadge label={leftStatus} variant="active" size="sm" />
              </div>
              <Text className="put-updated">{leftUpdated}</Text>
            </div>
          </div>

          {/* chart must have real height or ResponsiveContainer renders nothing */}
          <div className="put-heatArea" ref={heatRef}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={HEAT_MARGIN}>
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[-0.5, colsCount - 0.5]}
                  ticks={monthTickIdx}
                  tickFormatter={(i) => finalCols[i]}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#9FB0C3" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[-0.5, rowsCount - 0.5]}
                  ticks={finalRows.map((_, i) => i)}
                  tickFormatter={(i) => finalRows[i]}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#9FB0C3" }}
                  width={Y_AXIS_W}
                />

                <RTooltip content={<HeatTooltip />} cursor={false} />

                <Scatter
                  data={points}
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { cx, cy, payload } = props;
                    const p: HeatPoint = payload;
                    return (
                      <rect
                        x={cx - cellW / 2}
                        y={cy - cellH / 2}
                        width={cellW}
                        height={cellH}
                        rx={0} // ✅ no radius
                        ry={0}
                        fill={heatFill(p.level)}
                        stroke="rgba(16, 24, 40, 0.04)"
                      />
                    );
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <div className="put-legend">
            <div className="put-legItem">
              <span className="put-legDot" style={{ background: heatFill("low") }} />
              <span className="put-legText">Low (&lt;100$)</span>
            </div>
            <div className="put-legItem">
              <span className="put-legDot" style={{ background: heatFill("medium") }} />
              <span className="put-legText">Medium (100$ - 1000$)</span>
            </div>
            <div className="put-legItem">
              <span className="put-legDot" style={{ background: heatFill("high") }} />
              <span className="put-legText">High (&gt;1000$)</span>
            </div>
          </div>
        </div>
      </Card>

      {/* RIGHT CARD */}
      <Card className="put-card put-right">
        <div className="put-cardInner">
          <div className="put-headRowRight">
            <Text className="put-title">{rightTitle}</Text>
            <Text className="put-updated">{rightUpdated}</Text>
          </div>

          <div className="put-barArea">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segData} layout="vertical" margin={BAR_MARGIN} barCategoryGap={18}>
                <CartesianGrid horizontal={false} stroke="rgba(16, 24, 40, 0.06)" />
                <XAxis
                  type="number"
                  domain={[0, segData?.[0]?.max ?? 110_000_000]}
                  tickFormatter={fmtMoneyM}
                  tick={{ fontSize: 12, fill: "#A7B3C2" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#A7B3C2" }}
                  axisLine={false}
                  tickLine={false}
                  width={90}
                />

                <RTooltip content={<SegmentTooltip />} cursor={false} />

                {/* value bar with per-row color */}
                <Bar
                  dataKey="value"
                  barSize={18}
                  isAnimationActive={false}
                  shape={(props: any) => {
                    const { x, y, width, height, payload } = props;
                    const fill = payload.color as string;
                    return <rect x={x} y={y} width={width} height={height} fill={fill} />;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}
