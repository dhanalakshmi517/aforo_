import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
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
import StatusBadge from "../../componenetsss/StatusBadge";
import "./BillableHeatmapAndRevenue.css";

type Level = "low" | "medium" | "high";
type RevenueBand = "low" | "medium" | "high";

type HeatCellPoint = {
  x: number; // pixel center
  y: number; // pixel center
  value: number;
  timeLabel: string;
  rowLabel: string;
  level: Level;
};

type RevenueRow = {
  name: string;
  value: number;
  band: RevenueBand;
};

type Props = {
  // LEFT
  heatTitle?: string;
  heatStatusText?: string;
  heatUpdatedText?: string;
  rows?: string[];
  times?: string[];
  matrix?: number[][];

  // RIGHT
  revenueTitle?: string;
  revenueUpdatedText?: string;
  revenueRows?: RevenueRow[];

  // layout
  gapPx?: number;
};

const CELL_H = 65;  // ✅ increased height to fill more vertical space
const MIN_CELL_W = 16; // ✅ decreased to show 14 columns
const GAP = 4;      // ✅ exactly 4px gap

// tighter axes so charts start left (not centered)
const Y_AXIS_W = 72;
const HEAT_TOP = 8;
const HEAT_RIGHT = 8;
const HEAT_BOTTOM = 28;
const HEAT_LEFT = 0;

function useSize<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useLayoutEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth || 0, h: el.clientHeight || 0 });
    });

    ro.observe(el);
    setSize({ w: el.clientWidth || 0, h: el.clientHeight || 0 });

    return () => ro.disconnect();
  }, []);

  return { ref, ...size };
}

function useResizeWidth<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const ro = new ResizeObserver(() => {
      setWidth(el.clientWidth || 0);
    });

    ro.observe(el);
    setWidth(el.clientWidth || 0);

    return () => ro.disconnect();
  }, []);

  return { ref, width };
}

function levelFromValue(v: number): Level {
  if (v < 100) return "low";
  if (v < 1000) return "medium";
  return "high";
}

function heatColor(level: Level) {
  if (level === "low") return "#BED4ED";
  if (level === "medium") return "#6C8FE5";
  return "#354EB7";
}

function bandColor(b: RevenueBand) {
  if (b === "low") return "#66CCA5";
  if (b === "medium") return "#6685CC";
  return "#C066CC";
}

