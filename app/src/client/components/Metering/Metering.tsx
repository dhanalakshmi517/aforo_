import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CreateUsageMetric from "./CreateUsageMetric";
import EditMetrics from "./EditMetering/EditMetrics";
import "../Rateplan/RatePlan.css";
import "./Metering.css";
import "../Products/Products.css";
import PageHeader from "../PageHeader/PageHeader";
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import { useToast } from '../componenetsss/ToastProvider';
import EditIconButton from '../componenetsss/EditIconButton';
import DeleteIconButton from '../componenetsss/DeleteIconButton';
import RetryIconButton from '../componenetsss/RetryIconButton';
import UsageEmptyImg from "./usage.svg";
import { getUsageMetrics, deleteUsageMetric, UsageMetricDTO } from "./api";
import { logout } from "../../utils/auth";
import PrimaryButton from '../componenetsss/PrimaryButton';
import StatusBadge, { Variant } from '../componenetsss/StatusBadge';
import Tooltip from '../componenetsss/Tooltip';
import { Checkbox } from '../componenetsss/Checkbox';
import FilterChip from '../componenetsss/FilterChip';
import SimpleFilterDropdown from '../componenetsss/SimpleFilterDropdown';
import DateSortDropdown from '../componenetsss/DateSortDropdown';
import MainFilterMenu, { MainFilterKey } from '../componenetsss/MainFilterMenu';

// Props for Metering component
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

interface NotificationState {
  message: string;
  type: 'success' | 'error';
  productName: string;
}

const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path d="M20 6L9 17L4 12" stroke="#23A36D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path d="M12 8V12M12 16H12.01M7.9 20C9.8 21 12 21.2 14.1 20.75C16.2 20.3 18 19.05 19.3 17.3C20.6 15.55 21.15 13.4 20.98 11.3C20.81 9.15 19.89 7.15 18.37 5.63C16.85 4.11 14.85 3.18 12.71 3.02C10.57 2.85 8.44 3.45 6.71 4.72C4.97 5.98 3.75 7.82 3.25 9.91C2.76 12 3.02 14.19 4 16.1L2 22L7.9 20Z" stroke="#E34935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ToastNotification: React.FC<NotificationState> = ({ message, type, productName }) => {
  const Icon = type === 'success' ? SuccessIcon : ErrorIcon;
  return (
    <div className={`notification ${type === 'error' ? 'error' : ''}`}>
      <div className="notification-icon">
        <Icon />
      </div>
      <div className="notification-text">
        <h5>{type === 'success' ? 'Metric Deleted' : 'Failed to Delete Metric'}</h5>
        <p className="notification-details">
          {type === 'success'
            ? `The metric “${productName}” was successfully deleted.`
            : `Failed to delete the metric “${productName}”. Please try again.`}
        </p>
      </div>
    </div>
  );
};

