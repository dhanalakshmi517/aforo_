import * as React from "react";
import { Card, Flex, Text, LineChart } from "@tremor/react";
import "./RepeatBuyersAndGrowth.css";

type Band = "green" | "purple" | "blue" | "sky";

type BarRow = {
  label: string;
  value: number; // in millions
  max: number;   // in millions (110)
  band: Band;
};

const formatM = (n: number) => (n === 0 ? "0" : `${n}M`);

const Axis: React.FC<{ max: number; ticks: number[] }> = ({ max, ticks }) => {
  return (
    <div className="rbg-axis">
      {ticks.map((t) => (
        <div
          key={t}
          className="rbg-axis-tick"
          style={{ left: `${(t / max) * 100}%` }}
        >
          {formatM(t)}
        </div>
      ))}
    </div>
  );
};

const RepeatBuyersCard: React.FC<{
  title: string;
  updatedText?: string;
  rows: BarRow[];
}> = ({ title, updatedText = "Updated 3 mins ago", rows }) => {
  const max = rows[0]?.max ?? 110;
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

  return (
    <Card className="rbg-card">
      <Flex justifyContent="between" alignItems="start" className="rbg-head">
        <Text className="rbg-title">{title}</Text>
        <Text className="rbg-updated">{updatedText}</Text>
      </Flex>

      <div className="rbg-bars">
        {rows.map((r) => {
          const pct = Math.max(0, Math.min(100, (r.value / r.max) * 100));
          return (
            <div key={r.label} className="rbg-row">
              <div className="rbg-label">{r.label}</div>
              <div className="rbg-track">
                <div className={`rbg-fill is-${r.band}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <Axis max={max} ticks={ticks} />
    </Card>
  );
};

type GrowthPoint = {
  month: string;
  Growth: number;
  date?: string; // for tooltip
};

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0]?.payload as GrowthPoint;
  const v = payload[0]?.value as number;

  return (
    <div className="rbg-tooltip">
      <div className="rbg-tooltip-date">{p?.date ?? p?.month}</div>
      <div className="rbg-tooltip-val">{v}%</div>
      <div className="rbg-tooltip-dot" />
    </div>
  );
};

const ProductGrowthCard: React.FC<{ title: string; data: GrowthPoint[] }> = ({
  title,
  data,
}) => {
  return (
    <Card className="rbg-card">
      <Flex justifyContent="between" alignItems="start" className="rbg-head">
        <Text className="rbg-title">{title}</Text>
        <span className="rbg-kebab" aria-hidden="true" />
      </Flex>

      <div className="rbg-chart">
        <LineChart
          data={data}
          index="month"
          categories={["Growth"]}
          showLegend={false}
          showGridLines={true}
          showXAxis={true}
          showYAxis={true}
          yAxisWidth={30}
          minValue={0}
          maxValue={100}
          curveType="natural"
          valueFormatter={(v) => `${v}%`}
          customTooltip={CustomTooltip}
        />
      </div>
    </Card>
  );
};

const RepeatBuyersAndGrowth: React.FC = () => {
  const repeatBuyersRows: BarRow[] = [
    { label: "Drive 34", value: 98, max: 110, band: "green" },
    { label: "Product 2", value: 86, max: 110, band: "purple" },
    { label: "Prod 2", value: 80, max: 110, band: "blue" },
    { label: "Prox 5", value: 74, max: 110, band: "sky" },
  ];

  const growthData: GrowthPoint[] = [
    { month: "Jan", Growth: 40, date: "Jan 10, 2025" },
    { month: "Feb", Growth: 62, date: "Feb 10, 2025" },
    { month: "Mar", Growth: 66, date: "Mar 10, 2025" },
    { month: "Apr", Growth: 53, date: "Apr 10, 2025" }, // your tooltip point (53%)
    { month: "May", Growth: 49, date: "May 10, 2025" },
    { month: "Jun", Growth: 60, date: "Jun 10, 2025" },
    { month: "Jul", Growth: 84, date: "Jul 10, 2025" },
  ];

  return (
    <div className="rbg-grid">
      <RepeatBuyersCard title="Repeat Buyers per Product" rows={repeatBuyersRows} />
      <ProductGrowthCard title="Product Growth" data={growthData} />
    </div>
  );
};

export default RepeatBuyersAndGrowth;
