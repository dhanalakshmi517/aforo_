import React, { useState, useEffect, useRef } from 'react';
import { fetchRatePlans, deleteRatePlan, fetchRatePlanWithDetails } from './api';
import './RatePlan.css';
import PageHeader from '../PageHeader/PageHeader';
import { useNavigate } from 'react-router-dom';
import CreatePricePlan from './CreatePricePlan';
import TopBar from '../TopBar/TopBar';
import SaveDraft from '../componenetsss/SaveDraft';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import { clearAllRatePlanData } from './utils/sessionStorage';
import { ToastProvider, useToast } from '../componenetsss/ToastProvider';

/* ---------------- Types ---------------- */
export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  description: string;
  productId: number;
  productName?: string;
  product?: { productName: string };
  status?: string;
  paymentType?: 'PREPAID' | 'POSTPAID' | string;
  createdOn?: string;
  lastUpdated?: string;
  ratePlanType?: 'PREPAID' | 'POSTPAID' | string;
  billingFrequency?: string;
}

type RatePlanDetails = {
  ratePlanId: number;
  pricingModelName: string;
  billableMetric?: {
    uomShort?: string;
    name?: string;
  };
};

interface NotificationState {
  type: 'success' | 'error';
  ratePlanName: string;
}

/* ---------------- Tiny Icons used in pills ---------------- */
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
      <div className="notification-icon"><Icon /></div>
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

/* ---------------- helpers for safe extraction ---------------- */
const get = (obj: any, path: string): any => {
  try {
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  } catch { return undefined; }
};
const firstNonEmpty = (obj: any, paths: string[], fallback = ''): string => {
  for (const p of paths) {
    const v = get(obj, p);
    if (v !== undefined && v !== null) {
      const s = String(v).trim();
      if (s) return s;
    }
  }
  return fallback;
};

/* ---------------- Component ---------------- */
export interface RatePlansProps {
  showCreatePlan: boolean;
  setShowCreatePlan: (show: boolean) => void;
  ratePlans?: RatePlan[];
  setRatePlans?: React.Dispatch<React.SetStateAction<RatePlan[]>>;
}

