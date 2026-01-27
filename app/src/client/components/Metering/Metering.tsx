import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Metering.css";
import "../Products/Products.css";
import "../Rateplan/RatePlan.css";

import PageHeader from "../PageHeader/PageHeader";
import DataTable, { DataTableColumn } from "../componenetsss/DataTable";
import PrimaryButton from "../componenetsss/PrimaryButton";
import EditIconButton from "../componenetsss/EditIconButton";
import DeleteIconButton from "../componenetsss/DeleteIconButton";
import RetryIconButton from "../componenetsss/RetryIconButton";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import StatusBadge, { Variant } from "../componenetsss/StatusBadge";
import BillableMetricIcon from "../componenetsss/BillableMetricIcon";

import FilterChip from "../componenetsss/FilterChip";
import SimpleFilterDropdown from "../componenetsss/SimpleFilterDropdown";
import DateSortDropdown from "../componenetsss/DateSortDropdown";
import MainFilterMenu, { MainFilterKey } from "../componenetsss/MainFilterMenu";
import ResetButton from "../componenetsss/ResetButton";

import UsageEmptyImg from "./usage.svg";
import NoFileSvg from "../Customers/nofile.svg"; // reuse the same empty-search icon if you want (or replace with your local nofile.svg)
import CreateUsageMetric from "./CreateUsageMetric";
import EditMetrics from "./EditMetering/EditMetrics";

import { getUsageMetrics, deleteUsageMetric, UsageMetricDTO } from "./api";
import { isAuthenticated, logout } from "../../utils/auth";
import { useToast } from "../componenetsss/ToastProvider";

/* ---------------- types ---------------- */

interface MeteringProps {
  showNewUsageMetricForm: boolean;
  setShowNewUsageMetricForm: (show: boolean) => void;
  setHideSidebarOnEditMetric: (hide: boolean) => void;
}

interface Metric {
  id: number;
  usageMetric: string;
  productName: string;
  unit: string;
  status: string;
  createdOn?: string;
  productId?: number;
  iconData?: any;
}

/* ---------------- utils ---------------- */

const formatStatus = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "-";

const display = (v: any) =>
  v === undefined || v === null || String(v).trim() === "" ? "-" : v;

