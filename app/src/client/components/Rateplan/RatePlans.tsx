import React, { useState, useEffect } from 'react';
import { fetchRatePlans, deleteRatePlan } from './api';


import './RatePlan.css';
import { Link, useNavigate } from 'react-router-dom';
import CreatePricePlan from './CreatePricePlan';

// ------------ Toast Notification Helpers ------------
interface NotificationState {
  type: 'success' | 'error';
  ratePlanName: string;
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

const Notification: React.FC<NotificationState> = ({ type, ratePlanName }) => {
  const Icon = type === 'success' ? SuccessIcon : ErrorIcon;
  return (
    <div className={`notification ${type === 'error' ? 'error' : ''}`}>
      <div className="notification-icon">
        <Icon />
      </div>
      <div className="notification-text">
        <h5>{type === 'success' ? 'Rate Plan Deleted' : 'Failed to Delete Rate Plan'}</h5>
        <p className="notification-details">
          {type === 'success'
            ? `The rate plan “${ratePlanName}” was successfully deleted.`
            : `Failed to delete the rate plan “${ratePlanName}”. Please try again.`}
        </p>
      </div>
    </div>
  );
};
// ----------------------------------------------------

// ------------ Payment Type Badge ------------
interface PaymentTypeBadgeProps { type: string; }
const PaymentTypeBadge: React.FC<PaymentTypeBadgeProps> = ({ type }) => {
  const normalized = (type || '').toLowerCase();
  const isPostPaid = normalized.includes('post');
  const isPrePaid = normalized.includes('pre');

  const displayText = isPostPaid ? 'Post-paid' : isPrePaid ? 'Pre-paid' : (type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : 'N/A');
  const icon = isPostPaid ? (
    // Post-paid icon
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4.21162 13.8002C3.09055 13.8002 2.14155 13.4117 1.36462 12.6348C0.587686 11.8579 0.199219 10.9089 0.199219 9.7878C0.199219 9.31713 0.279485 8.85973 0.440019 8.4156C0.600552 7.97146 0.830552 7.56893 1.13002 7.208L3.53735 4.31282C3.79092 4.00787 3.84031 3.58189 3.66324 3.22701L2.87473 1.64665C2.543 0.981803 3.02652 0.200195 3.76953 0.200195H10.2289C10.9719 0.200195 11.4554 0.981804 11.1237 1.64666L10.3352 3.22701C10.1581 3.58189 10.2075 4.00787 10.4611 4.31282L12.8684 7.208C13.1679 7.56893 13.3979 7.97146 13.5584 8.4156C13.719 8.85973 13.7992 9.31713 13.7992 9.7878C13.7992 10.9089 13.4087 11.8579 12.6276 12.6348C11.8467 13.4117 10.8998 13.8002 9.78682 13.8002H4.21162ZM6.99922 9.9924C6.60029 9.9924 6.25955 9.85113 5.97702 9.5686C5.69435 9.28606 5.55302 8.94533 5.55302 8.5464C5.55302 8.14733 5.69435 7.80653 5.97702 7.524C6.25955 7.24146 6.60029 7.1002 6.99922 7.1002C7.39815 7.1002 7.73889 7.24146 8.02142 7.524C8.30409 7.80653 8.44542 8.14733 8.44542 8.5464C8.44542 8.94533 8.30409 9.28606 8.02142 9.5686C7.73889 9.85113 7.39815 9.9924 6.99922 9.9924ZM4.77624 2.74884C4.94591 3.08684 5.29175 3.3002 5.66995 3.3002H8.33388C8.71323 3.3002 9.05991 3.08555 9.22902 2.74598L9.75522 1.68935C9.82143 1.55639 9.72473 1.4002 9.57619 1.4002H4.4234C4.27459 1.4002 4.1779 1.55693 4.24466 1.68992L4.77624 2.74884ZM4.21162 12.6002H9.78682C10.5726 12.6002 11.2377 12.3266 11.7822 11.7794C12.3269 11.2322 12.5992 10.5683 12.5992 9.7878C12.5992 9.45753 12.5426 9.13733 12.4292 8.8272C12.3159 8.51693 12.1541 8.23666 11.9438 7.9864L9.34208 4.86048C9.15209 4.63221 8.87047 4.5002 8.57348 4.5002H5.44262C5.14697 4.5002 4.86648 4.63102 4.67648 4.85752L2.06222 7.974C1.85195 8.22426 1.68889 8.5066 1.57302 8.821C1.45715 9.13526 1.39922 9.45753 1.39922 9.7878C1.39922 10.5683 1.67282 11.2322 2.22002 11.7794C2.76722 12.3266 3.43109 12.6002 4.21162 12.6002Z" fill="#706C72"/>
    </svg>
  ) : isPrePaid ? (
    // Pre-paid icon
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12.0607 6.9135C12.6909 7.14845 13.2516 7.53852 13.6912 8.04763C14.1307 8.55674 14.4347 9.16846 14.5751 9.82621C14.7156 10.484 14.6879 11.1665 14.4947 11.8107C14.3014 12.4549 13.9489 13.04 13.4696 13.5119C12.9903 13.9838 12.3998 14.3272 11.7526 14.5103C11.1055 14.6935 10.4226 14.7105 9.76711 14.5598C9.11163 14.4091 8.50473 14.0956 8.00254 13.6482C7.50034 13.2008 7.11907 12.634 6.89398 12.0002M4.66732 4.00016H5.33398V6.66683M11.1407 9.2535L11.6073 9.72683L9.72732 11.6068M9.33398 5.3335C9.33398 7.54264 7.54312 9.3335 5.33398 9.3335C3.12485 9.3335 1.33398 7.54264 1.33398 5.3335C1.33398 3.12436 3.12485 1.3335 5.33398 1.3335C7.54312 1.3335 9.33398 3.12436 9.33398 5.3335Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ) : null;
  return (
    <span className="payment-type-badge">
      {icon}
      <span className="payment-type-text">{displayText}</span>
    </span>
  );
};
// ------------ Status Badge ------------
interface StatusBadgeProps { status: string; }
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'N/A';
  const variant = normalized.includes('active') ? 'active' : normalized.includes('draft') ? 'draft' : 'default';
  return (
    <span className={`status-badge status-badge--${variant}`}>{label}</span>
  );
};
// ------------ Timestamp formatter ------------
const formatTimestamp = (d: Date): string => {
  const pad = (n: number, w: number = 2) => n.toString().padStart(w, '0');
  const ms = d.getMilliseconds().toString().padStart(3, '0') + '000'; // 6-digit fraction
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`;
};
// ----------------------------------------------

export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  description: string;
  ratePlanType: string;
  billingFrequency: string;
  productId: number;
  productName?: string;
  product?: {
    productName: string;
  };
  status?: string;
}

interface RatePlansProps {
  showCreatePlan: boolean;
  setShowCreatePlan: (show: boolean) => void;
  ratePlans?: RatePlan[];
}

const RatePlans: React.FC<RatePlansProps> = ({ showCreatePlan, setShowCreatePlan, ratePlans }) => {
  const navigate = useNavigate();
  const [ratePlansState, setRatePlans] = useState<RatePlan[]>(ratePlans || []);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Derive filtered list based on search term (matches rate plan or product name)
  const filteredPlans = (ratePlansState ?? []).filter(plan => {
    const name = (plan.ratePlanName ?? '').toLowerCase();
    const prod = (plan.productName ?? plan.product?.productName ?? '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || prod.includes(searchTerm.toLowerCase());
  });

  // Fetch rate plans from backend on component mount
  useEffect(() => {
    const loadRatePlans = async () => {
      try {
        const data = await fetchRatePlans();
        setRatePlans(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch rate plans', error);
      }
    };
    loadRatePlans();
  }, []);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const handleEdit = (id: number) => {
    const plan = ratePlansState.find(p => p.ratePlanId === id);
    navigate(`/get-started/rate-plans/${id}/edit`, { state: { ratePlanName: plan?.ratePlanName || '' } });
    };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId == null) return;
    const deletedPlan = ratePlansState.find(p => p.ratePlanId === deleteTargetId);
    try {
      setIsDeleting(true);
      await deleteRatePlan(deleteTargetId);
      // Update UI after successful deletion
      setRatePlans(prev => (prev ?? []).filter(plan => plan.ratePlanId !== deleteTargetId));
      setShowDeleteModal(false);
      setNotification({ type: 'success', ratePlanName: deletedPlan?.ratePlanName || '' });
    } catch {
      setNotification({ type: 'error', ratePlanName: deletedPlan?.ratePlanName || '' });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="main-container">
      {notification && (
        <div className="notification-container">
          <Notification {...notification} />
        </div>
      )}
      {!showCreatePlan && (
        <nav className="breadcrumb-nav">
          <div className="breadcrumb">
            <Link to="/rateplans" className="breadcrumb-item">Rate Plans</Link>
          </div>
        </nav>
      )}

      {showCreatePlan ? (
        <div className="create-plan-container">
          <div className="create-plan-header">
            <button 
              className="back-button" 
              onClick={() => {
                setShowCreatePlan(false);
                navigate('/get-started/rate-plans');
              }}
            >
              <svg className="back-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                <path d="M9.99935 15.8332L4.16602 9.99984M4.16602 9.99984L9.99935 4.1665M4.16602 9.99984H15.8327" stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Create New Rate Plan</span>
            </button>
            <div className="plan-header-actions">
              <button
                className="cancel-button"
                onClick={() => setShowCancelModal(true)}
              >
                Cancel
              </button>
              <button className="draft-button">Save as Draft</button>
            </div>
          </div>

          <CreatePricePlan onClose={() => setShowCreatePlan(false)} />
          {showCancelModal && (
            <div className="rate-delete-modal-overlay">
              <div className="rate-delete-modal-content">
                <div className="rate-delete-modal-body">
                  <h5>Are you sure you want to cancel <br />creating this rate plan?</h5>
                  <p>This action cannot be undone.</p>
                </div>
                <div className="rate-delete-modal-footer">
                  <button className="rate-delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                  <button
                      className="rate-delete-modal-confirm"
                      onClick={() => {
                        setShowCancelModal(false);
                        setShowCreatePlan(false);
                        navigate('/get-started/rate-plans');
                      }}
                    >
                      Confirm
                    </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rate-plan-container">
          <div className="rate-plan-header">
            <h2>Rate Plans</h2>
            <div className="header-actions">
              <div className="products-search">
                {/* <svg
                  className="search-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M17.5 17.5L13.8833 13.8833M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>  */}
                <input
                  type="search"
                  placeholder="Search among your Rate Plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="products-search-input"
                />
              </div>
              {/* <button className="sam-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667" stroke="#706C72" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button> */}
              {/* Search component handles input */}
              <button className="rate-sam-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667" stroke="#706C72" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
              <button className="new-rate-button" onClick={() => {
                setShowCreatePlan(true);
                navigate('/get-started/rate-plans');
              }}>
                + New Rate Plan
              </button>
            </div>
          </div>

          <div className="rate-plans-table-wrapper">
            <table className="pp-rate-table">
            <thead>
              <tr>
                <th>Rate Plan Name</th>
                <th>Product Name</th>
                <th>Payment Type</th>
                <th>Created On</th>
                <th>Status</th>
                <th className="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>

              {filteredPlans.map((plan, index) => (                <tr key={plan.ratePlanId}>
                  <td>{plan.ratePlanName || 'N/A'}</td>
                  <td>
                    <span className={`pp-badge ${(plan.productName || plan.product?.productName || 'default').toLowerCase().replace(/\s/g, '-')}`}>
                      {plan.productName || plan.product?.productName || 'N/A'}
                    </span>
                  </td>
                  <td><PaymentTypeBadge type={(plan as any).paymentType || 'N/A'} /></td>
                  <td>{formatTimestamp(new Date())}</td>
                  <td><StatusBadge status={plan.status || 'N/A'} /></td>
                  <td>

                    <div className="action-buttons">
                      <button className="prod-edit-button" onClick={() => handleEdit(plan.ratePlanId)} title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M7.99933 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#1D7AFC" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></button>
                      <button className="prod-delete-button" onClick={() => handleDeleteClick(plan.ratePlanId)} title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>

          {showDeleteModal && (
            <div className="rate-delete-modal-overlay">
              <div className="rate-delete-modal-content">
                <div className="rate-delete-modal-body">
                  <h5>Are you sure you want to delete this <br />rate plan?</h5>
                  <p>This action cannot be undone.</p>
                </div>
                <div className="rate-delete-modal-footer">
                  <button className="rate-delete-modal-cancel" onClick={() => setShowDeleteModal(false)}>Back</button>
                  <button className="rate-delete-modal-confirm" onClick={confirmDelete} disabled={isDeleting}>
                    {isDeleting ? 'Deleting...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RatePlans;
