import React, { useEffect, useState } from "react";
import CreateUsageMetric from "./CreateUsageMetric";
import EditMetrics from "./EditMetering/EditMetrics";
import "../Rateplan/RatePlan.css";
import "./Metering.css";
import "../Products/Products.css";
import PageHeader from "../PageHeader/PageHeader";
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import UsageEmptyImg from "./usage.svg";
import { getUsageMetrics, deleteUsageMetric, UsageMetricDTO } from "./api";
import { logout } from "../../utils/auth";

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
  const formatStatus = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '-';
  const display = (v: any) => (v === undefined || v === null || String(v).trim() === '' ? '-' : v);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMetricId, setDeleteMetricId] = useState<number | null>(null);
  const [deleteMetricName, setDeleteMetricName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
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
      setNotification({ message: 'Deleted', type: 'success', productName: deleteMetricName });
    } catch (err) {
      console.error(err);
      setNotification({ message: 'Failed to delete', type: 'error', productName: deleteMetricName });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteMetricId(null);
    }
  };

  useEffect(() => {
    getUsageMetrics()
      .then((data: UsageMetricDTO[]) => {
        const mapped: Metric[] = data.map((m) => ({
        id: (m as any).metricId ?? (m as any).billableMetricId,
        usageMetric: m.metricName,
        productName: m.productName,
        unit: m.unitOfMeasure,
        status: (m as any).status ?? (m as any).metricStatus ?? "Active", 
        
      }));
      setMetrics(mapped);
      })
      .catch((err) => {
        console.error(err);
        if (String(err).includes("401")) {
          // Token expired or unauthorized, logout user
          logout();
        }
      });
  }, []);

  if (showNewUsageMetricForm) {
    return <CreateUsageMetric onClose={() => setShowNewUsageMetricForm(false)} />;
  }

  if (showEditMetricForm && selectedMetricId !== null) {
    return <EditMetrics metricId={selectedMetricId.toString()} onClose={() => setShowEditMetricForm(false)} />;
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

  const filteredMetrics = metrics.filter((m) =>
    m.usageMetric.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rate-plan-container">
     
      <PageHeader
        title="Usage Metrics"
        searchTerm={searchQuery}
        onSearchTermChange={setSearchQuery}
        primaryLabel="New Usage Metric"
        onPrimaryClick={() => setShowNewUsageMetricForm(true)}
      />
      <div className="products-table-wrapper">
        <table className="products-table">
        <thead>
          <tr>
            <th>Usage Metric</th>
            <th>Product Name</th>
            <th>Unit Of Measure</th>
            <th>Status</th>           
            <th className="actions-cell">Actions</th>
            
          </tr>
        </thead>
        <tbody>
          {filteredMetrics.map((metric, idx) => (
            <tr key={metric.id}>
              <td className="metrics-cell"><div className="metrics-wrapper" style={{display:'flex',alignItems:'center',justifyContent:'flex-start'}}><div className="metric-item" style={{ backgroundColor: getMetricColor(idx) }}><div className="metric-content"><div className="metric-uom">{display(metric.unit)}</div><div className="metric-name">{display(metric.usageMetric)}</div></div></div><span style={{marginLeft:4}}>{display(metric.usageMetric)}</span></div></td>
              <td>{display(metric.productName)}</td>
              <td>{display(metric.unit)}</td>
              <td>
                <span
                  className={`status-tag ${String(metric.status).toLowerCase() === "active" ? "active" : "inactive"}`}
                >
                  {formatStatus(metric.status)}
                </span>
              </td>
              
              <td className="actions-cell"><div className="product-action-buttons">
                {String(metric.status).toLowerCase() === 'draft' ? (
                  <button className="product-view-button" onClick={() => { setSelectedMetricId(metric.id); setShowEditMetricForm(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M7.99967 1.33325C11.6816 1.33325 14.6663 4.31802 14.6663 7.99992C14.6663 11.6818 11.6816 14.6666 7.99967 14.6666C4.31778 14.6666 1.33301 11.6818 1.33301 7.99992H5.33301H10.6663M10.6663 7.99992L7.99967 10.6666M10.6663 7.99992L7.99967 5.33325" stroke="#025A94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ) : (
                  <button className="product-edit-button" onClick={() => { setSelectedMetricId(metric.id); setShowEditMetricForm(true); }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7.00031 12.3334H13.0003M9.91764 1.41473C10.183 1.14934 10.543 1.00024 10.9183 1.00024C11.2936 1.00024 11.6536 1.14934 11.919 1.41473C12.1844 1.68013 12.3335 2.04008 12.3335 2.4154C12.3335 2.79072 12.1844 3.15067 11.919 3.41607L3.91231 11.4234C3.75371 11.582 3.55766 11.698 3.34231 11.7607L1.42764 12.3194C1.37028 12.3361 1.30947 12.3371 1.25158 12.3223C1.1937 12.3075 1.14086 12.2774 1.09861 12.2351C1.05635 12.1929 1.02624 12.140 1.01141 12.0821C0.996575 12.0242 0.997578 11.9634 1.01431 11.9061L1.57298 9.9914C1.63579 9.77629 1.75181 9.58048 1.91031 9.42207L9.91764 1.41473Z" stroke="#1D7AFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                <button className="product-delete-button" onClick={() => handleDeleteClick(metric)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4.00004H14M12.6667 4.00004V13.3334C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3334V4.00004M5.33333 4.00004V2.66671C5.33333 2.00004 6 1.33337 6.66667 1.33337H9.33333C10 1.33337 10.6667 2.00004 10.6667 2.66671V4.00004M6.66667 7.33337V11.3334M9.33333 7.33337V11.3334" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredMetrics.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                <div className="metrics-empty-state">
                  <img src={UsageEmptyImg} alt="No metrics" style={{ width: 200, height: 200 }} />
                  <p className="metrics-empty-state-text" style={{ marginTop: 8 }}>No Billable Metrics created yet. Click "New Billable Metric" <br /> to create your first metric.</p>
                  <button
                    onClick={() => setShowNewUsageMetricForm(true)}
                    className="new-metric-button"
                    style={{ marginTop: 12 }}
                  >
                    + New Billable Metric
                  </button>
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

      {/* Notification */}
      {notification && (
        <ToastNotification message={notification.message} type={notification.type} productName={notification.productName} />
      )}

    </div>
  );
};

export default Metering;



