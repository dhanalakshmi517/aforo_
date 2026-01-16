import * as React from "react";
import "./QuickbooksIntegration.css";

// Use your existing top bar
import QBBar from "./QBBar";
import TertiaryButton from "../../componenetsss/TertiaryButton";

type Props = {
  inSyncCount?: number;
  outOfSyncCount?: number;

  onBack?: () => void;
  onManageConnection?: () => void;

  /**
   * Optional: call backend to start sync.
   * If omitted, UI will simulate progress.
   */
  onSyncStart?: () => Promise<void> | void;
};

type SyncState = "idle" | "syncing" | "done";

export default function QuickbooksIntegration({
  inSyncCount = 18,
  outOfSyncCount = 24,
  onBack,
  onManageConnection,
  onSyncStart,
}: Props) {
  const [syncState, setSyncState] = React.useState<SyncState>("idle");
  const [progress, setProgress] = React.useState<number>(8);
  const [etaText, setEtaText] = React.useState<string>("2m left");

  React.useEffect(() => {
    if (syncState !== "syncing") return;

    // Simulated progress (replace with real polling if you have a job id)
    const totalMs = 2 * 60 * 1000; // 2 min
    const startedAt = Date.now();

    const t = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const pct = Math.min(100, Math.max(8, Math.round((elapsed / totalMs) * 100)));

      setProgress(pct);
      setEtaText(formatRemaining(Math.max(0, totalMs - elapsed)));

      if (elapsed >= totalMs) {
        window.clearInterval(t);
        setEtaText("Done");
        setSyncState("done");
      }
    }, 350);

    return () => window.clearInterval(t);
  }, [syncState]);

  const handleSync = async () => {
    if (syncState === "syncing") return;

    setProgress(8);
    setEtaText("2m left");
    setSyncState("syncing");

    try {
      await onSyncStart?.();
    } catch {
      // If backend fails, revert UI (keep it simple)
      setSyncState("idle");
    }
  };

  return (
    <div className="qbi-page">
      <div className="qbi-topbar">
        <QBBar
          title="Quickbooks Integration"
          onBack={onBack}
        />
      </div>

      <div className="qbi-shell">
        <div className="qbi-panel">
          <div className="qbi-title">Aforo-Quickbooks Customer Sync Status</div>

          <div className="qbi-body">
            <div className="qbi-cards">
              <StatCard
                title="Customers In Sync"
                value={inSyncCount}
                helper="Your recently created customers have been synced successfully."
                watermark={<RefreshWatermark />}
              />
              <StatCard
                title="Customers Out of Sync"
                value={outOfSyncCount}
                helper="Customers failed to sync because earlier ones aren't synced yet."
                watermark={<OutOfSyncWatermark />}
              />
            </div>

            <div className="qbi-spacer" />

            <div className="qbi-bottom">
              {syncState === "syncing" ? (
                <SyncProgressInline value={progress} etaText={etaText} />
              ) : (
                <SyncCta
                  onSync={handleSync}
                  buttonLabel={syncState === "done" ? "Sync Again" : "Sync Data"}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard(props: {
  title: string;
  value: number;
  helper: string;
  watermark: React.ReactNode;
}) {
  return (
    <div className="qbi-card">
      <div className="qbi-cardText">
        <div className="qbi-cardTitle">{props.title}</div>
        <div className="qbi-cardValue">{props.value}</div>
        <div className="qbi-cardHelper">{props.helper}</div>
      </div>

      <div className="qbi-watermark" aria-hidden="true">
        {props.watermark}
      </div>
    </div>
  );
}

function SyncCta({ onSync, buttonLabel }: { onSync: () => void; buttonLabel: string }) {
  return (
    <div className="qbi-cta">
      <div className="qbi-ctaLeft">
        <div className="qbi-plusBox" aria-hidden="true">
          +
        </div>
        <div className="qbi-ctaText">
          <div className="qbi-ctaTitle">Sync your previous data</div>
          <div className="qbi-ctaSub">
            QuickBooks connected. Auto-sync on. Use “Sync Data” to sync your previous data.
          </div>
        </div>
      </div>

      <TertiaryButton onClick={onSync}>
        {buttonLabel}
      </TertiaryButton>
    </div>
  );
}

function SyncProgressInline({ value, etaText }: { value: number; etaText: string }) {
  const clamped = clamp(value, 0, 100);

  return (
    <div className="qbi-progressWrap">
      <div className="qbi-progressLabel">Syncing your previous data...</div>

      <div
        className="qbi-track"
        role="progressbar"
        aria-label="Syncing your previous data"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="qbi-fill" style={{ width: `${clamped}%` }} />
      </div>

      <div className="qbi-progressMeta">
        <span>{Math.round(clamped)}%</span>
        <span>{etaText}</span>
      </div>
    </div>
  );
}

function RefreshWatermark() {
  return (
   <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
  <g filter="url(#filter0_f_13745_88797)">
    <path d="M20 80C20 64.087 26.3214 48.8258 37.5736 37.5736C48.8258 26.3214 64.087 20 80 20C96.7737 20.0631 112.874 26.6082 124.933 38.2667L140 53.3333M140 53.3333V20M140 53.3333H106.667M140 80C140 95.913 133.679 111.174 122.426 122.426C111.174 133.679 95.913 140 80 140C63.2263 139.937 47.1265 133.392 35.0667 121.733L20 106.667M20 106.667H53.3333M20 106.667V140" stroke="url(#paint0_linear_13745_88797)" stroke-opacity="0.5" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <filter id="filter0_f_13745_88797" x="-12" y="-12" width="184" height="184" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="6" result="effect1_foregroundBlur_13745_88797"/>
    </filter>
    <linearGradient id="paint0_linear_13745_88797" x1="35.8571" y1="20" x2="120.307" y2="144.632" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F2F9FD"/>
      <stop offset="0.5" stop-color="#71A7C7"/>
      <stop offset="1" stop-color="#026BB0"/>
    </linearGradient>
  </defs>
</svg>
  );
}

function OutOfSyncWatermark() {
  return (
   <svg xmlns="http://www.w3.org/2000/svg" width="174" height="174" viewBox="0 0 174 174" fill="none">
  <g filter="url(#filter0_f_13745_88824)">
    <path d="M146.667 60L131.6 44.9333C119.54 33.2748 103.44 26.7298 86.6667 26.6667C80 26.6667 73.5333 27.7333 67.5333 29.8M146.667 60V26.6667M146.667 60H113.333M60 113.333H26.6667M26.6667 113.333V146.667M26.6667 113.333L41.7333 128.4C53.7931 140.059 69.893 146.604 86.6667 146.667C103.267 146.667 118.267 140 129.067 129.067M26.6667 86.6667C26.6667 70.0667 33.3333 55.0667 44.2667 44.2667M146.667 86.6667C146.667 93.3333 145.6 99.8 143.533 105.8M153.333 153.333L20 20" stroke="url(#paint0_linear_13745_88824)" stroke-opacity="0.5" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <filter id="filter0_f_13745_88824" x="-5.33301" y="-5.3335" width="184" height="184" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="BackgroundImageFix"/>
      <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
      <feGaussianBlur stdDeviation="6" result="effect1_foregroundBlur_13745_88824"/>
    </filter>
    <linearGradient id="paint0_linear_13745_88824" x1="37.6191" y1="20" x2="131.453" y2="158.48" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F2F9FD"/>
      <stop offset="0.5" stop-color="#71A7C7"/>
      <stop offset="1" stop-color="#026BB0"/>
    </linearGradient>
  </defs>
</svg>
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "0s";
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s left`;
  if (r === 0) return `${m}m left`;
  return `${m}m ${r}s left`;
}
