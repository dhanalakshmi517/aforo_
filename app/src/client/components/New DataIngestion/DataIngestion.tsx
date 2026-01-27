import * as React from "react";
import "./DataIngestion.css";

type Mode = "manual" | "realtime";

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

function formatEta(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  if (s < 60) return `${s} sec left..`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return `${m} min ${r} sec left..`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h} hr ${mm} min left..`;
}

/** localStorage safe helpers */
function lsGet(key: string) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, val: string) {
  try {
    window.localStorage.setItem(key, val);
  } catch {
    // ignore
  }
}

export default function DataIngestion() {
  // top header state
  const [mode, setMode] = React.useState<Mode>("manual");
  const [search, setSearch] = React.useState("");

  // split sizes
  const [topRatio, setTopRatio] = React.useState(0.62); // top pane % (draggable)
  const dragRef = React.useRef<{ dragging: boolean; startY: number; startRatio: number } | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  // staged files
  const [staged, setStaged] = React.useState<StagedRow[]>([]);
  // history (mock some rows like your image 3)
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
    {
      id: "h2",
      fileName: "AJSDGJijnjfxnfius56789.csv",
      ingestedOn: "06 Jan, 2025 08:58 IST",
      status: "SUCCESS",
      note: "This file processes and import...",
      ingestedByName: "Vishal",
      ingestedByInitials: "V",
    },
    {
      id: "h3",
      fileName: "AJSDGJijnjfxnfius56789.csv",
      ingestedOn: "06 Jan, 2025 08:58 IST",
      status: "SUCCESS",
      note: "This file processes and import...",
      ingestedByName: "Vishal",
      ingestedByInitials: "V",
    },
    {
      id: "h4",
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
  const noteTarget = React.useMemo(
    () => staged.find((s) => s.id === noteForId) || null,
    [staged, noteForId]
  );

  // ingest progress state (mock)
  const [isIngesting, setIsIngesting] = React.useState(false);
  const [etaSec, setEtaSec] = React.useState(54);
  const [processedFiles, setProcessedFiles] = React.useState(10);
  const [totalFiles, setTotalFiles] = React.useState(100);

  // info box dismiss
  const infoKey = "di.dupInfo.dismissed";
  const [showDupInfo, setShowDupInfo] = React.useState(() => lsGet(infoKey) !== "1");
  const [dontShowAgain, setDontShowAgain] = React.useState(lsGet(infoKey) === "1");

  // drag divider handlers
  const onDividerMouseDown = (e: React.MouseEvent) => {
    if (!wrapRef.current) return;
    dragRef.current = { dragging: true, startY: e.clientY, startRatio: topRatio };
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  };

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const st = dragRef.current;
      if (!st?.dragging || !wrapRef.current) return;

      const rect = wrapRef.current.getBoundingClientRect();
      const dy = e.clientY - st.startY;
      const nextPx = st.startRatio * rect.height + dy;
      const nextRatio = nextPx / rect.height;

      // keep sane min heights
      setTopRatio(clamp(nextRatio, 0.28, 0.78));
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

  // mock “ingest” ticking
  React.useEffect(() => {
    if (!isIngesting) return;

    const t = window.setInterval(() => {
      setEtaSec((p) => (p <= 0 ? 0 : p - 1));
      setProcessedFiles((p) => (p >= totalFiles ? totalFiles : p + 1));
    }, 900);

    return () => window.clearInterval(t);
  }, [isIngesting, totalFiles]);

  React.useEffect(() => {
    if (!isIngesting) return;
    if (processedFiles >= totalFiles || etaSec <= 0) {
      // finish ingest: move staged -> history, mark success
      setIsIngesting(false);

      const now = "06 Jan, 2025 08:58 IST";
      const moved: HistoryRow[] = staged.map((s) => ({
        id: "h-" + s.id,
        fileName: s.fileName.endsWith(".csv") ? s.fileName : `${s.fileName}.csv`,
        ingestedOn: now,
        status: "SUCCESS",
        note: s.note ? s.note : "This file processes and import...",
        ingestedByName: s.ingestedByName,
        ingestedByInitials: s.ingestedByInitials,
      }));

      setHistory((prev) => [...moved, ...prev]);
      setStaged([]);
      // reset progress mock
      setEtaSec(54);
      setProcessedFiles(10);
      setTotalFiles(100);
    }
  }, [etaSec, processedFiles, totalFiles, isIngesting, staged]);

  // actions
  const selectedCount = staged.filter((s) => s.selected).length;
  const stagedCount = staged.length;

  const onClearAll = () => {
    if (isIngesting) return;
    setStaged([]);
  };

  const onAddMoreFiles = () => {
    if (isIngesting) return;
    // mock add 4 staged files like screenshot
    const now = "06 Jan, 2025 08:58 IST";
    const added: StagedRow[] = new Array(4).fill(0).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      fileName: "AJSDGJijnjfxnfius56789",
      ingestedOn: now,
      status: "STAGED",
      note: undefined,
      ingestedByName: "Mira",
      ingestedByInitials: "M",
      selected: true,
    }));

    setStaged((prev) => [...prev, ...added]);
  };

  const onUploadFirst = () => {
    // same as add more but for empty state
    onAddMoreFiles();
  };

  const onSampleFile = () => {
    // noop placeholder
    // you can hook download here
  };

  const onToggleSelect = (id: string) => {
    if (isIngesting) return;
    setStaged((prev) => prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
  };

  const onRemoveStaged = (id: string) => {
    if (isIngesting) return;
    setStaged((prev) => prev.filter((s) => s.id !== id));
  };

  const onOpenNote = (id: string) => {
    const row = staged.find((s) => s.id === id);
    setNoteForId(id);
    setNoteText(row?.note ?? "");
    setNoteOpen(true);
  };

  const applyNoteToFile = () => {
    if (!noteForId) return;
    setStaged((prev) => prev.map((s) => (s.id === noteForId ? { ...s, note: noteText.trim() } : s)));
    setNoteOpen(false);
  };

  const applyNoteToAll = () => {
    setStaged((prev) => prev.map((s) => ({ ...s, note: noteText.trim() })));
    setNoteOpen(false);
  };

  const onIngest = () => {
    if (isIngesting) return;
    if (stagedCount === 0) return;

    setIsIngesting(true);
    setStaged((prev) => prev.map((s) => ({ ...s, status: "INGESTING" })));
  };

  // filter (simple) for both lists by search
  const filterBySearch = (name: string) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return name.toLowerCase().includes(q);
  };

  const stagedView = staged.filter((s) => filterBySearch(s.fileName));
  const historyView = history.filter((h) => filterBySearch(h.fileName));

  // info box close
  const closeInfo = () => {
    if (dontShowAgain) lsSet(infoKey, "1");
    setShowDupInfo(false);
  };

  const toggleDontShow = (v: boolean) => {
    setDontShowAgain(v);
    if (v) lsSet(infoKey, "1");
    else lsSet(infoKey, "0");
  };

  return (
    <div className="di__page">
      {/* ===== Fixed header ===== */}
      <div className="di__header">
        <div className="di__title">Data Ingestion</div>

        <div className="di__headerRight">
          <div className="di__searchWrap">
            <SearchIcon />
            <input
              className="di__search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="di__headerIcons">
            <button className="di__iconBtn" type="button" aria-label="Filter">
              <FilterIcon />
            </button>
            <div className="di__vSep" />
            <button className="di__iconBtn" type="button" aria-label="Star">
              <StarIcon />
            </button>
            <button className="di__iconBtn" type="button" aria-label="Bell">
              <BellIcon />
            </button>
          </div>
        </div>
      </div>

      {/* ===== Page inner (16px padding) ===== */}
      <div className="di__inner">
        {/* mode switch + actions row */}
        <div className="di__topRow">
          <ModePill value={mode} onChange={setMode} />

          {/* Right actions only when staged exist */}
          {stagedCount > 0 ? (
            <div className="di__actions">
              <button className="di__linkBtn" type="button" onClick={onClearAll} disabled={isIngesting}>
                Clear all
              </button>

              <button className="di__btn di__btnGhost" type="button" onClick={onAddMoreFiles} disabled={isIngesting}>
                <PlusIcon />
                Add more files
              </button>

              <button
                className="di__btn di__btnPrimary"
                type="button"
                onClick={onIngest}
                disabled={isIngesting || stagedCount === 0}
              >
                {isIngesting ? "Ingesting..." : `Ingest ${stagedCount} Files`}
              </button>
            </div>
          ) : null}
        </div>

        {/* ===== Split panes (only these scroll) ===== */}
        <div className="di__splitWrap" ref={wrapRef}>
          {/* TOP PANE */}
          <div className="di__pane di__paneTop" style={{ height: `${topRatio * 100}%` }}>
            <TableHeader />

            {/* Top content */}
            {stagedCount === 0 ? (
              <div className="di__emptyTop">
                <div className="di__emptyTitle">Upload Files to start ingestion</div>

                <button className="di__btn di__btnPrimary di__btnUpload" type="button" onClick={onUploadFirst}>
                  <UploadIcon />
                  Upload File
                </button>

                <button className="di__sample" type="button" onClick={onSampleFile}>
                  <DownloadIcon />
                  Sample File
                </button>
              </div>
            ) : (
              <div className="di__tableScroll">
                <div className="di__rows">
                  {stagedView.map((r) => (
                    <div className="di__row" key={r.id}>
                      {/* file name cell */}
                      <div className="di__cell di__fileCell">
                        <label className="di__cbWrap">
                          <input
                            type="checkbox"
                            checked={r.selected}
                            onChange={() => onToggleSelect(r.id)}
                            disabled={isIngesting}
                          />
                          <span className="di__cb" aria-hidden="true" />
                        </label>

                        <div className="di__fileNameWrap">
                          <div className="di__fileName" title={r.fileName}>
                            {r.fileName}
                          </div>

                          {/* hover remove X */}
                          <button
                            className="di__rowIcon di__rowRemove"
                            type="button"
                            aria-label="Remove file"
                            onClick={() => onRemoveStaged(r.id)}
                            disabled={isIngesting}
                          >
                            <XIcon />
                          </button>
                        </div>
                      </div>

                      {/* ingested on */}
                      <div className="di__cell di__muted">{r.ingestedOn}</div>

                      {/* status */}
                      <div className="di__cell">
                        {r.status === "STAGED" ? (
                          <span className="di__badge di__badgeStaged">Staged</span>
                        ) : (
                          <span className="di__badge di__badgeIngesting">
                            <span className="di__spin" aria-hidden="true" />
                            Ingesting...
                          </span>
                        )}
                      </div>

                      {/* description/notes */}
                      <div className="di__cell">
                        {r.note ? (
                          <div className="di__noteLine" title={r.note}>
                            <span className="di__noteText">{r.note}</span>

                            <button
                              type="button"
                              className="di__rowIcon di__rowEdit"
                              aria-label="Edit note"
                              onClick={() => onOpenNote(r.id)}
                              disabled={isIngesting}
                            >
                              <PencilIcon />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="di__addNotes"
                            onClick={() => onOpenNote(r.id)}
                            disabled={isIngesting}
                          >
                            + Add notes
                          </button>
                        )}
                      </div>

                      {/* ingested by */}
                      <div className="di__cell di__byCell">
                        <div className="di__avatar">{r.ingestedByInitials}</div>
                        <div className="di__byName">{r.ingestedByName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* progress bar floating (like your image 5) */}
            {isIngesting ? (
              <div className="di__progressFloat">
                <ProgressCard
                  title="Uploading and processing files. Please wait..."
                  etaText={formatEta(etaSec)}
                  processed={processedFiles}
                  total={totalFiles}
                />
              </div>
            ) : null}
          </div>

          {/* DRAGGABLE DIVIDER */}
          <div className="di__divider" onMouseDown={onDividerMouseDown} role="separator" aria-label="Resize panels">
            <div className="di__dividerLine" />
            <div className="di__dividerPill">Previously Ingested Files</div>
            <div className="di__dividerLine" />
          </div>

          {/* BOTTOM PANE (History) */}
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

                    <div className="di__cell di__byCell">
                      <div className="di__avatar di__avatarDark">{r.ingestedByInitials}</div>
                      <div className="di__byName">{r.ingestedByName}</div>
                    </div>
                  </div>
                ))}

                {historyView.length === 0 ? (
                  <div className="di__historyEmpty">No history</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Duplicate info box bottom-right ===== */}
      {showDupInfo ? (
        <div className="di__infoFloat">
          <div className="di__infoBox">
            <div className="di__infoTop">
              <div className="di__infoTitle">We detect Event Duplicates</div>
              <button className="di__infoClose" type="button" aria-label="Close" onClick={closeInfo}>
                <XIcon />
              </button>
            </div>

            <div className="di__infoMsg">
              Don’t worry about re-uploads. If an Usage Event already exists, we’ll detect it automatically and process it only
              once.
            </div>

            <label className="di__infoCheck">
              <input type="checkbox" checked={dontShowAgain} onChange={(e) => toggleDontShow(e.target.checked)} />
              <span className="di__infoCb" aria-hidden="true" />
              <span className="di__infoCheckText">Don’t show this again</span>
            </label>
          </div>
        </div>
      ) : null}

      {/* ===== Notes modal ===== */}
      {noteOpen && noteTarget ? (
        <div className="di__modalOverlay" role="dialog" aria-modal="true">
          <div className="di__modalScrim" onMouseDown={() => setNoteOpen(false)} />

          <div className="di__modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="di__modalHeader">
              <div className="di__modalTitle">Add Notes</div>
              <button className="di__modalClose" type="button" aria-label="Close" onClick={() => setNoteOpen(false)}>
                <XIcon />
              </button>
            </div>

            <div className="di__modalFile">{noteTarget.fileName}.csv</div>

            <textarea className="di__modalTextarea" value={noteText} onChange={(e) => setNoteText(e.target.value)} />

            <div className="di__modalFooter">
              <button className="di__btn di__btnSoft" type="button" onClick={applyNoteToAll}>
                Apply Note to All Files
              </button>

              <button className="di__btn di__btnPrimary" type="button" onClick={applyNoteToFile}>
                Add Note
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ===================== sub components ===================== */

function TableHeader() {
  return (
    <div className="di__tableHead">
      <div className="di__th">File Name</div>
      <div className="di__th">Ingested On</div>
      <div className="di__th">Status</div>
      <div className="di__th">Description / Notes</div>
      <div className="di__th">Ingested By</div>
    </div>
  );
}

function ModePill({ value, onChange }: { value: Mode; onChange: (v: Mode) => void }) {
  const isLeft = value === "manual";
  return (
    <div className="di__mode" role="tablist" aria-label="Ingestion mode">
      <div className="di__modeThumb" style={{ transform: isLeft ? "translateX(0)" : "translateX(100%)" }} aria-hidden="true" />
      <button type="button" className={`di__modeBtn ${isLeft ? "isActive" : ""}`} onClick={() => onChange("manual")} role="tab">
        Manual
      </button>
      <button
        type="button"
        className={`di__modeBtn ${!isLeft ? "isActive" : ""}`}
        onClick={() => onChange("realtime")}
        role="tab"
      >
        Real-Time
      </button>
    </div>
  );
}

function ProgressCard({
  title,
  etaText,
  processed,
  total,
}: {
  title: string;
  etaText: string;
  processed: number;
  total: number;
}) {
  const pct = total <= 0 ? 0 : clamp((processed / total) * 100, 0, 100);

  return (
    <div className="di__progCard" role="status" aria-live="polite">
      <div className="di__progTitle">{title}</div>
      <div className="di__progTrack">
        <div className="di__progFill" style={{ width: `${pct}%` }} />
      </div>
      <div className="di__progMeta">
        <div className="di__progLeft">{etaText}</div>
        <div className="di__progRight">
          {processed} / {total} files
        </div>
      </div>
    </div>
  );
}

/* ===================== Icons (inline) ===================== */

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" />
      <path d="M16.2 16.2 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 12h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 17.3 6.8 20l1-5.7L3.6 10l5.8-.8L12 4l2.6 5.2 5.8.8-4.2 4.3 1 5.7L12 17.3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 8l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
