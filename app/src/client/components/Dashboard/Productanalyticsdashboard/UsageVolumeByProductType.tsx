import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./UsageVolumeByProductType.css";

type Point = {
  time: string;
  productA: number; // light line
  productB: number; // dark line
};

type Props = {
  title?: string;
  updatedText?: string;
  data?: Point[];
  heightPx?: number; // card chart height area
};

const sampleData: Point[] = [
  { time: "09:00", productA: 4_000_000, productB: 14_000_000 },
  { time: "10:00", productA: 12_000_000, productB: 8_000_000 },
  { time: "11:00", productA: 18_000_000, productB: 5_500_000 },
  { time: "12:00", productA: 21_000_000, productB: 4_800_000 },
  { time: "13:00", productA: 20_500_000, productB: 5_800_000 },
  { time: "14:00", productA: 15_000_000, productB: 9_000_000 },
  { time: "15:00", productA: 11_000_000, productB: 13_000_000 },
];

function formatMillions(v: number) {
  if (v === 0) return "0";
  return `${Math.round(v / 1_000_000)}M`;
}

function UsageTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const a = payload.find((p: any) => p.dataKey === "productA");
  const b = payload.find((p: any) => p.dataKey === "productB");

  return (
    <div className="uvpt-tt">
      <div className="uvpt-ttTitle">{label}</div>

      <div className="uvpt-ttRow">
        <span className="uvpt-ttKey">
          <span className="uvpt-ttDot uvpt-dotA" />
          Product A
        </span>
        <span className="uvpt-ttVal">{formatMillions(a?.value ?? 0)}</span>
      </div>

      <div className="uvpt-ttRow">
        <span className="uvpt-ttKey">
          <span className="uvpt-ttDot uvpt-dotB" />
          Product B
        </span>
        <span className="uvpt-ttVal">{formatMillions(b?.value ?? 0)}</span>
      </div>
    </div>
  );
}

export default function UsageVolumeByProductType({
  title = "Usage volume by product & type",
  updatedText = "Updated 3 mins ago",
  data = sampleData,
  heightPx = 300,
}: Props) {
  return (
    <Card className="uvpt-card">
      <Flex justifyContent="between" alignItems="start" className="uvpt-head">
        <Text className="uvpt-title">{title}</Text>
        <Text className="uvpt-updated">{updatedText}</Text>
      </Flex>

      <div className="uvpt-chartWrap" style={{ height: heightPx }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 6, right: 6, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id="uvptFillA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--uvpt-lineA)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--uvpt-lineA)" stopOpacity={0} />
              </linearGradient>

              <linearGradient id="uvptFillB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--uvpt-lineB)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--uvpt-lineB)" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(16, 24, 40, 0.06)"
            />

            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--uvpt-axis)" }}
              dy={10}
            />

            <YAxis
              domain={[0, 30_000_000]}
              ticks={[0, 10_000_000, 20_000_000, 30_000_000]}
              tickFormatter={formatMillions}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--uvpt-axis)" }}
              width={40}
            />

            <Tooltip content={<UsageTooltip />} cursor={false} />

            {/* Light line */}
            <Area
              type="monotone"
              dataKey="productA"
              stroke="var(--uvpt-lineA)"
              strokeWidth={2.5}
              fill="url(#uvptFillA)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4 }}
            />

            {/* Dark line */}
            <Area
              type="monotone"
              dataKey="productB"
              stroke="var(--uvpt-lineB)"
              strokeWidth={2.5}
              fill="url(#uvptFillB)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
