import React, { useEffect, useState } from "react";
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMetricId, setDeleteMetricId] = useState<number | null>(null);
  const [deleteMetricName, setDeleteMetricName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  // toast handled via context
  const { showToast } = useToast();
  const [selectedMetricId, setSelectedMetricId] = useState<number | null>(null);
  const [showEditMetricForm, setShowEditMetricForm] = useState(false);

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
    try {
      const data: UsageMetricDTO[] = await getUsageMetrics();
      const mapped: Metric[] = data.map((m) => ({
        id: (m as any).metricId ?? (m as any).billableMetricId,
        usageMetric: m.metricName,
        productName: m.productName,
        unit: m.unitOfMeasure,
        status: (m as any).status ?? (m as any).metricStatus ?? "Active",
        createdOn: (m as any).createdOn,
      }));
      setMetrics(mapped);
    } catch (err) {
      console.error(err);
      if (String(err).includes("401")) logout();
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

  const metricColors = [
    'rgba(234, 212, 174, 0.15)',
    'rgba(226, 182, 190, 0.15)',
    'rgba(226, 182, 204, 0.15)',
    'rgba(220, 182, 226, 0.15)',
    'rgba(204, 183, 225, 0.15)',
    'rgba(196, 183, 225, 0.15)',
    'rgba(174, 234, 214, 0.15)'
  ];
  const getMetricColor = (idx: number) => metricColors[idx % metricColors.length];

  const filteredMetrics = metrics
    .filter((m) =>
      m.usageMetric?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.productName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aDraft = a.status?.toLowerCase() === 'draft';
      const bDraft = b.status?.toLowerCase() === 'draft';
      if (aDraft && !bDraft) return -1;
      if (!aDraft && bDraft) return 1;
      return 0;
    });

  return (
    <div className="check-container">
      <PageHeader
        title="Billable Metrics"
        searchTerm={searchQuery}
        onSearchTermChange={setSearchQuery}
        primaryLabel={metrics.length > 0 ? " + New Billable Metric" : ""}
        onPrimaryClick={() => navigate('/get-started/metering/new')}
        onFilterClick={() => { }}
        searchDisabled={metrics.length === 0}
        filterDisabled={metrics.length === 0}
        showPrimary={metrics.length > 0}
        showIntegrations={metrics.length > 0}
      />
      <div className="customers-table-wrapper">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Usage Metric</th>
              <th>Product Name</th>
              <th>Unit Of Measure</th>
              <th>Status</th>
              <th>Created On</th>
              <th className="actions-cell">Actions</th>

            </tr>
          </thead>
          <tbody>
            {filteredMetrics.map((metric, idx) => (
              <tr key={metric.id}>
                <td className="metrics-cell"><div className="metrics-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}><div className="metric-item" style={{ backgroundColor: getMetricColor(idx) }}><div className="metric-content"><div className="metric-uom" title={metric.unit}>{display(metric.unit && metric.unit.length > 3 ? `${metric.unit.substring(0, 3)}...` : metric.unit)}</div><div className="metric-name" title={metric.usageMetric}>{display(metric.usageMetric && metric.usageMetric.length > 3 ? `${metric.usageMetric.substring(0, 3)}...` : metric.usageMetric)}</div></div></div><span style={{ marginLeft: 4 }}>{display(metric.usageMetric)}</span></div></td>
                <td>{display(metric.productName)}</td>
                <td>{display(metric.unit)}</td>
                <td>
                  <StatusBadge
                    label={formatStatus(metric.status)}
                    variant={metric.status?.toLowerCase() === "active" ? "active" : metric.status?.toLowerCase() === "draft" ? "draft" : "archived" as Variant}
                    size="sm"
                  />
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
                      onClick={() => { setSelectedMetricId(metric.id); setShowEditMetricForm(true); }}
                      title="Edit metric"
                    />
                  )}
                  <DeleteIconButton
                    onClick={() => handleDeleteClick(metric)}
                    title="Delete metric"
                  />
                </div></td>
              </tr>
            ))}
            {filteredMetrics.length === 0 && (
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



