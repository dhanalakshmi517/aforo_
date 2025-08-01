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

  // Fetch rate plans from backend on component mount
  useEffect(() => {
    const loadRatePlans = async () => {
      try {
        const data = await fetchRatePlans();
        setRatePlans(data);
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
      setRatePlans(prev => prev.filter(plan => plan.ratePlanId !== deleteTargetId));
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
            <div className="delete-modal-overlay">
              <div className="delete-modal-content">
                <div className="delete-modal-body">
                  <h5>Are you sure you want to cancel <br />creating this rate plan?</h5>
                  <p>This action cannot be undone.</p>
                </div>
                <div className="delete-modal-footer">
                  <button className="delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                  <button
                      className="delete-modal-confirm"
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
                <input
                  type="search"
                  placeholder="Search among your rate plans..."
                  className="products-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="sam-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667" stroke="#706C72" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
              <input type="search" placeholder="Search among your rate plans..." className="products-search-input" />
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

              {ratePlansState
                .filter(plan => plan.ratePlanName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((plan, index) => (                <tr key={plan.ratePlanId}>
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
                      <button className="edit-button" onClick={() => handleEdit(plan.ratePlanId)} title="Edit">Edit</button>
                      <button className="delete-button" onClick={() => handleDeleteClick(plan.ratePlanId)} title="Delete">Delete</button>
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showDeleteModal && (
            <div className="delete-modal-overlay">
              <div className="delete-modal-content">
                <div className="delete-modal-body">
                  <h5>Are you sure you want to delete this <br />rate plan?</h5>
                  <p>This action cannot be undone.</p>
                </div>
                <div className="delete-modal-footer">
                  <button className="delete-modal-cancel" onClick={() => setShowDeleteModal(false)}>Back</button>
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
