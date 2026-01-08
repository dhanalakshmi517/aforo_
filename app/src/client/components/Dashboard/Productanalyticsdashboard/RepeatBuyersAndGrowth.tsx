import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  LineChart,
  Line,
} from "recharts";
import "./RepeatBuyersAndGrowth.css";

type BarRow = {
  name: string;
  value: number;
  band: "green" | "purple" | "blue" | "teal";
};

type GrowthPoint = {
  label: string; // Jan..Jul
  value: number; // %
  dateText?: string; // "Apr 10, 2025"
};

type Props = {
  leftTitle?: string;
  rightTitle?: string;
  updatedText?: string;

  bars?: BarRow[];
  growth?: GrowthPoint[];
};

const sampleBars: BarRow[] = [
  { name: "Drive 34", value: 102_000_000, band: "green" },
  { name: "Produt 2", value: 90_000_000, band: "purple" },
  { name: "Prod 2", value: 82_000_000, band: "blue" },
  { name: "Prox 5", value: 76_000_000, band: "teal" },
];

const sampleGrowth: GrowthPoint[] = [
  { label: "Jan", value: 44 },
  { label: "Feb", value: 62 },
  { label: "Mar", value: 66 },
  { label: "Apr", value: 58, dateText: "Apr 10, 2025" }, // tooltip anchor like screenshot
  { label: "May", value: 50 },
  { label: "Jun", value: 56 },
  { label: "Jul", value: 82 },
];

function formatMillions(v: number) {
  if (!v) return "0";
  return `${Math.round(v / 1_000_000)}M`;
}

function bandFill(band: BarRow["band"]) {
  if (band === "green") return "#54C48C";
  if (band === "purple") return "#7B63D1";
  if (band === "blue") return "#5D78C8";
  return "#5AA7C6";
}

function BarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: BarRow = payload[0].payload;
  return (
    <div className="rbg-tt">
      <div className="rbg-ttTop">
        <div className="rbg-ttDot" style={{ background: bandFill(p.band) }} />
        <div className="rbg-ttTitle">{p.name}</div>
      </div>
      <div className="rbg-ttRow">
        <span className="rbg-ttK">Repeat buyers</span>
        <span className="rbg-ttV">{formatMillions(p.value)}</span>
      </div>
    </div>
  );
}

function GrowthTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const p: GrowthPoint = payload[0].payload;

  return (
    <div className="rbg-growthTT">
      <div className="rbg-growthDate">{p.dateText ?? "Apr 10, 2025"}</div>
      <div className="rbg-growthVal">{Math.round(p.value)}%</div>
    </div>
  );
}

function GrowthDot(props: any) {
  const { cx, cy, payload } = props;
  const isActive = payload?.label === "Apr";
  if (!isActive) return null;

  return (
    <g>
      {/* small dark dot on the line */}
      <circle cx={cx} cy={cy} r={4} fill="#0B1F3A" />
      {/* subtle outer ring */}
      <circle cx={cx} cy={cy} r={9} fill="rgba(11,31,58,0.08)" />
    </g>
  );
}

export default function RepeatBuyersAndGrowth({
  leftTitle = "Repeat Buyers per Product",
  rightTitle = "Product Growth",
  updatedText = "Updated 3 mins ago",
  bars,
  growth,
}: Props) {
  const barData = bars ?? sampleBars;
  const growthData = growth ?? sampleGrowth;

  const maxBar = React.useMemo(() => Math.max(...barData.map((d) => d.value)), [barData]);
  const barMaxTick = React.useMemo(() => {
    const step = 10_000_000;
    return Math.ceil(maxBar / step) * step;
  }, [maxBar]);

  return (
    <div className="rbg-grid">
      {/* LEFT: Repeat buyers (horizontal bars) */}
      <Card className="rbg-card">
        <div className="rbg-head">
          <Text className="rbg-title">{leftTitle}</Text>
          <Text className="rbg-updated">{updatedText}</Text>
        </div>

        <div className="rbg-chartWrap">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 4, right: 18, left: 0, bottom: 14 }}
              barCategoryGap={20}
            >
              <CartesianGrid horizontal={false} stroke="rgba(16, 24, 40, 0.04)" />
              <XAxis
                type="number"
                domain={[0, barMaxTick]}
                tickFormatter={(v) => (v === 0 ? "0" : formatMillions(v))}
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
                width={72}
              />
              <RTooltip content={<BarTooltip />} cursor={false} />

              {/* actual colored bar */}
              <Bar
                dataKey="value"
                isAnimationActive={false}
                shape={(props: any) => {
                  const { x, y, width, height, payload } = props;
                  const fill = bandFill(payload.band);
                  return <rect x={x} y={y} width={width} height={height} fill={fill} />;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* RIGHT: Product growth (line) */}
      <Card className="rbg-card">
        <div className="rbg-head">
          <Text className="rbg-title">{rightTitle}</Text>
          <Text className="rbg-updated">{updatedText}</Text>
        </div>

        <div className="rbg-chartWrap">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData} margin={{ top: 10, right: 18, left: 18, bottom: 10 }}>
              {/* super faint grid like screenshot */}
              <CartesianGrid vertical={false} stroke="rgba(16, 24, 40, 0.03)" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#C2CFDD" }}
                axisLine={false}
                tickLine={false}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[25, 50, 75, 100]}
                tick={{ fontSize: 12, fill: "#C2CFDD" }}
                axisLine={false}
                tickLine={false}
              />
              <RTooltip content={<GrowthTooltip />} cursor={false} />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#6A85D9"
                strokeWidth={2.6}
                dot={<GrowthDot />}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
