import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import "./RevenueBarsTwinCards.css";

type Band = "green" | "purple" | "blue" | "sky";

type BarRow = {
  label: string;
  value: number; // in millions
  max: number;   // in millions (110)
  band: Band;
};

type CardProps = {
  title: string;
  updatedText?: string;
  rows: BarRow[];
};

const formatM = (n: number) => (n === 0 ? "0" : `${n}M`);

const Axis: React.FC<{ max: number; ticks: number[] }> = ({ max, ticks }) => {
  return (
    <div className="rbtc-axis">
      {ticks.map((t) => (
        <div
          key={t}
          className="rbtc-axis-tick"
          style={{ left: `${(t / max) * 100}%` }}
        >
          {formatM(t)}
        </div>
      ))}
    </div>
  );
};

const RevenueBarCard: React.FC<CardProps> = ({ title, updatedText = "Updated 3 mins ago", rows }) => {
  const max = rows[0]?.max ?? 110;
  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];

  return (
    <Card className="rbtc-card">
      <Flex justifyContent="between" alignItems="start" className="rbtc-head">
        <Text className="rbtc-title">{title}</Text>
        <Text className="rbtc-updated">{updatedText}</Text>
      </Flex>

      <div className="rbtc-bars">
        {rows.map((r) => {
          const pct = Math.max(0, Math.min(100, (r.value / r.max) * 100));
          return (
            <div key={r.label} className="rbtc-row">
              <div className="rbtc-label">{r.label}</div>

              <div className="rbtc-track">
                <div className={`rbtc-fill is-${r.band}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <Axis max={max} ticks={ticks} />
    </Card>
  );
};

const RevenueBarsTwinCards: React.FC = () => {
  const leftRows: BarRow[] = [
    { label: "Drive 34", value: 98, max: 110, band: "green" },
    { label: "Product 2", value: 84, max: 110, band: "purple" },
    { label: "Prod 2", value: 79, max: 110, band: "blue" },
    { label: "Prox 5", value: 75, max: 110, band: "sky" },
  ];

  const rightRows: BarRow[] = [
    { label: "API Calls", value: 100, max: 110, band: "green" },
    { label: "GB", value: 85, max: 110, band: "purple" },
    { label: "Tokens", value: 81, max: 110, band: "blue" },
    { label: "Support Hrs", value: 74, max: 110, band: "sky" },
  ];

  return (
    <div className="rbtc-grid">
      <RevenueBarCard title="Revenue By Product" rows={leftRows} />
      <RevenueBarCard title="Revenue per Unit" rows={rightRows} />
    </div>
  );
};

export default RevenueBarsTwinCards;
