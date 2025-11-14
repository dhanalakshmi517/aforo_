import React, { useState, useEffect, useRef } from 'react';
import { fetchRatePlans, deleteRatePlan, fetchRatePlanWithDetails, fetchBillableMetricById, checkApiHealth } from './api';
import './RatePlan.css';
import PageHeader from '../PageHeader/PageHeader';
import { useNavigate } from 'react-router-dom';
import CreatePricePlan from './CreatePricePlan';
import TopBar from '../componenetsss/TopBar';
import SaveDraft from '../componenetsss/SaveDraft';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import { clearAllRatePlanData } from './utils/sessionStorage';
import { ToastProvider, useToast } from '../componenetsss/ToastProvider';
import EditIconButton from '../componenetsss/EditIconButton';
import DeleteIconButton from '../componenetsss/DeleteIconButton';
import RetryIconButton from '../componenetsss/RetryIconButton';
import { getProducts as getProductsApi, BASE_URL as API_BASE_URL, API_ORIGIN } from '../Products/api';
import { ProductIconData } from '../Products/ProductIcon';
import axios from 'axios';
import { getAuthHeaders } from '../../utils/auth';
import StatusBadge, { Variant } from '../componenetsss/StatusBadge';

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
  const [draftSaved, setDraftSaved] = useState(false);
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

  // Product icons state
  const [productIcons, setProductIcons] = useState<Record<number, { iconData: ProductIconData | null; iconUrl: string | null }>>({});
  const [loadingProductIcons, setLoadingProductIcons] = useState<Set<number>>(new Set());

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (localStorage.getItem('ratePlanWizardOpen') === 'true') {
      setShowCreatePlan(true);
      setDraftSaved(false);
      localStorage.removeItem('ratePlanWizardOpen');
    }
  }, []); // eslint-disable-line

  const [ratePlansState, setRatePlansState] = useState<RatePlan[]>(ratePlans || []);
  const [loading, setLoading] = useState(false);

  const loadRatePlans = async () => {
    try {
      setLoading(true);
      
      // First check API health
      console.log('🏥 Checking API health before fetching rate plans...');
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        console.warn('⚠️ API health check failed, but attempting to fetch rate plans anyway...');
      }
      
      const data = await fetchRatePlans();
      console.log('RatePlans - All Rate Plans:', data);
      setRatePlansState(data);
      if (setRatePlansFromParent) setRatePlansFromParent(data);
    } catch (err) {
      console.error('Failed to load rate plans', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear cache for specific rate plan to force refresh
  const clearRatePlanCache = (ratePlanId: number) => {
    setDetailsById(prev => {
      const next = { ...prev };
      delete next[ratePlanId];
      return next;
    });
  };

  useEffect(() => {
    loadRatePlans();
  }, []);

  // Clear cache when returning from edit to ensure fresh billable metric data
  useEffect(() => {
    const handleFocus = () => {
      // When window regains focus (user returns from edit), refresh rate plans
      loadRatePlans();
      // Clear all cached details to force fresh fetch
      setDetailsById({});
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible again, refresh data
        loadRatePlans();
        setDetailsById({});
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const filteredPlans = (ratePlansState ?? []).filter((p) => {
    const name = (p.ratePlanName ?? '').toLowerCase();
    const prod = (p.productName ?? p.product?.productName ?? '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || prod.includes(searchTerm.toLowerCase());
  });

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
        console.log(`RatePlans - Rate Plan ${id} Details:`, d);

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

        // Extract billable metric details
        let bmName = '';
        let uomShort = '';
        
        // First try to get from the response directly
        bmName = firstNonEmpty(d, [
          'billableMetric.name',
          'billableMetric.metricName',
          'billableMetricName',
          'metricName',
          'metric.name',
          'billableMetric.title'
        ], '');
        
        uomShort = firstNonEmpty(d, [
          'billableMetric.uomShort',
          'billableMetric.uom.short',
          'billableMetric.uom',
          'uom.short',
          'uomShort',
          'uom',
          'billableMetricUom',
          'billableMetric.uomSymbol'
        ], '');

        // If not found, fetch by billableMetricId
        if (!bmName && d.billableMetricId) {
          try {
            const billableMetric = await fetchBillableMetricById(d.billableMetricId);
            console.log(`RatePlans - Billable Metric ${d.billableMetricId}:`, billableMetric);
            if (billableMetric) {
              bmName = billableMetric.metricName || '';
              uomShort = billableMetric.unitOfMeasure || billableMetric.uomShort || billableMetric.uom || '';
            }
          } catch (bmError) {
            console.warn(`Failed to fetch billable metric ${d.billableMetricId}:`, bmError);
          }
        }

        const normalized: RatePlanDetails = {
          ratePlanId: id,
          pricingModelName,
          billableMetric: {
            uomShort,
            name: bmName
          }
        };
        console.log(`RatePlans - Normalized Data for ${id}:`, normalized);
        setDetailsById(prev => ({ ...prev, [id]: normalized }));
      } catch (e) {
        setDetailsById(prev => ({ ...prev, [id]: 'error' }));
      }
    });
  }, [filteredPlans, detailsById]);

  // ============================================================
  // Product icon fetch (FIX: correct base/origin for /uploads)
  // ============================================================
  const fetchProductIcon = async (productId: number) => {
    if (loadingProductIcons.has(productId) || productIcons[productId]) {
      return; // Already loading or loaded
    }

    setLoadingProductIcons(prev => new Set(prev).add(productId));

    try {
      // Get all products to find the one we need
      const products = await getProductsApi();
      const product = products.find(p => parseInt(p.productId) === productId);
      
      if (!product) {
        console.log(`❌ Product with ID ${productId} not found`);
        setProductIcons(prev => ({ ...prev, [productId]: { iconData: null, iconUrl: null } }));
        return;
      }

      let iconData: ProductIconData | null = null;
      let iconUrl: string | null = null;

      // ✅ PRIORITY 1: Check for structured productIcon field (saved during product creation)
      if (product.productIcon && product.productIcon !== 'null' && product.productIcon !== '') {
        try {
          const parsed = typeof product.productIcon === 'string' 
            ? JSON.parse(product.productIcon) 
            : product.productIcon;
          
          if (parsed?.id && parsed?.svgPath && parsed?.tileColor) {
            iconData = {
              id: parsed.id,
              label: parsed.label || product.productName || 'Product',
              svgPath: parsed.svgPath,
              tileColor: parsed.tileColor,
              viewBox: parsed.viewBox || '0 0 24 24',
              ...(parsed.outerBg && { outerBg: parsed.outerBg })
            } as ProductIconData;
          } else if (parsed?.iconData) {
            iconData = parsed.iconData as ProductIconData;
          }
        } catch (e) {
          console.error('❌ Error parsing productIcon JSON:', e);
        }
      }

      // ✅ PRIORITY 2: Only if no structured data, try to fetch from URL
      if (!iconData && product.icon) {
        try {
          const authHeaders = getAuthHeaders();
          const resolvedUrl =
            product.icon.startsWith('http')
              ? product.icon
              : product.icon.startsWith('/uploads')
                ? `${API_ORIGIN}${product.icon}` // <-- key fix: use ORIGIN (no /api) for /uploads
                : `${API_BASE_URL}${product.icon.startsWith('/') ? '' : '/'}${product.icon}`;

          const response = await axios.get(resolvedUrl, {
            responseType: 'blob',
            headers: authHeaders,
            timeout: 5000
          });
          
          iconUrl = URL.createObjectURL(response.data);

          // Try to parse SVG content to extract icon data
          const svgText = await (response.data as Blob).text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgText, 'image/svg+xml');
          
          // Extract tile color from the background rect
          const rects = doc.querySelectorAll('rect');
          let tileColor = '#0F6DDA';
          for (const rect of rects) {
            const width = rect.getAttribute('width');
            const fill = rect.getAttribute('fill');
            if (width && parseFloat(width) > 29 && parseFloat(width) < 30 && fill && fill.startsWith('#')) {
              tileColor = fill;
              break;
            }
          }
          
          // Extract icon path and viewBox
          const pathElement = doc.querySelector('path[fill="#FFFFFF"]');
          let svgPath = 'M12 2L2 7L12 12L22 7L12 2Z';
          let viewBox = '0 0 24 24';
          if (pathElement) {
            svgPath = pathElement.getAttribute('d') || svgPath;
            const svgElement = pathElement.closest('svg');
            if (svgElement) {
              viewBox = svgElement.getAttribute('viewBox') || viewBox;
            }
          }

          // Extract gradient colors
          let outerBg: [string, string] | undefined;
          const gradientElement = doc.querySelector('linearGradient');
          if (gradientElement) {
            const stops = gradientElement.querySelectorAll('stop');
            if (stops.length >= 2) {
              const color1 = stops[0].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1];
              const color2 = stops[1].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1];
              if (color1 && color2) {
                outerBg = [color1.trim(), color2.trim()];
              }
            }
          }
          
          iconData = {
            id: `product-${product.productId}`,
            label: product.productName || 'Product',
            svgPath,
            tileColor,
            viewBox,
            ...(outerBg && { outerBg })
          };
        } catch (e: any) {
          console.error('❌ Error fetching product icon from URL:', e);
        }
      }

      // ✅ PRIORITY 3: Create deterministic fallback only if absolutely no icon data
      if (!iconData && !iconUrl) {
        const colors = ['#0F6DDA', '#23A36D', '#CC9434', '#E3ADEB', '#FF6B6B', '#4ECDC4', '#95E77E', '#FFD93D'];
        const colorIndex = productId % colors.length;
        
        iconData = {
          id: `product-fallback-${productId}`,
          label: product.productName || 'Product',
          svgPath: 'M12 2L2 7V12L12 17L22 12V7L12 2ZM12 12L4.53 8.19L12 4.36L19.47 8.19L12 12Z',
          tileColor: colors[colorIndex],
          viewBox: '0 0 24 24'
        };
      }
      
      setProductIcons(prev => ({ ...prev, [productId]: { iconData, iconUrl } }));
    } catch (e) {
      console.error('Error loading product icon:', e);
      setProductIcons(prev => ({ ...prev, [productId]: { iconData: null, iconUrl: null } }));
    } finally {
      setLoadingProductIcons(prev => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Fetch icons for visible rate plans
  useEffect(() => {
    const productIds = new Set(filteredPlans.map(p => p.productId).filter(Boolean));
    productIds.forEach(productId => {
      if (!productIcons[productId] && !loadingProductIcons.has(productId)) {
        fetchProductIcon(productId);
      }
    });
  }, [filteredPlans]); // eslint-disable-line

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
      setDraftSaved(false);
      setShowCreatePlan(true);
    } catch (error) {
      console.error('❌ Failed to fetch detailed draft data:', error);
      const plan = ratePlansState.find((p) => p.ratePlanId === id);
      if (plan) {
        setDraftPlanData(plan);
        setDraftSaved(false);
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
      setRatePlansState(next);
      if (setRatePlansFromParent) setRatePlansFromParent(next);
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

  // ============================================================
  // FIXED: RatePlanIcon Component in RatePlans.tsx
  // ============================================================
  const RatePlanIcon: React.FC<{ iconData: ProductIconData | null; iconUrl: string | null }> = ({ iconData, iconUrl }) => {
    // Fallback UI when no icon is available
    if (!iconData) {
      return (
        <div style={{
          display: 'flex',
          padding: '8px 8px 8px 6px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '-4px',
          borderRadius: '12px',
          border: '0.6px solid var(--border-border-2, #D5D4DF)',
          background: 'var(--multi-colors-Products-Fuchsia-opac-1, rgba(227, 173, 235, 0.30))',
          width: '48px',
          height: '48px',
          position: 'relative'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: '#E3ADEB',
            color: '#1A2126'
          }}>
            {iconUrl ? (
              <img src={iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              'PR'
            )}
          </div>
          
          {/* Front Thread */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="13" 
            height="10" 
            viewBox="0 0 13 10" 
            fill="none"
            style={{
              position: 'absolute',
              bottom: '3px',
              right: '3px',
              width: '10.837px',
              height: '8.136px',
              flexShrink: 0,
              zIndex: 2
            }}
          >
            <path d="M12.0003 4.42164C9.50001 -0.57812 -1.99973 -0.0781536 2.00008 9.42188" stroke="white" strokeWidth="0.6" strokeLinecap="round"/>
          </svg>
          
          {/* Purchase Tag */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="21" 
            height="21" 
            viewBox="0 0 21 21" 
            fill="none"
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '19.627px',
              height: '19.627px',
              flexShrink: 0,
              zIndex: 3
            }}
          >
            <defs>
              <clipPath id="bgblur_purchase_tag_clip">
                <path d="M6.36221 5.08439C6.44348 4.71625 6.66766 4.39546 6.98544 4.19259L11.283 1.45027C11.6009 1.24746 11.9863 1.17921 12.3544 1.26054C12.7226 1.34188 13.0434 1.56613 13.2462 1.88398L15.9885 6.18156C16.1912 6.49942 16.2594 6.88479 16.178 7.25291L14.2905 15.7966C14.1909 16.241 13.9194 16.628 13.5355 16.873C13.1515 17.118 12.6863 17.2011 12.2412 17.1043L5.78241 15.6774C5.33799 15.5777 4.95104 15.3063 4.70604 14.9223C4.46104 14.5384 4.37789 14.0731 4.47473 13.6281L6.36221 5.08439Z"/>
              </clipPath>
            </defs>
            <foreignObject x="3.03555" y="-0.172949" width="14.5764" height="18.7165">
              <div style={{backdropFilter: 'blur(0.45px)', clipPath: 'url(#bgblur_purchase_tag_clip)', height: '100%', width: '100%'}}></div>
            </foreignObject>
            <path d="M6.36221 5.08439C6.44348 4.71625 6.66766 4.39546 6.98544 4.19259L11.283 1.45027C11.6009 1.24746 11.9863 1.17921 12.3544 1.26054C12.7226 1.34188 13.0434 1.56613 13.2462 1.88398L15.9885 6.18156C16.1912 6.49942 16.2594 6.88479 16.178 7.25291L14.2905 15.7966C14.1909 16.241 13.9194 16.628 13.5355 16.873C13.1515 17.118 12.6863 17.2011 12.2412 17.1043L5.78241 15.6774C5.33799 15.5777 4.95104 15.3063 4.70604 14.9223C4.46104 14.5384 4.37789 14.0731 4.47473 13.6281L6.36221 5.08439Z" fill="#CDADEB" fillOpacity="0.3" stroke="#C75ED7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.03722 11.0566L12.522 12.1229M7.50775 13.049L10.0001 13.5859M12.0004 3.0493C11.8337 3.0493 11.5004 3.1493 11.5004 3.5493C11.5004 3.91754 12.3139 4.01453 12.5429 3.64058C12.7531 3.29737 12.2848 2.7646 12.0004 3.0493Z" stroke="#C75ED7" strokeWidth="0.6" strokeLinecap="round"/>
          </svg>
          
          {/* Back Thread */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="7" 
            height="4" 
            viewBox="0 0 7 4" 
            fill="none"
            style={{
              position: 'absolute',
              bottom: '11px',
              right: '11px',
              width: '6px',
              height: '2.551px',
              flexShrink: 0,
              zIndex: 1
            }}
          >
            <path d="M1 1.42204C5.00057 5.4219 5.00032 0.421875 7.00032 0.421875" stroke="white" strokeWidth="0.6"/>
          </svg>
        </div>
      );
    }

    // Main rendering with iconData
    const tile = iconData.tileColor ?? '#CC9434';
    const hexToRgba = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return (
      <div style={{
        display: 'flex',
        padding: '8px 8px 8px 6px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '-4px',
        borderRadius: '12px',
        border: '0.6px solid var(--border-border-2, #D5D4DF)',
        background: hexToRgba(tile, 0.30),
        position: 'relative'
      }}>
        {/* BACK TILE (brand solid) */}
        <div style={{
          position: 'absolute',
          left: '10px',
          top: '6px',
          width: '26.6px',
          height: '26.6px',
          borderRadius: '5.7px',
          background: tile,
          flexShrink: 0
        }} />

        {/* GLASS FOREGROUND TILE */}
        <div style={{
          width: '28px',
          height: '28px',
          padding: '1.661px 3.321px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2.214px',
          flexShrink: 0,
          borderRadius: '6px',
          border: '0.6px solid #FFF',
          background: hexToRgba(tile, 0.10),
          backdropFilter: 'blur(3.875px)',
          transform: 'translate(3px, 2px)',
          boxShadow: 'inset 0 1px 8px rgba(255,255,255,0.35)',
          position: 'relative',
          zIndex: 1
        }}>
          {/* ICON */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14.727"
            height="14.727"
            viewBox={iconData.viewBox ?? "0 0 18 18"}
            fill="none"
            style={{
              flexShrink: 0,
              aspectRatio: '14.73 / 14.73',
              display: 'block'
            }}
          >
            <path d={iconData.svgPath} fill="#FFFFFF" />
          </svg>
        </div>

        {/* Front Thread */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="13" 
          height="10" 
          viewBox="0 0 13 10" 
          fill="none"
          style={{
            position: 'absolute',
            bottom: '3px',
            right: '3px',
            width: '10.837px',
            height: '8.136px',
            flexShrink: 0,
            zIndex: 2
          }}
        >
          <path d="M12.0003 4.42164C9.50001 -0.57812 -1.99973 -0.0781536 2.00008 9.42188" stroke="white" strokeWidth="0.6" strokeLinecap="round"/>
        </svg>
        
        {/* Purchase Tag */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="21" 
          height="21" 
          viewBox="0 0 21 21" 
          fill="none"
          style={{
            position: 'absolute',
            bottom: '-4px',
            right: '-4px',
            width: '19.627px',
            height: '19.627px',
            flexShrink: 0,
            zIndex: 3
          }}
        >
          <defs>
            <clipPath id="bgblur_purchase_tag_clip">
              <path d="M6.36221 5.08439C6.44348 4.71625 6.66766 4.39546 6.98544 4.19259L11.283 1.45027C11.6009 1.24746 11.9863 1.17921 12.3544 1.26054C12.7226 1.34188 13.0434 1.56613 13.2462 1.88398L15.9885 6.18156C16.1912 6.49942 16.2594 6.88479 16.178 7.25291L14.2905 15.7966C14.1909 16.241 13.9194 16.628 13.5355 16.873C13.1515 17.118 12.6863 17.2011 12.2412 17.1043L5.78241 15.6774C5.33799 15.5777 4.95104 15.3063 4.70604 14.9223C4.46104 14.5384 4.37789 14.0731 4.47473 13.6281L6.36221 5.08439Z"/>
            </clipPath>
          </defs>
          <foreignObject x="3.03555" y="-0.172949" width="14.5764" height="18.7165">
            <div style={{backdropFilter: 'blur(0.45px)', clipPath: 'url(#bgblur_purchase_tag_clip)', height: '100%', width: '100%'}}></div>
          </foreignObject>
          <path d="M6.36221 5.08439C6.44348 4.71625 6.66766 4.39546 6.98544 4.19259L11.283 1.45027C11.6009 1.24746 11.9863 1.17921 12.3544 1.26054C12.7226 1.34188 13.0434 1.56613 13.2462 1.88398L15.9885 6.18156C16.1912 6.49942 16.2594 6.88479 16.178 7.25291L14.2905 15.7966C14.1909 16.241 13.9194 16.628 13.5355 16.873C13.1515 17.118 12.6863 17.2011 12.2412 17.1043L5.78241 15.6774C5.33799 15.5777 4.95104 15.3063 4.70604 14.9223C4.46104 14.5384 4.37789 14.0731 4.47473 13.6281L6.36221 5.08439Z" fill="#CDADEB" fillOpacity="0.3" stroke="#C75ED7" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.03722 11.0566L12.522 12.1229M7.50775 13.049L10.0001 13.5859M12.0004 3.0493C11.8337 3.0493 11.5004 3.1493 11.5004 3.5493C11.5004 3.91754 12.3139 4.01453 12.5429 3.64058C12.7531 3.29737 12.2848 2.7646 12.0004 3.0493Z" stroke="#C75ED7" strokeWidth="0.6" strokeLinecap="round"/>
        </svg>
        
        {/* Back Thread */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="7" 
          height="4" 
          viewBox="0 0 7 4" 
          fill="none"
          style={{
            position: 'absolute',
            bottom: '11px',
            right: '11px',
            width: '6px',
            height: '2.551px',
            flexShrink: 0,
            zIndex: 1
          }}
        >
          <path d="M1 1.42204C5.00057 5.4219 5.00032 0.421875 7.00032 0.421875" stroke="white" strokeWidth="0.6"/>
        </svg>
      </div>
    );
  };

  /** Rate Plan name chip with product icon and product name */
  const renderNameChip = (p: RatePlan) => {
    const productName = p.productName ?? p.product?.productName ?? '—';
    const productIcon = productIcons[p.productId];
    
    return (
      <div style={{
        display: 'flex',
        padding: '8px 16px',
        alignItems: 'center',
        gap: '4px',
        alignSelf: 'stretch',
        borderBottom: '0.4px solid var(--border-border-1, #E9E9EE)'
      }}>
        {/* Product Icon with purchase tag */}
        <RatePlanIcon 
          iconData={productIcon?.iconData || null}
          iconUrl={productIcon?.iconUrl || null}
        />
        
        {/* Rate plan name and product name */}
        <div className="rp-name-texts" style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          <div style={{
            overflow: 'hidden',
            color: 'var(--text-text-darkest, #1A2126)',
            textOverflow: 'ellipsis',
            fontFamily: 'var(--type-font-family-primary, "IBM Plex Sans")',
            fontSize: 'var(--fontsize-body-md, 14px)',
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 'var(--line-height-body-md, 20px)',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1,
            alignSelf: 'stretch'
          }}>
            {p.ratePlanName || 'N/A'}
          </div>
          <div style={{
            overflow: 'hidden',
            color: 'var(--text-text-light, #767183)',
            textOverflow: 'ellipsis',
            fontFamily: 'var(--type-font-family-primary, "IBM Plex Sans")',
            fontSize: 'var(--fontsize-body-sm, 12px)',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'var(--line-height-body-sm, 16px)',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 1,
            alignSelf: 'stretch'
          }} title={productName}>
            {productName}
          </div>
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
              const ok = createPlanRef.current?.validateBeforeBack?.() ?? true;
              if (ok) {
                setShowSaveDraftModal(true);
              } else {
                createPlanRef.current?.back?.() || setShowCreatePlan(false);
              }
            }}
            cancel={{ label: 'Discard', onClick: () => setShowConfirmDelete(true) }}
            save={{
              label: 'Save as Draft',
              labelWhenSaved: 'Saved as Draft',
              saved: draftSaved,
              saving: draftSaving,
              disabled: !saveDraftFn,
              onClick: async () => {
                if (!saveDraftFn) return;
                setDraftSaved(false); // Reset saved state during save
                setDraftSaving(true);
                const ok = await saveDraftFn(); // boolean
                setDraftSaving(false);
                if (!ok) {
                  // validation failed; keep wizard open
                  return;
                }
                setDraftSaved(true); // Mark as saved
                // Stay on the same page after saving
                showToast?.({ message: 'Draft saved', kind: 'success' });
              }
            }}
          />
          <div className="create-plan-body" style={{ flex: 1 }}>
            <CreatePricePlan
              ref={createPlanRef}
              registerSaveDraft={(fn) => setSaveDraftFn(() => fn)}
              draftData={draftPlanData}
              onFieldChange={() => {
                if (draftSaved) setDraftSaved(false);
              }}
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
              setDraftSaved(false);
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
                        <StatusBadge
                          label={formatStatus(plan.status)}
                          variant={String(plan.status || '').toLowerCase() as Variant}
                          size="sm"
                        />
                      </td>
                      <td>
                        <div className="product-action-buttons">
                          {plan.status?.toLowerCase() === 'draft' ? (
                            <RetryIconButton
                              onClick={() => handleDraft(plan.ratePlanId)}
                              title="Continue editing draft"
                            />
                          ) : (
                            <EditIconButton
                              onClick={() => handleEdit(plan.ratePlanId)}
                              title="Edit rate plan"
                            />
                          )}
                          <DeleteIconButton
                            onClick={() => handleDeleteClick(plan.ratePlanId)}
                            title="Delete rate plan"
                          />
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
                            setDraftSaved(false);
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
