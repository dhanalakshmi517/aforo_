import React from "react";
import "./DataTable.css";

export type DataTableColumn<T> = {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  render: (row: T) => React.ReactNode;
  filterable?: boolean;
  onFilterClick?: () => void;
  ref?: React.RefObject<HTMLDivElement>;
  filterDropdown?: React.ReactNode;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;

  /** 🔑 content shown INSIDE table, above header (filters, chips, reset) */
  topContent?: React.ReactNode;

  emptyIcon?: React.ReactNode;
  emptyText?: string;
  emptyAction?: React.ReactNode;
};

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  topContent,
  emptyIcon,
  emptyText,
  emptyAction,
}: Props<T>) {
  const gridTemplate = columns
    .map((c) => (c.width ? `${c.width}px` : `minmax(${c.minWidth ?? 120}px, 1fr)`))
    .join(" ");

  return (
    <div className="dt-surface">
      {topContent && <div className="dt-top">{topContent}</div>}

      {/* HEADER */}
      <div className="dt-header" style={{ gridTemplateColumns: gridTemplate }}>
        {columns.map((col) => (
          <div
            key={col.key}
            ref={col.ref}
            className={`dt-header-cell ${col.filterable ? "dt-header-cell--filterable" : ""}`}
            onClick={col.filterable ? col.onFilterClick : undefined}
          >
            <span>{col.title}</span>
            {col.filterable && (
              <button
                className="dt-filter-trigger"
                onClick={(e) => {
                  e.stopPropagation();
                  col.onFilterClick?.();
                }}
                aria-label={`Filter by ${col.title}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11"
                  height="8"
                  viewBox="0 0 11 8"
                  fill="none"
                >
                  <path
                    d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
            {col.filterDropdown}
          </div>
        ))}
      </div>

      {/* BODY */}
      <div className="dt-body">
        {rows.length === 0 ? (
          <div className="dt-empty">
            {emptyIcon}
            {emptyText && <p>{emptyText}</p>}
            {emptyAction}
          </div>
        ) : (
          rows.map((row, idx) => (
            <div
              key={rowKey(row, idx)}
              className="dt-row"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              {columns.map((col) => (
                <div key={col.key} className="dt-cell">
                  {col.render(row)}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
