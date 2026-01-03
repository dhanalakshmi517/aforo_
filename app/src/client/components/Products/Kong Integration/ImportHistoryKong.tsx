// ImportHistoryKong.tsx
import * as React from "react";
import "./ImportHistoryKong.css";

// ✅ use your existing top bar
import ConnectionBar from "./ConnectionBar";
import SearchInput from "../../componenetsss/SearchInput";

type HistoryRow = {
  id: string;
  productName: string;
  productCode: string;
  productType: string; // e.g. "API"
  importedOn: string; // display string
  canDelete?: boolean;
};

type Props = {
  rows?: HistoryRow[];
  onBack?: () => void;
  onManageConnection?: () => void;
  onDeleteRow?: (id: string) => void;
};

const demoRows: HistoryRow[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `row-${i + 1}`,
  productName: "Microsoft OneDrive",
  productCode: "P-SKU-387238",
  productType: "API",
  importedOn: "06 Jan, 2025 08:58 IST",
  canDelete: i >= 2, // first couple disabled like your screenshot
}));

export default function ImportHistoryKong({
  rows = demoRows,
  onBack,
  onManageConnection,
  onDeleteRow,
}: Props) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((r) => {
      const hay = `${r.productName} ${r.productCode} ${r.productType} ${r.importedOn}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  return (
    <div className="ihk-page">
      <div className="ihk-topbar">
        <ConnectionBar
          title="Import Products History"
          onBack={onBack}
          rightActionLabel="Manage Connection"
          onRightAction={onManageConnection}
        />
      </div>

      <div className="ihk-content">
        <div className="ihk-card">
          {/* header (never scrolls) */}
          <div className="ihk-head">
            <button
              type="button"
              className="ihk-back"
              onClick={onBack}
              aria-label="Back"
              title="Back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M10 15.8333L4.16667 10M4.16667 10L10 4.16667M4.16667 10H15.8333"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="ihk-title">Import Products History</div>

            <div className="ihk-search">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search"
                className="ihk-searchInput"
              />
            </div>
          </div>

          {/* table header (fixed) */}
          <div className="ihk-tableHead">
            <table className="ihk-table">
              <thead>
                <tr className="ihk-header-row">
                  <th className="ihk-th ihk-th--product">Product Name</th>
                  <th className="ihk-th">Product Type</th>
                  <th className="ihk-th">Imported On</th>
                  <th className="ihk-th ihk-th--right">Actions</th>
                </tr>
              </thead>
            </table>
          </div>

          {/* ✅ ONLY ROWS SCROLL */}
          <div className="ihk-rowsScroll">
            {filtered.map((r) => {
              const disabled = !r.canDelete;

              return (
                <div className="ihk-row" key={r.id}>
                  {/* product cell */}
                  <div className="ihk-cell ihk-cell--product">
                    <div className="ihk-icon">
                      {/* soft pink app icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        viewBox="0 0 26 26"
                        fill="none"
                      >
                        <rect x="1" y="1" width="24" height="24" rx="8" fill="#FCE7F3" />
                        <path
                          d="M9.2 14.1c.4 2 2.2 3.6 4.3 3.6 2.4 0 4.4-2 4.4-4.4 0-2.1-1.6-3.9-3.6-4.3"
                          stroke="#E11D48"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path
                          d="M8.5 8.6h4.6c1 0 1.9.8 1.9 1.9v4.6c0 1-.8 1.9-1.9 1.9H8.5c-1 0-1.9-.8-1.9-1.9v-4.6c0-1 .8-1.9 1.9-1.9Z"
                          stroke="#FB7185"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </div>

                    <div className="ihk-prodMeta">
                      <div className="ihk-prodName">{r.productName}</div>
                      <div className="ihk-prodCode">{r.productCode}</div>
                    </div>
                  </div>

                  {/* type */}
                  <div className="ihk-cell">
                    <span className="ihk-pill">{r.productType}</span>
                  </div>

                  {/* imported on */}
                  <div className="ihk-cell ihk-cell--muted">{r.importedOn}</div>

                  {/* actions */}
                  <div className="ihk-cell ihk-cell--right">
                    <button
                      type="button"
                      className={`ihk-action ${disabled ? "ihk-action--disabled" : ""}`}
                      disabled={disabled}
                      onClick={() => onDeleteRow?.(r.id)}
                      aria-label="Delete"
                      title={disabled ? "Not available" : "Delete"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M7.5 6.667V5.833c0-.92.746-1.666 1.666-1.666h1.668c.92 0 1.666.746 1.666 1.666v.834"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                        <path
                          d="M5.833 6.667h8.334M8.333 9.167v5M11.667 9.167v5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6.667 6.667l.5 10c.05.9.8 1.6 1.7 1.6h2.266c.9 0 1.65-.7 1.7-1.6l.5-10"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 ? (
              <div className="ihk-empty">No history found.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
