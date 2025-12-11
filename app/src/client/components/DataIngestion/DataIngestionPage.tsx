import React, { useEffect, useMemo, useRef, useState } from "react";

import DataHeader from "../componenetsss/DataHeader";
import NoteModal from "../componenetsss/NoteModal";
import ProgressBar from "../componenetsss/ProgressBar";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import TertiaryButton from "../componenetsss/TertiaryButton";
import { Checkbox } from "../componenetsss/Checkbox";
import EditIconButton from "../componenetsss/EditIconButton";
import DeleteButton from "../componenetsss/DeleteButton";
import OutlinedButton from "../componenetsss/OutlinedButton";
import SmartDuplicateDetection from "../componenetsss/SmartDuplicateDetection";
import StatusBadge from "../componenetsss/StatusBadge";

import { ingestFiles, fetchIngestionFiles, IngestionFile } from "./api";

import "./DataIngestionPage.css";
import IngestionHistory, { HistoryRow } from "./IngestionHistory";

export type FileRow = {
  id: number;
  file?: File;
  name: string;
  status: "Staged" | "Uploading" | "Uploaded" | "Failed"; // show "Staged" like the mock
  note?: string;
  uploadedAt: Date;
};

const DataIngestionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"ingestion" | "history">("ingestion");
  const [mode, setMode] = useState<"left" | "right">("left"); // 'left' = Manual, 'right' = API
  const [rows, setRows] = useState<FileRow[]>([]);
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteFile, setCurrentNoteFile] = useState<FileRow | null>(null);
  const [showSmartDetection, setShowSmartDetection] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canIngest = selectedRows.size > 0;
  const allSelected = rows.length > 0 && selectedRows.size === rows.length;

  // Load history from backend when History tab becomes active
  useEffect(() => {
    if (activeTab !== 'history') return;

    const loadHistory = async () => {
      try {
        const files: IngestionFile[] = await fetchIngestionFiles();

        const mapped: HistoryRow[] = files.map((f) => {
          let status: HistoryRow["status"];
          const backendStatus = f.status?.toUpperCase();

          if (backendStatus === 'FAILED') {
            status = 'Failed';
          } else if (backendStatus === 'STAGED') {
            status = 'Staged';
          } else {
            status = 'Success';
          }

          return {
            id: f.fileId,
            name: f.fileName,
            ingestedOn: new Date(f.uploadedAt),
            status,
            note: f.description ?? '',
          };
        });

        setHistoryRows(mapped);
      } catch (err) {
        console.error('Failed to load ingestion history', err);
      }
    };

    loadHistory();
  }, [activeTab]);

  const columns = useMemo(
    () => [
      {
        key: "select",
        label: (
          <div className="data-checkbox-container">
            <Checkbox
              checked={allSelected}
              onChange={(checked) => {
                if (checked) {
                  setSelectedRows(new Set(rows.map((_, index) => index)));
                } else {
                  setSelectedRows(new Set());
                }
              }}
            />
            <span>S.No</span>
          </div>
        )
      },
      { key: "name", label: "File Name" },
      { key: "status", label: "Status" },
      { key: "uploaded", label: "Uploaded On" },
      { key: "notes", label: " Notes/description" },
      { key: "actions", label: "Actions" },
    ],
    [allSelected, rows.length]
  );

  const openPicker = () => fileInputRef.current?.click();
  const addMoreFiles = openPicker;

  const clearAll = () => {
    setRows([]);
    setSelectedRows(new Set());
  };

  const downloadSampleFile = () => {
    const sampleData = {
      "comment": "8. BILLABLE - STATUS_CODE 301",
      "timestamp": "2025-09-18T05:08:47Z",
      "subscriptionId": 100,
      "billableMetricId": "110",
      "uom": "API_CALL",
      "idempotencyKey": "test-sample-008",
      "dimensions": { "STATUS_CODE": 301 }
    };

    const jsonString = JSON.stringify(sampleData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-usage-event.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const now = new Date();
    const currentRowCount = rows.length;
    const next = files.map((f, i) => ({
      id: Date.now() + i,
      file: f,
      name: f.name,
      status: "Staged" as const,
      note: "",
      uploadedAt: now,
    }));
    setRows(prev => [...prev, ...next]);

    // Auto-select newly added files
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      for (let i = 0; i < next.length; i++) {
        newSelected.add(currentRowCount + i);
      }
      return newSelected;
    });

    // allow selecting the same file again later
    e.target.value = "";
  };

  const removeRow = (indexToRemove: number) => {
    setRows(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setSelectedRows(prev => {
      const next = new Set<number>();
      prev.forEach((idx) => {
        if (idx === indexToRemove) return; // removed row
        next.add(idx > indexToRemove ? idx - 1 : idx);
      });
      return next;
    });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });

  const ingest = async () => {
    console.log('Ingest button clicked');
    console.log('canIngest:', canIngest, 'isLoading:', isLoading, 'selectedRows:', selectedRows.size);

    if (!canIngest || isLoading || selectedRows.size === 0) {
      console.log('Ingest prevented - condition not met');
      return;
    }

    try {
      setIsLoading(true);
      // Only get selected rows (ignore any stale indices defensively)
      const selectedFiles = Array.from(selectedRows)
        .map(index => rows[index])
        .filter((row): row is FileRow => Boolean(row));

      console.log('Selected files:', selectedFiles);

      const filesToUpload = selectedFiles.map(row => row.file).filter(Boolean) as File[];
      const descriptions = selectedFiles.map(row => row.note || '');

      // Update status to "Uploading" for selected files
      setRows(prevRows =>
        prevRows.map((row, index) =>
          selectedRows.has(index)
            ? { ...row, status: 'Uploading' as const }
            : row
        )
      );

      // Initialize progress
      setUploadProgress({ current: 0, total: filesToUpload.length });

      console.log('Files to upload:', filesToUpload);
      console.log('Descriptions:', descriptions);

      // Each file takes 5 seconds to upload
      const timePerFileMs = 5000; // 5 seconds per file
      const totalTimeMs = timePerFileMs * filesToUpload.length; // Total time based on file count
      const intervalTime = timePerFileMs; // Time per file

      // Start progress simulation
      const progressPromise = new Promise<void>((resolve) => {
        let currentProgress = 0;
        const progressInterval = setInterval(() => {
          currentProgress++;
          setUploadProgress(prev => ({
            current: Math.min(currentProgress, filesToUpload.length),
            total: filesToUpload.length
          }));

          if (currentProgress >= filesToUpload.length) {
            clearInterval(progressInterval);
            resolve();
          }
        }, intervalTime);
      });

      console.log('Calling ingestFiles API...');

      // Wait for both API and progress to complete
      const [result] = await Promise.all([
        ingestFiles(filesToUpload, descriptions),
        progressPromise
      ]);

      // Keep the progress bar at 100% for 2 seconds before closing
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('API Response:', result);

      if (result.success) {
        // Add successful uploads to history
        setHistoryRows(prev => [
          ...prev,
          ...selectedFiles.map(row => ({
            id: row.id,
            name: row.name,
            ingestedOn: row.uploadedAt,
            status: "Success" as const,
            note: row.note,
          })),
        ]);

        // Remove uploaded files from the ingestion tab
        setRows(prevRows =>
          prevRows.filter((row, index) => !selectedRows.has(index))
        );
        // Clear selection after successful upload
        setSelectedRows(new Set());
      } else {
        // Handle upload failure - update status to Failed
        console.error("Failed to ingest files:", result.message);

        // Add failed uploads to history
        setHistoryRows(prev => [
          ...prev,
          ...selectedFiles.map(row => ({
            id: row.id,
            name: row.name,
            ingestedOn: row.uploadedAt,
            status: "Failed" as const,
            note: row.note,
          })),
        ]);

        setRows(prevRows =>
          prevRows.map((row, index) =>
            selectedRows.has(index)
              ? { ...row, status: "Failed" as const }
              : row
          )
        );
        // Clear selection on failure
        setSelectedRows(new Set());
      }
    } catch (error) {
      console.error("Error during file ingestion:", error);
      // Add failed uploads to history and update status
      const selectedFiles = Array.from(selectedRows)
        .map(index => rows[index])
        .filter((row): row is FileRow => Boolean(row));

      setHistoryRows(prev => [
        ...prev,
        ...selectedFiles.map(row => ({
          id: row.id,
          name: row.name,
          ingestedOn: row.uploadedAt,
          status: "Failed" as const,
          note: row.note,
        })),
      ]);

      setRows(prevRows =>
        prevRows.map((row, index) =>
          selectedRows.has(index)
            ? { ...row, status: "Failed" as const }
            : row
        )
      );

      // Clear selection on error
      setSelectedRows(new Set());
    } finally {
      setIsLoading(false);
      setUploadProgress({ current: 0, total: 0 });
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

  return (
    <div className="check-container">
      <div className="data-page">
        <DataHeader
          title="Data Ingestion"
          primaryLabel="New"
          onPrimaryClick={() => { }}
          showPrimary={false}
          showToggle
          toggleLeftLabel="Manual"
          toggleRightLabel="Real-Time"
          toggleValue={mode}
          onToggleChange={setMode}
          onSettingsClick={() => { }}
          onNotificationsClick={() => { }}
          showTrailingDivider
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

          <div className="data-ingestion-container">
            {activeTab === 'ingestion' && (
              <>
                {!isLoading && (
                  <header className="data-card-header">
                    <span>Selected Files</span>
                    <div className="data-card-actions">
                      {rows.length > 0 ? (
                        <>
                          <button className="data-link-clear" type="button" onClick={clearAll}>
                            Clear all
                          </button>
                          <TertiaryButton onClick={addMoreFiles}>

                            + Add more files
                          </TertiaryButton>
                        </>
                      ) : null}
                      <PrimaryButton
                        onClick={ingest}
                        disabled={!canIngest || isLoading}
                      >
                        {isLoading
                          ? 'Uploading...'
                          : canIngest
                            ? `Ingest ${selectedRows.size} File${selectedRows.size > 1 ? 's' : ''}`
                            : 'Ingest Files'}
                      </PrimaryButton>
                    </div>
                  </header>
                )}

                {isLoading && uploadProgress.total > 0 && (
                  <div className="progress-bar-container">
                    <ProgressBar
                      current={uploadProgress.current}
                      total={uploadProgress.total}
                    />
                  </div>
                )}

                <section className="data-card">
                  <div className="data-table-scroll">
                    <table className="data-table">
                      <colgroup>
                        <col className="col-select" />
                        <col className="col-name" />
                        <col className="col-status" />
                        <col className="col-uploaded" />
                        <col className="col-notes" />
                        <col className="col-actions" />
                      </colgroup>

                      <thead>
                        <tr>
                          <th>{columns[0].label}</th>
                          <th>{columns[1].label}</th>
                          <th>{columns[2].label}</th>
                          <th>{columns[3].label}</th>
                          <th className="data-th-notes">{columns[4].label}</th>
                          <th className="data-th-actions">{columns[5].label}</th>
                        </tr>
                      </thead>

                      <tbody>
                        {rows.length === 0 ? (
                          <tr className="data-empty-row">
                            <td colSpan={6}>
                              <div className="data-empty">
                                <p className="data-empty-hint">
                                  You didn't have any files yet. Click on add files to start Ingestion
                                </p>
                                <TertiaryButton onClick={openPicker} className="data-upload-files-btn">
                                  + Upload files
                                </TertiaryButton>
                                <OutlinedButton
                                  label="Sample File"
                                  onClick={downloadSampleFile}
                                  iconLeft={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M6.75 8.75V0.75M6.75 8.75L3.41667 5.41667M6.75 8.75L10.0833 5.41667M12.75 8.75V11.4167C12.75 11.7703 12.6095 12.1094 12.3595 12.3595C12.1094 12.6095 11.7703 12.75 11.4167 12.75H2.08333C1.72971 12.75 1.39057 12.6095 1.14052 12.3595C0.890476 12.1094 0.75 11.7703 0.75 11.4167V8.75" stroke="#2A455E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                                  }
                                />

                              </div>
                            </td>
                          </tr>
                        ) : (
                          rows.map((r: FileRow, idx: number) => (
                            <tr key={r.id}>
                              {/* Checkbox + S.No column */}
                              <td className="data-td-sno" style={{ verticalAlign: 'middle' }}>
                                <div className="data-checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Checkbox
                                    checked={selectedRows.has(idx)}
                                    onChange={(checked) => {
                                      const newSelected = new Set(selectedRows);
                                      if (checked) {
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
                                      <path d="M7.29789 1.11865V3.71124C7.29789 4.05504 7.43446 4.38476 7.67756 4.62786C7.92067 4.87097 8.25039 5.00754 8.59418 5.00754H11.1868M4.7053 5.65569H3.409M8.59418 8.24828H3.409M8.59418 10.8409H3.409M7.94604 1.11865H2.1127C1.7689 1.11865 1.43919 1.25523 1.19608 1.49833C0.95298 1.74143 0.816406 2.07115 0.816406 2.41495V12.7853C0.816406 13.1291 0.95298 13.4588 1.19608 13.7019C1.43919 13.945 1.7689 14.0816 2.1127 14.0816H9.89048C10.2343 14.0816 10.564 13.945 10.8071 13.7019C11.0502 13.4588 11.1868 13.1291 11.1868 12.7853V4.35939L7.94604 1.11865Z" stroke="#00365A" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </span>
                                  <span className="data-file-name" title={r.name}>{r.name}</span>
                                </span>
                              </td>

                              {/* Status column */}
                              <td className="data-td-status">
                                <StatusBadge
                                  label={r.status}
                                  variant={
                                    r.status === "Failed"
                                      ? "failed"
                                      : r.status === "Staged"
                                      ? "staged"
                                      : r.status === "Uploading"
                                      ? "uploading"
                                      : "success"
                                  }
                                  size="sm"
                                />
                              </td>

                              {/* Uploaded On */}
                              <td className="data-td-uploaded">{formatUploaded(r.uploadedAt)}</td>

                              {/* Notes column */}
                              <td className="data-td-notes">
                                {r.note ? (
                                  <div className="data-note-container">
                                    <span className="data-note-text">{r.note}</span>
                                    {r.note && (
                                      <EditIconButton
                                        onClick={() => {
                                          handleAddNote(r);
                                        }}
                                        title="Edit note"
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    className="data-link-notes"
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      handleAddNote(r);
                                      return false;
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onMouseUp={(e) => e.stopPropagation()}
                                  >
                                    + Add notes
                                  </button>
                                )}
                              </td>

                              {/* Actions column */}
                              <td className="data-td-actions">
                                <DeleteButton
                                  onClick={() => removeRow(idx)}
                                  label="Remove"
                                  variant="soft"
                                  customIcon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                      <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="#ED5142" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  }
                                />
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
              <IngestionHistory rows={historyRows} />
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
            totalFiles={rows.length}
            onClose={() => setShowNoteModal(false)}
          />

          {showSmartDetection && (
            <div className="smart-detection-wrapper">
              <SmartDuplicateDetection
                onClose={() => setShowSmartDetection(false)}
                onCheckboxChange={(checked) => {
                  setDontShowAgain(checked);
                  if (checked) {
                    // Optionally save to localStorage
                    localStorage.setItem('hideSmartDetection', 'true');
                  }
                }}
                checked={dontShowAgain}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataIngestionPage;