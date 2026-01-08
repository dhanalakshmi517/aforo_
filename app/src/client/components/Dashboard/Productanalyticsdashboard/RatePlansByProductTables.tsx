import * as React from "react";
import { Card, Flex, Text } from "@tremor/react";
import MiniScrollbar from "../../componenetsss/MiniScrollbar";
import "./RatePlansByProductTables.css";

type Trend = "up" | "down";

export type RatePlanRow = {
  id: string;
  name: string;
  ratePlan: string;
  rateText: string; // "+20.08%" / "-6.08%"
  trend: Trend;
};

type TableCardProps = {
  tone: "green" | "red";
  title: string;
  emoji?: string; // you said you'll replace later
  rows: RatePlanRow[];
};

type Props = {
  leftTitle?: string;
  rightTitle?: string;
  leftEmoji?: string;
  rightEmoji?: string;

  leftRows?: RatePlanRow[];
  rightRows?: RatePlanRow[];

  /** matches your frame: W 100% ~653px, H fixed ~302px */
  heightPx?: number; // default 302
  gapPx?: number; // default 20
};

const upSvg = (
 <svg xmlns="http://www.w3.org/2000/svg" width="17" height="9" viewBox="0 0 17 9" fill="none">
  <path d="M11.1748 0.674805H15.6748M15.6748 0.674805V5.1748M15.6748 0.674805L9.2998 7.0498L5.5498 3.2998L0.674805 8.1748" stroke="#6AB349" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

const userSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M8.75 13.41V15.036C8.74622 15.3786 8.65448 15.7145 8.48358 16.0115C8.31268 16.3085 8.06834 16.5566 7.774 16.732C7.14914 17.1948 6.64084 17.797 6.28948 18.4907C5.93813 19.1843 5.75341 19.9504 5.75 20.728M12.75 13.41V15.036C12.7538 15.3786 12.8455 15.7145 13.0164 16.0115C13.1873 16.3085 13.4317 16.5566 13.726 16.732C14.3509 17.1948 14.8592 17.797 15.2105 18.4907C15.5619 19.1843 15.7466 19.9504 15.75 20.728M16.75 7.75H18.25C18.913 7.75 19.5489 7.48661 20.0178 7.01777C20.4866 6.54893 20.75 5.91304 20.75 5.25C20.75 4.58696 20.4866 3.95107 20.0178 3.48223C19.5489 3.01339 18.913 2.75 18.25 2.75H16.75M16.75 7.75C16.75 9.3413 16.1179 10.8674 14.9926 11.9926C13.8674 13.1179 12.3413 13.75 10.75 13.75C9.1587 13.75 7.63258 13.1179 6.50736 11.9926C5.38214 10.8674 4.75 9.3413 4.75 7.75M16.75 7.75V1.75C16.75 1.48478 16.6446 1.23043 16.4571 1.04289C16.2696 0.855357 16.0152 0.75 15.75 0.75H5.75C5.48478 0.75 5.23043 0.855357 5.04289 1.04289C4.85536 1.23043 4.75 1.48478 4.75 1.75V7.75M2.75 20.75H18.75M4.75 7.75H3.25C2.58696 7.75 1.95107 7.48661 1.48223 7.01777C1.01339 6.54893 0.75 5.91304 0.75 5.25C0.75 4.58696 1.01339 3.95107 1.48223 3.48223C1.95107 3.01339 2.58696 2.75 3.25 2.75H4.75" stroke="#389315" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

const downSvg = (
 <svg xmlns="http://www.w3.org/2000/svg" width="17" height="9" viewBox="0 0 17 9" fill="none">
  <path d="M11.1748 8.1748H15.6748M15.6748 8.1748V3.6748M15.6748 8.1748L9.2998 1.79981L5.5498 5.5498L0.674805 0.674805" stroke="#ED5142" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

const warningSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22 20" fill="none">
    <path d="M10.768 6.7639V10.7639M10.768 14.7639H10.778M20.498 15.7639L12.498 1.7639C12.3236 1.4561 12.0706 1.20008 11.7649 1.02197C11.4592 0.843846 11.1118 0.75 10.758 0.75C10.4042 0.75 10.0568 0.843846 9.75107 1.02197C9.44539 1.20008 9.19243 1.4561 9.018 1.7639L1.018 15.7639C0.841678 16.0693 0.749224 16.4158 0.750005 16.7684C0.750786 17.121 0.844774 17.4671 1.02244 17.7717C1.20011 18.0763 1.45514 18.3285 1.76169 18.5027C2.06824 18.677 2.4154 18.7671 2.768 18.7639H18.768C19.1189 18.7635 19.4635 18.6709 19.7673 18.4952C20.071 18.3195 20.3232 18.067 20.4985 17.763C20.6738 17.459 20.766 17.1143 20.7659 16.7634C20.7659 16.4125 20.6734 16.0678 20.498 15.7639Z" stroke="#C29017" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

const sampleActive: RatePlanRow[] = [
  { id: "a1", name: "Product", ratePlan: "Rate Plan", rateText: "+20.08%", trend: "up" },
  { id: "a2", name: "Product", ratePlan: "Rate Plan", rateText: "+13.08%", trend: "up" },
  { id: "a3", name: "Produc", ratePlan: "Rate Plan", rateText: "+11.08%", trend: "up" },
  { id: "a4", name: "Product", ratePlan: "Rate Plan", rateText: "+6.08%", trend: "up" },
];

const sampleCancelled: RatePlanRow[] = [
  { id: "c1", name: "Product", ratePlan: "Rate Plan", rateText: "-6.08%", trend: "down" },
  { id: "c2", name: "Product", ratePlan: "Rate Plan", rateText: "-6.08%", trend: "down" },
  { id: "c3", name: "Produc", ratePlan: "Rate Plan", rateText: "-6.08%", trend: "down" },
  { id: "c4", name: "Product", ratePlan: "Rate Plan", rateText: "-6.08%", trend: "down" },
];

function ToneBadge({ tone, emoji = "✨" }: { tone: "green" | "red"; emoji?: string }) {
  return (
    <div className={`rpt-badge ${tone === "green" ? "rpt-badgeGreen" : "rpt-badgeRed"}`}>
      {tone === "green" ? (
        <div className="rpt-badgeSvg">{userSvg}</div>
      ) : (
        <div className="rpt-badgeSvg">{warningSvg}</div>
      )}
    </div>
  );
}

function TableCard({ tone, title, emoji, rows }: TableCardProps) {
  const bodyRef = React.useRef<HTMLDivElement>(null);

  return (
    <Card className="rpt-card">
      <div className="rpt-titleRow">
        <ToneBadge tone={tone} emoji={emoji} />
        <Text className="rpt-title">{title}</Text>
      </div>

      <div className="rpt-tableWrap">
        <div className="rpt-head">
          <div className="rpt-hCell rpt-colName">Name</div>
          <div className="rpt-hCell rpt-colPlan">Rate Plan</div>
          <div className="rpt-hCell rpt-colRate">Rate</div>
        </div>

        <div className="rpt-body" ref={bodyRef}>
          {rows.map((r) => {
            const isUp = r.trend === "up";
            return (
              <div key={r.id} className="rpt-row">
                <div className="rpt-cell rpt-colName">{r.name}</div>
                <div className="rpt-cell rpt-colPlan">{r.ratePlan}</div>

                <div className="rpt-cell rpt-colRate">
                  <span className={`rpt-rate ${isUp ? "rpt-up" : "rpt-down"}`}>{r.rateText}</span>
                  <span className="rpt-icon">{isUp ? upSvg : downSvg}</span>
                </div>
              </div>
            );
          })}
        </div>
        <MiniScrollbar containerRef={bodyRef} side="right" inset={8} />
      </div>
    </Card>
  );
}

export default function RatePlansByProductTables({
  leftTitle = "Active Rate Plans per Product",
  rightTitle = "Cancelled Rate Plns per Product",
  leftEmoji = "＋",
  rightEmoji = "✖",

  leftRows,
  rightRows,

  heightPx = 302,
  gapPx = 20,
}: Props) {
  const L = leftRows ?? sampleActive;
  const R = rightRows ?? sampleCancelled;

  return (
    <div className="rpt-grid" style={{ gap: gapPx }}>
      <div className="rpt-col" style={{ height: heightPx }}>
        <TableCard tone="green" title={leftTitle} emoji={leftEmoji} rows={L} />
      </div>

      <div className="rpt-col" style={{ height: heightPx }}>
        <TableCard tone="red" title={rightTitle} emoji={rightEmoji} rows={R} />
      </div>
    </div>
  );
}
