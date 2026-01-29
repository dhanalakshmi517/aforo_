import * as React from "react";
import "./DataIngestion.css";

import Header from "../componenetsss/Header";
import Checkbox from "../componenetsss/Checkbox";
import PrimaryButton from "../componenetsss/PrimaryButton";
import OutlinedButton from "../componenetsss/OutlinedButton";
import TertiaryButton from "../componenetsss/TertiaryButton";
import EditIconButton from "../componenetsss/EditIconButton";
import IngestionToggle, { IngestionToggleValue } from "../DataIngestion/Dataingestioncomponents/Ingestiontoggle";
import InfoBox from "./InfoBox";
import IngestionProgressBar from "./IngestionProgressBar";
import AddNoteModal from "./AddNoteModal";
import { ingestFiles, fetchIngestionFiles, IngestionFile, deleteIngestionFile } from "../DataIngestion/api";
import FilterChip from "../componenetsss/FilterChip";
import SimpleFilterDropdown from "../componenetsss/SimpleFilterDropdown";
import DateSortDropdown from "../componenetsss/DateSortDropdown";
import MainFilterMenu, { MainFilterKey } from "../componenetsss/MainFilterMenu";
import ResetButton from "../componenetsss/ResetButton";
import { ToastProvider, useToast } from "../componenetsss/ToastProvider";

type StagedRow = {
  id: string;
  file?: File;
  fileName: string;
  ingestedOn: string;
  status: "STAGED" | "INGESTING" | "UPLOADING" | "UPLOADED";
  note?: string;
  ingestedByName: string;
  ingestedByInitials: string;
  selected: boolean;
};

