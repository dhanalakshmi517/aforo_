// CustomersByUsageCard.tsx
import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import "./CustomersByUsageCard.css";
import MiniScrollbar from "../../componenetsss/MiniScrollbar";

type Level = "low" | "medium" | "high";
type UpdateType = "success" | "warning" | "error";

export type RealTimeUpdateItem = {
  id: string;
  type: UpdateType;
  title: string;
  amountLine: string;
  subtitle: string;
  timeAgo: string;
};

type HeatCellPoint = {
  x: number; // pixel-like position inside plot area
  y: number;
  value: number;
  timeLabel: string;
  rowLabel: string;
  level: Level;
};

type Props = {
  leftTitle?: string;
  leftUpdatedText?: string;
  rows?: string[];
  times?: string[];
  matrix?: number[][];

  rightTitle?: string;
  rightUpdatedText?: string;
  updates?: RealTimeUpdateItem[];
  updatesMaxHeightPx?: number;

  rightWidthPx?: number;
  gapPx?: number;
};

const CELL_H = 28;      // ✅ fixed height
const MIN_CELL_W = 28;  // ✅ minimum width
const GAP = 4;          // ✅ fixed gap like your 2nd image

const Y_AXIS_PX = 84;
const TOP_PAD_PX = 14;
const BOTTOM_AXIS_PX = 20;
const RIGHT_PAD_PX = 16;
const LEFT_MARGIN_PX = 4;

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
function colorForLevel(level: Level) {
  if (level === "low") return "#BED4ED";
  if (level === "medium") return "#6C8FE5";
  return "#354EB7";
}
function formatValue(v: number) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return `${v}`;
}
function toneColor(type: UpdateType) {
  if (type === "success") return "#389315";
  if (type === "warning") return "#F59E0B";
  return "#ED5142";
}

function buildSampleHeatmap() {
  const rows = [
    "API Calls",
    "GB",
    "API Calls",
    "API Calls",
    "API Calls",
    "API Calls",
    "API Calls",
    "API Calls",
    "API Calls",
    "API Calls",
    "API Calls",
  ];
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "13:00", "13:00", "13:00", "13:00", "14:00", "15:00"];

  const matrix = rows.map((_, r) =>
    times.map((_, c) => {
      const base = Math.floor(Math.random() * 220);
      const spike = (c === times.length - 1 ? 900 : 0) + (r === rows.length - 1 ? 600 : 0);
      const midSpike = c >= 5 && c <= 8 ? Math.floor(Math.random() * 600) : 0;
      const rare = Math.random() < 0.06 ? 1200 + Math.floor(Math.random() * 900) : 0;
      return base + spike + midSpike + rare;
    })
  );

  return { rows, times, matrix };
}

function buildSampleUpdates(): RealTimeUpdateItem[] {
  return [
    { id: "1", type: "success", title: "Payment Received", amountLine: "₹499 • Pro Plan • UPI", subtitle: "ABC Company Ltd", timeAgo: "2 sec ago" },
    { id: "2", type: "warning", title: "New Signup", amountLine: "Free Trial Started", subtitle: "ABC Company Ltd", timeAgo: "2 sec ago" },
    { id: "3", type: "error", title: "Payment Failed", amountLine: "₹1,299 • Card Declined", subtitle: "ABC Company Ltd", timeAgo: "2 sec ago" },
    { id: "4", type: "success", title: "Plan Upgraded", amountLine: "Basic → Pro", subtitle: "Rahul Ltd", timeAgo: "2 sec ago" },
    { id: "5", type: "success", title: "Plan Upgraded", amountLine: "Basic → Pro", subtitle: "Anita Ltd", timeAgo: "2 sec ago" },
  ];
}

function HeatTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: HeatCellPoint = payload[0].payload;

  return (
    <div className="cbuTT">
      <div className="cbuTTTop">
        <div className="cbuTTDot" style={{ background: colorForLevel(p.level) }} />
        <div className="cbuTTTitle">{p.rowLabel}</div>
      </div>

      <div className="cbuTTRow">
        <span className="cbuTTK">Time</span>
        <span className="cbuTTV">{p.timeLabel}</span>
      </div>

      <div className="cbuTTRow">
        <span className="cbuTTK">Usage</span>
        <span className="cbuTTV">{formatValue(p.value)}</span>
      </div>

      <div className="cbuTTHint">
        {p.level === "low" ? "Low (<100)" : p.level === "medium" ? "Medium (100–1000)" : "High (>1000)"}
      </div>
    </div>
  );
}

function HeatCellShape({
  cx,
  cy,
  payload,
  cellW,
}: {
  cx?: number;
  cy?: number;
  payload?: HeatCellPoint;
  cellW: number;
}) {
  if (cx == null || cy == null || !payload) return null;

  const x = cx - cellW / 2;
  const y = cy - CELL_H / 2;

  return (
    <rect
      x={x}
      y={y}
      width={cellW}
      height={CELL_H}
      rx={0} // ✅ no radius like your 2nd image
      ry={0}
      fill={colorForLevel(payload.level)}
      stroke="rgba(16, 24, 40, 0.04)"
    />
  );
}

