import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import "./ProductsKpiStrip.css";

type Trend = {
  value: string; // "+6.08%"
};

type KpiVariant = "lavender" | "mint" | "sky";

export type ProductKpiItem = {
  id: string;
  title: string;
  value: string;
  trend?: Trend; // optional (only first 3 in your screenshot)
  variant?: KpiVariant;
};

type Props = {
  items?: ProductKpiItem[];
  className?: string;
};

const TrendUpIcon: React.FC = () => (
  <svg
    className="pkpi-trend-icon"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3.2 10.2L6.4 7.0L8.6 9.2L12.8 5.0"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.6 5H12.8V7.2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const defaultItems: ProductKpiItem[] = [
  { id: "total", title: "Total Products", value: "85", trend: { value: "+6.08%" }, variant: "lavender" },
  { id: "active", title: "Active Products", value: "85", trend: { value: "+6.08%" }, variant: "mint" },
  { id: "inactive", title: "Inactive Products", value: "40", trend: { value: "+6.08%" }, variant: "sky" },
  { id: "mostSold", title: "Most Sold Product", value: "Microsoft Drive Pro", variant: "lavender" },
  { id: "highestRev", title: "Highest Revenue Product", value: "Box Drive Pro", variant: "lavender" },
];

const ProductsKpiStrip: React.FC<Props> = ({ items = defaultItems, className = "" }) => {
  return (
    <div className={`pkpi-row ${className}`.trim()} role="list" aria-label="Product KPIs">
      {items.map((it) => (
        <Card
          key={it.id}
          className={`pkpi-card v-${it.variant || "lavender"}`}
        >
          <Flex justifyContent="between" alignItems="start" className="pkpi-top">
            <Text className="pkpi-title">{it.title}</Text>

            {it.trend ? (
              <div className="pkpi-trend" aria-label={`Trend ${it.trend.value}`}>
                <span className="pkpi-trend-value">{it.trend.value}</span>
                <TrendUpIcon />
              </div>
            ) : (
              <span className="pkpi-trend-spacer" />
            )}
          </Flex>

          <div className={`pkpi-value ${it.value.length > 8 ? "is-text" : ""}`}>
            {it.value}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ProductsKpiStrip;
