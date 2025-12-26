import * as React from "react";
import Portal from './Portal';
import "./MainFilterMenu.css";

export type MainFilterKey =
  | "productName"
  | "productType"
  | "billableMetrics"
  | "status"
  | "date"
  | "source"
  | "companyName"
  | "ratePlan"
  | "paymentType"
  | "pricingModel"
  | "billingFrequency";

export type MainFilterItem = {
  key: MainFilterKey;
  label: string;
  disabled?: boolean;
};

type Props = {
  items?: MainFilterItem[];
  activeKey?: MainFilterKey | null;
  onSelect: (key: MainFilterKey) => void;
  onSelectWithRect?: (key: MainFilterKey, rect: DOMRect) => void;
  className?: string;
  anchorTop?: number;
  anchorLeft?: number;
};

const ChevronRight: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
    <path
      d="M0.75 10.75L5.75 5.75L0.75 0.75"
      stroke="#25303D"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const defaultItems: MainFilterItem[] = [
  { key: "productName", label: "Product Name" },
  { key: "productType", label: "Product Type" },
  { key: "billableMetrics", label: "Billable Metrics" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

const MainFilterMenu: React.FC<Props> = ({
  items = defaultItems,
  activeKey = null,
  onSelect,
  onSelectWithRect,
  className = "",
  anchorTop,
  anchorLeft,
}) => {
  const style: React.CSSProperties = {};
  if (anchorTop !== undefined || anchorLeft !== undefined) {
    style.position = 'fixed';
    if (anchorTop !== undefined) style.top = `${anchorTop}px`;
    if (anchorLeft !== undefined) style.left = `${anchorLeft}px`;
    style.zIndex = 90;
  }

  return (
    <Portal>
      <div className={`mfm-root ${className}`.trim()} style={style} role="menu" aria-label="Filters">
      {items.map((it) => {
        const isActive = activeKey === it.key;
        const isDisabled = !!it.disabled;

        return (
          <button
            key={it.key}
            type="button"
            className={`mfm-item ${isActive ? "is-active" : ""} ${isDisabled ? "is-disabled" : ""}`.trim()}
            onClick={(e) => {
              if (isDisabled) return;
              onSelect(it.key);
              onSelectWithRect?.(it.key, (e.currentTarget as HTMLElement).getBoundingClientRect());
            }}
            disabled={isDisabled}
            role="menuitem"
          >
            <span className="mfm-label">{it.label}</span>
            <span className="mfm-chevron" aria-hidden="true">
              <ChevronRight />
            </span>
          </button>
        );
      })}
      </div>
    </Portal>
  );
};

export default MainFilterMenu;
