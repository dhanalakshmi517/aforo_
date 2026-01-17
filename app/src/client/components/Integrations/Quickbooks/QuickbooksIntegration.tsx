// QickbooksIntegration.tsx
import * as React from "react";
import "./QuickbooksIntegration.css";

import QBConnectionBar from "./QBConnectionBar"; // adjust path

type Props = {
  onBack?: () => void;
};

export default function QickbooksIntegration({ onBack }: Props) {
  const [syncing, setSyncing] = React.useState(false);

  return (
    <div className="qbiqPage">
      <QBConnectionBar
        title="Quickbooks Integration"
        onBack={onBack}
        rightActionLabel="Manage Connection"
        className="qbiqTopbar"
      />

      <main className="qbiqMain">
        <section className="qbiqCard">
          <div className="qbiqInner">
            <h1 className="qbiqH1">Aforo-Quickbooks Customer Sync Status</h1>

            <div className="qbiqStats">
              <div className="qbiqStatCard">
                <div className="qbiqStatLeft">
                  <div className="qbiqStatTitle">Customers In Sync</div>
                  <div className="qbiqStatValue">18</div>
                  <div className="qbiqStatSub">
                    Your recently created customers have been synced successfully.
                  </div>
                </div>
                <div className="qbiqStatIcon" aria-hidden="true">
                  <BigSyncIcon />
                </div>
              </div>

              <div className="qbiqStatCard">
                <div className="qbiqStatLeft">
                  <div className="qbiqStatTitle">Customers Out of Sync</div>
                  <div className="qbiqStatValue">24</div>
                  <div className="qbiqStatSub">
                    Customers failed to sync because earlier ones aren't synced yet.
                  </div>
                </div>
                <div className="qbiqStatIcon" aria-hidden="true">
                  <BigSyncOffIcon />
                </div>
              </div>
            </div>

            {/* ✅ big middle empty area (Auto in Figma) */}
            <div className="qbiqAutoSpace" />

            {/* ✅ Bottom switch (idle vs progress) */}
            {!syncing ? (
              <div className="qbiqBottomCard">
                <div className="qbiqBottomLeft">
                  <div className="qbiqSmallIcon" aria-hidden="true">
                    <SmallSyncIcon />
                  </div>
                  <div className="qbiqBottomCopy">
                    <div className="qbiqBottomTitle">Sync your previous data</div>
                    <div className="qbiqBottomSub">
                      QuickBooks connected. Auto-sync on. Use "Sync Data" to sync your previous data.
                    </div>
                  </div>
                </div>

                <button className="qbiqBtn" type="button" onClick={() => setSyncing(true)}>
                  Sync Data
                </button>
              </div>
            ) : (
              <div className="qbiqProgressCard">
                <div className="qbiqProgressTop">Sycing your previous data...</div>

                <div className="qbiqTrack">
                  <div className="qbiqFill" style={{ width: "12%" }} />
                </div>

                <div className="qbiqMeta">
                  <div>8%</div>
                  <div>2m left</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

/* ------------ Icons (kept minimal & soft like screenshot) ------------ */

function BigSyncIcon() {
  return (
   <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
  <g filter="url(#filter0_f_13758_88904)">
    <path d="M20 80C20 64.087 26.3214 48.8258 37.5736 37.5736C48.8258 26.3214 64.087 20 80 20C96.7737 20.0631 112.874 26.6082 124.933 38.2667L140 53.3333M140 53.3333V20M140 53.3333H106.667M140 80C140 95.913 133.679 111.174 122.426 122.426C111.174 133.679 95.913 140 80 140C63.2263 139.937 47.1265 133.392 35.0667 121.733L20 106.667M20 106.667H53.3333M20 106.667V140" stroke="url(#paint0_linear_13758_88904)" stroke-opacity="0.5" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <filter id="filter0_f_13758_88904" x="-12" y="-12" width="184" height="184" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="6" result="effect1_foregroundBlur_13758_88904"/>
    </filter>
    <linearGradient id="paint0_linear_13758_88904" x1="35.8571" y1="20" x2="120.307" y2="144.632" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F2F9FD"/>
      <stop offset="0.5" stop-color="#71A7C7"/>
      <stop offset="1" stop-color="#026BB0"/>
    </linearGradient>
  </defs>
</svg>
  );
}

function BigSyncOffIcon() {
  return (
   <svg xmlns="http://www.w3.org/2000/svg" width="174" height="174" viewBox="0 0 174 174" fill="none">
  <g filter="url(#filter0_f_13758_88911)">
    <path d="M146.667 60L131.6 44.9333C119.54 33.2748 103.44 26.7298 86.6667 26.6667C80 26.6667 73.5333 27.7333 67.5333 29.8M146.667 60V26.6667M146.667 60H113.333M60 113.333H26.6667M26.6667 113.333V146.667M26.6667 113.333L41.7333 128.4C53.7931 140.059 69.893 146.604 86.6667 146.667C103.267 146.667 118.267 140 129.067 129.067M26.6667 86.6667C26.6667 70.0667 33.3333 55.0667 44.2667 44.2667M146.667 86.6667C146.667 93.3333 145.6 99.8 143.533 105.8M153.333 153.333L20 20" stroke="url(#paint0_linear_13758_88911)" stroke-opacity="0.5" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <filter id="filter0_f_13758_88911" x="-5.33301" y="-5.3335" width="184" height="184" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="6" result="effect1_foregroundBlur_13758_88911"/>
    </filter>
    <linearGradient id="paint0_linear_13758_88911" x1="37.6191" y1="20" x2="131.453" y2="158.48" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F2F9FD"/>
      <stop offset="0.5" stop-color="#71A7C7"/>
      <stop offset="1" stop-color="#026BB0"/>
    </linearGradient>
  </defs>
</svg>
  );
}

function SmallSyncIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M17.5 10C17.5 8.01088 16.7098 6.10322 15.3033 4.6967C13.8968 3.29018 11.9891 2.5 10 2.5C7.90329 2.50789 5.89081 3.32602 4.38333 4.78333L2.5 6.66667M2.5 6.66667V2.5M2.5 6.66667H6.66667M2.5 10C2.5 11.9891 3.29018 13.8968 4.6967 15.3033C6.10322 16.7098 8.01088 17.5 10 17.5C12.0967 17.4921 14.1092 16.674 15.6167 15.2167L17.5 13.3333M17.5 13.3333H13.3333M17.5 13.3333V17.5" stroke="#034A7D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
  );
}
