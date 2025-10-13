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
  const createPlanRef = useRef<{ back: () => boolean; getRatePlanId: () => number | null }>(null);
  const [saveDraftFn, setSaveDraftFn] = useState<null | (() => Promise<void>)>(null);
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
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (id: number) => {
    const plan = ratePlansState.find((p) => p.ratePlanId === id);
    if (!plan) return;
    clearAllRatePlanData();
    navigate(`/get-started/rate-plans/${id}/edit`, { state: { plan } });
  };

  const handleDraft = async (id: number) => {
    console.log('🎯 handleDraft called for ID:', id);
    try {
      clearAllRatePlanData();
      console.log('📡 Fetching rate plan details...');
      const fresh = await fetchRatePlanWithDetails(id);
      console.log('✅ Fetched draft data:', fresh);
      console.log('🔍 Freemiums in draft data:', fresh.freemiums);
      setDraftPlanData(fresh);
      setShowCreatePlan(true);
      console.log('🚀 Opening CreatePricePlan with draft data');
    } catch (error) {
      console.error('❌ Failed to fetch detailed draft data:', error);
      const plan = ratePlansState.find((p) => p.ratePlanId === id);
      if (plan) { 
        console.log('📋 Using basic plan data as fallback:', plan);
        setDraftPlanData(plan); 
        setShowCreatePlan(true); 
      }
    }
  };

  const handleDeleteClick = (id: number) => { 
    console.log('🗑️ Delete button clicked for rate plan ID:', id);
    const plan = ratePlansState.find(p => p.ratePlanId === id);
    setDeleteTargetId(id); 
    setDeleteRatePlanName(plan?.ratePlanName || 'Unknown Plan');
    setShowTableDeleteModal(true);
    console.log('📋 ConfirmDeleteModal opened for:', plan?.ratePlanName);
  };

  // Table row delete confirmation (like Products component)
  const handleTableDeleteConfirm = async () => {
    if (deleteTargetId == null) {
      console.log('❌ No delete target ID set');
      return;
    }
    
    console.log('🗑️ Confirming delete for plan ID:', deleteTargetId);
    
    try {
      setIsDeleting(true);
      console.log('🔄 Calling deleteRatePlan API...');
      await deleteRatePlan(deleteTargetId);
      console.log('✅ Delete API successful');
      
      // Update the list
      const next = ratePlansState.filter((p) => p.ratePlanId !== deleteTargetId);
      setBoth(next);
      
      // Show success toast (like Products)
      showToast?.({ message: 'Rate plan deleted successfully', kind: 'success' });
      console.log('🎉 Success toast shown');
      
    } catch (error) {
      console.error('❌ Delete failed:', error);
      // Show error toast (like Products)
      showToast?.({ message: 'Failed to delete rate plan', kind: 'error' });
    } finally {
      setIsDeleting(false);
      setShowTableDeleteModal(false);
      setDeleteTargetId(null);
      setDeleteRatePlanName('');
    }
  };
  
  const handleTableDeleteCancel = () => {
    console.log('❌ Table delete cancelled');
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

  /** Rate Plan name chip with full spec icon stack (now shows PRODUCT name below) */
  const renderNameChip = (p: RatePlan) => {
    const productName = p.productName ?? p.product?.productName ?? '—';
    return (
      <div className="rp-name-chip">
        <div className="rp-name-icon" aria-hidden="true">
          {/* purchase tag (20×26) behind the pink squares */}
          <svg className="rp-price-tag" xmlns="http://www.w3.org/2000/svg" width="21" height="26" viewBox="0 0 21 26" fill="none">
            <foreignObject x="3.03359" y="-0.458594" width="14.5773" height="18.7165">
              <div style={{ backdropFilter:'blur(0.45px)', height:'100%', width:'100%' }} />
            </foreignObject>
            <path d="M6.36123 4.79875C6.44251 4.4306 6.66668 4.10981 6.98446 3.90694L11.282 1.16463C11.5999 0.961812 11.9853 0.893563 12.3534 0.974898C12.7216 1.05623 13.0424 1.28049 13.2452 1.59833L15.9875 5.89591C16.1902 6.21377 16.2584 6.59915 16.177 6.96727L14.2896 15.5109C14.1899 15.9554 13.9185 16.3423 13.5345 16.5873C13.1506 16.8323 12.6853 16.9155 12.2402 16.8186L5.78144 15.3917C5.33701 15.2921 4.95007 15.0206 4.70507 14.6367C4.46007 14.2527 4.37691 13.7875 4.47375 13.3424L6.36123 4.79875Z" fill="#EBADCC" fillOpacity="0.3" stroke="#BA5285" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.03722 10.771L12.522 11.8373M7.50775 12.7634L10.0001 13.3002M12.0004 2.76365C11.8337 2.76365 11.5004 2.86365 11.5004 3.26365C11.5004 3.6319 12.3139 3.72888 12.5429 3.35494C12.7531 3.01173 12.2848 2.47895 12.0004 2.76365Z" stroke="#BA5285" strokeWidth="0.6" strokeLinecap="round"/>
          </svg>

          {/* white thread */}
          <svg className="rp-tag-thread" xmlns="http://www.w3.org/2000/svg" width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M11.9993 4.13599C9.49904 -0.863765 -2.0007 -0.363798 1.99911 9.13624" stroke="white" strokeWidth="0.6" strokeLinecap="round"/>
          </svg>

          <div className="rp-icon-bg" />
          <div className="rp-icon-fg">
            <div className="rp-icon-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <mask id="mask0_8724_24579" style={{ maskType:'alpha' } as any} maskUnits="userSpaceOnUse" x="0" y="0" width="16" height="16">
                  <rect x="0.621094" y="0.518555" width="14.7273" height="14.7273" fill="#D9D9D9"/>
                </mask>
                <g mask="url(#mask0_8724_24579)">
                  <path d="M11.9242 14.1721C11.7929 14.1721 11.6837 14.1279 11.5968 14.0397C11.5099 13.9515 11.4664 13.8422 11.4664 13.7118C11.4664 13.6505 11.4776 13.5886 11.4998 13.5262C11.5221 13.4639 11.5519 13.4133 11.5891 13.3743C12.0391 12.9243 12.3945 12.4002 12.6553 11.8019C12.9161 11.2036 13.0465 10.5618 13.0465 9.87662C13.0465 9.18945 12.9161 8.54717 12.6553 7.9498C12.3945 7.35252 12.0391 6.82889 11.5891 6.37889C11.5519 6.34002 11.5221 6.28945 11.4998 6.22717C11.4776 6.16488 11.4664 6.1026 11.4664 6.04031C11.4664 5.90808 11.5105 5.79849 11.5988 5.71156C11.687 5.62463 11.7962 5.58116 11.9266 5.58116C11.988 5.58116 12.0475 5.59456 12.105 5.62135C12.1625 5.64825 12.2104 5.68088 12.2488 5.71923C12.7806 6.25105 13.1999 6.87235 13.5067 7.58315C13.8136 8.29395 13.967 9.05593 13.967 9.8691C13.967 10.6923 13.8136 11.4593 13.5067 12.1701C13.1999 12.8809 12.7806 13.5022 12.2488 14.034C12.2101 14.0724 12.1619 14.1049 12.104 14.1317C12.046 14.1586 11.9861 14.1721 11.9242 14.1721ZM10.1778 12.4232C10.0474 12.4232 9.93809 12.3791 9.84994 12.2908C9.76167 12.2027 9.71754 12.0934 9.71754 11.963C9.71754 11.9016 9.73099 11.8421 9.75789 11.7846C9.78468 11.7271 9.81726 11.6792 9.85561 11.6408C10.0908 11.4056 10.2724 11.1391 10.4002 10.8413C10.5281 10.5434 10.592 10.2213 10.592 9.87477C10.592 9.52828 10.5281 9.20673 10.4002 8.91014C10.2724 8.61355 10.0908 8.34764 9.85561 8.11241C9.8147 8.0715 9.78146 8.02226 9.7559 7.96468C9.73033 7.9072 9.71754 7.84778 9.71754 7.78642C9.71754 7.65602 9.76167 7.54735 9.84994 7.46042C9.93809 7.37349 10.0474 7.33003 10.1778 7.33003C10.2494 7.33003 10.3133 7.34025 10.3695 7.36071C10.4258 7.38116 10.4744 7.41696 10.5153 7.46809C10.8221 7.77491 11.065 8.13476 11.244 8.54763C11.4229 8.96041 11.5124 9.40274 11.5124 9.87462C11.5124 10.3464 11.4229 10.7894 11.244 11.2036C11.065 11.6178 10.8221 11.9783 10.5153 12.2851C10.4744 12.3363 10.4258 12.3721 10.3695 12.3925C10.3133 12.413 10.2494 12.4232 10.1778 12.4232ZM5.37607 9.6465H3.99538V10.0914C3.99538 10.48 4.11555 10.8252 4.3559 11.1269C4.59624 11.4286 4.90561 11.6306 5.28402 11.7329L5.46811 11.7789C5.80357 11.863 5.99226 12.0732 6.03419 12.4096C6.07612 12.7459 5.94368 13.001 5.63686 13.1749C5.12488 13.4608 4.5878 13.6677 4.02561 13.7958C3.46341 13.9239 2.89084 13.9982 2.30788 14.0187C2.18516 14.0289 2.07777 13.9899 1.98572 13.9016C1.89368 13.8135 1.84766 13.7042 1.84766 13.5738C1.84766 13.4434 1.89112 13.334 1.97805 13.2458C2.06499 13.1576 2.17493 13.1084 2.30788 13.0982C2.73743 13.0778 3.16114 13.025 3.57903 12.9399C3.99702 12.8548 4.41194 12.7337 4.82379 12.5766C4.32266 12.3312 3.90589 11.9937 3.57351 11.5641C3.24112 11.1346 3.07493 10.6437 3.07493 10.0914V9.18628C3.07493 9.05588 3.11906 8.94655 3.20732 8.85829C3.29548 8.77013 3.40476 8.72605 3.53516 8.72605H5.52947V7.19196C5.52947 7.06156 5.57361 6.95223 5.66187 6.86397C5.75003 6.77581 5.8593 6.73173 5.9897 6.73173H7.69254L5.69822 2.8965C5.63686 2.784 5.62919 2.66639 5.67521 2.54366C5.72124 2.42093 5.8005 2.33145 5.913 2.2752C6.0255 2.21895 6.14055 2.20872 6.25817 2.24451C6.37578 2.28031 6.46527 2.35446 6.52663 2.46696L8.52095 6.31752C8.68459 6.62434 8.67722 6.92349 8.49886 7.21497C8.3205 7.50645 8.05684 7.65218 7.70788 7.65218H6.44993V8.57264C6.44993 8.8679 6.34479 9.12072 6.13452 9.33109C5.92425 9.54137 5.67143 9.6465 5.37607 9.6465Z" fill="white"/>
                </g>
              </svg>
            </div>
          </div>
        </div>

        <div className="rp-name-texts">
          <div className="rp-name-title">{p.ratePlanName || 'N/A'}</div>
          {/* Product name under Rate Plan name */}
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
            onBack={() => setShowSaveDraftModal(true)}
            cancel={{ label: 'Delete', onClick: () => setShowConfirmDelete(true) }}
            save={{
              label: 'Save as Draft',
              saving: draftSaving,
              disabled: !saveDraftFn,
              onClick: async () => { if (!saveDraftFn) return; setDraftSaving(true); await saveDraftFn(); setDraftSaving(false); }
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
              try { if (saveDraftFn) { setDraftSaving(true); await saveDraftFn(); setDraftSaving(false); } }
              finally { setShowSaveDraftModal(false); setShowCreatePlan(false); await loadRatePlans(); }
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
            onPrimaryClick={() => { setShowCreatePlan(true); navigate('/get-started/rate-plans'); }}
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
                          <button className="empty-new-rate-btn" onClick={() => { setShowCreatePlan(true); navigate('/get-started/rate-plans'); }}>
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

          {/* Table row delete modal (like Products component) */}
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
