import React, { useEffect, useState } from "react";
import CreateUsageMetric from "./CreateUsageMetric";
import EditMetrics from "./EditMetering/EditMetrics";
import Search from "../Components/Search";
import "../Rateplan/RatePlan.css";
import "./Metering.css";
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

  const filteredMetrics = metrics.filter((m) =>
    m.usageMetric.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="rate-plan-container metering-page">
      <nav className="metering-breadcrumb-nav">
        <div className="metering-breadcrumb">
          <span>Usage Metrics</span>
        </div>
      </nav>
      <div className="rate-plan-header">
        <h2>Usage Metrics</h2>
        <div className="header-actions">
          {/* <div className="search-wrappers">
            {/* <div className="search-wrappers">
            <input
              type="text"
              placeholder="Search among customers"
              className="search-input" 
            />
          </div> 
          <button className="sam-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667" stroke="#706C72" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button> */}
          <Search onSearch={setSearchQuery} />
          <button className="new-rate-button" onClick={() => setShowNewUsageMetricForm(true)}>+ New Usage Metric</button>
      
        </div>
      </div>
      <div className="rate-plans-table-wrapper">
        <table className="metering-table">
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
          {filteredMetrics.map((metric) => (
            <tr key={metric.id}>
              <td>{display(metric.usageMetric)}</td>
              <td>{display(metric.productName)}</td>
              <td>{display(metric.unit)}</td>
              <td>
                <span
                  className={`status-tag ${String(metric.status).toLowerCase() === "active" ? "active" : "inactive"}`}
                >
                  {formatStatus(metric.status)}
                </span>
              </td>
              
              <td className="actions-cell"><div className="action-buttons">
                <button className="prod-edit-button" onClick={() => { setSelectedMetricId(metric.id); setShowEditMetricForm(true); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M7.99933 13.3333H13.9993M10.9167 2.41461C11.1821 2.14922 11.542 2.00012 11.9173 2.00012C12.2927 2.00012 12.6526 2.14922 12.918 2.41461C13.1834 2.68001 13.3325 3.03996 13.3325 3.41528C13.3325 3.7906 13.1834 4.15055 12.918 4.41595L4.91133 12.4233C4.75273 12.5819 4.55668 12.6979 4.34133 12.7606L2.42667 13.3193C2.3693 13.336 2.30849 13.337 2.25061 13.3222C2.19272 13.3074 2.13988 13.2772 2.09763 13.235C2.05538 13.1927 2.02526 13.1399 2.01043 13.082C1.9956 13.0241 1.9966 12.9633 2.01333 12.9059L2.572 10.9913C2.63481 10.7762 2.75083 10.5804 2.90933 10.4219L10.9167 2.41461Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="prod-delete-button" onClick={() => handleDeleteClick(metric)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4.00004H14M12.6667 4.00004V13.3334C12.6667 14 12 14.6667 11.3333 14.6667H4.66667C4 14.6667 3.33333 14 3.33333 13.3334V4.00004M5.33333 4.00004V2.66671C5.33333 2.00004 6 1.33337 6.66667 1.33337H9.33333C10 1.33337 10.6667 2.00004 10.6667 2.66671V4.00004M6.66667 7.33337V11.3334M9.33333 7.33337V11.3334" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-body">
              <h5>
                Are you sure you want to delete <br />the usage metric? <strong>"{deleteMetricName}"</strong>
              </h5>
              <p>This action cannot be undone.</p>
            </div>
            <div className="delete-modal-footer">
              <button className="delete-modal-cancel" onClick={() => { setShowDeleteModal(false); setDeleteMetricId(null); }}>Cancel</button>
              <button className="delete-modal-confirm" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <ToastNotification message={notification.message} type={notification.type} productName={notification.productName} />
      )}

    </div>
  );
};

export default Metering;
