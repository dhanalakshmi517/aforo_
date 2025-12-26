import * as React from "react";
import "./TableHeaderRow.css";

export type HeaderColumn = {
  key: string;
  label: string;
  showFilterIcon?: boolean;
  onFilterClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  minWidthPx?: number;
  className?: string;
  innerClassName?: string;
  ref?: React.Ref<HTMLTableCellElement>;
  innerRef?: React.Ref<HTMLDivElement>;
  onInnerMouseEnter?: () => void;
  onInnerMouseLeave?: () => void;
  isFilterActive?: boolean;
  filterButtonClassName?: string;
  buttonAriaLabel?: string;
  renderPopover?: () => React.ReactNode;
};

type Props = {
  columns: HeaderColumn[];
  className?: string;
};

const FilterIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M1.5 3H10.5M3.5 6H8.5M5 9H7"
      stroke="#000"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TableHeaderRow: React.FC<Props> = ({ columns, className = "" }) => {
  const rootClass = [`thr-root`, className].filter(Boolean).join(" ");

  return (
    <tr className={rootClass}>
      {columns.map((c) => {
        const colClass = [
          "thr-col",
          c.className,
          c.isFilterActive ? "is-active" : ""
        ]
          .filter(Boolean)
          .join(" ");

        const innerClass = ["thr-inner", c.innerClassName].filter(Boolean).join(" ");
        const filterBtnClass = [
          "thr-filterBtn",
          c.filterButtonClassName,
          c.isFilterActive ? "is-open" : ""
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <th
            key={c.key}
            className={colClass}
            style={c.minWidthPx ? { minWidth: `${c.minWidthPx}px` } : undefined}
            ref={c.ref}
          >
            <div
              className={innerClass}
              ref={c.innerRef}
              onMouseEnter={c.onInnerMouseEnter}
              onMouseLeave={c.onInnerMouseLeave}
            >
              <span className="thr-label">{c.label}</span>

              {c.showFilterIcon ? (
                <button
                  type="button"
                  className={filterBtnClass}
                  aria-label={c.buttonAriaLabel ?? `Filter ${c.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    c.onFilterClick?.(e);
                  }}
                >
                  <FilterIcon />
                </button>
              ) : null}

              {c.renderPopover?.()}
            </div>
          </th>
        );
      })}
    </tr>
  );
};

export default TableHeaderRow;
