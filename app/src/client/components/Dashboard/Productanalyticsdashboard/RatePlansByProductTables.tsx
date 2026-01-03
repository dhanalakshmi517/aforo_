import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import "./RatePlansByProductTables.css";

type TrendDirection = "up" | "down";

export type RatePlanRow = {
  name: string;
  ratePlan: string;
  rateText: string;       // "+20.08%" or "-6.08%"
  direction: TrendDirection;
};

type TableCardProps = {
  tone: "active" | "cancelled";
  title: string;
  rows: RatePlanRow[];
};

const TrendArrow: React.FC<{ direction: TrendDirection }> = ({ direction }) => {
  if (direction === "up") {
    return (
      <svg
        className="rpt-arrow is-up"
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 8.5L8.2 3.3M8.2 3.3H4.7M8.2 3.3V6.8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      className="rpt-arrow is-down"
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3.5L8.2 8.7M8.2 8.7H4.7M8.2 8.7V5.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const TableCard: React.FC<TableCardProps> = ({ tone, title, rows }) => {
  return (
    <Card className="rpt-card">
      <Flex alignItems="center" className="rpt-card-head">
        <div className={`rpt-icon ${tone === "active" ? "is-active" : "is-cancelled"}`}>
          {tone === "active" ? (
            <span className="rpt-plus" aria-hidden="true">+</span>
          ) : null}
        </div>
        <Text className="rpt-title">{title}</Text>
      </Flex>

      <div className="rpt-table-wrap">
        <table className="rpt-table" role="table" aria-label={title}>
          <thead>
            <tr>
              <th className="rpt-th">Name</th>
              <th className="rpt-th">Rate Plan</th>
              <th className="rpt-th rpt-th-right">Rate</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, idx) => (
              <tr key={`${r.name}-${idx}`} className="rpt-tr">
                <td className="rpt-td">{r.name}</td>
                <td className="rpt-td">{r.ratePlan}</td>
                <td className="rpt-td rpt-td-right">
                  <span className={`rpt-rate ${r.direction === "up" ? "is-up" : "is-down"}`}>
                    {r.rateText}
                    <TrendArrow direction={r.direction} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const RatePlansByProductTables: React.FC = () => {
  const activeRows: RatePlanRow[] = [
    { name: "Product", ratePlan: "Rate Plan", rateText: "+20.08%", direction: "up" },
    { name: "Product", ratePlan: "Rate Plan", rateText: "+13.08%", direction: "up" },
    { name: "Product", ratePlan: "Rate Plan", rateText: "+11.08%", direction: "up" },
    { name: "Product", ratePlan: "Rate Plan", rateText: "+6.08%", direction: "up" },
  ];

  const cancelledRows: RatePlanRow[] = [
    { name: "Product", ratePlan: "Rate Plan", rateText: "-6.08%", direction: "down" },
    { name: "Product", ratePlan: "Rate Plan", rateText: "-6.08%", direction: "down" },
    { name: "Product", ratePlan: "Rate Plan", rateText: "-6.08%", direction: "down" },
    { name: "Product", ratePlan: "Rate Plan", rateText: "-6.08%", direction: "down" },
  ];

  return (
    <div className="rpt-grid">
      <TableCard tone="active" title="Active Rate Plans per Product" rows={activeRows} />
      <TableCard tone="cancelled" title="Cancelled Rate Plns per Product" rows={cancelledRows} />
    </div>
  );
};

export default RatePlansByProductTables;
