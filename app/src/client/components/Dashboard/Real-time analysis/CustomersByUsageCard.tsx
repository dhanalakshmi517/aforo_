import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import "./CustomersByUsageCard.css";

type UsageRow = {
  customerName: string;        // tooltip uses this
  uomLabel?: string;           // shown at left (default: "API Calls")
  values: number[];            // one value per time column
};

type UpdateItem = {
  type: "success" | "info" | "danger" | "neutral";
  title: string;
  headline: string;
  subline: string;
  timeAgo: string;
};

type Props = {
  titleLeft?: string;
  titleRight?: string;
  updatedText?: string;

  times?: string[];
  rows?: UsageRow[];

  updates?: UpdateItem[];
};

type Bucket = "low" | "medium" | "high";

type TooltipState = {
  open: boolean;
  x: number; // px within heatmap area
  y: number; // px within heatmap area
  time: string;
  customerName: string;
  value: number;
  bucket: Bucket;
};

const formatExact = (n: number) => new Intl.NumberFormat().format(n);

const getBucket = (v: number): Bucket => {
  if (v <= 1000) return "low";
  if (v <= 10000) return "medium";
  return "high";
};

const bucketText: Record<Bucket, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const defaultTimes = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
];

const defaultRows: UsageRow[] = [
  { customerName: "ABC Company Ltd", uomLabel: "API Calls", values: [800, 1200, 2200, 900, 1100, 7800, 2400, 1900, 8200, 9000, 10200, 7600, 3200] },
  { customerName: "Rahul Ltd",       uomLabel: "API Calls", values: [600, 900, 1400, 1000, 1800, 2600, 3100, 2900, 5200, 6100, 7400, 8800, 9300] },
  { customerName: "Drive 34",        uomLabel: "API Calls", values: [900, 1300, 1600, 2500, 3200, 4000, 9800, 5200, 4100, 2300, 1900, 2600, 7200] },
  { customerName: "Prod 2",          uomLabel: "API Calls", values: [500, 700, 900, 1200, 3500, 4200, 6100, 8300, 9100, 10400, 11900, 13100, 14500] },
  { customerName: "Prox 5",          uomLabel: "API Calls", values: [450, 800, 1200, 1600, 2100, 2800, 3300, 4100, 5200, 7400, 9800, 12000, 15000] },
  { customerName: "Microsoft Drive", uomLabel: "API Calls", values: [650, 900, 1400, 2000, 2600, 3200, 3800, 5200, 7000, 9000, 10100, 12000, 13500] },
  { customerName: "Box Drive Pro",   uomLabel: "API Calls", values: [700, 1100, 1700, 2300, 2900, 3500, 4200, 6000, 8000, 9800, 11200, 12800, 14300] },
  { customerName: "Kong Sandbox",    uomLabel: "API Calls", values: [420, 700, 1000, 1400, 1900, 2600, 3400, 5200, 7600, 9400, 11200, 13000, 15500] },
];

const defaultUpdates: UpdateItem[] = [
  { type: "success", title: "Payment Received", headline: "₹499 • Pro Plan - UPI", subline: "ABC Company Ltd", timeAgo: "2 sec ago" },
  { type: "info",    title: "New Signup",       headline: "Free Trial Started",    subline: "ABC Company Ltd", timeAgo: "2 sec ago" },
  { type: "danger",  title: "Payment Failed",   headline: "₹1,299 • Card Declined",subline: "ABC Company Ltd", timeAgo: "2 sec ago" },
  { type: "success", title: "Plan Upgraded",    headline: "Basic → Pro",            subline: "Rahul Ltd",       timeAgo: "2 sec ago" },
  { type: "success", title: "Plan Upgraded",    headline: "Basic → Pro",            subline: "Rahul Ltd",       timeAgo: "2 sec ago" },
];

