import React, { useRef, useState } from 'react';
import './DataIngestion.css';

type Mode = 'manual' | 'api';

type FileRow = {
  id: number;
  file: File;
  status: 'Queued' | 'Uploaded' | 'Failed';
  notes: string;
};

export default function DataIngestion(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'ingestion' | 'history'>('ingestion');
  const [mode, setMode] = useState<Mode>('manual');
  const [rows, setRows] = useState<FileRow[]>([]);
  const [showModal, setShowModal] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleFilesAdd = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const next: FileRow[] = [];
    Array.from(list).forEach((f) =>
      next.push({
        id: Date.now() + Math.random(),
        file: f,
        status: 'Queued',
        notes: '',
      })
    );
    setRows((prev) => [...prev, ...next]);
    closeModal();
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files ?? null;
    handleFilesAdd(files);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const updateNotes = (id: number, notes: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, notes } : r)));
  };

  const ingestDisabled = rows.length === 0;

  return (
    <div className="ingestion-wrapper">
      <div className="ingestion-card">
        <div className="ingestion-header">
          <h2>Data Ingestion</h2>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'ingestion' ? 'active' : ''}`}
              onClick={() => setActiveTab('ingestion')}
            >
              Ingestion
            </button>
            <button
              className={`tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Ingestion History
            </button>
          </div>
        </div>

        {activeTab === 'ingestion' && (
          <>
            <div className="mode-row">
              <div className="pill-group">
                <button
                  className={`pill ${mode === 'manual' ? 'selected' : ''}`}
                  onClick={() => setMode('manual')}
                >
                  Ingest Manually
                </button>
                <button
                  className={`pill ${mode === 'api' ? 'selected' : ''}`}
                  onClick={() => setMode('api')}
                >
                  Ingest with API
                </button>
              </div>

              <button className="primary" disabled={ingestDisabled}>
                Ingest Files
              </button>
            </div>

            <div className="section-title">Selected Files</div>

            <div className="table-shell">
              <div className="table-header">
                <div className="col sn">S.No</div>
                <div className="col name">File Name</div>
                <div className="col status">Status</div>
                <div className="col notes">Description / Notes</div>
              </div>

              {rows.length === 0 ? (
                <div className="empty-state">
                  <button className="add-btn" onClick={openModal}>
                    <span className="plus-ico" aria-hidden>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    Add files
                  </button>
                  <div className="empty-hint">
                    You didn’t have any files yet. Click on add files to start ingestion
                  </div>
                </div>
              ) : (
                <div className="table-body">
                  {rows.map((r, i) => (
                    <div className="table-row" key={r.id}>
                      <div className="col sn">{i + 1}</div>
                      <div className="col name">{r.file.name}</div>
                      <div className="col status">{r.status}</div>
                      <div className="col notes">
                        <input
                          className="notes-input"
                          placeholder="Add a short description…"
                          value={r.notes}
                          onChange={(e) => updateNotes(r.id, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="history-placeholder">No history available yet.</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="upload-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-head">
              <div className="modal-title">Upload Files</div>
              <button className="close-x" onClick={closeModal} aria-label="Close">
                ×
              </button>
            </div>

            <div
              ref={dropRef}
              className="dropzone"
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <div className="preview-icon">
                <svg width="44" height="36" viewBox="0 0 44 36" fill="none">
                  <rect x="1" y="4" width="42" height="31" rx="4" stroke="#E2E8F0" strokeWidth="2" />
                  <rect x="6" y="9" width="15" height="10" rx="2" fill="#F1F5F9" />
                  <path d="M10 27l6-6 6 6H10z" fill="#E2E8F0" />
                  <circle cx="30.5" cy="14.5" r="3.5" fill="#E2E8F0" />
                </svg>
              </div>
              <div className="drop-text">
                Drag here or{' '}
                <button
                  className="link-like"
                  onClick={() => inputRef.current?.click()}
                  type="button"
                >
                  upload files
                </button>
              </div>
              <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => handleFilesAdd(e.target.files)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
