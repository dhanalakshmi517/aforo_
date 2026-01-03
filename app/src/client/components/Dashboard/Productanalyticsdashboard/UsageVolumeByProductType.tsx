import * as React from "react";
import { Card, Flex, Text, LineChart } from "@tremor/react";
import "./UsageVolumeByProductType.css";

type Point = {
  time: string;           // "09:00"
  "Product A": number;    // in millions
  "Product B": number;    // in millions
};

type Props = {
  title?: string;
  data?: Point[];
  highlightTime?: string;     // e.g. "12:00"
  highlightSeries?: "Product A" | "Product B";
  avatarSrc?: string;         // optional image src
};

const formatMillions = (v: number) => (v === 0 ? "0" : `${Math.round(v)}M`);

const defaultData: Point[] = [
  { time: "09:00", "Product A": 14, "Product B": 4 },
  { time: "10:00", "Product A": 9,  "Product B": 16 },
  { time: "11:00", "Product A": 6,  "Product B": 20 },
  { time: "12:00", "Product A": 5,  "Product B": 21 },
  { time: "13:00", "Product A": 6,  "Product B": 18 },
  { time: "14:00", "Product A": 13, "Product B": 9 },
  { time: "15:00", "Product A": 27, "Product B": 12 },
  { time: "16:00", "Product A": 26, "Product B": 31 },
];

const UsageVolumeByProductType: React.FC<Props> = ({
  title = "Usage volume by product & type",
  data = defaultData,
  highlightTime = "12:00",
  highlightSeries = "Product B",
  avatarSrc,
}) => {
  const idx = Math.max(0, data.findIndex((d) => d.time === highlightTime));
  const safeIdx = idx === -1 ? 0 : idx;

  const maxY = React.useMemo(() => {
    let m = 0;
    for (const d of data) {
      m = Math.max(m, d["Product A"], d["Product B"]);
    }
    // match screenshot scale-ish (cap at 30/32M)
    return Math.max(30, Math.ceil(m / 5) * 5);
  }, [data]);

  const xPct = React.useMemo(() => {
    if (data.length <= 1) return 0;
    return (safeIdx / (data.length - 1)) * 100;
  }, [safeIdx, data.length]);

  const yPct = React.useMemo(() => {
    const v = (data[safeIdx]?.[highlightSeries] ?? 0) as number;
    // 0..100 where 0 is top, 100 bottom
    const t = 1 - Math.max(0, Math.min(1, v / maxY));
    return t * 100;
  }, [data, safeIdx, highlightSeries, maxY]);

  return (
    <Card className="uvpt-card">
      <Flex justifyContent="between" alignItems="start" className="uvpt-head">
        <Text className="uvpt-title">{title}</Text>
      </Flex>

      <div className="uvpt-chartWrap">
        <LineChart
          className="uvpt-chart"
          data={data}
          index="time"
          categories={["Product B", "Product A"]}
          colors={["blue", "indigo"]} // gives one light + one stronger tone (close to screenshot)
          showLegend={false}
          showGridLines={true}
          showXAxis={true}
          showYAxis={true}
          yAxisWidth={34}
          minValue={0}
          maxValue={maxY}
          curveType="natural"
          valueFormatter={formatMillions}
        />

        {/* Floating avatar marker */}
        <div
          className="uvpt-marker"
          style={{ left: `${xPct}%`, top: `${yPct}%` }}
          aria-label={`Highlight at ${highlightTime}`}
        >
          <div className="uvpt-markerRing">
            <div className="uvpt-avatar">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" />
              ) : (
                <span className="uvpt-avatarFallback" aria-hidden="true">👩🏻</span>
              )}
            </div>
          </div>
          <div className="uvpt-markerShadow" />
        </div>
      </div>
    </Card>
  );
};

export default UsageVolumeByProductType;
