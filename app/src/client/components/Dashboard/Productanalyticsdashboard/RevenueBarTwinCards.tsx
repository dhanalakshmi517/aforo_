import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
} from "recharts";
import "./RevenueBarsTwinCards.css";

type BarRow = {
  name: string;
  value: number;
  color: string; // bar color
};

type Props = {
  leftTitle?: string;
  leftUpdatedText?: string;
  leftRows?: BarRow[];

  rightTitle?: string;
  rightUpdatedText?: string;
  rightRows?: BarRow[];

  /** max scale (like 110M). If not provided, inferred from data. */
  maxValue?: number;

  /** keep same look as screenshot */
  heightPx?: number; // default 260
};

const DEFAULT_MAX = 110_000_000;

const sampleLeft: BarRow[] = [
  { name: "Drive 34", value: 102_000_000, color: "#66CCA5" },
  { name: "Product 2", value: 88_000_000, color: "#8566CC" },
  { name: "Prod 2", value: 82_000_000, color: "#6685CC" },
  { name: "Prox 5", value: 74_000_000, color: "#66B1CC" },
];

const sampleRight: BarRow[] = [
  { name: "API Calls", value: 98_000_000, color: "#66CCA5" },
  { name: "GB", value: 86_000_000, color: "#8566CC" },
  { name: "Tokens", value: 80_000_000, color: "#6685CC" },
  { name: "Support Hrs", value: 72_000_000, color: "#66B1CC" },
];

function toMTick(v: number) {
  if (v === 0) return "0";
  return `${Math.round(v / 1_000_000)}M`;
}

function RevenueTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as BarRow;

  return (
    <div className="rbtc-tt">
      <div className="rbtc-ttTop">
        <span className="rbtc-ttDot" style={{ background: p.color }} />
        <span className="rbtc-ttTitle">{p.name}</span>
      </div>
      <div className="rbtc-ttRow">
        <span className="rbtc-ttK">Revenue</span>
        <span className="rbtc-ttV">{toMTick(p.value)}</span>
      </div>
    </div>
  );
}

/**
 * Draws:
 * - a soft background "track" (full width)
 * - the actual value bar on top with rounded ends
 */
function TrackBarShape(props: any) {
  const { x, y, width, height, payload, backgroundWidth } = props;
  const row: BarRow = payload;

  const trackH = Math.max(12, Math.floor(height * 0.75));
  const trackY = y + (height - trackH) / 2;

  return (
    <g>
      {/* track */}
      <rect
        x={x}
        y={trackY}
        width={backgroundWidth}
        height={trackH}
        fill="rgba(123, 151, 174, 0.14)"
      />
      {/* value */}
      <rect
        x={x}
        y={trackY}
        width={width}
        height={trackH}
        fill={row.color}
      />
    </g>
  );
}

function inferMax(data: BarRow[]) {
  const m = Math.max(...data.map((d) => d.value), 0);
  // round to nearest 10M step
  const step = 10_000_000;
  return Math.max(DEFAULT_MAX, Math.ceil(m / step) * step);
}

function BarsCard({
  title,
  updatedText,
  data,
  maxValue,
  heightPx,
}: {
  title: string;
  updatedText: string;
  data: BarRow[];
  maxValue: number;
  heightPx: number;
}) {
  // used to render the full track width inside custom shape
  const bgWidthRef = React.useRef<number>(0);

  return (
    <Card className="rbtc-card">
      <Flex justifyContent="between" alignItems="start" className="rbtc-head">
        <Text className="rbtc-title">{title}</Text>
        <Text className="rbtc-updated">{updatedText}</Text>
      </Flex>

      <div className="rbtc-chart" style={{ height: heightPx }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 18, left: 0, bottom: 14 }}
            barCategoryGap={16}
          >
            <CartesianGrid horizontal={false} stroke="rgba(16, 24, 40, 0.04)" />
            <XAxis
              type="number"
              domain={[0, maxValue]}
              tickFormatter={toMTick}
              tick={{ fontSize: 11, fill: "#A7B3C2" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={74}
              tick={{ fontSize: 11, fill: "#A7B3C2" }}
              axisLine={false}
              tickLine={false}
            />

            <RTooltip content={<RevenueTooltip />} cursor={false} />

            <Bar
              dataKey="value"
              isAnimationActive={false}
              // We render both track + value ourselves
              shape={(p: any) => {
                // backgroundWidth should be the width for maxValue.
                // recharts gives us "x" and a computed width for the value.
                // we approximate track width using the chart’s available width:
                // Recharts does not expose it directly; but "p.background" may exist in some versions.
                // If not, we compute it from the current x + scale by storing the widest seen width.
                const bw = Math.max(bgWidthRef.current, p.width);
                bgWidthRef.current = bw;

                // The *true* track width should equal width at maxValue, which is chart drawable width.
                // Using the max observed width becomes stable after first render.
                return <TrackBarShape {...p} backgroundWidth={bw} />;
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default function RevenueBarsTwinCards({
  leftTitle = "Revenue By Product",
  leftUpdatedText = "Updated 3 mins ago",
  leftRows,
  rightTitle = "Revenue per Unit",
  rightUpdatedText = "Updated 3 mins ago",
  rightRows,
  maxValue,
  heightPx = 260,
}: Props) {
  const left = leftRows ?? sampleLeft;
  const right = rightRows ?? sampleRight;

  const computedMax = maxValue ?? Math.max(inferMax(left), inferMax(right));

  return (
    <div className="rbtc-grid">
      <BarsCard
        title={leftTitle}
        updatedText={leftUpdatedText}
        data={left}
        maxValue={computedMax}
        heightPx={heightPx}
      />

      <BarsCard
        title={rightTitle}
        updatedText={rightUpdatedText}
        data={right}
        maxValue={computedMax}
        heightPx={heightPx}
      />
    </div>
  );
}
