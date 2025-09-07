import React, { useState, useEffect, useRef } from 'react';
import { fetchRatePlans, deleteRatePlan } from './api';
import './RatePlan.css';
import { useNavigate } from 'react-router-dom';
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

/** Component-local shape that matches backend + keeps legacy fields for tests. */
export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  description: string;
  productId: number;
  productName?: string;
  product?: { productName: string };
  status?: string;

  /** From backend now */
  paymentType?: 'PREPAID' | 'POSTPAID' | string;
  createdOn?: string;
  lastUpdated?: string;

  /** Legacy/compat fields used in older tests */
  ratePlanType?: 'PREPAID' | 'POSTPAID' | string;
  billingFrequency?: string;
}

export interface RatePlansProps {
  showCreatePlan: boolean;
  setShowCreatePlan: (show: boolean) => void;
  /** Optional controlled list from parent */
  ratePlans?: RatePlan[];
  /** Optional parent setter — when provided we keep it in sync */
  setRatePlans?: React.Dispatch<React.SetStateAction<RatePlan[]>>;
}

const RatePlans: React.FC<RatePlansProps> = ({
  showCreatePlan,
  setShowCreatePlan,
  ratePlans,
  setRatePlans: setRatePlansFromParent
}) => {
  const createPlanRef = useRef<{ back: () => boolean }>(null);
  const [saveDraftFn, setSaveDraftFn] = useState<null | (() => Promise<void>)>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const navigate = useNavigate();

  // Local state (mirrors parent if provided)
  const [ratePlansState, setRatePlansState] = useState<RatePlan[]>(ratePlans || []);

  // Keep local in sync if parent updates RatePlans
  useEffect(() => {
    if (Array.isArray(ratePlans)) setRatePlansState(ratePlans);
  }, [ratePlans]);

  const setBoth = (next: RatePlan[]) => {
    setRatePlansState(next);
    if (setRatePlansFromParent) setRatePlansFromParent(next);
  };

  const loadRatePlans = React.useCallback(async () => {
    try {
      const data = await fetchRatePlans();
      const list = Array.isArray(data) ? data : [];
      setBoth(list);
    } catch (error) {
      console.error('Failed to fetch rate plans', error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredPlans = (ratePlansState ?? []).filter((plan) => {
    const name = (plan.ratePlanName ?? '').toLowerCase();
    const prod = (plan.productName ?? plan.product?.productName ?? '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || prod.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    loadRatePlans();
  }, [loadRatePlans]);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const handleEdit = (id: number) => {
    const plan = ratePlansState.find((p) => p.ratePlanId === id);
    if (!plan) return;
    navigate(`/get-started/rate-plans/${id}/edit`, { state: { plan } });
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteTargetId == null) return;
    const deletedPlan = ratePlansState.find((p) => p.ratePlanId === deleteTargetId);
    try {
      setIsDeleting(true);
      await deleteRatePlan(deleteTargetId);
      const next = ratePlansState.filter((p) => p.ratePlanId !== deleteTargetId);
      setBoth(next);
      setShowDeleteModal(false);
      setNotification({ type: 'success', ratePlanName: deletedPlan?.ratePlanName || '' });
    } catch {
      setNotification({ type: 'error', ratePlanName: deletedPlan?.ratePlanName || '' });
    } finally {
      setIsDeleting(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  /** Payment Type → Pre-paid / Post-paid pill with icon. */
  const renderPaymentType = (p: RatePlan) => {
    const raw = String(p.paymentType || p.ratePlanType || '')
      .trim()
      .toUpperCase()
      .replace(/[_-]/g, '');

    if (raw === 'PREPAID') {
      return (
        <span className="pill pill--prepaid">
          <span className="pill-icon" aria-hidden="true">
            {/* coins */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 8.5c0 1.933-3.134 3.5-7 3.5S3 10.433 3 8.5 6.134 5 10 5s7 1.567 7 3.5Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 8.5v7c0 1.933 3.134 3.5 7 3.5s7-1.567 7-3.5v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M21 7.5c0 1.38-2.239 2.5-5 2.5" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span>
          Pre-paid
        </span>
      );
    }
    if (raw === 'POSTPAID') {
      return (
        <span className="pill pill--postpaid">
          <span className="pill-icon" aria-hidden="true">
            {/* money bag */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14.2 4.5 13 3h-2l-1.2 1.5c.8.3 1.8.5 3.4 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M6 10c0-2.761 2.686-5 6-5s6 2.239 6 5-2 9-6 9-6-6.239-6-9Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 9v6M9.75 11.25h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          Post-paid
        </span>
      );
    }
    return <span className="pill pill--unknown">—</span>;
  };

  /** Backend already sends a nicely formatted string. If missing, show em dash. */
  const renderCreatedOn = (p: RatePlan) => (p.createdOn && p.createdOn.trim()) || '—';

  /** Complex "Rate Plan Name" card (chip) */
  const renderNameChip = (p: RatePlan) => (
    <div className="rp-name-chip">
      <div className="rp-name-icon" aria-hidden="true">
        <span className="rp-name-initials">
          {(p.ratePlanName || 'RP')
            .trim()
            .split(/\s+/)
            .map((s) => s[0])
            .join('')
            .slice(0, 3)
            .toUpperCase()}
        </span>
      </div>
      <div className="rp-name-texts">
        <div className="rp-name-title">{p.ratePlanName || 'N/A'}</div>
        <div className="rp-name-subtitle">Pricing Model Name</div>
      </div>
    </div>
  );

  const hasRows = ratePlansState.length > 0;

  return (
    <div className="main-container">
      {notification && (
        <div className="notification-container">
          <Notification {...notification} />
        </div>
      )}

      {showCreatePlan ? (
        <div className="create-plan-container">
          {/* ======= TOP BAR ======= */}
          <div className="create-plan-header">
            <div className="header-left">
              <button
                className="back-button"
                onClick={() => {
                  if (createPlanRef.current && createPlanRef.current.back()) {
                    return;
                  }
                  setShowCreatePlan(false);
                  navigate('/get-started/rate-plans');
                }}
                aria-label="Back"
              >
                <svg className="back-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path
                    d="M9.99935 15.8332L4.16602 9.99984M4.16602 9.99984L9.99935 4.1665M4.16602 9.99984H15.8327"
                    stroke="#706C72" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              </button>
              <h1 className="create-title">Create New Rate Plan</h1>
            </div>

            <div className="plan-header-actions">
              <button className="cancel-button" onClick={() => setShowCancelModal(true)}>Cancel</button>
              <button
                className="draft-button"
                disabled={!saveDraftFn || draftSaving}
                onClick={async () => {
                  if (!saveDraftFn) return;
                  setDraftSaving(true);
                  await saveDraftFn();
                  setDraftSaving(false);
                }}
              >
                {draftSaving ? 'Saving...' : 'Save as Draft'}
              </button>
            </div>
          </div>

          {/* ======= BODY ======= */}
          <div className="create-plan-body">
            <CreatePricePlan
              ref={createPlanRef}
              registerSaveDraft={(fn) => setSaveDraftFn(() => fn)}
              onClose={() => {
                setShowCreatePlan(false);
                loadRatePlans();
              }}
            />
          </div>

          {showCancelModal && (
            <div className="rate-delete-modal-overlay">
              <div className="rate-delete-modal-content">
                <div className="rate-delete-modal-body">
                  <h5>
                    Are you sure you want to cancel <br /> creating this rate plan?
                  </h5>
                  <p>This action cannot be undone.</p>
                </div>
                <div className="rate-delete-modal-footer">
                  <button className="rate-delete-modal-cancel" onClick={() => setShowCancelModal(false)}>Back</button>
                  <button
                    className="rate-delete-modal-confirm"
                    onClick={async () => {
                      setShowCancelModal(false);
                      setShowCreatePlan(false);
                      await loadRatePlans();
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
              {/* Search */}
              <div className="rp-header-search" role="search">
                <span className="rp-search-icon" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <input
                  className="rp-search-input"
                  aria-label="Search rate plans"
                  placeholder=""
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className="rp-filter-btn" aria-label="Open filters">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7h16M7 12h10M10 17h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>

              {/* Hide top-right CTA when no rows */}
              {hasRows && (
                <button
                  className="new-rate-button"
                  onClick={() => {
                    setShowCreatePlan(true);
                    navigate('/get-started/rate-plans');
                  }}
                >
                  + New Rate Plan
                </button>
              )}
            </div>
          </div>

          {/* ======= EMPTY STATE (with required corner gaps) ======= */}
          {!hasRows ? (
            <div className="pp-empty-area">
              <div className="rate-empty">
                <div className="rate-empty-illustration" aria-hidden="true">
                  {/* 160 × 160 */}
                  <svg width="160" height="160" viewBox="0 0 160 160" fill="none">
                    <g>
                      <path d="M40 30h52l8 14v80H40z" fill="#CACACA"/>
                      <path d="M32 38h56l8 14v82H40c-4.4 0-8-3.6-8-8V38z" fill="#BFBFBF"/>
                      <rect x="52" y="64" width="38" height="6" rx="3" fill="#8D8D8D"/>
                      <rect x="52" y="80" width="38" height="6" rx="3" fill="#8D8D8D"/>
                      <rect x="52" y="96" width="30" height="6" rx="3" fill="#8D8D8D"/>
                    </g>
                    <g>
                      <circle cx="108" cy="88" r="28" fill="#EFEFEF"/>
                      <path d="M96 76l24 24M120 76l-24 24" stroke="#5E5E5E" strokeWidth="6" strokeLinecap="round"/>
                    </g>
                  </svg>
                </div>

                <p className="rate-empty-text">
                  No Rate Plan created yet. Click ‘New Rate Plan’
                  to create your First Rate Plan.
                </p>

                <button
                  className="empty-new-rate-btn"
                  onClick={() => {
                    setShowCreatePlan(true);
                    navigate('/get-started/rate-plans');
                  }}
                >
                  <span className="empty-btn-plus" aria-hidden="true">+</span>
                  New Rate Plan
                </button>
              </div>
            </div>
          ) : (
            /* ======= TABLE ======= */
            <table className="pp-rate-table">
              <colgroup>
                <col className="col-rateplan-name" />
                <col className="col-product" />
                <col className="col-payment" />
                <col className="col-created" />
                <col className="col-status" />
                <col className="col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>Rate Plan Name</th>
                  <th>Product</th>
                  <th>Payment Type</th>
                  <th>Created on</th>
                  <th>Status</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan.ratePlanId}>
                    <td>{renderNameChip(plan)}</td>

                    <td>
                      <span
                        className={`pp-badge ${
                          (plan.productName || plan.product?.productName || 'default')
                            .toLowerCase()
                            .replace(/\s/g, '-')
                        }`}
                      >
                        {plan.productName || plan.product?.productName || 'N/A'}
                      </span>
                    </td>

                    <td>{renderPaymentType(plan)}</td>

                    <td>{renderCreatedOn(plan)}</td>

                    <td>
                      <span className={`status-badge ${String(plan.status || '').toLowerCase() || 'default'}`}>
                        {plan.status || 'N/A'}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        {plan.status?.toLowerCase() === 'draft' ? (
                          <button
                            className="resume-button"
                            onClick={() => handleEdit(plan.ratePlanId)}
                            title="Resume Draft"
                            aria-label="Resume Draft"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
                              <path d="M11.75 3.25a5.5 5.5 0 1 1-7.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5.25 8h5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8.5 6l2.25 2-2.25 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        ) : (
                          <button className="edit-button" onClick={() => handleEdit(plan.ratePlanId)} title="Edit" aria-label="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path
                                d="M7.99933 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z"
                                stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        )}
                        <button className="delete-button" onClick={() => handleDeleteClick(plan.ratePlanId)} title="Delete" aria-label="Delete">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335"
                              stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {showDeleteModal && (
            <div className="rate-delete-modal-overlay">
              <div className="rate-delete-modal-content">
                <div className="rate-delete-modal-body">
                  <h5>
                    Are you sure you want to delete this <br /> rate plan?
                  </h5>
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
