import React, { useMemo, useState } from "react";
import "./IngestionHistory.css";
import dashboardEmpty from "./dataingestion.svg";

export type HistoryRow = {
  id: number;
  name: string;
  ingestedOn: Date;
  status: "Success" | "Failed";
  note?: string;
};

interface Props {
  rows: HistoryRow[];
}

const IngestionHistory: React.FC<Props> = ({ rows }) => {
  const [query, setQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"All" | "Success" | "Failed">("All");

  const formatDate = (d: Date) =>
    d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        (r.note ? r.note.toLowerCase().includes(q) : false);

      const matchesStatus = statusFilter === "All" || r.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const hasData = rows.length > 0;
  const hasResults = filtered.length > 0;

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
  };

  return (
    <>
      <div className="data-toolbar">
        <div className="data-search">
          <svg
            aria-hidden
            className="data-search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M11.5 11.5L15 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle
              cx="7.25"
              cy="7.25"
              r="5.75"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="data-search-input"
            aria-label="Search ingestion history"
          />
          {query && (
            <button
              className="data-search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear"
            >
              ×
            </button>
          )}
        </div>

        <div className="data-filter">
          <button
            className={`data-filter-btn ${showFilter ? "is-open" : ""}`}
            onClick={() => setShowFilter((s) => !s)}
            aria-haspopup="menu"
            aria-expanded={showFilter}
            aria-label="Filter"
          >
            {/* filter icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
            >
              <path
                d="M2 4h14M5 9h8M7.5 14h3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {showFilter && (
            <div className="data-filter-menu" role="menu">
              <div className="data-filter-row">
                <label className="data-filter-label">Status</label>
                <div className="data-filter-pills">
                  {(["All", "Success", "Failed"] as const).map((opt) => (
                    <button
                      key={opt}
                      className={`data-pill ${
                        statusFilter === opt ? "is-active" : ""
                      }`}
                      onClick={() => setStatusFilter(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {(statusFilter !== "All" || query) && (
                <div className="data-filter-actions">
                  <button className="data-clear-link" onClick={clearFilters}>
                    Clear all
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="data-card">
        <div className="data-table-scroll">
          <table className="data-table">
            <colgroup>
              <col className="col-sno" />
              <col className="col-name" />
              <col className="col-date" />
              <col className="col-status" />
              <col className="col-notes" />
            </colgroup>

            <thead>
              <tr>
                <th>S.No</th>
                <th>File Name</th>
                <th>Ingested On</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>

            <tbody>
              {!hasData ? (
                <tr className="data-empty-row">
                  <td colSpan={5}>
                    <div className="data-empty-state">
                      <img
                        src={dashboardEmpty}
                        alt="No ingestion history yet"
                        className="data-empty-icon"
                      />
                      <p className="data-empty-hint">
                        No ingestion history available yet.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : !hasResults ? (
                <tr className="data-empty-row">
                  <td colSpan={5}>
                    <div className="data-empty-state">
                      <img
                        src={dashboardEmpty}
                        alt="No matching results"
                        className="data-empty-icon"
                      />
                      <p className="data-empty-hint">
                        No results {query ? <>for “{query}”</> : ""} with current
                        filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, idx) => (
                  <tr key={r.id}>
                    <td>{idx + 1}</td>
                    <td>{r.name}</td>
                    <td>{formatDate(r.ingestedOn)}</td>
                    <td>
                      <span
                        className={`data-status-chip data-status-${r.status.toLowerCase()}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td>{r.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default IngestionHistory;
