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

import { ingestFiles, fetchIngestionFiles, IngestionFile, deleteIngestionFile } from "./api";

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
  const [failedIngestionFiles, setFailedIngestionFiles] = useState<IngestionFile[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNoteFile, setCurrentNoteFile] = useState<FileRow | null>(null);
  const [showSmartDetection, setShowSmartDetection] = useState(true);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canIngest = selectedRows.size > 0;
  const allSelected = rows.length > 0 && selectedRows.size === rows.length;

  const loadFailedIngestionFiles = async () => {
    try {
      const files: IngestionFile[] = await fetchIngestionFiles();
      const filtered = files.filter((f) => {
        const backendStatus = f.status?.toUpperCase();
        if (!backendStatus) return false;
        if (backendStatus === 'FAILED') return true;
        if (backendStatus === 'PARTIALLY_INGESTED') return true;
        return false;
      });
      setFailedIngestionFiles(filtered);
    } catch (err) {
      console.error('Failed to load failed ingestion files', err);
    }
  };

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
          } else if (backendStatus === 'PARTIALLY_INGESTED') {
            status = 'Partial';
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

  // Load only failed / partial files for the Ingestion tab (backend view)
  useEffect(() => {
    if (activeTab !== 'ingestion') return;
    loadFailedIngestionFiles();
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
      await loadFailedIngestionFiles();
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
      await loadFailedIngestionFiles();
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
    // Apply note to all rows; let NoteModal decide when to close itself
    setRows(rows.map(row => ({ ...row, note })));
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
              onClick={() => setActiveTab('history')}
            >
              Ingestion History
            </button>
            <div className="data-tabs-spacer" />
          </div>

          <div className="data-ingestion-container">
            {activeTab === 'ingestion' && (
              <>
                {!isLoading && (rows.length > 0 || failedIngestionFiles.length > 0) && (
                  <header className="data-card-header">
                    <span>Files</span>
                    <div className="data-card-actions">
                      {rows.length > 0 && (
                        <button className="data-link-clear" type="button" onClick={clearAll}>
                          Clear all
                        </button>
                      )}
                      <TertiaryButton onClick={addMoreFiles}>
                        + Add more files
                      </TertiaryButton>
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
                        <col className="col-sno" />
                        <col className="col-name" />
                        <col className="col-status" />
                        <col className="col-uploaded" />
                        <col className="col-notes" />
                        <col className="col-actions" />
                      </colgroup>

                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>File Name</th>
                          <th>Status</th>
                          <th>Uploaded On</th>
                          <th>Notes/description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {rows.length === 0 && failedIngestionFiles.length === 0 ? (
                          <tr className="data-empty-row">
                            <td colSpan={6}>
                              <div className="data-empty">
                                <p className="data-empty-hint">
                                  No files. Click on add files to start Ingestion
                                </p>
                                <TertiaryButton onClick={openPicker} className="data-upload-files-btn">
                                  + Upload files
                                </TertiaryButton>
                                <OutlinedButton
                                  label="Sample File"
                                  onClick={downloadSampleFile}
                                  iconLeft={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                                      <path d="M6.75 8.75V0.75M6.75 8.75L3.41667 5.41667M6.75 8.75L10.0833 5.41667M12.75 8.75V11.4167C12.75 11.7703 12.6095 12.1094 12.3595 12.3595C12.1094 12.6095 11.7703 12.75 11.4167 12.75H2.08333C1.72971 12.75 1.39057 12.6095 1.14052 12.3595C0.890476 12.1094 0.75 11.7703 0.75 11.4167V8.75" stroke="#2A455E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <>
                            {rows.map((r: FileRow, idx: number) => (
                              <tr key={r.id}>
                                <td>{idx + 1}</td>
                                <td>{r.name}</td>
                                <td>
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
                                <td>{formatUploaded(r.uploadedAt)}</td>
                                <td>
                                  {r.note ? (
                                    r.note
                                  ) : (
                                    <button
                                      type="button"
                                      className="data-add-note-btn"
                                      onClick={() => handleAddNote(r)}
                                    >
                                      + Add notes
                                    </button>
                                  )}
                                </td>
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
                            ))}
                            {failedIngestionFiles.map((f, index) => {
                              const backendStatus = f.status?.toUpperCase();
                              const isFailed = backendStatus === 'FAILED';
                              const label = isFailed ? 'Failed' : 'Partial';

                              return (
                                <tr key={f.fileId}>
                                  <td>{rows.length + index + 1}</td>
                                  <td>{f.fileName}</td>
                                  <td>
                                    <StatusBadge
                                      label={label}
                                      variant={isFailed ? 'failed' : 'partial'}
                                      size="sm"
                                    />
                                  </td>
                                  <td>{formatUploaded(new Date(f.uploadedAt))}</td>
                                  <td>{f.description || '-'}</td>
                                  <td className="data-td-actions">
                                    <DeleteButton
                                      onClick={async () => {
                                        try {
                                          await deleteIngestionFile(f.fileId);
                                          setFailedIngestionFiles(prev => prev.filter(x => x.fileId !== f.fileId));
                                          setHistoryRows(prev => prev.filter(hr => hr.id !== f.fileId));
                                        } catch (err) {
                                          console.error('Failed to delete ingestion file', err);
                                        }
                                      }}
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
                              );
                            })}
                          </>
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