const RatePlans: React.FC<RatePlansProps> = ({
  showCreatePlan,
  setShowCreatePlan,
  ratePlans,
  setRatePlans: setRatePlansFromParent
}) => {
  const createPlanRef = useRef<{
    back: () => boolean;
    getRatePlanId: () => number | null;
    validateBeforeBack: () => boolean;
  }>(null);

  // saveDraftFn now returns boolean: true when saved, false when validation stopped it
  const [saveDraftFn, setSaveDraftFn] = useState<null | (() => Promise<boolean>)>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftPlanData, setDraftPlanData] = useState<any>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Toast system (like Products component)
  const { showToast } = useToast();

  // Table row delete modal states (like Products component)
  const [showTableDeleteModal, setShowTableDeleteModal] = useState(false);
  const [deleteRatePlanName, setDeleteRatePlanName] = useState<string>('');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (localStorage.getItem('ratePlanWizardOpen') === 'true') {
      setShowCreatePlan(true);
      localStorage.removeItem('ratePlanWizardOpen');
    }
  }, []); // eslint-disable-line

  const [ratePlansState, setRatePlansState] = useState<RatePlan[]>(ratePlans || []);
  useEffect(() => { if (Array.isArray(ratePlans)) setRatePlansState(ratePlans); }, [ratePlans]);
  const setBoth = (next: RatePlan[]) => { setRatePlansState(next); if (setRatePlansFromParent) setRatePlansFromParent(next); };

  const loadRatePlans = React.useCallback(async () => {
    try {
      const data = await fetchRatePlans();
      const list = Array.isArray(data) ? data : [];
      setBoth(list);
    } catch (e) {
      console.error('Failed to fetch rate plans', e);
    }
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const filteredPlans = (ratePlansState ?? []).filter((p) => {
    const name = (p.ratePlanName ?? '').toLowerCase();
    const prod = (p.productName ?? p.product?.productName ?? '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || prod.includes(searchTerm.toLowerCase());
  });

  useEffect(() => { loadRatePlans(); }, [loadRatePlans]);

  /* ---------- details cache ---------- */
  const [detailsById, setDetailsById] = useState<Record<number, RatePlanDetails | 'loading' | 'error'>>({});

  useEffect(() => {
    const toFetch = filteredPlans
      .map(p => p.ratePlanId)
      .filter(id => detailsById[id] === undefined);
    if (toFetch.length === 0) return;

    toFetch.forEach(async (id) => {
      setDetailsById(prev => ({ ...prev, [id]: 'loading' }));
      try {
        const d = await fetchRatePlanWithDetails(id);

        // --- Robust normalization for many backend shapes ---
        const pricingModelName = firstNonEmpty(d, [
          'pricingModelName',
          'pricingModel.name',
          'pricingModel',
          'modelName',
          'pricingModelType',
          'pricing.name',
          'rateCard.pricingModelName'
        ], '—');

        const bmName = firstNonEmpty(d, [
          'billableMetric.name',
          'billableMetric.metricName',
          'billableMetricName',
          'metricName',
          'metric.name',
          'billableMetric.title'
        ], '');

        const uomShort = firstNonEmpty(d, [
          'billableMetric.uomShort',
          'billableMetric.uom.short',
          'billableMetric.uom',
          'uom.short',
          'uomShort',
          'uom',
          'billableMetricUom',
          'billableMetric.uomSymbol'
        ], '');

        const normalized: RatePlanDetails = {
          ratePlanId: id,
          pricingModelName,
          billableMetric: {
            uomShort,
            name: bmName
          }
        };
        setDetailsById(prev => ({ ...prev, [id]: normalized }));
      } catch (e) {
        setDetailsById(prev => ({ ...prev, [id]: 'error' }));
      }
    });
  }, [filteredPlans, detailsById]);

  /* ---------- actions ---------- */

  const handleEdit = (id: number) => {
    const plan = ratePlansState.find((p) => p.ratePlanId === id);
    if (!plan) return;
    clearAllRatePlanData();
    navigate(`/get-started/rate-plans/${id}/edit`, { state: { plan } });
  };

  const handleDraft = async (id: number) => {
    try {
      clearAllRatePlanData();
      const fresh = await fetchRatePlanWithDetails(id);
      setDraftPlanData(fresh);
      setShowCreatePlan(true);
    } catch (error) {
      console.error('❌ Failed to fetch detailed draft data:', error);
      const plan = ratePlansState.find((p) => p.ratePlanId === id);
      if (plan) {
        setDraftPlanData(plan);
        setShowCreatePlan(true);
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    const plan = ratePlansState.find(p => p.ratePlanId === id);
    setDeleteTargetId(id);
    setDeleteRatePlanName(plan?.ratePlanName || 'Unknown Plan');
    setShowTableDeleteModal(true);
  };

  // Table row delete confirmation (like Products component)
  const handleTableDeleteConfirm = async () => {
    if (deleteTargetId == null) return;

    try {
      setIsDeleting(true);
      await deleteRatePlan(deleteTargetId);
      const next = ratePlansState.filter((p) => p.ratePlanId !== deleteTargetId);
      setBoth(next);
      showToast?.({ message: 'Rate plan deleted successfully', kind: 'success' });
    } catch (error) {
      console.error('❌ Delete failed:', error);
      showToast?.({ message: 'Failed to delete rate plan', kind: 'error' });
    } finally {
      setIsDeleting(false);
      setShowTableDeleteModal(false);
      setDeleteTargetId(null);
      setDeleteRatePlanName('');
    }
  };

  const handleTableDeleteCancel = () => {
    setShowTableDeleteModal(false);
    setDeleteTargetId(null);
    setDeleteRatePlanName('');
  };

  /* ---------- render helpers ---------- */
  const formatStatus = (value?: string) =>
    ((value || '').trim() || 'N/A')
      .replace(/[_-]+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const renderPaymentType = (p: RatePlan) => {
    const raw = String(p.paymentType || p.ratePlanType || '')
      .trim().toUpperCase().replace(/[_-]/g, '');

    if (raw === 'PREPAID') {
      return (
        <span className="pill pill--prepaid">
          <span className="pill-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clipPath="url(#clip0_prepaid)"><path d="M12.0597 6.9135C12.6899 7.14845 13.2507 7.53852 13.6902 8.04763C14.1297 8.55674 14.4337 9.16846 14.5742 9.82621C14.7146 10.484 14.6869 11.1665 14.4937 11.8107C14.3005 12.4549 13.9479 13.04 13.4686 13.5119C12.9893 13.9838 12.3988 14.3272 11.7517 14.5103C11.1045 14.6935 10.4216 14.7105 9.76613 14.5598C9.11065 14.4091 8.50375 14.0956 8.00156 13.6482C7.49937 13.2008 7.1181 12.634 6.89301 12.0002M4.66634 4.00016H5.33301V6.66683M9.33301 5.3335C9.33301 7.54264 7.54215 9.3335 5.33301 9.3335C3.12387 9.3335 1.33301 7.54264 1.33301 5.3335C1.33301 3.12436 3.12387 1.3335 5.33301 1.3335C7.54215 1.3335 9.33301 3.12436 9.33301 5.3335Z" stroke="#1A2126" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></g><defs><clipPath id="clip0_prepaid"><rect width="16" height="16" fill="white"/></clipPath></defs></svg>
          </span>
          Pre-paid
        </span>
      );
    }
    if (raw === 'POSTPAID') {
      return (
        <span className="pill pill--postpaid">
          <span className="pill-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4.2126 13.8002C3.09153 13.8002 2.14253 13.4117 1.3656 12.6348C0.588662 11.8579 0.200195 10.9089 0.200195 9.7878C0.200195 9.31713 0.280462 8.85973 0.440995 8.4156C0.601529 7.97146 0.831529 7.56893 1.131 7.208L3.53833 4.31282C3.79189 4.00787 3.84128 3.58189 3.66422 3.22701L2.8757 1.64665C2.54398 0.981803 3.02749 0.200195 3.77051 0.200195H10.2299C10.9729 0.200195 11.4564 0.981804 11.1247 1.64666L10.3362 3.22701C10.1591 3.58189 10.2085 4.00787 10.4621 4.31282L12.8694 7.208C13.1689 7.56893 13.3989 7.97146 13.5594 8.4156C13.7199 8.85973 13.8002 9.31713 13.8002 9.7878C13.8002 10.9089 13.4097 11.8579 12.6286 12.6348C11.8477 13.4117 10.9007 13.8002 9.7878 13.8002H4.2126Z" fill="#1A2126"/></svg>
          </span>
          Post-paid
        </span>
      );
    }
    return <span className="pill pill--unknown">—</span>;
  };

  const renderCreatedOn = (p: RatePlan) => (p.createdOn && p.createdOn.trim()) || '—';

  /** pricing model cell with UOM+metric badge */
  const renderPricingModel = (p: RatePlan) => {
    const d = detailsById[p.ratePlanId];
    if (d === 'loading' || d === undefined) return <div className="pricing-skel" aria-label="loading" />;
    if (d === 'error') return <span className="pricing-error">—</span>;
    const uom = d.billableMetric?.uomShort || '';
    const metricName = d.billableMetric?.name || '';
    const model = d.pricingModelName || '—';
    const hasModel = model && model !== '—';

    return (
      <div className="pricing-cell">
        <div className="bm-badge" title={`${uom}${metricName ? ' • ' + metricName : ''}`}>
          <div className="bm-badge-uom">{uom || '—'}</div>
          <div className="bm-badge-sub">{metricName || 'Billable metric'}</div>
        </div>
        <div className="pricing-model-name">{hasModel ? `• ${model}` : '—'}</div>
      </div>
    );
  };

  /** Rate Plan name chip with product name under it */
  const renderNameChip = (p: RatePlan) => {
    const productName = p.productName ?? p.product?.productName ?? '—';
    return (
      <div className="rp-name-chip">
        <div className="rp-name-texts">
          <div className="rp-name-title">{p.ratePlanName || 'N/A'}</div>
          <div className="rp-name-subtitle" title={productName}>{productName}</div>
        </div>
      </div>
    );
  };

  const hasRows = ratePlansState.length > 0;

  /* ---------------- JSX ---------------- */
  return (
    <ToastProvider>
      <div className="main-container">
        {notification && (
          <div className="notification-container"><Notification {...notification} /></div>
        )}

      {showCreatePlan ? (
        <div className="create-plan-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <TopBar
            title="Create New Rate Plan"
            onBack={() => {
              // ✅ Only show the modal if step-0 is valid (or we’re not on step-0).
              const ok = createPlanRef.current?.validateBeforeBack?.() ?? true;
              if (ok) setShowSaveDraftModal(true);
              // if not ok, inline errors are already visible; do not open modal
            }}
            cancel={{ label: 'Delete', onClick: () => setShowConfirmDelete(true) }}
            save={{
              label: 'Save as Draft',
              saving: draftSaving,
              disabled: !saveDraftFn,
              onClick: async () => {
                if (!saveDraftFn) return;
                setDraftSaving(true);
                const ok = await saveDraftFn(); // boolean
                setDraftSaving(false);
                if (!ok) {
                  // validation failed; keep wizard open
                  return;
                }
                // ✅ Stay on the same page after saving (no redirect, no closing wizard)
                // Optionally give feedback:
                showToast?.({ message: 'Draft saved', kind: 'success' });
                // Do not call setShowCreatePlan(false) and do not reload the table here.
              }
            }}
          />
          <div className="create-plan-body" style={{ flex: 1 }}>
            <CreatePricePlan
              ref={createPlanRef}
              registerSaveDraft={(fn) => setSaveDraftFn(() => fn)}
              draftData={draftPlanData}
              onClose={() => {
                setDraftPlanData(null);
                clearAllRatePlanData();
                setShowCreatePlan(false);
                loadRatePlans();
              }}
            />
          </div>

          <SaveDraft
            isOpen={showSaveDraftModal}
            onClose={() => setShowSaveDraftModal(false)}
            onSave={async () => {
              if (!saveDraftFn) return;
              try {
                setDraftSaving(true);
                const ok = await saveDraftFn(); // now returns boolean
                setDraftSaving(false);

                if (!ok) {
                  // ❗ Validation failed. Close ONLY the modal so the inline errors are visible.
                  setShowSaveDraftModal(false);
                  return;
                }

                // This modal is the flow for “Back” → save & exit.
                setShowSaveDraftModal(false);
                setShowCreatePlan(false);
                await loadRatePlans();
              } catch {
                setDraftSaving(false);
                // keep modal open on unexpected error
              }
            }}
            onDelete={async () => {
              setShowSaveDraftModal(false);
              const currentId = createPlanRef.current?.getRatePlanId();
              if (currentId) { try { await deleteRatePlan(currentId); } catch {} }
              setShowCreatePlan(false);
              await loadRatePlans();
            }}
          />

          <ConfirmDeleteModal
            isOpen={showConfirmDelete}
            productName={createPlanRef.current?.getRatePlanId() ? 'Rate Plan' : 'Draft Rate Plan'}
            onConfirm={async () => {
              setShowConfirmDelete(false);
              const currentId = createPlanRef.current?.getRatePlanId();
              if (currentId) {
                try { await deleteRatePlan(currentId); setNotification({ type: 'success', ratePlanName: 'Rate Plan' }); setTimeout(() => setNotification(null), 3000); }
                catch { setNotification({ type: 'error', ratePlanName: 'Rate Plan' }); setTimeout(() => setNotification(null), 3000); }
              }
              setShowCreatePlan(false);
              await loadRatePlans();
            }}
            onCancel={() => setShowConfirmDelete(false)}
          />
        </div>
      ) : (
        <div className="rate-plan-container">
          <PageHeader
            title="Rate Plans"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            primaryLabel="+ New Rate Plan"
            onPrimaryClick={() => { 
              clearAllRatePlanData(); 
              setShowCreatePlan(true); 
              navigate('/get-started/rate-plans'); 
            }}
            onFilterClick={() => {}}
            showPrimary={hasRows}
          />

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
                  <th>Rate Plan</th>
                  <th>Pricing model</th>
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
                      <td>{renderPricingModel(plan)}</td>
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
                            <button className="resume-button" onClick={() => handleDraft(plan.ratePlanId)} title="Resume Draft" aria-label="Resume Draft">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <g clipPath="url(#clip0_7416_37004)"><path d="M8 1.333C11.682 1.333 14.666 4.318 14.666 8c0 3.682-2.984 6.667-6.666 6.667S1.333 11.682 1.333 8H5.333H10.666M10.666 8L8 10.667M10.666 8L8 5.333" stroke="#025A94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></g>
                                <defs><clipPath id="clip0_7416_37004"><rect width="16" height="16" fill="white"/></clipPath></defs>
                              </svg>
                            </button>
                          ) : (
                            <button className="edit-button" onClick={() => handleEdit(plan.ratePlanId)} title="Edit" aria-label="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 13.333h6M10.917 2.414a1.31 1.31 0 0 1 1.999 1.001c0 .375-.149.735-.414 1L4.911 12.423c-.158.158-.354.274-.569.336l-1.915.559c-.19.056-.362-.116-.306-.306l.559-1.915c.62-.215.178-.411.336-.569l8.006-8.017Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                          <button className="delete-button" onClick={() => handleDeleteClick(plan.ratePlanId)} title="Delete" aria-label="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4h12M12.667 4v9.333c0 .666-.667 1.333-1.334 1.333H4.667C4 14.666 3.333 14 3.333 13.333V4m2 0V2.667C5.333 2 6 1.333 6.667 1.333h2.666C10 1.333 10.667 2 10.667 2.667V4M6.667 7.333V11.333M9.333 7.333V11.333" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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
                              <g><path d="M40 30h52l8 14v80H40z" fill="#CACACA"/><path d="M32 38h56l8 14v82H40c-4.4 0-8-3.6-8-8V38z" fill="#BFBFBF"/><rect x="52" y="64" width="38" height="6" rx="3" fill="#8D8D8D"/><rect x="52" y="80" width="38" height="6" rx="3" fill="#8D8D8D"/><rect x="52" y="96" width="30" height="6" rx="3" fill="#8D8D8D"/></g>
                              <g><circle cx="108" cy="88" r="28" fill="#EFEFEF"/><path d="M96 76l24 24M120 76l-24 24" stroke="#5E5E5E" strokeWidth="6" strokeLinecap="round"/></g>
                            </svg>
                          </div>
                          <p className="products-empty-state-text">
                            No Rate Plan created yet. Click ‘New Rate Plan’<br /> to create your First Rate Plan.
                          </p>
                          <button className="empty-new-rate-btn" onClick={() => { 
                            clearAllRatePlanData(); 
                            setShowCreatePlan(true); 
                            navigate('/get-started/rate-plans'); 
                          }}>
                            <span className="empty-btn-plus" aria-hidden="true">+</span> New Rate Plan
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>

          {/* Table row delete modal */}
          {showTableDeleteModal && (
            <ConfirmDeleteModal
              isOpen={showTableDeleteModal}
              productName={deleteRatePlanName}
              onCancel={handleTableDeleteCancel}
              onConfirm={handleTableDeleteConfirm}
            />
          )}
        </div>
      )}
      </div>
    </ToastProvider>
  );
};

export default RatePlans;
