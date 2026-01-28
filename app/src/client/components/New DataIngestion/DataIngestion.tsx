import * as React from "react";
import "./DataIngestion.css";

import Header from "../componenetsss/Header";
import Checkbox from "../componenetsss/Checkbox";
import PrimaryButton from "../componenetsss/PrimaryButton";
import TertiaryButton from "../componenetsss/TertiaryButton";
import OutlinedButton from "../componenetsss/OutlinedButton";
import EditIconButton from "../componenetsss/EditIconButton";
import IngestionToggle, { IngestionToggleValue } from "../DataIngestion/Dataingestioncomponents/Ingestiontoggle";
import InfoBox from "./InfoBox";
import IngestionProgressBar from "./IngestionProgressBar";
import AddNoteModal from "./AddNoteModal";

type StagedRow = {
  id: string;
  fileName: string;
  ingestedOn: string;
  status: "STAGED" | "INGESTING";
  note?: string;
  ingestedByName: string;
  ingestedByInitials: string;
  selected: boolean;
};

type HistoryRow = {
  id: string;
  fileName: string;
  ingestedOn: string;
  status: "SUCCESS";
  note?: string;
  ingestedByName: string;
  ingestedByInitials: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function DataIngestion() {
  const [mode, setMode] = React.useState<IngestionToggleValue>("manual");
  const [search, setSearch] = React.useState("");

  // split
  const [topRatio, setTopRatio] = React.useState(0.62);
  const dragRef = React.useRef<{ dragging: boolean; startY: number; startRatio: number } | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  // data
  const [staged, setStaged] = React.useState<StagedRow[]>([]);
  const [history, setHistory] = React.useState<HistoryRow[]>([
    {
      id: "h1",
      fileName: "AJSDGJijnjfxnfius56789.csv",
      ingestedOn: "06 Jan, 2025 08:58 IST",
      status: "SUCCESS",
      note: "This file processes and import...",
      ingestedByName: "Vishal",
      ingestedByInitials: "V",
    },
  ]);

  // notes modal
  const [noteOpen, setNoteOpen] = React.useState(false);
  const [noteText, setNoteText] = React.useState("");
  const [noteForId, setNoteForId] = React.useState<string | null>(null);
  const noteTarget = React.useMemo(() => staged.find((s) => s.id === noteForId) || null, [staged, noteForId]);

  // ingest progress
  const [isIngesting, setIsIngesting] = React.useState(false);
  const [etaSeconds, setEtaSeconds] = React.useState<number | null>(null);
  const [processedFiles, setProcessedFiles] = React.useState(0);
  const [totalFiles, setTotalFiles] = React.useState(0);
  const progressIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // divider drag
  const onDividerMouseDown = (e: React.MouseEvent) => {
    if (!wrapRef.current) return;
    dragRef.current = { dragging: true, startY: e.clientY, startRatio: topRatio };
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  // file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const st = dragRef.current;
      if (!st?.dragging || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const dy = e.clientY - st.startY;
      const nextPx = st.startRatio * rect.height + dy;
      setTopRatio(clamp(nextPx / rect.height, 0.28, 0.78));
    };

    const onUp = () => {
      if (!dragRef.current?.dragging) return;
      dragRef.current.dragging = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [topRatio]);

  // actions
  const stagedCount = staged.length;

  const openFilePicker = () => {
  if (isIngesting) return;
  fileInputRef.current?.click();
};

const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;

  const now = "06 Jan, 2025 08:58 IST";
  const added: StagedRow[] = files.map((f, i) => ({
    id: `${Date.now()}-${i}`,
    fileName: f.name.replace(/\.[^/.]+$/, ""), // Remove file extension
    ingestedOn: now,
    status: "STAGED",
    note: undefined,
    ingestedByName: "Mira",
    ingestedByInitials: "M",
    selected: true,
  }));
  setStaged((p) => [...p, ...added]);

  // Reset file input
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

const onAddMoreFiles = () => {
  openFilePicker();
};

  const onClearAll = () => {
    if (isIngesting) return;
    setStaged([]);
  };

  const onToggleSelect = (id: string) => {
    if (isIngesting) return;
    setStaged((p) => p.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
  };

  const onRemoveStaged = (id: string) => {
    if (isIngesting) return;
    setStaged((p) => p.filter((s) => s.id !== id));
  };

  const onOpenNote = (id: string) => {
    const row = staged.find((s) => s.id === id);
    setNoteForId(id);
    setNoteText(row?.note ?? "");
    setNoteOpen(true);
  };

  const applyNoteToFile = () => {
    if (!noteForId) return;
    setStaged((p) => p.map((s) => (s.id === noteForId ? { ...s, note: noteText.trim() } : s)));
    setNoteOpen(false);
  };

  const applyNoteToAll = () => {
    setStaged((p) => p.map((s) => ({ ...s, note: noteText.trim() })));
    setNoteOpen(false);
  };

  const startIngest = () => {
    if (isIngesting || stagedCount === 0) return;

    // start UI state
    setIsIngesting(true);
    setEtaSeconds(54);
    setProcessedFiles(0);
    setTotalFiles(stagedCount);

    setStaged((p) => p.map((s) => ({ ...s, status: "INGESTING" })));

    // Start dynamic progress simulation
    let currentProgress = 0;
    const progressIncrement = Math.ceil(stagedCount / 10); // Update in 10 steps

    progressIntervalRef.current = setInterval(() => {
      currentProgress = Math.min(currentProgress + progressIncrement, stagedCount);
      setProcessedFiles(currentProgress);

      // Update ETA
      const remaining = stagedCount - currentProgress;
      const newEta = remaining > 0 ? Math.ceil((remaining / stagedCount) * 54) : 0;
      setEtaSeconds(newEta);

      // Check if complete
      if (currentProgress >= stagedCount) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }

        // Complete the ingestion
        const now = "06 Jan, 2025 08:58 IST";
        const moved: HistoryRow[] = staged.map((s) => ({
          id: "h-" + s.id,
          fileName: s.fileName.endsWith(".csv") ? s.fileName : `${s.fileName}.csv`,
          ingestedOn: now,
          status: "SUCCESS",
          note: s.note,
          ingestedByName: s.ingestedByName,
          ingestedByInitials: s.ingestedByInitials,
          selected: false,
        }));

        setHistory((p) => [...moved, ...p]);
        setStaged([]);
        setIsIngesting(false);
        setEtaSeconds(null);
        setProcessedFiles(0);
        setTotalFiles(0);
      }
    }, 300); // Update every 300ms
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

  const q = search.trim().toLowerCase();
  const stagedView = !q ? staged : staged.filter((s) => s.fileName.toLowerCase().includes(q));
  const historyView = !q ? history : history.filter((h) => h.fileName.toLowerCase().includes(q));

  return (
    <div className="di__page">
      <Header
        title="Data Ingestion"
        searchTerm={search}
        onSearchTermChange={setSearch}
        onFilterClick={() => {}}
        onSettingsClick={() => {}}
        onNotificationsClick={() => {}}
        showPrimary={false}
      />

      <div className="di__inner">
        <div className="di__topRow">
          <IngestionToggle
            value={mode}
            onChange={setMode}
            leftLabel="Manual"
            rightLabel="Real-Time"
          />

          {stagedCount > 0 && (
            <div className="di__actions">
              <OutlinedButton
                label="Clear all"
                                                  className="up-data-new-upload"

                onClick={onClearAll}
                disabled={isIngesting}
              />

              <TertiaryButton
                type="button"
                                  className="up-data-new-upload"

                onClick={onAddMoreFiles}
                disabled={isIngesting}
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M0.75 4.83333H8.91667M4.83333 0.75V8.91667" stroke="#034A7D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                }
              >
                Add more files
              </TertiaryButton>

              <PrimaryButton
                type="button"
                                  className="data-new-upload"

                onClick={startIngest}
                disabled={isIngesting}
                isLoading={isIngesting}
              >
                {isIngesting ? "Ingesting..." : `Ingest ${stagedCount} Files`}
              </PrimaryButton>
            </div>
          )}
        </div>

        <div className="di__splitWrap" ref={wrapRef}>
          {/* TOP */}
          <div className="di__pane di__paneTop" style={{ height: `${topRatio * 100}%`,borderRadius:'8px',marginBottom:'16px'}}>
            <div className="di__tableHead">
              <div className="di__th">File Name</div>
              <div className="di__th">Ingested On</div>
              <div className="di__th">Status</div>
              <div className="di__th">Description / Notes</div>
            </div>

            {stagedCount === 0 ? (
              <div className="di__emptyTop">
                <div className="di__emptyTitle">Upload Files to start ingestion</div>
                <PrimaryButton
                  type="button"
                  onClick={openFilePicker}
                  className="data-new-upload"
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M6.6001 0.600098L6.6001 8.6001M6.6001 0.600098L9.93343 3.93343M6.6001 0.600098L3.26676 3.93343M12.6001 8.6001V11.2668C12.6001 11.6204 12.4596 11.9595 12.2096 12.2096C11.9595 12.4596 11.6204 12.6001 11.2668 12.6001L1.93343 12.6001C1.57981 12.6001 1.24067 12.4596 0.990622 12.2096C0.740573 11.9595 0.600098 11.6204 0.600098 11.2668L0.600098 8.6001" stroke="#F9FBFD" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  }
                >
                  Upload File
                </PrimaryButton>
                <OutlinedButton
                  label="Sample File"
                  className="data-new-upload"
                  onClick={downloadSampleFile}
                  iconLeft={
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 8.75V1.75M7 8.75L4.08333 5.83333M7 8.75L9.91667 5.83333M12.25 8.75V11.0833C12.25 11.3928 12.1271 11.6895 11.9083 11.9083C11.6895 12.1271 11.3928 12.25 11.0833 12.25H2.91667C2.60725 12.25 2.3105 12.1271 2.09171 11.9083C1.87292 11.6895 1.75 11.3928 1.75 11.0833V8.75" stroke="#034A7D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  }
                />
              </div>
            ) : (
              <div className="di__tableScroll">
                <div className="di__rows">
                  {stagedView.map((r) => (
                    <div className="di__row" key={r.id}>
                      <div className="di__cell di__fileCell">
                        <Checkbox
                          checked={r.selected}
                          onChange={() => onToggleSelect(r.id)}
                          disabled={isIngesting}
                        />

                        <div className="di__fileNameWrap">
                          <div className="di__fileName" title={r.fileName}>
                            {r.fileName}
                          </div>

                          <button
                            className="di__rowIcon di__rowRemove"
                            type="button"
                            onClick={() => onRemoveStaged(r.id)}
                            disabled={isIngesting}
                            aria-label="Remove"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M10.75 0.75L0.75 10.75M0.75 0.75L10.75 10.75" stroke="#25303D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                          </button>
                        </div>
                      </div>

                      <div className="di__cell di__muted">{r.ingestedOn}</div>

                      <div className="di__cell">
                        {r.status === "STAGED" ? (
                          <span className="di__badge di__badgeStaged">Staged</span>
                        ) : (
                          <span className="di__badge di__badgeIngesting">Ingesting...</span>
                        )}
                      </div>

                      <div className="di__cell">
                        {r.note ? (
                          <div className="di__noteLine" title={r.note}>
                            <span className="di__noteText">{r.note}</span>
                            <EditIconButton
                              onClick={() => onOpenNote(r.id)}
                              disabled={isIngesting}
                              title="Edit note"
                            />
                          </div>
                        ) : (
                          <button className="di__addNotes" type="button" onClick={() => onOpenNote(r.id)} disabled={isIngesting}>
                            + Add notes
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isIngesting && (
              <div className="di__progressFloat">
                <IngestionProgressBar
                  processedFiles={processedFiles}
                  totalFiles={totalFiles}
                  etaSeconds={etaSeconds ?? undefined}
                  width={348}
                />
              </div>
            )}
          </div>

          {/* DIVIDER */}
          <div className="di__divider" onMouseDown={onDividerMouseDown}>
            <div className="di__dividerLine" />
            <div className="di__dividerPill">Previously Ingested Files</div>
            <div className="di__dividerLine" />
          </div>

          {/* BOTTOM */}
          <div className="di__pane di__paneBottom" style={{ height: `${(1 - topRatio) * 100}%` }}>
            <div className="di__tableScroll di__tableScrollHistory">
              <div className="di__rows">
                {historyView.map((r) => (
                  <div className="di__row di__rowHistory" key={r.id}>
                    <div className="di__cell di__muted di__fileHistory" title={r.fileName}>
                      {r.fileName}
                    </div>
                    <div className="di__cell di__muted">{r.ingestedOn}</div>
                    <div className="di__cell">
                      <span className="di__badge di__badgeSuccess">Success</span>
                    </div>
                    <div className="di__cell di__muted di__noteHistory" title={r.note}>
                      {r.note}
                    </div>
                  </div>
                ))}

                {historyView.length === 0 && <div className="di__historyEmpty">No history</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reuse InfoBox component */}
      <div className="di__infoFloat">
        <InfoBox
          storageKey="di.dupInfo"
          title="We detect Event Duplicates"
          message="Don’t worry about re-uploads. If an Usage Event already exists, we’ll detect it automatically and process it only once."
        />
      </div>

      {/* Reuse AddNoteModal component */}
      <AddNoteModal
        open={noteOpen && !!noteTarget}
        fileName={(noteTarget?.fileName ?? "") + ".csv"}
        value={noteText}
        onChange={setNoteText}
        onClose={() => setNoteOpen(false)}
        onApplyToAllFiles={applyNoteToAll}
        onAddNote={applyNoteToFile}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="data-file-input"
        style={{ display: 'none' }}
        onChange={onFilesPicked}
        accept=".csv,.json,.txt"
      />
    </div>
  );
}
