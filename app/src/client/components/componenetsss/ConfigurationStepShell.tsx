import * as React from "react";
import "./ConfigurationStepShell.css";
import MetricRow from "./MetricRow";
import SecondaryButton from "./SecondaryButton";
import PrimaryButton from "./PrimaryButton";

type Step = {
  id: string;
  label: string;
};

type Props = {
  steps?: Step[];
  activeStepId?: string;
  onStepClick?: (stepId: string) => void;

  onBack?: () => void;
  onSave?: () => void;

  backLabel?: string;
  saveLabel?: string;

  /** Your existing middle content goes here (don’t change it) */
  children: React.ReactNode;

  className?: string;
};

export default function ConfigurationStepShell({
  steps = [
    { id: "general", label: "General Details" },
    { id: "configuration", label: "Configuration" },
    { id: "review", label: "Review & Confirm" },
  ],
  activeStepId = "configuration",
  onStepClick,

  onBack,
  onSave,

  backLabel = "Back",
  saveLabel = "Save Changes",

  children,
  className = "",
}: Props) {
  // Check if we're on the first step
  const isFirstStep = activeStepId === steps[0]?.id;
  return (
    <div className={`cfgShell ${className}`}>
      <div className="cfgShellCard">
        {/* LEFT */}
        <aside className="cfgShellSide">
          <nav className="cfgShellSteps">
            {steps.map((s) => {
              const isActive = s.id === activeStepId;
              return (
                <MetricRow
                  key={s.id}
                  title={s.label}
                  state={isActive ? "active" : "default"}
                  onClick={() => onStepClick?.(s.id)}
                />
              );
            })}
          </nav>
        </aside>

        {/* RIGHT */}
        <section className="cfgShellMain">
          {/* ✅ This is the ONLY scrolling area */}
          <div className="cfgShellBody">{children}</div>

          {/* ✅ Footer fixed (never scrolls) */}
          <div className={`cfgShellFooter ${isFirstStep ? 'cfgShellFooter--first-step' : ''}`}>
            {!isFirstStep && (
              <SecondaryButton onClick={onBack}>
                {backLabel}
              </SecondaryButton>
            )}

            <PrimaryButton onClick={onSave}>
              {saveLabel}
            </PrimaryButton>
          </div>
        </section>
      </div>
    </div>
  );
}