const CustomersByUsageCard: React.FC<Props> = ({
  titleLeft = "Customers by Usage",
  titleRight = "Real-time updates",
  updatedText = "Updated 3 mins ago",
  times = defaultTimes,
  rows = defaultRows,
  updates = defaultUpdates,
}) => {
  const heatmapRef = React.useRef<HTMLDivElement>(null);

  const [tooltip, setTooltip] = React.useState<TooltipState>({
    open: false,
    x: 0,
    y: 0,
    time: "",
    customerName: "",
    value: 0,
    bucket: "low",
  });

  const closeTooltip = React.useCallback(() => {
    setTooltip((t) => ({ ...t, open: false }));
  }, []);

  const openTooltip = React.useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      customerName: string,
      time: string,
      value: number
    ) => {
      const host = heatmapRef.current;
      if (!host) return;

      const hostRect = host.getBoundingClientRect();
      const cellRect = e.currentTarget.getBoundingClientRect();

      // anchor tooltip center above the cell
      let x = cellRect.left - hostRect.left + cellRect.width / 2;
      let y = cellRect.top - hostRect.top;

      // prevent "top cut" (simple clamp)
      y = Math.max(86, y);

      setTooltip({
        open: true,
        x,
        y,
        time,
        customerName,
        value,
        bucket: getBucket(value),
      });
    },
    []
  );

  const legend = [
    { key: "low" as const, label: "Low (≤1000)" },
    { key: "medium" as const, label: "Medium (1005 - 10000)" },
    { key: "high" as const, label: "High (>10000)" },
  ];

  return (
    <div className="cbu-grid">
      {/* LEFT: Tremor card */}
      <Card className="cbu-left-card">
        <Flex justifyContent="between" alignItems="start" className="cbu-head">
          <Text className="cbu-title">{titleLeft}</Text>
          <Text className="cbu-updated">{updatedText}</Text>
        </Flex>

        <div
          ref={heatmapRef}
          className="cbu-heatmapWrap"
          onMouseLeave={closeTooltip}
        >
          <div
            className="cbu-heatmap"
            style={{ ["--cbu-cols" as any]: times.length } as React.CSSProperties}
            role="grid"
            aria-label="Customers by usage heatmap (API Calls)"
          >
            {rows.map((r, rIdx) => (
              <React.Fragment key={`${r.customerName}-${rIdx}`}>
                <div className="cbu-yLabel">{r.uomLabel ?? "API Calls"}</div>

                {times.map((t, cIdx) => {
                  const value = r.values[cIdx] ?? 0;
                  const bucket = getBucket(value);

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      className={`cbu-cell is-${bucket}`}
                      role="gridcell"
                      aria-label={`${r.customerName} • API Calls at ${t}: ${value} (${bucketText[bucket]})`}
                      onMouseEnter={(e) => openTooltip(e, r.customerName, t, value)}
                      onFocus={(e) => openTooltip(e as any, r.customerName, t, value)}
                      onBlur={closeTooltip}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip.open && (
            <div
              className="cbu-tooltip"
              style={{ left: tooltip.x, top: tooltip.y }}
              role="status"
              aria-live="polite"
            >
              <div className="cbu-tooltip-title">{tooltip.time}</div>

              <div className="cbu-tooltip-customer">{tooltip.customerName}</div>

              <div className="cbu-tooltip-metric">
                API Calls: <span>{formatExact(tooltip.value)}</span>
              </div>

              <div className={`cbu-bucket is-${tooltip.bucket}`}>
                {bucketText[tooltip.bucket]}
              </div>
            </div>
          )}
        </div>

        {/* X axis */}
        <div className="cbu-xAxis">
          <div className="cbu-xAxisSpacer" />
          <div
            className="cbu-xTicks"
            style={{ ["--cbu-cols" as any]: times.length } as any}
          >
            {times.map((t) => (
              <div key={t} className="cbu-xTick">
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="cbu-legend">
          {legend.map((l) => (
            <div key={l.key} className="cbu-legendItem">
              <span className={`cbu-legendDot is-${l.key}`} />
              <span className="cbu-legendText">{l.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* RIGHT: normal CSS card */}
      <div className="cbu-right-card">
        <div className="cbu-right-head">
          <div className="cbu-right-title">{titleRight}</div>
          <div className="cbu-right-updated">{updatedText}</div>
        </div>

        <div className="cbu-updatesList">
          {updates.map((u, idx) => (
            <div key={idx} className={`cbu-updateItem is-${u.type}`}>
              <div className="cbu-updateTop">
                <div className="cbu-updateTitle">{u.title}</div>
                <div className="cbu-updateTime">{u.timeAgo}</div>
              </div>

              <div className="cbu-updateHeadline">{u.headline}</div>
              <div className="cbu-updateSub">{u.subline}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomersByUsageCard;