const Metering: React.FC<MeteringProps> = ({ showNewUsageMetricForm, setShowNewUsageMetricForm, setHideSidebarOnEditMetric }) => {
  const navigate = useNavigate();
  const formatStatus = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '-';
  const display = (v: any) => (v === undefined || v === null || String(v).trim() === '' ? '-' : v);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [createdSortOrder, setCreatedSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMetricId, setDeleteMetricId] = useState<number | null>(null);
  const [deleteMetricName, setDeleteMetricName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // toast handled via context
  const { showToast } = useToast();
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
  const [showEditMetricForm, setShowEditMetricForm] = useState(false);

  // Column filter / sort popover state
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isCreatedSortOpen, setIsCreatedSortOpen] = useState(false);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const createdSortRef = useRef<HTMLDivElement | null>(null);
  const [statusFilterPosition, setStatusFilterPosition] = useState({ top: 0, left: 0 });
  const [createdSortPosition, setCreatedSortPosition] = useState({ top: 0, left: 0 });

  // Header filter menu (two-panel)
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = useState(false);
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [activeFilterKey, setActiveFilterKey] = useState<MainFilterKey | null>('status');
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = useState(false);
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = useState({ top: 0, left: 0 });
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);

  // manage sidebar visibility
  useEffect(() => {
    setHideSidebarOnEditMetric(showEditMetricForm);
  }, [showEditMetricForm, setHideSidebarOnEditMetric]);

  // Prevent browser window scroll on Metering page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // open confirmation modal
  const handleDeleteClick = (metric: Metric) => {
    setDeleteMetricId(metric.id);
    setDeleteMetricName(metric.usageMetric);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteMetricId == null) return;
    setIsDeleting(true);
    try {
      await deleteUsageMetric(deleteMetricId);
      setMetrics(prev => prev.filter(m => m.id !== deleteMetricId));
      showToast({
        kind: 'success',
        title: 'Metric Deleted',
        message: `The metric “${deleteMetricName}” was successfully deleted.`
      });
    } catch (err) {
      console.error(err);
      showToast({
        kind: 'error',
        title: 'Failed to Delete',
        message: `Failed to delete the metric “${deleteMetricName}”. Please try again.`
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteMetricId(null);
    }
  };

  const fetchMetrics = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data: UsageMetricDTO[] = await getUsageMetrics();
      const mapped: Metric[] = data.map((m) => {
        let iconData = null;
        try {
          if ((m as any).iconData) {
            iconData = typeof (m as any).iconData === 'string'
              ? JSON.parse((m as any).iconData)
              : (m as any).iconData;
          }
        } catch (e) {
          console.error('Error parsing iconData:', e);
        }
        return {
          id: (m as any).metricId ?? (m as any).billableMetricId,
          usageMetric: m.metricName,
          productName: m.productName,
          unit: m.unitOfMeasure,
          status: (m as any).status ?? (m as any).metricStatus ?? "Active",
          createdOn: (m as any).createdOn,
          productId: m.productId,
          iconData: iconData
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

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (showNewUsageMetricForm) {
    return <CreateUsageMetric draftMetricId={selectedMetricId ?? undefined} onClose={() => { setShowNewUsageMetricForm(false); fetchMetrics(); }} />;
  }

  if (showEditMetricForm && selectedMetricId !== null) {
    return <EditMetrics metricId={selectedMetricId.toString()} onClose={() => { setShowEditMetricForm(false); fetchMetrics(); }} />;
  }

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '15, 109, 218';
  };

  // Define metric color palette with bg and text colors
  const metricColorPalette = [
    { bg: '#EAD4AE', text: '#81632E' }, // lilac
    { bg: '#E2B6BE', text: '#AA3C4E' }, // pink
    { bg: '#E2B6CC', text: '#AC3C73' }, // blue
    { bg: '#DCB6E2', text: '#90449C' }, // teal
    { bg: '#CCB7E1', text: '#693E92' }, // orange
    { bg: '#C4B7E1', text: '#6547A8' }, // green
    { bg: '#B7B8E1', text: '#4749AF' }, // red
    { bg: '#B6C7E2', text: '#2A559C' }, // indigo
    { bg: '#AED7EA', text: '#1C5F7D' }, // warm orange
    { bg: '#AEE1EA', text: '#206D79' }, // teal
    { bg: '#AEEAD6', text: '#1C6C51' }, // mint
    { bg: '#AEEAC4', text: '#2AA055' }, // green
    { bg: '#AFE9E3', text: '#177167' }  // cyan
  ];

  // Helper function to get metric color by index
  const getMetricColor = (idx: number) => metricColorPalette[idx % metricColorPalette.length];

  const filteredMetrics = metrics
    // Global text search across key fields (metric, product, unit, status), excluding date
    .filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      const metricName = (m.usageMetric || '').toLowerCase();
      const productName = (m.productName || '').toLowerCase();
      const unit = (m.unit || '').toLowerCase();
      const status = (m.status || '').toLowerCase();

      return (
        metricName.includes(q) ||
        productName.includes(q) ||
        unit.includes(q) ||
        status.includes(q)
      );
    })
    // Status filter
    .filter((m) => {
      if (selectedStatuses.length === 0) return true;
      const statusKey = (m.status || '').toLowerCase();
      return selectedStatuses.includes(statusKey);
    })
    // Sort: drafts first, then by createdOn according to createdSortOrder
    .sort((a, b) => {
      const aStatus = (a.status || '').toLowerCase();
      const bStatus = (b.status || '').toLowerCase();

      const aDraft = aStatus === 'draft';
      const bDraft = bStatus === 'draft';
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
      if (createdSortOrder === 'oldest') {
        return aDate - bDate;
      }
      return bDate - aDate;
    });

  // Close popovers when clicking outside (ignore portal-root)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // Ignore clicks inside portal-root
      const portalRoot = document.getElementById('portal-root');
      if (portalRoot && portalRoot.contains(target)) return;

      if (statusFilterRef.current && !statusFilterRef.current.contains(target)) {
        setIsStatusFilterOpen(false);
      }

      if (createdSortRef.current && !createdSortRef.current.contains(target)) {
        setIsCreatedSortOpen(false);
      }

      if (filterButtonRef.current && !filterButtonRef.current.contains(target)) {
        setIsMainFilterMenuOpen(false);
        setIsMainFilterPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="check-container">
      <PageHeader
        title="Billable Metrics"
        searchTerm={searchQuery}
        onSearchTermChange={setSearchQuery}
        primaryLabel=""
        onPrimaryClick={() => navigate('/get-started/metering/new')}
        onFilterClick={() => {
          // close table-header popovers so only one UI is active
          setIsStatusFilterOpen(false);
          setIsCreatedSortOpen(false);

          if (filterButtonRef.current) {
            const rect = filterButtonRef.current.getBoundingClientRect();
            const menuWidth = 240;
            const panelWidth = 264;
            const gap = 12;
            const margin = 8;

            let left = rect.left;
            const minLeft = panelWidth + gap + margin;
            if (left < minLeft) {
              left = minLeft;
            }

            if (left + menuWidth + margin > window.innerWidth) {
              left = Math.max(margin, window.innerWidth - menuWidth - margin);
              if (left < minLeft) {
                left = minLeft;
              }
            }

            setMainFilterMenuPosition({
              top: rect.bottom + 8,
              left,
            });
          }

          const nextOpen = !isMainFilterMenuOpen;
          setIsMainFilterMenuOpen(nextOpen);
          if (!nextOpen) {
            setIsMainFilterPanelOpen(false);
          }
        }}
        filterButtonRef={filterButtonRef}
        searchDisabled={metrics.length === 0}
        filterDisabled={metrics.length === 0}
        showPrimary={metrics.length > 0}
        showIntegrations={metrics.length > 0}
      />

      {isMainFilterMenuOpen && (
        <MainFilterMenu
          items={[
            { key: 'status', label: 'Status' },
            { key: 'date', label: 'Date' },
          ]}
          activeKey={activeFilterKey}
          onSelect={(key) => {
            setActiveFilterKey(key);
          }}
          onSelectWithRect={(key, rect) => {
            setActiveFilterKey(key);
            const panelWidth = 264;
            const gap = 12;
            const margin = 8;

            // Prefer opening panel to the left of the clicked row
            let left = rect.left - gap - panelWidth;
            if (left < margin) {
              const tryRight = rect.right + gap;
              if (tryRight + panelWidth + margin <= window.innerWidth) {
                left = tryRight;
              } else {
                left = Math.max(margin, window.innerWidth - panelWidth - margin);
              }
            }

            setMainFilterPanelPosition({
              top: rect.top,
              left,
            });
            setIsMainFilterPanelOpen(true);
          }}
          anchorTop={mainFilterMenuPosition.top}
          anchorLeft={mainFilterMenuPosition.left}
        />
      )}

      {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'status' && (
        <SimpleFilterDropdown
          options={['active', 'draft'].map((statusKey) => ({
            id: statusKey,
            label: statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
          }))}
          value={selectedStatuses}
          onChange={(next) => setSelectedStatuses(next.map((x) => String(x).toLowerCase()))}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}

      {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'date' && (
        <DateSortDropdown
          value={createdSortOrder}
          onChange={(next) => setCreatedSortOrder(next)}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}
      {selectedStatuses.length > 0 && (
        <div className="products-active-filters-row">
          <div className="products-active-filters-chips">
            {selectedStatuses.map((s) => (
              <FilterChip
                key={s}
                label={s.charAt(0).toUpperCase() + s.slice(1)}
                onRemove={() =>
                  setSelectedStatuses((prev) => prev.filter((x) => x !== s))
                }
              />
            ))}
          </div>
          <button
            type="button"
            className="products-filters-reset"
            onClick={() => {
              setSelectedStatuses([]);
            }}
          >
            Reset
          </button>
        </div>
      )}
      <div className="customers-table-wrapper">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Usage Metric</th>
              <th>Product Name</th>
              <th>Unit Of Measure</th>
              <th className="products-th-with-filter">
                <div
                  ref={statusFilterRef}
                  className="products-th-label-with-filter"
                  onMouseEnter={() => {
                    // close others
                    setIsCreatedSortOpen(false);

                    if (statusFilterRef.current) {
                      const rect = statusFilterRef.current.getBoundingClientRect();
                      setStatusFilterPosition({
                        top: rect.bottom + 4,
                        left: rect.left,
                      });
                    }
                    setIsStatusFilterOpen(true);
                  }}
                  onMouseLeave={() => {
                    setIsStatusFilterOpen(false);
                  }}
                >
                  <span>Status </span>
                  <button
                    type="button"
                    className={`products-column-filter-trigger ${
                      isStatusFilterOpen ? 'is-open' : ''
                    }`}
                    aria-label="Filter by status"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="8"
                      viewBox="0 0 11 8"
                      fill="none"
                    >
                      <path
                        d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001"
                        stroke="#19222D"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isStatusFilterOpen && (
                    <div
                      className="products-column-filter-popover"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SimpleFilterDropdown
                        options={['active', 'draft'].map((statusKey) => ({
                          id: statusKey,
                          label:
                            statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
                        }))}
                        value={selectedStatuses}
                        onChange={(next) =>
                          setSelectedStatuses(next.map((x) => String(x).toLowerCase()))
                        }
                        anchorTop={statusFilterPosition.top}
                        anchorLeft={statusFilterPosition.left}
                      />
                    </div>
                  )}
                </div>
              </th>
              <th className="products-th-with-filter">
                <div
                  ref={createdSortRef}
                  className="products-th-label-with-filter"
                  onMouseEnter={() => {
                    // close others
                    setIsStatusFilterOpen(false);

                    if (createdSortRef.current) {
                      const rect = createdSortRef.current.getBoundingClientRect();
                      setCreatedSortPosition({
                        top: rect.bottom + 4,
                        left: rect.left,
                      });
                    }
                    setIsCreatedSortOpen(true);
                  }}
                  onMouseLeave={() => {
                    setIsCreatedSortOpen(false);
                  }}
                >
                  <span>Created On </span>
                  <button
                    type="button"
                    className={`products-column-filter-trigger ${
                      isCreatedSortOpen ? 'is-open' : ''
                    }`}
                    aria-label="Sort by created date"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M10.5 8L8.5 10M8.5 10L6.5 8M8.5 10L8.5 2M1.5 4L3.5 2M3.5 2L5.5 4M3.5 2V10"
                        stroke="#25303D"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {isCreatedSortOpen && (
                    <div
                      className="products-column-filter-popover products-createdon-popover"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DateSortDropdown
                        value={createdSortOrder}
                        onChange={(next) => {
                          setCreatedSortOrder(next);
                          setIsCreatedSortOpen(false);
                        }}
                        anchorTop={createdSortPosition.top}
                        anchorLeft={createdSortPosition.left}
                      />
                    </div>
                  )}
                </div>
              </th>
              <th className="actions-cell">Actions</th>

            </tr>
          </thead>
          <tbody>
            {isLoading && metrics.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                  <div className="metrics-loading-state">
                    <div className="spinner"></div>
                    <p style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>Loading billable metrics...</p>
                  </div>
                </td>
              </tr>
            ) : metrics.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                  <div className="metrics-empty-state">
                    <img src={UsageEmptyImg} alt="No metrics" style={{ width: 190, height: 190 }} />
                    <p className="metrics-empty-state-text" style={{ marginTop: 8 }}>No Billable Metrics created yet. Click "New Billable Metric" <br /> to create your first metric.</p>
                    <div className="new-metric-button-wrapper">
                      <PrimaryButton
                        onClick={() => navigate('/get-started/metering/new')}
                      >
                        + New Billable Metric
                      </PrimaryButton>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredMetrics.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '48px 0', borderBottom: 'none', color: '#5C5F62', fontSize: '14px' }}>
                  No results found. Try adjusting your search or filters.
                </td>
              </tr>
            ) : (
              filteredMetrics.map((metric, idx) => (
                <tr key={metric.id}>
                  <td className="metrics-cell">
                    <div className="metrics-wrapper">
                      <div 
                        className="metric-item" 
                        style={{ 
                          backgroundColor: getMetricColor(idx).bg, 
                          color: getMetricColor(idx).text 
                        }}
                      >
                        <div className="metric-content">
                          <div className="metric-uom" title={metric.unit}>
                            {display(metric.unit && metric.unit.length > 3
                              ? metric.unit.substring(0, 3)   // only first 3 letters, no dots
                              : metric.unit
                            )}
                          </div>
                          <div className="metric-name" title={metric.usageMetric}>
                            {display(metric.usageMetric && metric.usageMetric.length > 3
                              ? `${metric.usageMetric.substring(0, 3)}...`  // first 3 letters + dots
                              : metric.usageMetric
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="metric-label">{display(metric.usageMetric)}</span>
                    </div>
                  </td>
                  <td>{display(metric.productName)}</td>
                  <td>{display(metric.unit)}</td>
                  <td>
                    <Tooltip
                      position="right"
                      content={
                        metric.status?.toLowerCase() === 'active'
                          ? 'Metric is active and in use.'
                          : metric.status?.toLowerCase() === 'draft'
                            ? 'Metric is in draft. Continue setting it up.'
                            : formatStatus(metric.status)
                      }
                    >
                      <StatusBadge
                        label={formatStatus(metric.status)}
                        variant={metric.status?.toLowerCase() === "active" ? "active" : metric.status?.toLowerCase() === "draft" ? "draft" : "archived" as Variant}
                        size="sm"
                      />
                    </Tooltip>
                  </td>
                  <td>{display(metric.createdOn)}</td>

                  <td className="actions-cell"><div className="product-action-buttons">
                    {metric.status?.toLowerCase() === 'draft' ? (
                      <RetryIconButton
                        onClick={() => navigate('/get-started/metering/new', { state: { draftMetricId: metric.id } })}
                        title="Continue editing draft"
                      />
                    ) : (
                      <EditIconButton
                        onClick={() => navigate(`/get-started/metering/${metric.id}/edit`)}
                        title="Edit metric"
                      />
                    )}
                    <DeleteIconButton
                      onClick={() => handleDeleteClick(metric)}
                      title="Delete metric"
                    />
                  </div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          productName={deleteMetricName}
          onConfirm={confirmDelete}
          onCancel={() => { setShowDeleteModal(false); setDeleteMetricId(null); }}
        />
      )}


    </div>
  );
};

export default Metering;


