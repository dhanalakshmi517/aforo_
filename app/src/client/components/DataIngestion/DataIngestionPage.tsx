import React, { useMemo, useRef, useState } from "react";
import DataHeader from "../componenetsss/DataHeader";
import NoteModal from "../componenetsss/NoteModal";
import "./DataIngestionPage.css";

type FileRow = {
  id: number;
  file?: File;
  name: string;
  status: "Staged" | "Uploaded" | "Failed"; // show "Staged" like the mock
  note?: string;
  uploadedAt: Date;
};

const DataIngestionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ingestion" | "history">("ingestion");
  const [mode, setMode] = useState<"left" | "right">("left"); // 'left' = Manual, 'right' = API
  const [rows, setRows] = useState<FileRow[]>([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteFile, setCurrentNoteFile] = useState<FileRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canIngest = rows.length > 0;

  const columns = useMemo(
    () => [
      { key: "sno", label: "S.No", width: "110px" },       // checkbox + index badge
      { key: "name", label: "File Name", width: "42%" },
      { key: "status", label: "Status", width: "120px" },
      { key: "uploaded", label: "Uploaded On", width: "220px" },
      { key: "notes", label: "Description / Notes", width: "auto" },
    ],
    []
  );

  const openPicker = () => fileInputRef.current?.click();
  const addMoreFiles = openPicker;

  const clearAll = () => setRows([]);

  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const now = new Date();
    const next = files.map((f, i) => ({
      id: Date.now() + i,
      file: f,
      name: f.name,
      status: "Staged" as const,
      note: "",
      uploadedAt: now,
    }));
    setRows(prev => [...prev, ...next]);

    // allow selecting the same file again later
    e.target.value = "";
  };

  const removeRow = (id: number) => setRows(prev => prev.filter(r => r.id !== id));

  const ingest = () => {
    if (!canIngest) return;
    // TODO: wire to API
    console.log("Ingesting files:", rows);
  };

  const handleAddNote = (file: FileRow) => {
    setCurrentNoteFile(file);
    setShowNoteModal(true);
  };

  const handleSaveNote = (note: string) => {
    if (!currentNoteFile) return;
    
    setRows(rows.map(row => 
      row.id === currentNoteFile.id ? { ...row, note } : row
    ));
    setShowNoteModal(false);
    setCurrentNoteFile(null);
  };

  const handleSaveNoteToAll = (note: string) => {
    setRows(rows.map(row => ({ ...row, note })));
    setShowNoteModal(false);
    setCurrentNoteFile(null);
  };

  const formatUploaded = (d: Date) =>
    d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="di-page">
      <DataHeader
        title="Data Ingestion"
        primaryLabel="New"
        onPrimaryClick={() => {}}
        showPrimary={false}
        showToggle
        toggleLeftLabel="Manual"
        toggleRightLabel="API"
        toggleValue={mode}
        onToggleChange={setMode}
        onSettingsClick={() => {}}
        onNotificationsClick={() => {}}
      />

      <div className="di-content">
        {/* Tabs */}
        <div className="di-tabs">
          <button
            className={`di-tab ${activeTab === "ingestion" ? "is-active" : ""}`}
            onClick={() => setActiveTab("ingestion")}
            type="button"
          >
            Ingestion
          </button>
          <button
            className={`di-tab ${activeTab === "history" ? "is-disabled" : ""}`}
            onClick={() => setActiveTab("history")}
            type="button"
            disabled
            title="Coming soon"
          >
            Ingestion History
          </button>
          <div className="di-tabs-spacer" />
        </div>

        {/* Card */}
        <header className="di-card-header">
            <span>Selected Files</span>

            <div className="di-card-actions">
              {rows.length > 0 ? (
                <>
                  <button className="link-clear" type="button" onClick={clearAll}>
                    Clear all
                  </button>
                  <button type="button" className="btn-outline" onClick={addMoreFiles}>
                    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                      <path d="M3.333 8H12.667M8 3.333V12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Add more files
                  </button>
                </>
              ) : null}
              <button
                className={`di-ingest-btn ${canIngest ? "" : "is-disabled"}`}
                onClick={ingest}
                disabled={!canIngest}
                type="button"
              >
                {canIngest ? `Ingest ${rows.length} File${rows.length > 1 ? "s" : ""}` : "Ingest Files"}
              </button>
            </div>
          </header>

        <section className="di-card">
         
          {/* Table */}
          <div className="di-table-scroll">
            <table className="di-table">
              <colgroup>
                <col style={{ width: columns[0].width }} />
                <col style={{ width: columns[1].width }} />
                <col style={{ width: columns[2].width }} />
                <col style={{ width: columns[3].width }} />
                <col style={{ width: columns[4].width }} />
              </colgroup>

              <thead>
                <tr>
                  <th>{columns[0].label}</th>
                  <th>{columns[1].label}</th>
                  <th>{columns[2].label}</th>
                  <th>{columns[3].label}</th>
                  <th className="th-notes">{columns[4].label}</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr className="di-empty-row">
                    <td colSpan={5}>
                      <div className="di-empty">
                        <button type="button" className="di-select-btn" onClick={openPicker}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3.333 8H12.667M8 3.333V12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          Select files
                        </button>
                        <p className="di-empty-hint">
                          You didn’t have any files yet. Click on add files to start Ingestion
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, idx) => (
                    <tr key={r.id}>
                      {/* S.No column: checkbox + index badge */}
                      <td className="td-sno">
                        <span className="dot-check" aria-hidden="true" />
                        <span className="index-badge">{idx + 1}</span>
                      </td>

                      {/* File name column: chip + remove */}
                      <td className="td-name">
                        <span className="file-chip">
                          <span className="file-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" viewBox="0 0 12 15" fill="none">
  <path d="M7.29789 1.11865V3.71124C7.29789 4.05504 7.43446 4.38476 7.67756 4.62786C7.92067 4.87097 8.25039 5.00754 8.59418 5.00754H11.1868M4.7053 5.65569H3.409M8.59418 8.24828H3.409M8.59418 10.8409H3.409M7.94604 1.11865H2.1127C1.7689 1.11865 1.43919 1.25523 1.19608 1.49833C0.95298 1.74143 0.816406 2.07115 0.816406 2.41495V12.7853C0.816406 13.1291 0.95298 13.4588 1.19608 13.7019C1.43919 13.945 1.7689 14.0816 2.1127 14.0816H9.89048C10.2343 14.0816 10.564 13.945 10.8071 13.7019C11.0502 13.4588 11.1868 13.1291 11.1868 12.7853V4.35939L7.94604 1.11865Z" stroke="#00365A" stroke-width="1.16667" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                          </span>
                          <span className="file-name" title={r.name}>{r.name}</span>
                          <button
                            type="button"
                            className="file-remove"
                            aria-label={`Remove ${r.name}`}
                            onClick={() => removeRow(r.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
  <path d="M12 4.6001L4 12.6001M4 4.6001L12 12.6001" stroke="#373B40" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                          </button>
                        </span>
                      </td>

                      {/* Status column */}
                      <td className="td-status">
                        <span className={`status-chip status-${r.status.toLowerCase()}`}>{r.status}</span>
                      </td>

                      {/* Uploaded On */}
                      <td className="td-uploaded">{formatUploaded(r.uploadedAt)}</td>

                      {/* Notes column */}
                      <td className="td-notes">
                        {r.note ? (
                          <span className="note-text">{r.note}</span>
                        ) : (
                          <button 
                            className="link-notes" 
                            type="button" 
                            onClick={() => handleAddNote(r)}
                          >
                            + Add notes
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="di-bottom-pad" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="di-file-input"
        onChange={onFilesPicked}
      />

      <NoteModal
        open={showNoteModal}
        fileName={currentNoteFile?.name || ''}
        initialValue={currentNoteFile?.note || ''}
        onSave={handleSaveNote}
        onSaveAll={handleSaveNoteToAll}
        onClose={() => setShowNoteModal(false)}
      />
    </div>
  );
};

export default DataIngestionPage;