export default function CustomersByUsageCard({
  leftTitle = "Customers by Usage",
  leftUpdatedText = "Updated 3 mins ago",
  rows,
  times,
  matrix,

  rightTitle = "Real-time updates",
  rightUpdatedText = "Updated 3 mins ago",
  updates,
  updatesMaxHeightPx = 420,

  rightWidthPx = 360,
  gapPx = 20,
}: Props) {
  const sampleHeat = React.useMemo(() => buildSampleHeatmap(), []);
  const sampleUpd = React.useMemo(() => buildSampleUpdates(), []);

  const finalRows = rows ?? sampleHeat.rows;
  const finalTimes = times ?? sampleHeat.times;
  const finalMatrix = matrix ?? sampleHeat.matrix;
  const finalUpdates = updates ?? sampleUpd;

  // measure available width for the heatmap plot area
  const { ref: heatWrapRef, width: heatWrapWidth } = useResizeWidth<HTMLDivElement>();

  // ref for right side scrollable container
  const rightScrollRef = React.useRef<HTMLDivElement>(null);

  const cols = finalTimes.length;
  const rowsCount = finalRows.length;

  // plotWidth = wrapper width minus axis area and margins
  const plotWidth = Math.max(
    0,
    heatWrapWidth - (Y_AXIS_PX + LEFT_MARGIN_PX + RIGHT_PAD_PX)
  );

  // ✅ auto cell width (fills container), but never below 28
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
  const yLastCenter = yFirst + (rowsCount - 1) * yStep;

  const xDomainMax = xLastCenter + cellW / 2;
  const yDomainMax = yLastCenter + CELL_H / 2;

  const points: HeatCellPoint[] = React.useMemo(() => {
    const out: HeatCellPoint[] = [];
    for (let r = 0; r < rowsCount; r++) {
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
  }, [rowsCount, cols, finalMatrix, finalTimes, finalRows, xFirst, yFirst, xStep, yStep]);

  // when screen is small, we keep cellW=28 and allow horizontal scroll using minWidth
  const minGridWidth =
    Y_AXIS_PX + LEFT_MARGIN_PX + RIGHT_PAD_PX + cols * MIN_CELL_W + (cols - 1) * GAP + 24;

  const heatHeight =
    TOP_PAD_PX + rowsCount * CELL_H + (rowsCount - 1) * GAP + BOTTOM_AXIS_PX + 10;

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

  return (
    <div className="cbuWrap" style={{ gridTemplateColumns: `1fr ${rightWidthPx}px`, gap: gapPx }}>
      {/* LEFT */}
      <Card className="cbuCard cbuLeft">
        <Flex justifyContent="between" alignItems="start" className="cbuHead">
          <Text className="cbuTitle">{leftTitle}</Text>
          <Text className="cbuUpdated">{leftUpdatedText}</Text>
        </Flex>

        <div className="cbuScrollX" ref={heatWrapRef}>
          <div className="cbuHeatSizer" style={{ width: "100%", minWidth: minGridWidth, height: heatHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: TOP_PAD_PX,
                  right: RIGHT_PAD_PX,
                  bottom: BOTTOM_AXIS_PX,
                  left: LEFT_MARGIN_PX,
                }}
              >
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
                  width={Y_AXIS_PX}
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

        <div className="cbuLegend">
          <div className="cbuLegItem">
            <span className="cbuLegDot" style={{ background: "#D9E8FB" }} />
            <span className="cbuLegText">Low (&lt;100$)</span>
          </div>
          <div className="cbuLegItem">
            <span className="cbuLegDot" style={{ background: "#86AEF2" }} />
            <span className="cbuLegText">Medium (100$ - 1000$)</span>
          </div>
          <div className="cbuLegItem">
            <span className="cbuLegDot" style={{ background: "#2F5FD2" }} />
            <span className="cbuLegText">High (&gt;1000$)</span>
          </div>
        </div>
      </Card>

      {/* RIGHT */}
      <Card className="cbuCard cbuRight">
        <Flex justifyContent="between" alignItems="start" className="cbuHead">
          <Text className="cbuTitle">{rightTitle}</Text>
          <Text className="cbuUpdated">{rightUpdatedText}</Text>
        </Flex>

        <div className="rtuList" ref={rightScrollRef} style={{ maxHeight: updatesMaxHeightPx }}>
          {finalUpdates.map((it) => (
            <div key={it.id} className="rtuItem">
              <div className="rtuTop">
                <div className="rtuChip" style={{ color: toneColor(it.type) }}>
                  {it.title}
                </div>
                <div className="rtuTime">{it.timeAgo}</div>
              </div>
              <div className="rtuMain">{it.amountLine}</div>
              <div className="rtuSub">{it.subtitle}</div>
            </div>
          ))}
        </div>
        
        <MiniScrollbar containerRef={rightScrollRef as React.RefObject<HTMLElement>} side="right" inset={8} />
      </Card>
    </div>
  );
}
