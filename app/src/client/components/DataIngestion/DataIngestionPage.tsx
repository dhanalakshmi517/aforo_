import React, { useMemo, useRef, useState } from "react";
import DataHeader from "../componenetsss/DataHeader";
import NoteModal from "../componenetsss/NoteModal";
import { ingestFiles } from "./api";
import "./DataIngestionPage.css";
import IngestionHistory from "./IngestionHistory";

export type FileRow = {
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
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteFile, setCurrentNoteFile] = useState<FileRow | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canIngest = selectedRows.size > 0;
  const allSelected = rows.length > 0 && selectedRows.size === rows.length;

  const columns = useMemo(
    () => [
      { 
        key: "select", 
        label: (
          <div className="data-checkbox-container">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedRows(new Set(rows.map((_, index) => index)));
                } else {
                  setSelectedRows(new Set());
                }
              }}
            />
            <span>S.No</span>
          </div>
        ),
        width: "120px"
      },
      { key: "name", label: "File Name", width: "42%" },
      { key: "status", label: "Status", width: "120px" },
      { key: "uploaded", label: "Uploaded On", width: "220px" },
      { key: "notes", label: "Description / Notes", width: "auto" },
    ],
    [allSelected, rows.length]
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

  const [isLoading, setIsLoading] = useState(false);

  const ingest = async () => {
    console.log('Ingest button clicked');
    console.log('canIngest:', canIngest, 'isLoading:', isLoading, 'selectedRows:', selectedRows.size);
    
    if (!canIngest || isLoading || selectedRows.size === 0) {
      console.log('Ingest prevented - condition not met');
      return;
    }
    
    try {
      setIsLoading(true);
      // Only get selected rows
      const selectedFiles = Array.from(selectedRows).map(index => rows[index]);
      console.log('Selected files:', selectedFiles);
      
      const filesToUpload = selectedFiles.map(row => row.file).filter(Boolean) as File[];
      const descriptions = selectedFiles.map(row => row.note || '');
      
      console.log('Files to upload:', filesToUpload);
      console.log('Descriptions:', descriptions);
      
      console.log('Calling ingestFiles API...');
      const result = await ingestFiles(filesToUpload, descriptions);
      console.log('API Response:', result);
      
      if (result.success) {
        // Update the status of uploaded files
        setRows(prevRows => 
          prevRows.map((row, index) => 
            selectedRows.has(index) 
              ? { ...row, status: 'Uploaded' as const }
              : row
          )
        );
        // Clear selection after successful upload
        setSelectedRows(new Set());
      } else {
        // Handle upload failure
        console.error("Failed to ingest files:", result.message);
        // You might want to show an error message to the user here
      }
    } catch (error) {
      console.error("Error during file ingestion:", error);
      // Update status for failed files
      setRows(prevRows => 
        prevRows.map((row, index) => 
          selectedRows.has(index) 
            ? { ...row, status: "Failed" as const } 
            : row
        )
      );
    } finally {
      setIsLoading(false);
    }
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

  // Filter out staged files for history view
  const historyData = rows.filter(row => row.status !== "Staged");

  return (
    <div className="data-page">
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

      <div className="data-content">
        <div className="data-tabs">
          <button
            className={`data-tab ${activeTab === 'ingestion' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setActiveTab('ingestion')}
          >
            Ingestion
          </button>
          <button
            className={`data-tab ${activeTab === 'history' ? 'is-active' : ''}`}
            type="button"
            onClick={() => setActiveTab('history')}
          >
            Ingestion History
          </button>
          <div className="data-tabs-spacer" />
        </div>

        <div>
          {activeTab === 'ingestion' && (
          <>
          <header className="data-card-header">
            <span>Selected Files</span>
            <div className="data-card-actions">
              {rows.length > 0 ? (
                <>
                  <button className="data-link-clear" type="button" onClick={clearAll}>
                    Clear all
                  </button>
                  <button type="button" className="data-btn-outline" onClick={addMoreFiles}>
                    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                      <path d="M3.333 8H12.667M8 3.333V12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Add more files
                  </button>
                </>
              ) : null}
              <button
                className={`data-ingest-btn ${canIngest ? "" : "is-disabled"}`}
                onClick={ingest}
                disabled={!canIngest || isLoading}
                type="button"
              >
                {isLoading 
                  ? 'Uploading...' 
                  : canIngest 
                    ? `Ingest ${selectedRows.size} File${selectedRows.size > 1 ? 's' : ''}` 
                    : 'Ingest Files'}
              </button>
            </div>
          </header>

        <section className="data-card">
          <div className="data-table-scroll">
            <table className="data-table">
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
                  <th className="data-th-notes">{columns[4].label}</th>
                </tr>
              </thead>

              <tbody>
                {rows.length === 0 ? (
                  <tr className="data-empty-row">
                    <td colSpan={5}>
                      <div className="data-empty">
                        <button type="button" className="data-select-btn" onClick={openPicker}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3.333 8H12.667M8 3.333V12.667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                          Select files
                        </button>
                        <p className="data-empty-hint">
                          You didn't have any files yet. Click on add files to start Ingestion
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((r: FileRow, idx: number) => (
                    <tr key={r.id}>
                      {/* Checkbox + S.No column */}
                      <td className="data-td-sno" style={{ verticalAlign: 'middle' }}>
                        <div className="data-checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="checkbox"
                            checked={selectedRows.has(idx)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedRows);
                              if (e.target.checked) {
                                newSelected.add(idx);
                              } else {
                                newSelected.delete(idx);
                              }
                              setSelectedRows(newSelected);
                            }}
                          />
                          <span className="data-index-badge" style={{ fontSize: '16px', fontWeight: 'bold' }}>{idx + 1}</span>
                        </div>
                      </td>

                      {/* File name column: chip + remove */}
                      <td className="data-td-name">
                        <span className="data-file-chip">
                          <span className="data-file-icon">
                            {/* File icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" viewBox="0 0 12 15" fill="none">
                              <path d="M7.29789 1.11865V3.71124C7.29789 4.05504 7.43446 4.38476 7.67756 4.62786C7.92067 4.87097 8.25039 5.00754 8.59418 5.00754H11.1868M4.7053 5.65569H3.409M8.59418 8.24828H3.409M8.59418 10.8409H3.409M7.94604 1.11865H2.1127C1.7689 1.11865 1.43919 1.25523 1.19608 1.49833C0.95298 1.74143 0.816406 2.07115 0.816406 2.41495V12.7853C0.816406 13.1291 0.95298 13.4588 1.19608 13.7019C1.43919 13.945 1.7689 14.0816 2.1127 14.0816H9.89048C10.2343 14.0816 10.564 13.945 10.8071 13.7019C11.0502 13.4588 11.1868 13.1291 11.1868 12.7853V4.35939L7.94604 1.11865Z" stroke="#00365A" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          <span className="data-file-name" title={r.name}>{r.name}</span>
                          <button
                            type="button"
                            className="data-file-remove"
                            aria-label={`Remove ${r.name}`}
                            onClick={() => removeRow(r.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                              <path d="M12 4.6001L4 12.6001M4 4.6001L12 12.6001" stroke="#373B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </span>
                      </td>

                      {/* Status column */}
                      <td className="data-td-status">
                        <span className={`data-status-chip data-status-${r.status.toLowerCase()}`}>{r.status}</span>
                      </td>

                      {/* Uploaded On */}
                      <td className="data-td-uploaded">{formatUploaded(r.uploadedAt)}</td>

                      {/* Notes column */}
                      <td className="data-td-notes">
                        {r.note ? (
                          <div className="data-note-container">
                            <span className="data-note-text">{r.note}</span>
                            {r.note && (
                              <button 
                                type="button" 
                                className="data-edit-note-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddNote(r);
                                }}
                                aria-label="Edit note"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M8.6 4.57206L11.428 7.40072L4.828 14.0001H2V11.1714L8.6 4.57139V4.57206ZM9.88533 3.28539L11.7713 1.40006C11.9076 1.26341 12.0899 1.18799 12.2793 1.18799C12.4688 1.18799 12.6511 1.26341 12.7873 1.40006L14.6 3.21472C14.7366 3.35096 14.812 3.5333 14.812 3.72272C14.812 3.91213 14.7366 4.09447 14.6 4.23072L12.714 6.11472L9.88533 3.28539Z" fill="#5B6B79"/>
                                </svg>
                              </button>
                            )}
                          </div>
                        ) : (
                          <button 
                            className="data-link-notes" 
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

          <div className="data-bottom-pad" />
          </>
          )}
          
          {activeTab === 'history' && (
  <IngestionHistory rows={rows
    .filter(row => row.status !== 'Staged') // Only include uploaded or failed files
    .map((row, idx) => ({
      id: row.id,
      name: row.name,
      ingestionType: mode === "left" ? "Manual" : "API",
      ingestedOn: row.uploadedAt,
      status: row.status === "Uploaded" ? "Success" : "Failed",
      note: row.note,
    }))} />
)}

        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="data-file-input"
          style={{ display: 'none' }}
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
    </div>
  );
};

export default DataIngestionPage;
