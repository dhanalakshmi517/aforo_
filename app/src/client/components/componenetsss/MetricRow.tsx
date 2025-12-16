import * as React from "react";
import "./MetricRow.css";

export type MetricRowState = "default" | "active" | "loading" | "disabled";

type Props = {
  title: string;
  state?: MetricRowState;
  onClick?: () => void;
  className?: string;
};

const MetricRow: React.FC<Props> = ({
  title,
  state = "default",
  onClick,
  className = "",
}) => {
  const isDisabled = state === "disabled" || state === "loading";

  return (
    <button
      type="button"
      className={[
        "mr",
        `mr--${state}`,
        onClick && !isDisabled ? "mr--click" : "",
        className,
      ].join(" ")}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-busy={state === "loading" ? true : undefined}
    >
      <span className="mr-title">{title}</span>

      {state === "loading" && <span className="mr-spinner" aria-hidden="true" />}
    </button>
  );
};

export default MetricRow;
