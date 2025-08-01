import React, { useEffect, useState } from 'react';
import './RatePlans.css';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CreatePricePlan from './CreatePricePlan';
import { fetchRatePlans, deleteRatePlan } from './api';

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
  ratePlans: RatePlan[];
  loading: boolean;
  error: string;
}

const RatePlans: React.FC<RatePlansProps> = ({ showCreatePlan, setShowCreatePlan, ratePlans, loading, error }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [ratePlansState, setRatePlans] = useState(ratePlans);
  const [loadingState, setLoading] = useState(loading);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorState, setError] = useState(error);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  useEffect(() => {
    const fetchRatePlansData = async () => {
      try {
        const data = await fetchRatePlans();
        console.log('Fetched rate plans:', data);
        setRatePlans(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rate plans:', error);
        setError('Failed to fetch rate plans. Please try again.');
        setLoading(false);
      }
    };
    fetchRatePlansData();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/get-started/rate-plans/${id}/edit`);
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
      await deleteRatePlan(deleteTargetId.toString());
      setRatePlans(prev => prev.filter(plan => plan.ratePlanId !== deleteTargetId));
      setShowDeleteModal(false);
      setNotification({ type: 'success', ratePlanName: deletedPlan?.ratePlanName || '' });
    } catch (error) {
      setError('Failed to delete rate plan. Please try again.');
      console.error('Error deleting rate plan:', error);
      setNotification({ type: 'error', ratePlanName: deletedPlan?.ratePlanName || '' });
    } finally {
      setIsDeleting(false);
      // auto-dismiss toast
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
              <svg 
                className="back-icon" 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none"
              >
                <path 
                  d="M9.99935 15.8332L4.16602 9.99984M4.16602 9.99984L9.99935 4.1665M4.16602 9.99984H15.8327" 
                  stroke="#706C72" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
              <span>Create New Rate Plan</span>
            </button>
            <div className="plan-header-actions">
              <button
                className="cancel-button"
                onClick={() => setShowCancelModal(true) }
              >
                Cancel
              </button>
              <button
                className="draft-button"
               
                
              >
                Save as Draft
              </button>
            </div>
          </div>
          <CreatePricePlan 
            onClose={() => {
              setShowCreatePlan(false);
            }}
          />

          {showCancelModal && (
            <div className="delete-modal-overlay">
              <div className="delete-modal-content">
                <div className="delete-modal-body">
                  <h5>Are you sure you want to cancel <br />creating this rate plan?</h5>
                  <p>This action cannot be undone.</p>
                </div>
                <div className="delete-modal-footer">
                  <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                  <button className="delete-modal-confirm" onClick={() => { setShowCancelModal(false); setShowCreatePlan(false); }}>Confirm</button>
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
                <svg 
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
                </svg>
                <input type="search" placeholder="Search among your rate plans..." className="products-search-input" />
              </div>
              <button className="sam-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667" stroke="#706C72" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
              <button className="new-button" onClick={() => {
                setShowCreatePlan(true);
                navigate('/get-started/rate-plans');
              }}>
                + New Rate Plan
              </button>
            </div>
          </div>

          <table className="pp-rate-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Rate Plan Name</th>
                <th>Product Name</th>
                <th>Billing Frequency</th>
                <th>Pricing Model</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingState && (
                <tr><td colSpan={7}>Loading...</td></tr>
              )}
              {errorState && !loadingState && (
                <tr><td colSpan={7} style={{color:'red'}}>{errorState}</td></tr>
              )}
              {ratePlansState.map((plan, index) => (
                <tr key={plan.ratePlanId}>
                  <td>{index + 1}</td>
                  <td>{plan.ratePlanName || 'N/A'}</td>
                  <td>
                    <span className={`pp-badge ${(plan.productName || plan.product?.productName || 'default').toLowerCase().replace(/\s/g, '-')}`}>
                      {plan.productName || plan.product?.productName || 'N/A'}
                    </span>
                  </td>
                  <td>{plan.billingFrequency || 'N/A'}</td>
                 
                  <td>{plan.ratePlanType || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-button" 
                        onClick={() => handleEdit(plan.ratePlanId)}
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                          <path d="M8.59894 13.3332H14.5989M11.5163 2.41449C11.7817 2.1491 12.1416 2 12.5169 2C12.8923 2 13.2522 2.1491 13.5176 2.41449C13.783 2.67988 13.9321 3.03983 13.9321 3.41516C13.9321 3.79048 13.783 4.15043 13.5176 4.41582L5.51094 12.4232C5.35234 12.5818 5.15629 12.6978 4.94094 12.7605L3.02628 13.3192C2.96891 13.3359 2.9081 13.3369 2.85022 13.3221C2.79233 13.3072 2.73949 13.2771 2.69724 13.2349C2.65499 13.1926 2.62487 13.1398 2.61004 13.0819C2.59521 13.024 2.59621 12.9632 2.61294 12.9058L3.17161 10.9912C3.23442 10.776 3.35044 10.5802 3.50894 10.4218L11.5163 2.41449Z" stroke="#1D7AFC" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        className="delete-button" 
                        onClick={() => handleDeleteClick(plan.ratePlanId)}
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                          <path d="M2.59961 4.00016H14.5996M13.2663 4.00016V13.3335C13.2663 14.0002 12.5996 14.6668 11.9329 14.6668H5.2663C4.59961 14.6668 3.93294 14.0002 3.93294 13.3335V4.00016M5.93294 4.00016V2.66683C5.93294 2.00016 6.59961 1.3335 7.26628 1.3335H9.93294C10.5996 1.3335 11.2663 2.00016 11.2663 2.66683V4.00016M7.26628 7.3335V11.3335M9.93294 7.3335V11.3335" stroke="#E34935" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Delete confirmation modal */}
          {showDeleteModal && (
            <div className="delete-modal-overlay">
              <div className="delete-modal-content">
                <div className="delete-modal-body">
                  <h5>Are you sure you want to delete this <br />rate plan?</h5>
                  <p>This action cannot be undone.</p>
                </div>
                <div className="delete-modal-footer">
                  <button className="delete-modal-cancel" onClick={() => setShowDeleteModal(false)}>
                    Back
                  </button>
                  <button className="delete-modal-confirm" onClick={confirmDelete} disabled={isDeleting}>
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