type HistoryRow = {
  id: string;
  fileName: string;
  ingestedOn: string;
  status: "SUCCESS" | "FAILED" | "STAGED" | "Partial";
  note?: string;
  ingestedByName: string;
  ingestedByInitials: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function DataIngestion() {
  const { showToast } = useToast();
  const [mode, setMode] = React.useState<IngestionToggleValue>("manual");
  const [search, setSearch] = React.useState("");

  // split
  const [topRatio, setTopRatio] = React.useState(0.34);
  const dragRef = React.useRef<{ dragging: boolean; startY: number; startRatio: number } | null>(null);
  const wrapRef = React.useRef<HTMLDivElement | null>(null);

  // data
  const [staged, setStaged] = React.useState<StagedRow[]>([]);
  const [history, setHistory] = React.useState<HistoryRow[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<{ [key: string]: File }>({});
  const [failedIngestionFiles, setFailedIngestionFiles] = React.useState<IngestionFile[]>([]);
  const [hasInvalidFiles, setHasInvalidFiles] = React.useState(false);

  // filters
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);
  const [dateSortOrder, setDateSortOrder] = React.useState<"newest" | "oldest" | null>(null);

  // filter dropdown state
  const filterButtonRef = React.useRef<HTMLButtonElement>(null!);
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = React.useState(false);
  const [activeFilterKey, setActiveFilterKey] = React.useState<MainFilterKey | null>(null);
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = React.useState({ top: 0, left: 0 });
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = React.useState({ top: 0, left: 0 });
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = React.useState(false);

  const statusFilterRef = React.useRef<HTMLDivElement>(null!);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = React.useState(false);
  const [isStatusFilterHovered, setIsStatusFilterHovered] = React.useState(false);

  const dateFilterRef = React.useRef<HTMLDivElement>(null!);
  const [isDateFilterOpen, setIsDateFilterOpen] = React.useState(false);
  const [isDateFilterHovered, setIsDateFilterHovered] = React.useState(false);

  // Filter dropdown refs for table headers
  const statusHeaderFilterRef = React.useRef<HTMLDivElement>(null);
  const dateHeaderFilterRef = React.useRef<HTMLDivElement>(null);
  const [isStatusHeaderFilterOpen, setIsStatusHeaderFilterOpen] = React.useState(false);
  const [isDateHeaderFilterOpen, setIsDateHeaderFilterOpen] = React.useState(false);

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

  // Load history on component mount
  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        const files: IngestionFile[] = await fetchIngestionFiles();

        const mapped: HistoryRow[] = files.map((f) => {
          let status: HistoryRow["status"];
          const backendStatus = f.status?.toUpperCase();

          if (backendStatus === 'FAILED') {
            status = 'FAILED';
          } else if (backendStatus === 'STAGED') {
            status = 'STAGED';
          } else if (backendStatus === 'PARTIALLY_INGESTED') {
            status = 'Partial';
          } else {
            status = 'SUCCESS';
          }

          const ingestedOn = new Date(f.uploadedAt);
          const formattedDate = ingestedOn.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
          }) + ' IST';

          return {
            id: f.fileId.toString(),
            fileName: f.fileName,
            ingestedOn: formattedDate,
            status,
            note: f.description || undefined,
            ingestedByName: "User",
            ingestedByInitials: "U"
          };
        });

        setHistory(mapped);
      } catch (error) {
        console.error('Failed to load ingestion history:', error);
      }
    };

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

    loadHistory();
    loadFailedIngestionFiles();
  }, []);

  // file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Filter handlers
  const handleResetFilters = () => {
    setSelectedStatuses([]);
    setDateSortOrder(null);
  };

  // Filter options
  const statusOptions = [
    { id: "STAGED", label: "Staged" },
    { id: "UPLOADING", label: "Uploading" },
    { id: "INGESTING", label: "Ingesting" },
    { id: "FAILED", label: "Failed" },
    { id: "PARTIAL", label: "Partial" },
    { id: "SUCCESS", label: "Success" },
  ];

  const mainFilterItems = [
    { key: "status" as MainFilterKey, label: "Status" },
    { key: "date" as MainFilterKey, label: "Date" },
  ];

  // Filter logic for staged files
  const filteredStaged = React.useMemo(() => {
    let filtered = [...staged];
    
    // Status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(row => 
        selectedStatuses.includes(row.status)
      );
    }
    
    return filtered;
  }, [staged, selectedStatuses]);

  // Filter logic for failed files
  const filteredFailedFiles = React.useMemo(() => {
    let filtered = [...failedIngestionFiles];
    
    // Status filter for failed files
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(file => {
        const backendStatus = file.status?.toUpperCase();
        if (backendStatus === 'FAILED' && selectedStatuses.includes('FAILED')) return true;
        if (backendStatus === 'PARTIALLY_INGESTED' && selectedStatuses.includes('PARTIAL')) return true;
        return false;
      });
    }
    
    // Date sorting
    if (dateSortOrder) {
      filtered.sort((a, b) => {
        const dateA = new Date(a.uploadedAt).getTime();
        const dateB = new Date(b.uploadedAt).getTime();
        return dateSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
    }
    
    return filtered;
  }, [failedIngestionFiles, selectedStatuses, dateSortOrder]);

  // Combined filtered view
  const stagedView = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = filteredStaged;
    
    if (q) {
      filtered = filtered.filter(s => s.fileName.toLowerCase().includes(q));
    }
    
    return filtered;
  }, [filteredStaged, search]);

  const historyView = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    let filtered = [...history];
    
    if (q) {
      filtered = filtered.filter(h => h.fileName.toLowerCase().includes(q));
    }
    
    // Status filter for history
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(row => 
        selectedStatuses.includes(row.status)
      );
    }
    
    // Date sorting for history
    if (dateSortOrder) {
      filtered.sort((a, b) => {
        const dateA = new Date(a.ingestedOn).getTime();
        const dateB = new Date(b.ingestedOn).getTime();
        return dateSortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
    }
    
    return filtered;
  }, [history, search, selectedStatuses, dateSortOrder]);

  React.useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const st = dragRef.current;
      if (!st?.dragging || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const dy = e.clientY - st.startY;
      const nextPx = st.startRatio * rect.height + dy;
      setTopRatio(clamp(nextPx / rect.height, 0.28, 0.65));
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
  const canIngest = stagedCount > 0 && !hasInvalidFiles && !isIngesting;

  const openFilePicker = () => {
  if (isIngesting) return;
  fileInputRef.current?.click();
};

// File validation
  const validateFiles = (files: File[]): { valid: File[]; invalid: File[] } => {
    const valid: File[] = [];
    const invalid: File[] = [];
    
    files.forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'json' || extension === 'csv' || extension === 'txt') {
        valid.push(file);
      } else {
        invalid.push(file);
      }
    });
    
    return { valid, invalid };
  };

  const onFilesPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const { valid, invalid } = validateFiles(files);
    
    // Show toast for invalid files
    if (invalid.length > 0) {
      const invalidNames = invalid.map(f => f.name).join(', ');
      showToast?.({
        kind: "error",
        message: `Invalid file format(s): ${invalidNames}. Only JSON, CSV, and TXT files are allowed.`,
        duration: 5000
      });
      
      // Show additional toast about disabled ingest button
      showToast?.({
        kind: "info",
        message: "Please remove invalid files to enable the 'Ingest Files' button.",
        duration: 4000
      });
    }

    if (valid.length === 0) return;

    const now = new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    }) + ' IST';
    const added: StagedRow[] = valid.map((f, i) => ({
      id: `${Date.now()}-${i}`,
      file: f,
      fileName: f.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      ingestedOn: now,
      status: "STAGED",
      note: undefined,
      ingestedByName: "Mira",
      ingestedByInitials: "M",
      selected: true,
    }));
    
    setStaged((p) => [...p, ...added]);
    
    // Store files for API call
    const newUploadedFiles: { [key: string]: File } = {};
    added.forEach(row => {
      if (row.file) {
        newUploadedFiles[row.id] = row.file;
      }
    });
    setUploadedFiles(prev => ({ ...prev, ...newUploadedFiles }));

    // Update invalid files state
    setHasInvalidFiles(invalid.length > 0);

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
    setUploadedFiles({});
    setHasInvalidFiles(false);
  };

  const onToggleSelect = (id: string) => {
    if (isIngesting) return;
    setStaged((p) => p.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
  };

  const onRemoveStaged = (id: string) => {
    if (isIngesting) return;
    setStaged((p) => p.filter((s) => s.id !== id));
    // Also remove from uploadedFiles
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[id];
      return newFiles;
    });
    
    // Reset invalid files state if no staged files remain
    if (staged.length <= 1) {
      setHasInvalidFiles(false);
    }
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

  const onDeleteFailedFile = async (fileId: number) => {
    try {
      await deleteIngestionFile(fileId);
      setFailedIngestionFiles(prev => prev.filter(x => x.fileId !== fileId));
      setHistory(prev => prev.filter(hr => hr.id !== fileId.toString()));
    } catch (err) {
      console.error('Failed to delete ingestion file', err);
    }
  };

  const startIngest = async () => {
    if (isIngesting || stagedCount === 0) return;

    // Get selected files and their descriptions
    const selectedStaged = staged.filter(s => s.selected);
    const filesToUpload: File[] = [];
    const descriptions: string[] = [];

    selectedStaged.forEach(row => {
      const file = uploadedFiles[row.id];
      if (file) {
        filesToUpload.push(file);
        descriptions.push(row.note || '');
      }
    });

    if (filesToUpload.length === 0) {
      console.error('No files to upload');
      return;
    }

    // Start UI state
    setIsIngesting(true);
    setEtaSeconds(54);
    setProcessedFiles(0);
    setTotalFiles(filesToUpload.length);

    setStaged((p) => p.map((s) =>
      s.selected ? { ...s, status: "UPLOADING" } : s
    ));

    try {
      // Call the API
      console.log('Calling ingestFiles API...');
      const result = await ingestFiles(filesToUpload, descriptions, 'MANUAL', true);

      console.log('API Response:', result);

      if (result.success) {
        // Simulate progress updates
        let currentProgress = 0;
        const progressIncrement = Math.ceil(filesToUpload.length / 10);

        progressIntervalRef.current = setInterval(() => {
          currentProgress = Math.min(currentProgress + progressIncrement, filesToUpload.length);
          setProcessedFiles(currentProgress);

          // Update ETA
          if (etaSeconds !== null) {
            setEtaSeconds(Math.max(0, etaSeconds - 5));
          }

          // Complete when all files processed
          if (currentProgress >= filesToUpload.length) {
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }

            // Complete the ingestion
            const now = new Date().toLocaleString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'Asia/Kolkata'
            }) + ' IST';

            const moved: HistoryRow[] = selectedStaged.map((s) => ({
              id: "h-" + s.id,
              fileName: s.file ? s.file.name : `${s.fileName}.csv`,
              ingestedOn: now,
              status: "SUCCESS",
              note: s.note,
              ingestedByName: s.ingestedByName,
              ingestedByInitials: s.ingestedByInitials,
            }));

            setHistory((p) => [...moved, ...p]);

            // Remove ingested files from staged and uploadedFiles
            const remainingStaged = staged.filter(s => !s.selected);
            setStaged(remainingStaged);

            const remainingUploadedFiles = { ...uploadedFiles };
            selectedStaged.forEach(s => {
              delete remainingUploadedFiles[s.id];
            });
            setUploadedFiles(remainingUploadedFiles);

            setIsIngesting(false);
            setEtaSeconds(null);
            setProcessedFiles(0);
            setTotalFiles(0);

            // Reload history to get latest data
            const reloadHistory = async () => {
              try {
                const files: IngestionFile[] = await fetchIngestionFiles();
                const mapped: HistoryRow[] = files.map((f) => {
                  let status: HistoryRow["status"];
                  const backendStatus = f.status?.toUpperCase();

                  if (backendStatus === 'FAILED') {
                    status = 'FAILED';
                  } else if (backendStatus === 'STAGED') {
                    status = 'STAGED';
                  } else if (backendStatus === 'PARTIALLY_INGESTED') {
                    status = 'Partial';
                  } else {
                    status = 'SUCCESS';
                  }

                  const ingestedOn = new Date(f.uploadedAt);
                  const formattedDate = ingestedOn.toLocaleString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata'
                  }) + ' IST';

                  return {
                    id: f.fileId.toString(),
                    fileName: f.fileName,
                    ingestedOn: formattedDate,
                    status,
                    note: f.description || undefined,
                    ingestedByName: "User",
                    ingestedByInitials: "U"
                  };
                });
                setHistory(mapped);

                // Also reload failed files
                const filtered = files.filter((f) => {
                  const backendStatus = f.status?.toUpperCase();
                  if (!backendStatus) return false;
                  if (backendStatus === 'FAILED') return true;
                  if (backendStatus === 'PARTIALLY_INGESTED') return true;
                  return false;
                });
                setFailedIngestionFiles(filtered);
              } catch (error) {
                console.error('Failed to reload history:', error);
              }
            };

            reloadHistory();
          }
        }, 300);
      } else {
        // Handle API error
        console.error('API Error:', result.message);
        setStaged((p) => p.map((s) =>
          s.selected ? { ...s, status: "STAGED" } : s
        ));
        setIsIngesting(false);
        setEtaSeconds(null);
        setProcessedFiles(0);
        setTotalFiles(0);

        // Show error message (you could add a toast notification here)
        showToast?.({
          kind: "error",
          message: result.message || 'Ingestion failed. Please try again.',
          duration: 5000
        });

        // Reload failed files
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
        } catch (error) {
          console.error('Failed to reload failed files:', error);
        }
      }
    } catch (error) {
      console.error('Ingestion error:', error);
      setStaged((p) => p.map((s) =>
        s.selected ? { ...s, status: "STAGED" } : s
      ));
      setIsIngesting(false);
      setEtaSeconds(null);
      setProcessedFiles(0);
      setTotalFiles(0);

      showToast?.({
        kind: "error",
        message: 'Ingestion failed. Please try again.',
        duration: 5000
      });

      // Reload failed files
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
      } catch (error) {
        console.error('Failed to reload failed files:', error);
      }
    }
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

  // Filter dropdown handlers that close after selection
  const handleStatusFilterChange = (value: (string | number)[]) => {
    setSelectedStatuses(value as string[]);
    setIsStatusFilterOpen(false);
    setIsStatusHeaderFilterOpen(false);
  };

  const handleDateFilterChange = (value: "newest" | "oldest" | null) => {
    setDateSortOrder(value);
    setIsDateFilterOpen(false);
    setIsDateHeaderFilterOpen(false);
  };

  const onFilterClick = () => {
    // Get the filter button position using the ref
    if (filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setMainFilterMenuPosition({ top: rect.bottom + 4, left: rect.left - 150 });
      setIsMainFilterMenuOpen(true);
    }
  };

  const handleMainFilterSelect = (key: MainFilterKey) => {
    setActiveFilterKey(key);
    const buttonRect = filterButtonRef.current.getBoundingClientRect();
    
    // Position based on which filter is selected
    if (key === 'status') {
      setMainFilterPanelPosition({ top: buttonRect.bottom + 4, left: buttonRect.left - 430 });
      setIsStatusFilterOpen(true);
      setIsDateFilterOpen(false); // Close date filter when opening status
    } else if (key === 'date') {
      setMainFilterPanelPosition({ top: buttonRect.bottom + 4, left: buttonRect.left - 430 });
      setIsDateFilterOpen(true);
      setIsStatusFilterOpen(false); // Close status filter when opening date
    }
    
    setIsMainFilterPanelOpen(true);
    // Don't close the main filter menu - keep it open
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (target.closest('.data-ingestion-filter-popover')) return;
      if (target.closest('.di__filter-button')) return;
      if (target.closest('.di__th--filterable')) return;
      if (target.closest('.mfm-root')) return; // Don't close when clicking main filter menu items

      setIsMainFilterMenuOpen(false);
      setIsMainFilterPanelOpen(false);
      setIsStatusFilterOpen(false);
      setIsDateFilterOpen(false);
      setIsStatusHeaderFilterOpen(false);
      setIsDateHeaderFilterOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ToastProvider>
      <div className="di__page">
      <Header
        title="Data Ingestion"
        searchTerm={search}
        onSearchTermChange={setSearch}
        onFilterClick={onFilterClick}
        onSettingsClick={() => {}}
        onNotificationsClick={() => {}}
        showPrimary={false}
        filterButtonRef={filterButtonRef}
      />

      <div className="di__inner">
        <div className="di__topRow">
          <IngestionToggle
            value={mode}
            onChange={setMode}
            leftLabel="Manual"
            rightLabel="Real-Time"
          />

          {(stagedCount > 0 || filteredFailedFiles.length > 0) && (
            <div className="di__topActions">
              <OutlinedButton
                label="Clear all"
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
                disabled={!canIngest}
                isLoading={isIngesting}
              >
                {isIngesting ? "Ingesting..." : `Ingest ${stagedCount} Files`}
              </PrimaryButton>
            </div>
          )}
        </div>

        <div className="di__splitWrap" ref={wrapRef}>
          {/* TOP */}
          <div className="di__pane di__paneTop" style={{ height: `${history.length > 0 ? topRatio * 100 : 100}%`,borderRadius:'8px',marginBottom:'16px'}}>
            {/* Filter Chips */}
            {(selectedStatuses.length > 0 || dateSortOrder) && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '8px 16px',
                borderBottom: '1px solid var(--color-neutral-200)'
              }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedStatuses.map(status => (
                    <FilterChip
                      key={status}
                      label={`Status: ${status}`}
                      onRemove={() => setSelectedStatuses(prev => prev.filter(s => s !== status))}
                    />
                  ))}
                  {dateSortOrder && (
                    <FilterChip
                      label={`Date: ${dateSortOrder === 'newest' ? 'Newest First' : 'Oldest First'}`}
                      onRemove={() => setDateSortOrder(null)}
                    />
                  )}
                </div>
                <ResetButton onClick={handleResetFilters} />
              </div>
            )}
            
            <div className="di__tableHead">
              <div className="di__th">File Name</div>
              <div 
                className="di__th di__th--filterable" 
                ref={dateHeaderFilterRef}
                onClick={() => setIsDateHeaderFilterOpen(true)}
              >
                <span>Ingested On</span>
                <button className="di__filter-trigger" onClick={(e) => {
                  e.stopPropagation();
                  setIsDateHeaderFilterOpen(true);
                }} aria-label="Filter by Ingested On">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 3H10.5M3.5 6H8.5M5 9H7" stroke="#7B97AE" stroke-width="1.12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <div 
                className="di__th di__th--filterable"
                ref={statusHeaderFilterRef}
                onClick={() => setIsStatusHeaderFilterOpen(true)}
              >
                <span>Status</span>
                <button className="di__filter-trigger" onClick={(e) => {
                  e.stopPropagation();
                  setIsStatusHeaderFilterOpen(true);
                }} aria-label="Filter by Status">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1.5 3H10.5M3.5 6H8.5M5 9H7" stroke="#7B97AE" stroke-width="1.12" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="di__th">Description / Notes</div>
            </div>
            
            {stagedCount === 0 && failedIngestionFiles.length === 0 ? (
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
                  {/* Staged Files */}
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

                      <div className="di__cell di__muted"><span className="di__ingestedDate">{r.ingestedOn}</span></div>

                      <div className="di__cell">
                        {r.status === "STAGED" ? (
                          <span className="di__badge di__badgeStaged">Staged</span>
                        ) : r.status === "UPLOADING" ? (
                          <span className="di__badge di__badgeIngesting">Uploading...</span>
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
                  
                  {/* Failed Files from API */}
                  {filteredFailedFiles.map((f, index) => {
                    const backendStatus = f.status?.toUpperCase();
                    const isFailed = backendStatus === 'FAILED';
                    const label = isFailed ? 'FAILED' : 'Partial';
                    const ingestedOn = new Date(f.uploadedAt);
                    const formattedDate = ingestedOn.toLocaleString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Kolkata'
                    }) + ' IST';

                    return (
                      <div className="di__row" key={f.fileId}>
                        <div className="di__cell di__fileCell">
                          <div className="di__fileNameWrap">
                            <div className="di__fileName" title={f.fileName}>
                              {f.fileName}
                            </div>
                            <button
                              className="di__rowIcon di__rowRemove"
                              type="button"
                              onClick={() => onDeleteFailedFile(f.fileId)}
                              aria-label="Remove failed file"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
  <path d="M10.75 0.75L0.75 10.75M0.75 0.75L10.75 10.75" stroke="#25303D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                            </button>
                          </div>
                        </div>

                        <div className="di__cell di__muted"><span className="di__ingestedDate">{formattedDate}</span></div>

                        <div className="di__cell">
                          {isFailed ? (
                            <span className="di__badge di__badgeFailed">Failed</span>
                          ) : (
                            <span className="di__badge di__badgePartial">Partial</span>
                          )}
                        </div>

                        <div className="di__cell">
                          {f.description ? (
                            <div className="di__noteLine" title={f.description}>
                              <span className="di__noteText">{f.description}</span>
                            </div>
                          ) : (
                            <span className="di__muted">-</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

          {/* BOTTOM - Only show if there's history */}
          {history.length > 0 && (
            <>
              {/* DIVIDER */}
              <div className="di__divider" onMouseDown={onDividerMouseDown}>
                <div className="di__dividerLine" />
                <div className="di__dividerPill">Previously Ingested Files</div>
                <div className="di__dividerLine" />
              </div>

              <div className="di__pane di__paneBottom" style={{ height: `${(1 - topRatio) * 100}%` }}>
                <div className="di__tableScroll di__tableScrollHistory">
                  <div className="di__rows">
                    {historyView.map((r) => (
                      <div className="di__row di__rowHistory" key={r.id}>
                        <div className="di__cell di__muted di__fileHistory" title={r.fileName}>
                          {r.fileName}
                        </div>
                        <div className="di__cell di__muted"><span className="di__ingestedDate">{r.ingestedOn}</span></div>
                        <div className="di__cell">
                          {r.status === "SUCCESS" ? (
                            <span className="di__badge di__badgeSuccess">Success</span>
                          ) : r.status === "FAILED" ? (
                            <span className="di__badge di__badgeFailed">Failed</span>
                          ) : r.status === "STAGED" ? (
                            <span className="di__badge di__badgeStaged">Staged</span>
                          ) : r.status === "Partial" ? (
                            <span className="di__badge di__badgePartial">Partial</span>
                          ) : (
                            <span className="di__badge di__badgeSuccess">Success</span>
                          )}
                        </div>
                        <div className="di__cell di__muted di__noteHistory" title={r.note}>
                          {r.note}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reuse InfoBox component */}
      <div className="di__infoFloat">
        <InfoBox
          storageKey="di.dupInfo"
          title="We detect Event Duplicates"
          message="Don't worry about re-uploads. If an Usage Event already exists, we'll detect it automatically and process it only once."
        />
      </div>

      {/* Filter Dropdowns */}
      {isMainFilterMenuOpen && (
        <MainFilterMenu
          items={mainFilterItems}
          activeKey={activeFilterKey}
          onSelect={handleMainFilterSelect}
          anchorTop={mainFilterMenuPosition.top}
          anchorLeft={mainFilterMenuPosition.left}
        />
      )}

      {isStatusFilterOpen && (
        <SimpleFilterDropdown
          options={statusOptions}
          value={selectedStatuses}
          onChange={handleStatusFilterChange}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
          className="data-ingestion-filter-popover"
        />
      )}

      {isDateFilterOpen && (
        <DateSortDropdown
          value={dateSortOrder}
          onChange={handleDateFilterChange}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
          className="data-ingestion-filter-popover"
        />
      )}

      {/* Header filter dropdowns */}
      {isStatusHeaderFilterOpen && (
        <SimpleFilterDropdown
          options={statusOptions}
          value={selectedStatuses}
          onChange={handleStatusFilterChange}
          anchorTop={statusHeaderFilterRef.current ? statusHeaderFilterRef.current.getBoundingClientRect().bottom + 4 : 0}
          anchorLeft={statusHeaderFilterRef.current ? statusHeaderFilterRef.current.getBoundingClientRect().left - 50 : 0}
          className="data-ingestion-filter-popover"
        />
      )}

      {isDateHeaderFilterOpen && (
        <DateSortDropdown
          value={dateSortOrder}
          onChange={handleDateFilterChange}
          anchorTop={dateHeaderFilterRef.current ? dateHeaderFilterRef.current.getBoundingClientRect().bottom + 4 : 0}
          anchorLeft={dateHeaderFilterRef.current ? dateHeaderFilterRef.current.getBoundingClientRect().left : 0}
          className="data-ingestion-filter-popover"
        />
      )}

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
  </ToastProvider>
  );
}
