import * as React from "react";
import "./MetricStepper.css";

export type StepStatus = "completed" | "current" | "upcoming" | "locked";

export type Step = {
  id: string;
  title: string;
  description?: string;
  status: StepStatus;
};

type Props = {
  steps: Step[];
  /** clicked/selected step (for the “clicked” card state) */
  value?: string | null;
  onChange?: (stepId: string) => void;
  className?: string;
};

export default function MetricStepper({
  steps,
  value = null,
  onChange,
  className = "",
}: Props) {
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  return (
    <div className={`msStepper ${className}`}>
      <ul className="msStepperList">
        {steps.map((s, idx) => {
          const prev = idx > 0 ? steps[idx - 1] : null;
          const isSelected = value === s.id;
          const isHovered = hoveredId === s.id;

          const topLine: "primary" | "muted" =
            idx === 0 ? "muted" : prev?.status === "completed" ? "primary" : "muted";

          const bottomLine: "primary" | "muted" =
            idx === steps.length - 1
              ? "muted"
              : s.status === "completed"
              ? "primary"
              : "muted";

          const clickable = s.status !== "locked";

          // Visual variant = what your 2nd image shows:
          // default -> hover -> active -> clicked(selected)
          const variant =
            s.status === "locked"
              ? "locked"
              : s.status === "completed"
              ? "completed"
              : s.status === "current"
              ? isSelected
                ? "selected"
                : isHovered
                ? "hover"
                : "active"
              : isHovered
              ? "hover"
              : "default";

          return (
            <li className="msStepperItem" key={s.id}>
              <button
                type="button"
                className={`msStepBtn msVar-${variant}`}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId((h) => (h === s.id ? null : h))}
                onClick={() => clickable && onChange?.(s.id)}
                disabled={!clickable}
                aria-current={s.status === "current" ? "step" : undefined}
              >
                <span className="msStepMarker" aria-hidden="true">
                  {idx !== 0 && <span className={`msLine msLineTop msLine-${topLine}`} />}
                  <span className="msDot">
                    <MarkerIcon status={s.status} />
                  </span>
                  {idx !== steps.length - 1 && (
                    <span className={`msLine msLineBottom msLine-${bottomLine}`} />
                  )}
                </span>

                <span className="msStepContent">
                  <span className="msTitle">{s.title}</span>
                  {s.description ? <span className="msDesc">{s.description}</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** --- ICONS (your svgs, made themeable via currentColor) --- */

function MarkerIcon({ status }: { status: StepStatus }) {
  if (status === "completed") return <CompletedIcon />;
  if (status === "locked") return <LockedIcon />;
  if (status === "current") return <PresentActiveIcon />;
  return <UpcomingIcon />;
}

function CompletedIcon() {
  // your "completed" svg
  return (
    <svg className="msIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
      <path
        d="M9.50024 16.6662C9.89077 17.0567 10.5239 17.0567 10.9145 16.6662L18.0341 9.54661C18.4017 9.17902 18.4017 8.58304 18.0341 8.21546C17.6665 7.84787 17.0705 7.84787 16.7029 8.21546L10.9145 14.0039C10.5239 14.3944 9.89077 14.3944 9.50024 14.0039L7.27291 11.7766C6.90533 11.409 6.30935 11.409 5.94176 11.7766C5.57418 12.1442 5.57418 12.7402 5.94176 13.1077L9.50024 16.6662ZM12.0022 24.0001C10.3425 24.0001 8.78242 23.6851 7.32204 23.0552C5.86163 22.4253 4.59129 21.5705 3.51102 20.4907C2.43072 19.4109 1.57549 18.1411 0.945316 16.6813C0.315145 15.2216 6.02322e-05 13.6619 6.02322e-05 12.0022C6.02322e-05 10.3425 0.315009 8.78242 0.944905 7.32204C1.5748 5.86163 2.42965 4.5913 3.50944 3.51102C4.58925 2.43072 5.85903 1.57549 7.31878 0.945317C8.77851 0.315147 10.3382 6.02322e-05 11.9979 6.02322e-05C13.6577 6.02322e-05 15.2177 0.31501 16.6781 0.944906C18.1385 1.5748 19.4088 2.42965 20.4891 3.50944C21.5694 4.58925 22.4246 5.85903 23.0548 7.31879C23.685 8.77852 24.0001 10.3382 24.0001 11.9979C24.0001 13.6577 23.6851 15.2177 23.0552 16.6781C22.4253 18.1385 21.5705 19.4088 20.4907 20.4891C19.4109 21.5694 18.1411 22.4246 16.6813 23.0548C15.2216 23.685 13.6619 24.0001 12.0022 24.0001Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LockedIcon() {
  // your "locked" svg
  return (
    <svg className="msIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
      <path
        d="M10.03 11.895V9.67503C10.03 8.93905 10.3224 8.23322 10.8428 7.71281C11.3632 7.1924 12.069 6.90004 12.805 6.90004C13.541 6.90004 14.2468 7.1924 14.7672 7.71281C15.2876 8.23322 15.58 8.93905 15.58 9.67503V11.895M25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1C19.6274 1 25 6.37258 25 13ZM8.92003 11.895H16.69C17.303 11.895 17.8 12.392 17.8 13.005V16.89C17.8 17.503 17.303 18 16.69 18H8.92003C8.307 18 7.81003 17.503 7.81003 16.89V13.005C7.81003 12.392 8.307 11.895 8.92003 11.895Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function PresentActiveIcon() {
  // your "present active" svg
  return (
    <svg className="msIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
      <path
        d="M19 13C19 16.3137 16.3137 19 13 19C9.68629 19 7 16.3137 7 13C7 9.68629 9.68629 7 13 7C16.3137 7 19 9.68629 19 13Z"
        fill="currentColor"
      />
      <path
        d="M13 1C19.6274 1 25 6.37258 25 13C25 19.6274 19.6274 25 13 25C6.37258 25 1 19.6274 1 13C1 6.37258 6.37258 1 13 1ZM18 13C18 15.7614 15.7614 18 13 18C10.2386 18 8 15.7614 8 13C8 10.2386 10.2386 8 13 8C15.7614 8 18 10.2386 18 13ZM20 13C20 9.13401 16.866 6 13 6C9.13401 6 6 9.13401 6 13C6 16.866 9.13401 20 13 20C16.866 20 20 16.866 20 13Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}

function UpcomingIcon() {
  // simple outline (grey ring) for upcoming
  return (
    <svg className="msIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26">
      <circle cx="13" cy="13" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
