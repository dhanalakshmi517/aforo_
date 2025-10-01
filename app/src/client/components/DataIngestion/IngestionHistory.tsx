// src/pages/IngestionHistory.tsx
import React from "react";
import "./IngestionHistory.css";

export type HistoryRow = {
  id: number;
  name: string;
  ingestionType: "Manual" | "API";
  ingestedOn: Date;
  status: "Success" | "Failed";
  note?: string;
};

interface Props {
  rows: HistoryRow[];
}

const IngestionHistory: React.FC<Props> = ({ rows }) => {
  const formatDate = (d: Date) =>
    d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <section className="data-card">
      <div className="data-table-scroll">
        <table className="data-table">
          <colgroup>
            <col style={{ width: "60px" }} />
            <col style={{ width: "40%" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "200px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "auto" }} />
          </colgroup>

          <thead>
            <tr>
              <th>S.No</th>
              <th>File Name</th>
              <th>Ingestion Type</th>
              <th>Ingested On</th>
              <th>Status</th>
              <th>Description / Notes</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr className="data-empty-row">
                <td colSpan={6}>
                  <p className="data-empty-hint">No ingestion history available.</p>
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.id}>
                  <td>{idx + 1}</td>
                  <td>{r.name}</td>
                  <td>
                    <span className={`data-type-chip data-type-${r.ingestionType.toLowerCase()}`}>
                      {r.ingestionType}
                    </span>
                  </td>
                  <td>{formatDate(r.ingestedOn)}</td>
                  <td>
                    <span className={`data-status-chip data-status-${r.status.toLowerCase()}`}>
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
  );
};

export default IngestionHistory;