function formatValue(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${v}`;
}

/* -------- sample data -------- */
function buildHeatSample() {
  const rows = ["API Calls", "GB", "API Calls", "API Calls", "API Calls"];
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
  const matrix = rows.map((_, r) =>
    times.map((_, c) => {
      const base = Math.floor(Math.random() * 220);
      const spike = c >= 3 ? Math.floor(Math.random() * 700) : 0;
      const rare = Math.random() < 0.08 ? 1200 + Math.floor(Math.random() * 800) : 0;
      return base + spike + rare;
    })
  );
  return { rows, times, matrix };
}

function buildRevenueSample(): RevenueRow[] {
  const m = (n: number) => n * 1_000_000;
  return [
    { name: "Rate plan 1", value: m(102), band: "low" },
    { name: "Rate plan 2", value: m(90), band: "low" },
    { name: "Rate plan 3", value: m(82), band: "low" },
    { name: "Rate plan 4", value: m(78), band: "low" },

    { name: "Rate plan 5", value: m(75), band: "medium" },
    { name: "Rate plan 6", value: m(75), band: "medium" },
    { name: "Rate plan 7", value: m(72), band: "medium" },
    { name: "Rate plan 8", value: m(70), band: "medium" },

    { name: "Rate plan 9", value: m(50), band: "high" },
    { name: "Rate plan 10", value: m(48), band: "high" },
    { name: "Rate plan 11", value: m(46), band: "high" },
  ];
}

/* -------- tooltips -------- */
function HeatTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: HeatCellPoint = payload[0].payload;

  return (
    <div className="bhrr-tt">
      <div className="bhrr-ttTop">
        <div className="bhrr-ttDot" style={{ background: heatColor(p.level) }} />
        <div className="bhrr-ttTitle">{p.rowLabel}</div>
      </div>
      <div className="bhrr-ttRow">
        <span className="bhrr-ttK">Time</span>
        <span className="bhrr-ttV">{p.timeLabel}</span>
      </div>
      <div className="bhrr-ttRow">
        <span className="bhrr-ttK">Usage</span>
        <span className="bhrr-ttV">{formatValue(p.value)}</span>
      </div>
    </div>
  );
}

function RevenueTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: RevenueRow = payload[0].payload;

  return (
    <div className="bhrr-tt">
      <div className="bhrr-ttTop">
        <div className="bhrr-ttDot" style={{ background: bandColor(p.band) }} />
        <div className="bhrr-ttTitle">{p.name}</div>
      </div>
      <div className="bhrr-ttRow">
        <span className="bhrr-ttK">Revenue</span>
        <span className="bhrr-ttV">{formatValue(p.value)}</span>
      </div>
    </div>
  );
}

/* ✅ no radius + exact cell width/height with gap */
function HeatCellShape({
  cx,
  cy,
  payload,
  cellW,
}: any & { cellW: number }) {
  if (cx == null || cy == null || !payload) return null;
  const p: HeatCellPoint = payload;

  // Reduce cell size by GAP amount to create visible gap between cells
  const displayCellW = cellW - GAP;
  const displayCellH = CELL_H - GAP;

  const x = cx - displayCellW / 2;
  const y = cy - displayCellH / 2;

  return (
    <rect
      x={x}
      y={y}
      width={displayCellW}
      height={displayCellH}
      rx={0}
      ry={0}
      fill={heatColor(p.level)}
    />
  );
}

export default function BillableHeatmapAndRevenue({
  heatTitle = "Billable Unit Heatmap",
  heatStatusText = "Good",
  heatUpdatedText = "Updated 3 mins ago",
  rows,
  times,
  matrix,

  revenueTitle = "Revenue by Plan",
  revenueUpdatedText = "Updated 3 mins ago",
  revenueRows,

  gapPx = 20,
}: Props) {
  const heatSample = React.useMemo(() => buildHeatSample(), []);
  const revSample = React.useMemo(() => buildRevenueSample(), []);

  const finalRows = rows ?? heatSample.rows;
  const finalTimes = times ?? heatSample.times;
  const finalMatrix = matrix ?? heatSample.matrix;
  const revData = revenueRows ?? revSample;

  // measure available width for the heatmap plot area
  const { ref: heatRef, width: heatWrapWidth } = useResizeWidth<HTMLDivElement>();

  const cols = finalTimes.length;
  const rowCount = finalRows.length;

  // plotWidth = wrapper width minus axis area and margins
  const plotWidth = Math.max(
    0,
    heatWrapWidth - (Y_AXIS_W + HEAT_LEFT + HEAT_RIGHT)
  );

  // ✅ auto cell width (fills container), but never below MIN_CELL_W
  const computedCellW = cols > 0
    ? Math.floor((plotWidth - (cols - 1) * GAP) / cols)
    : MIN_CELL_W;

  const cellW = Math.max(MIN_CELL_W, computedCellW);

  // pixel grid math (fixed gap, fixed height)
  const xStep = cellW + GAP;
  const yStep = CELL_H + GAP;

  const xFirst = cellW / 2;
  const yFirst = CELL_H / 2;

  const xLastCenter = xFirst + (cols - 1) * xStep;
  const yLastCenter = yFirst + (rowCount - 1) * yStep;

  const xDomainMax = xLastCenter + cellW / 2;
  const yDomainMax = yLastCenter + CELL_H / 2;

  const points: HeatCellPoint[] = React.useMemo(() => {
    const out: HeatCellPoint[] = [];
    for (let r = 0; r < rowCount; r++) {
      for (let c = 0; c < cols; c++) {
        const v = finalMatrix?.[r]?.[c] ?? 0;
        out.push({
          x: xFirst + c * xStep,
          y: yFirst + r * yStep,
          value: v,
          timeLabel: finalTimes[c],
          rowLabel: finalRows[r],
          level: levelFromValue(v),
        });
      }
    }
    return out;
  }, [rowCount, cols, finalMatrix, finalTimes, finalRows, xFirst, yFirst, xStep, yStep]);

  // when screen is small, we keep cellW=MIN_CELL_W and allow horizontal scroll using minWidth
  const minGridWidth =
    Y_AXIS_W + HEAT_LEFT + HEAT_RIGHT + cols * MIN_CELL_W + (cols - 1) * GAP + 24;

  const heatHeight =
    HEAT_TOP + rowCount * CELL_H + (rowCount - 1) * GAP + HEAT_BOTTOM + 10;

  // ✅ revenue chart height fit (not huge empty space)
  const revHeight = Math.max(280, revData.length * 34);

  // ticks at the center of each cell
  const xTicks = React.useMemo(
    () => finalTimes.map((_, i) => xFirst + i * xStep),
    [finalTimes, xFirst, xStep]
  );
  const yTicks = React.useMemo(
    () => finalRows.map((_, i) => yFirst + i * yStep),
    [finalRows, yFirst, yStep]
  );

  const tickToIndexX = (val: number) => Math.round((val - xFirst) / xStep);
  const tickToIndexY = (val: number) => Math.round((val - yFirst) / yStep);

  const revMax = React.useMemo(() => {
    const maxVal = Math.max(...revData.map((d) => d.value));
    const step = 10_000_000;
    return Math.ceil(maxVal / step) * step;
  }, [revData]);

  return (
    <div className="bhrr-grid" style={{ gap: gapPx }}>
      {/* LEFT CARD */}
      <Card className="bhrr-card">
        <Flex justifyContent="between" alignItems="start" className="bhrr-head">
          <div className="bhrr-leftHead">
            <Text className="bhrr-title">{heatTitle}</Text>
            <StatusBadge variant="active" label={heatStatusText} />
          </div>
          <Text className="bhrr-updated">{heatUpdatedText}</Text>
        </Flex>

        {/* ✅ scroll only if needed (small screens) */}
        <div className="bhrr-xScroll" ref={heatRef}>
          <div
            className="bhrr-heatBox"
            style={{ width: "100%", minWidth: minGridWidth, height: heatHeight }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: HEAT_TOP, right: HEAT_RIGHT, bottom: HEAT_BOTTOM, left: HEAT_LEFT }}>
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, xDomainMax]}
                  ticks={xTicks}
                  tickFormatter={(v) => finalTimes[tickToIndexX(v)] ?? ""}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#7B97AE" }}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, yDomainMax]}
                  ticks={yTicks}
                  tickFormatter={(v) => finalRows[tickToIndexY(v)] ?? ""}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "#7B97AE" }}
                  width={Y_AXIS_W}
                />

                <RTooltip content={<HeatTooltip />} cursor={false} />
                <Scatter
                  data={points}
                  isAnimationActive={false}
                  shape={(p: any) => <HeatCellShape {...p} cellW={cellW} />}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bhrr-legend">
          <div className="bhrr-legItem">
            <span className="bhrr-legDot" style={{ background: heatColor("low") }} />
            <span className="bhrr-legText">Low (&lt;100$)</span>
          </div>
          <div className="bhrr-legItem">
            <span className="bhrr-legDot" style={{ background: heatColor("medium") }} />
            <span className="bhrr-legText">Medium (100$ - 1000$)</span>
          </div>
          <div className="bhrr-legItem">
            <span className="bhrr-legDot" style={{ background: heatColor("high") }} />
            <span className="bhrr-legText">High (&gt;1000$)</span>
          </div>
        </div>
      </Card>

      {/* RIGHT CARD */}
      <Card className="bhrr-card">
        <Flex justifyContent="between" alignItems="start" className="bhrr-head">
          <Text className="bhrr-title">{revenueTitle}</Text>
          <Text className="bhrr-updated">{revenueUpdatedText}</Text>
        </Flex>

        <div className="bhrr-revBox" style={{ height: revHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={revData}
              layout="vertical"
              margin={{ top: 6, right: 10, left: 0, bottom: 18 }}  // ✅ start from left
              barCategoryGap={9}
              barSize={20}
            >
              <CartesianGrid horizontal={false} stroke="rgba(16, 24, 40, 0.06)" />
              <XAxis
                type="number"
                domain={[0, revMax]}
                tickFormatter={(v) => (v === 0 ? "0" : `${Math.round(v / 1_000_000)}M`)}
                tick={{ fontSize: 12, fill: "#A7B3C2" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={82} // ✅ tighter than before
                tick={{ fontSize: 12, fill: "#A7B3C2" }}
                axisLine={false}
                tickLine={false}
              />

              <RTooltip content={<RevenueTooltip />} cursor={false} />

              <Bar
                dataKey="value"
                isAnimationActive={false}
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const fill = bandColor(payload.band as RevenueBand);
                  return (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      rx={0}
                      ry={0}
                      fill={fill}
                    />
                  );
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bhrr-legend">
          <div className="bhrr-legItem">
            <span className="bhrr-legDot" style={{ background: bandColor("low") }} />
            <span className="bhrr-legText">Low (&lt;100$)</span>
          </div>
          <div className="bhrr-legItem">
            <span className="bhrr-legDot" style={{ background: bandColor("medium") }} />
            <span className="bhrr-legText">Medium (100$ - 1000$)</span>
          </div>
          <div className="bhrr-legItem">
            <span className="bhrr-legDot" style={{ background: bandColor("high") }} />
            <span className="bhrr-legText">High (&gt;1000$)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
