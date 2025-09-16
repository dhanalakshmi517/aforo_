import React, { useState, useEffect, useRef } from 'react';
import { fetchRatePlans, deleteRatePlan } from './api';
import './RatePlan.css';
import PageHeader from '../PageHeader/PageHeader';
import { useNavigate } from 'react-router-dom';
import CreatePricePlan from './CreatePricePlan';
import TopBar from '../TopBar/TopBar';
import SaveDraft from '../componenetsss/SaveDraft'; // ⬅️ NEW: use the Save-as-Draft modal

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
  const createPlanRef = useRef<{ back: () => boolean; getRatePlanId: () => number | null }>(null);
  const [saveDraftFn, setSaveDraftFn] = useState<null | (() => Promise<void>)>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const navigate = useNavigate();

  // Prevent browser window scroll on Rate Plans page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Auto-open wizard when coming back from estimator screens
  useEffect(() => {
    if (localStorage.getItem('ratePlanWizardOpen') === 'true') {
      setShowCreatePlan(true);
      localStorage.removeItem('ratePlanWizardOpen');
    }
  }, []); // eslint-disable-line

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

  const [showDeleteModal, setShowDeleteModal] = useState(false); // list-table delete dialog (unchanged)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // ⬇️ NEW: Save-as-Draft modal used by Back & top-right Delete while in wizard
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);

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

  // Helper: turn "ACTIVE", "IN_REVIEW" etc. into "Active", "In Review"
  const formatStatus = (value?: string) => {
    const s = (value || '').trim();
    if (!s) return 'N/A';
    return s
      .replace(/[_-]+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  /** Payment Type → Pre-paid / Post-paid pill with icon (designer SVGs). */
  const renderPaymentType = (p: RatePlan) => {
    const raw = String(p.paymentType || p.ratePlanType || '')
      .trim()
      .toUpperCase()
      .replace(/[_-]/g, '');

    if (raw === 'PREPAID') {
      return (
        <span className="pill pill--prepaid">
          <span className="pill-icon" aria-hidden="true">
            {/* Designer SVG: PREPAID (16x16) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <g clipPath="url(#clip0_prepaid)">
                <path d="M12.0597 6.9135C12.6899 7.14845 13.2507 7.53852 13.6902 8.04763C14.1297 8.55674 14.4337 9.16846 14.5742 9.82621C14.7146 10.484 14.6869 11.1665 14.4937 11.8107C14.3005 12.4549 13.9479 13.04 13.4686 13.5119C12.9893 13.9838 12.3988 14.3272 11.7517 14.5103C11.1045 14.6935 10.4216 14.7105 9.76613 14.5598C9.11065 14.4091 8.50375 14.0956 8.00156 13.6482C7.49937 13.2008 7.1181 12.634 6.89301 12.0002M4.66634 4.00016H5.33301V6.66683M11.1397 9.2535L11.6063 9.72683L9.72634 11.6068M9.33301 5.3335C9.33301 7.54264 7.54215 9.3335 5.33301 9.3335C3.12387 9.3335 1.33301 7.54264 1.33301 5.3335C1.33301 3.12436 3.12387 1.3335 5.33301 1.3335C7.54215 1.3335 9.33301 3.12436 9.33301 5.3335Z" stroke="#1A2126" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </g>
              <defs>
                <clipPath id="clip0_prepaid">
                  <rect width="16" height="16" fill="white"/>
                </clipPath>
              </defs>
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
            {/* Designer SVG: POSTPAID */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4.2126 13.8002C3.09153 13.8002 2.14253 13.4117 1.3656 12.6348C0.588662 11.8579 0.200195 10.9089 0.200195 9.7878C0.200195 9.31713 0.280462 8.85973 0.440995 8.4156C0.601529 7.97146 0.831529 7.56893 1.131 7.208L3.53833 4.31282C3.79189 4.00787 3.84128 3.58189 3.66422 3.22701L2.8757 1.64665C2.54398 0.981803 3.02749 0.200195 3.77051 0.200195H10.2299C10.9729 0.200195 11.4564 0.981804 11.1247 1.64666L10.3362 3.22701C10.1591 3.58189 10.2085 4.00787 10.4621 4.31282L12.8694 7.208C13.1689 7.56893 13.3989 7.97146 13.5594 8.4156C13.7199 8.85973 13.8002 9.31713 13.8002 9.7878C13.8002 10.9089 13.4097 11.8579 12.6286 12.6348C11.8477 13.4117 10.9007 13.8002 9.7878 13.8002H4.2126ZM7.0002 9.9924C6.60126 9.9924 6.26053 9.85113 5.978 9.5686C5.69533 9.28606 5.554 8.94533 5.554 8.5464C5.554 8.14733 5.69533 7.80653 5.978 7.524C6.26053 7.24146 6.60126 7.1002 7.0002 7.1002C7.39913 7.1002 7.73986 7.24146 8.0224 7.524C8.30506 7.80653 8.44639 8.14733 8.44639 8.5464C8.44639 8.94533 8.30506 9.28606 8.0224 9.5686C7.73986 9.85113 7.39913 9.9924 7.0002 9.9924ZM4.77721 2.74884C4.94689 3.08684 5.29273 3.3002 5.67093 3.3002H8.33486C8.7142 3.3002 9.06089 3.08555 9.23 2.74598L9.7562 1.68935C9.82241 1.55639 9.7257 1.4002 9.57717 1.4002H4.42438C4.27556 1.4002 4.17887 1.55693 4.24564 1.68992L4.77721 2.74884Z" fill="var(--icon-color-darkest, #1A2126)"/>
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
        <div className="create-plan-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          {/* ======= TOP BAR ======= */}
          <TopBar
            title="Create New Rate Plan"
            onBack={() => {
              // Always open the Save-as-Draft modal on back
              setShowSaveDraftModal(true);
            }}
            cancel={{
              label: "Delete",
              // Open the same Save-as-Draft modal (Design: No, Delete | Yes, Save as Draft)
              onClick: () => setShowSaveDraftModal(true)
            }}
            save={{
              label: "Save as Draft",
              saving: draftSaving,
              disabled: !saveDraftFn,
              onClick: async () => {
                if (!saveDraftFn) return;
                setDraftSaving(true);
                await saveDraftFn();
                setDraftSaving(false);
              }
            }}
          />

          {/* ======= BODY ======= */}
          <div className="create-plan-body" style={{ flex: 1 }}>
            <CreatePricePlan
              ref={createPlanRef}
              registerSaveDraft={(fn) => setSaveDraftFn(() => fn)}
              onClose={() => {
                setShowCreatePlan(false);
                loadRatePlans();
              }}
            />
          </div>

          {/* ======= Save-as-Draft Modal (Back/Delete in wizard) ======= */}
          <SaveDraft
            isOpen={showSaveDraftModal}
            onClose={async () => {
              // "No, Delete" clicked
              setShowSaveDraftModal(false);

              const currentId = createPlanRef.current?.getRatePlanId();
              if (currentId) {
                try {
                  await deleteRatePlan(currentId);
                } catch (e) {
                  console.error('Failed to delete current wizard rate plan', e);
                }
              }
              setShowCreatePlan(false);
              await loadRatePlans();
              navigate('/get-started/rate-plans');
            }}
            onSave={async () => {
              // "Yes, Save as Draft" clicked
              try {
                if (saveDraftFn) {
                  setDraftSaving(true);
                  await saveDraftFn(); // calls the same APIs as the top-right "Save as Draft"
                  setDraftSaving(false);
                }
              } catch (e) {
                console.error('Save as draft (from modal) failed', e);
              } finally {
                setShowSaveDraftModal(false);
                setShowCreatePlan(false);
                await loadRatePlans();
                navigate('/get-started/rate-plans');
              }
            }}
          />
        </div>
      ) : (
        <div className="rate-plan-container">
          {/* Apply proper sidebar alignment like Products */}
          <PageHeader
            title="Rate Plans"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            primaryLabel="+New Rate Plan"
            onPrimaryClick={() => {
              setShowCreatePlan(true);
              navigate('/get-started/rate-plans');
            }}
            onFilterClick={() => {
              /* TODO: open filters */
            }}
            showPrimary={hasRows}
          />

          {/* ======= TABLE (always render header) ======= */}
          <div className="products-table-wrapper">
            <table className="products-table">
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

            {hasRows ? (
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
                        {formatStatus(plan.status)}
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
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <g clipPath="url(#clip0_7416_37004)">
                                <path d="M7.99967 1.33337C11.6816 1.33337 14.6663 4.31814 14.6663 8.00004C14.6663 11.6819 11.6816 14.6667 7.99967 14.6667C4.31778 14.6667 1.33301 11.6819 1.33301 8.00004H5.33301H10.6663M10.6663 8.00004L7.99967 10.6667M10.6663 8.00004L7.99967 5.33337" stroke="#025A94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </g>
                              <defs>
                                <clipPath id="clip0_7416_37004">
                                  <rect width="16" height="16" fill="white"/>
                                </clipPath>
                              </defs>
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
            ) : (
              <tbody>
                <tr className="pp-empty-row">
                  <td colSpan={6}>
                    <div className="pp-empty-area in-table">
                      <div className="rate-empty">
                        <div className="rate-empty-illustration" aria-hidden="true">
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

                        <p className="products-empty-state-text">
                          No Rate Plan created yet. Click ‘New Rate Plan’<br />
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
                  </td>
                </tr>
              </tbody>
              
            )}
          </table>
          </div>

          {/* List page delete confirm modal (unchanged) */}
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