const truncateText = (text: string, maxLength = 10) => {
  if (!text) return "-";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const formatDateStr = (dateValue?: string) => {
  if (!dateValue) return "-";
  // Backend already returns formatted date string like "21 Jan, 2026 13:06 IST"
  return dateValue;
};

/* ---------------- component ---------------- */

const Metering: React.FC<MeteringProps> = ({
  showNewUsageMetricForm,
  setShowNewUsageMetricForm,
  setHideSidebarOnEditMetric,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [createdSortOrder, setCreatedSortOrder] = useState<"newest" | "oldest">(
    "newest"
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMetricId, setDeleteMetricId] = useState<number | null>(null);
  const pendingName = useRef("");

  const [isLoading, setIsLoading] = useState(true);

  /* ---- edit/draft navigation state ---- */
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
  const [showEditMetricForm, setShowEditMetricForm] = useState(false);

  /* ---- filter menu state (same skeleton as Customers) ---- */
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState<MainFilterKey | null>(
    null
  );
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = useState({
    top: 0,
    left: 0,
  });
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = useState(false);

  /* ---- status column filter dropdown state ---- */
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isStatusFilterHovered, setIsStatusFilterHovered] = useState(false);

  /* ---- date column filter dropdown state ---- */
  const dateFilterRef = useRef<HTMLDivElement>(null);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isDateFilterHovered, setIsDateFilterHovered] = useState(false);

  /* ---------------- effects ---------------- */

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // manage sidebar visibility
  useEffect(() => {
    setHideSidebarOnEditMetric(showEditMetricForm);
  }, [showEditMetricForm, setHideSidebarOnEditMetric]);

  // Close filter dropdowns when clicking outside (Customers-style)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      // Don't close if clicking inside portal (dropdowns render in portal)
      const portalRoot = document.getElementById("portal-root");
      if (portalRoot && target && portalRoot.contains(target)) return;

      // Don't close if clicking inside dropdown popovers
      if (target.closest(".products-column-filter-popover")) return;

      // Don't close if clicking on filter headers/buttons
      if (target.closest(".products-th-label-with-filter")) return;
      if (target.closest(".dt-header-cell")) return;

      // Don't close if clicking inside filter header refs
      if (statusFilterRef.current && statusFilterRef.current.contains(target))
        return;
      if (dateFilterRef.current && dateFilterRef.current.contains(target))
        return;

      // Don't close if clicking on main filter menu
      if (target.closest('[role="menu"]')) return;

      // Don't close if clicking inside DataTable body rows
      if (target.closest("tbody")) return;

      // Close everything
      if (
        isMainFilterMenuOpen ||
        isMainFilterPanelOpen ||
        isStatusFilterOpen ||
        isDateFilterOpen
      ) {
        setIsMainFilterMenuOpen(false);
        setIsMainFilterPanelOpen(false);
        setIsStatusFilterOpen(false);
        setIsDateFilterOpen(false);
      }

      if (isStatusFilterHovered || isDateFilterHovered) {
        setIsStatusFilterHovered(false);
        setIsDateFilterHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    isMainFilterMenuOpen,
    isMainFilterPanelOpen,
    isStatusFilterOpen,
    isDateFilterOpen,
    isStatusFilterHovered,
    isDateFilterHovered,
  ]);

  // Attach hover listeners to filterable header cells (Customers-style)
  useEffect(() => {
    const attachHoverListeners = () => {
      const statusHeader = statusFilterRef.current;
      const dateHeader = dateFilterRef.current;

      if (statusHeader) {
        statusHeader.addEventListener("mouseenter", () =>
          setIsStatusFilterHovered(true)
        );
        statusHeader.addEventListener("mouseleave", (e: any) => {
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="status"]');
          if (dropdown && dropdown.contains(relatedTarget)) return;
          setIsStatusFilterHovered(false);
        });
      }

      if (dateHeader) {
        dateHeader.addEventListener("mouseenter", () =>
          setIsDateFilterHovered(true)
        );
        dateHeader.addEventListener("mouseleave", (e: any) => {
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="date"]');
          if (dropdown && dropdown.contains(relatedTarget)) return;
          setIsDateFilterHovered(false);
        });
      }
    };

    const timeoutId = setTimeout(attachHoverListeners, 100);

    return () => {
      clearTimeout(timeoutId);
      const statusHeader = statusFilterRef.current;
      const dateHeader = dateFilterRef.current;

      if (statusHeader) {
        statusHeader.removeEventListener("mouseenter", () =>
          setIsStatusFilterHovered(true)
        );
        statusHeader.removeEventListener("mouseleave", () => {});
      }

      if (dateHeader) {
        dateHeader.removeEventListener("mouseenter", () =>
          setIsDateFilterHovered(true)
        );
        dateHeader.removeEventListener("mouseleave", () => {});
      }
    };
  }, []);

  const fetchMetrics = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data: UsageMetricDTO[] = await getUsageMetrics();
      const mapped: Metric[] = (data || []).map((m) => {
        let iconData = null;
        try {
          if ((m as any).iconData) {
            iconData =
              typeof (m as any).iconData === "string"
                ? JSON.parse((m as any).iconData)
                : (m as any).iconData;
          }
        } catch (e) {
          console.error("Error parsing iconData:", e);
        }

        return {
          id: (m as any).metricId ?? (m as any).billableMetricId,
          usageMetric: (m as any).metricName ?? (m as any).usageMetric ?? "",
          productName: (m as any).productName ?? "",
          unit: (m as any).unitOfMeasure ?? (m as any).unit ?? "",
          status: (m as any).status ?? (m as any).metricStatus ?? "Active",
          createdOn: (m as any).createdOn,
          productId: (m as any).productId,
          iconData,
        };
      });
      setMetrics(mapped);
    } catch (err) {
      console.error(err);
      if (String(err).includes("401")) logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  /* ---------------- routing: keep your existing forms ---------------- */

  if (showNewUsageMetricForm) {
    return (
      <CreateUsageMetric
        draftMetricId={selectedMetricId ?? undefined}
        onClose={() => {
          setShowNewUsageMetricForm(false);
          fetchMetrics();
        }}
      />
    );
  }

  if (showEditMetricForm && selectedMetricId !== null) {
    return (
      <EditMetrics
        metricId={selectedMetricId.toString()}
        onClose={() => {
          setShowEditMetricForm(false);
          fetchMetrics();
        }}
      />
    );
  }

  /* ---------------- filters ---------------- */

  const filteredMetrics = metrics
    .filter((m) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;

      const metricName = (m.usageMetric || "").toLowerCase();
      const productName = (m.productName || "").toLowerCase();
      const unit = (m.unit || "").toLowerCase();
      const status = (m.status || "").toLowerCase();

      return (
        metricName.includes(q) ||
        productName.includes(q) ||
        unit.includes(q) ||
        status.includes(q)
      );
    })
    .filter((m) => {
      if (!selectedStatuses.length) return true;
      const statusKey = (m.status || "").toLowerCase();
      return selectedStatuses.includes(statusKey);
    })
    .sort((a, b) => {
      const aStatus = (a.status || "").toLowerCase();
      const bStatus = (b.status || "").toLowerCase();

      const aDraft = aStatus === "draft";
      const bDraft = bStatus === "draft";
      if (aDraft && !bDraft) return -1;
      if (!aDraft && bDraft) return 1;

      const parseDate = (d?: string) => {
        if (!d) return 0;
        const t = Date.parse(d);
        return Number.isNaN(t) ? 0 : t;
      };

      const aDate = parseDate(a.createdOn);
      const bDate = parseDate(b.createdOn);

      if (aDate === bDate) return 0;
      if (createdSortOrder === "oldest") return aDate - bDate;
      return bDate - aDate;
    });

  /* ---------------- delete ---------------- */

  const handleDeleteClick = (metric: Metric) => {
    pendingName.current = metric.usageMetric || "";
    setDeleteMetricId(metric.id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteMetricId) return;
    try {
      await deleteUsageMetric(deleteMetricId);
      setMetrics((prev) => prev.filter((m) => m.id !== deleteMetricId));
      showToast({
        kind: "success",
        title: "Metric Deleted",
        message: `The metric “${pendingName.current}” was successfully deleted.`,
      });
    } catch (err) {
      console.error(err);
      showToast({
        kind: "error",
        title: "Failed to Delete",
        message: `Failed to delete the metric “${pendingName.current}”. Please try again.`,
      });
    } finally {
      setShowDeleteModal(false);
      setDeleteMetricId(null);
    }
  };

  /* ---------------- columns (DataTable like Customers) ---------------- */

  const columns: DataTableColumn<Metric>[] = useMemo(
    () => [
      {
        key: "usageMetric",
        title: "Usage Metric",
        render: (m) => (
          <div className="cell-flex" style={{ paddingLeft: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <BillableMetricIcon
              topText={display(
                m.unit && m.unit.length > 3 ? m.unit.substring(0, 3) : m.unit
              )}
              bottomText={display(
                m.usageMetric && m.usageMetric.length > 3
                  ? `${m.usageMetric.substring(0, 3)}...`
                  : m.usageMetric
              )}
              size={40}
            />
            <span className="metric-label" title={m.usageMetric}>
              {truncateText(m.usageMetric, 10)}
            </span>
          </div>
        ),
      },
      {
        key: "productName",
        title: "Product Name",
        render: (m) => (
          <div className="cell-stack">
            <div className="metering-product-name" title={m.productName}>
              {truncateText(m.productName, 10)}
            </div>
          </div>
        ),
      },
      {
        key: "unit",
        title: "Unit Of Measure",
        render: (m) => <span>{display(m.unit)}</span>,
      },
      {
        key: "status",
        title: "Status",
        filterable: true,
        ref: statusFilterRef,
        onFilterClick: () => setIsStatusFilterOpen(true),
        render: (m) => (
          <div className="status-cell-padded">
            <StatusBadge
              label={formatStatus(m.status)}
              variant={(m.status || "").toLowerCase() as Variant}
              size="sm"
            />
          </div>
        ),
      },
      {
        key: "createdOn",
        title: "Created On",
        filterable: true,
        ref: dateFilterRef,
        onFilterClick: () => setIsDateFilterOpen(true),
        width: 210,
        render: (m) => <span data-date>{formatDateStr(m.createdOn)}</span>,
      },
      {
        key: "actions",
        title: "Actions",
        width: 80,
        render: (m) => (
          <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
            {(m.status || "").toLowerCase() === "draft" ? (
              <RetryIconButton
                onClick={() =>
                  navigate("/get-started/metering/new", {
                    state: { draftMetricId: m.id },
                  })
                }
                title="Continue editing draft"
              />
            ) : (
              <EditIconButton
                onClick={() => navigate(`/get-started/metering/${m.id}/edit`)}
                title="Edit metric"
              />
            )}
            <DeleteIconButton
              onClick={() => handleDeleteClick(m)}
              title="Delete metric"
            />
          </div>
        ),
      },
    ],
    [navigate]
  );

  /* ---------------- render ---------------- */

  return (
    <div className={`check-container ${metrics.length > 0 ? "has-customers" : ""}`}>
      <PageHeader
        title="Billable Metrics"
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchDisabled={metrics.length === 0}
        showPrimary={metrics.length > 0}
        primaryLabel="+ New Billable Metric"
        onPrimaryClick={() => navigate("/get-started/metering/new")}
        filterButtonRef={filterButtonRef}
        filterActive={isMainFilterMenuOpen || isMainFilterPanelOpen}
        onFilterClick={() => {
          if (!filterButtonRef.current) return;
          const rect = filterButtonRef.current.getBoundingClientRect();
          setMainFilterMenuPosition({ top: rect.bottom + 8, left: rect.left });
          setIsMainFilterMenuOpen((v) => !v);
          setIsMainFilterPanelOpen(false);
        }}
      />

      {/* ===== FILTER MENUS (same skeleton as Customers) ===== */}
      {isMainFilterMenuOpen && (
        <MainFilterMenu
          items={[
            { key: "status", label: "Status" },
            { key: "date", label: "Date" },
          ]}
          activeKey={activeFilterKey}
          onSelect={(key) => setActiveFilterKey(key)}
          onSelectWithRect={(key, rect) => {
            setActiveFilterKey(key);
            setMainFilterPanelPosition({
              top: rect.top,
              left: rect.left - 280,
            });
            setIsMainFilterPanelOpen(true);
          }}
          anchorTop={mainFilterMenuPosition.top}
          anchorLeft={mainFilterMenuPosition.left}
        />
      )}

      {isMainFilterPanelOpen && activeFilterKey === "status" && (
        <SimpleFilterDropdown
          options={[
            { id: "active", label: "Active" },
            { id: "draft", label: "Draft" },
          ]}
          value={selectedStatuses}
          onChange={(v) => setSelectedStatuses(v.map(String))}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}

      {isMainFilterPanelOpen && activeFilterKey === "date" && (
        <DateSortDropdown
          value={createdSortOrder}
          onChange={setCreatedSortOrder}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}

      {/* ===== STATUS COLUMN FILTER DROPDOWN ===== */}
      {(isStatusFilterOpen || isStatusFilterHovered) && statusFilterRef.current && (
        <div data-dropdown="status">
          <SimpleFilterDropdown
            options={[
              { id: "active", label: "Active" },
              { id: "draft", label: "Draft" },
            ]}
            value={selectedStatuses}
            onChange={(v) => setSelectedStatuses(v.map(String))}
            anchorTop={statusFilterRef.current.getBoundingClientRect().bottom + 8}
            anchorLeft={statusFilterRef.current.getBoundingClientRect().left}
          />
        </div>
      )}

      {/* ===== DATE COLUMN FILTER DROPDOWN ===== */}
      {(isDateFilterOpen || isDateFilterHovered) && dateFilterRef.current && (
        <div data-dropdown="date">
          <DateSortDropdown
            value={createdSortOrder}
            onChange={setCreatedSortOrder}
            anchorTop={dateFilterRef.current.getBoundingClientRect().bottom + 8}
            anchorLeft={dateFilterRef.current.getBoundingClientRect().left}
          />
        </div>
      )}

      {/* ===== FORCE HOVER STATE WHEN DROPDOWN IS OPEN (optional but matches Customers behavior) ===== */}
      {isStatusFilterOpen && (
        <style>{`
          .dt-header-cell:nth-child(4) { background-color: var(--color-neutral-200) !important; border-radius: 0 !important; }
          .dt-header-cell:nth-child(4) .dt-filter-trigger { opacity: 1 !important; pointer-events: auto !important; }
        `}</style>
      )}
      {isDateFilterOpen && (
        <style>{`
          .dt-header-cell:nth-child(5) { background-color: var(--color-neutral-200) !important; border-radius: 0 !important; }
          .dt-header-cell:nth-child(5) .dt-filter-trigger { opacity: 1 !important; pointer-events: auto !important; }
        `}</style>
      )}

      {/* ===== DATA TABLE (Customers skeleton) ===== */}
      <DataTable
        columns={columns}
        rows={filteredMetrics}
        rowKey={(m, i) => String(m.id ?? i)}
        topContent={
          selectedStatuses.length ? (
            <div className="customers-active-filters-row">
              <div className="customers-active-filters-chips">
                {selectedStatuses.map((s) => (
                  <FilterChip
                    key={s}
                    label={s}
                    onRemove={() =>
                      setSelectedStatuses((prev) => prev.filter((x) => x !== s))
                    }
                  />
                ))}
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                <ResetButton
                  label="Reset"
                  onClick={() => {
                    setSelectedStatuses([]);
                    setCreatedSortOrder("newest");
                  }}
                />
              </div>
            </div>
          ) : null
        }
        emptyIcon={
          isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div className="spinner" />
              <span style={{ color: "#666", fontSize: "14px" }}>Loading billable metrics...</span>
            </div>
          ) : searchTerm.trim() || selectedStatuses.length ? (
            <img src={NoFileSvg} width={170} height={170} />
          ) : (
            <img src={UsageEmptyImg} width={190} height={190} />
          )
        }
        emptyText={
          isLoading ? (
            undefined
          ) : searchTerm.trim() ? (
            `No billable metrics found for "${searchTerm}"\nTry searching with different keywords`
          ) : selectedStatuses.length ? (
            "Oops! No matches found with these filters.\nTry adjusting your search or filters"
          ) : (
            'No Billable Metrics created yet. Click “New Billable Metric”\nto create your first metric.'
          )
        }
        emptyAction={
          !isLoading && metrics.length === 0 ? (
            <PrimaryButton
              onClick={() => navigate("/get-started/metering/new")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 5V19M5 12H19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              iconPosition="left"
            >
              New Billable Metric
            </PrimaryButton>
          ) : undefined
        }
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        productName={pendingName.current}
        entityType="metric"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default Metering;
