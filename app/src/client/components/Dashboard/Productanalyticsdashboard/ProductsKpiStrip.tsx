import * as React from "react";
import { Card, Text } from "@tremor/react";
import "./ProductsKpiStrip.css";

type KpiTone = "lavender" | "mint" | "ice";

export type ProductKpi = {
  id: string;
  title: string;
  value: string | number;
  /** optional delta like "+6.08%" */
  deltaText?: string;
  /** show the green rising arrow */
  showTrend?: boolean;
  /** background tone */
  tone?: KpiTone;
  /** for cards like “Most Sold Product” */
  subtitle?: string;
};

type Props = {
  items?: ProductKpi[];
  className?: string;
};

function TrendIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M12 5.25H16.5M16.5 5.25V9.75M16.5 5.25L10.125 11.625L6.375 7.875L1.5 12.75"
        stroke="#6AB349"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const sample: ProductKpi[] = [
  { id: "total", title: "Total Products", value: 85, deltaText: "+6.08%", showTrend: true, tone: "lavender" },
  { id: "active", title: "Active Products", value: 85, deltaText: "+6.08%", showTrend: true, tone: "mint" },
  { id: "inactive", title: "Inactive Products", value: 40, deltaText: "+6.08%", showTrend: true, tone: "ice" },
  { id: "most", title: "Most Sold Product", value: "Microsoft Drive Pro", tone: "lavender" },
  { id: "highest", title: "Highest Revenue Product", value: "Box Drive Pro", tone: "lavender" },
];

function toneClass(tone?: KpiTone) {
  if (tone === "mint") return "pks-card pks-mint";
  if (tone === "ice") return "pks-card pks-ice";
  return "pks-card pks-lavender";
}

export default function ProductKpiStrip({ items = sample, className = "" }: Props) {
  return (
    <div className={`pks-wrap ${className}`}>
      {items.map((kpi) => {
        const isNumeric = typeof kpi.value === "number" || /^[0-9]+$/.test(String(kpi.value));
        return (
          <Card key={kpi.id} className={toneClass(kpi.tone)}>
            <div className="pks-top">
              <Text className="pks-title">{kpi.title}</Text>

              {kpi.deltaText ? (
                <div className="pks-delta">
                  <span className="pks-deltaText">{kpi.deltaText}</span>
                  {kpi.showTrend ? <TrendIcon /> : null}
                </div>
              ) : (
                <div />
              )}
            </div>

            <div className={`pks-value ${isNumeric ? "pks-valueNum" : "pks-valueText"}`}>
              {kpi.value}
            </div>

            {kpi.subtitle ? <div className="pks-sub">{kpi.subtitle}</div> : null}
          </Card>
        );
      })}
    </div>
  );
}
