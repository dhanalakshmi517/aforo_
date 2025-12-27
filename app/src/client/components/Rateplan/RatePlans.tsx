import React, { useState, useEffect, useRef, useMemo } from 'react';

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
import Tooltip from '../componenetsss/Tooltip';
import PrimaryButton from '../componenetsss/PrimaryButton';
import Checkbox from '../componenetsss/Checkbox';
import FilterChip from '../componenetsss/FilterChip';
import FilterDropdown from '../componenetsss/FilterDropdown';
import SimpleFilterDropdown from '../componenetsss/SimpleFilterDropdown';
import DateSortDropdown from '../componenetsss/DateSortDropdown';
import MainFilterMenu, { MainFilterKey } from '../componenetsss/MainFilterMenu';
import RatePlansEmptyImg from './rateplans.svg';
import NoFileSvg from '../componenetsss/nofile.svg';
import ResetButton from '../componenetsss/ResetButton';

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

/** Robustly normalize/parse anything we might get in `productIcon` */
const parseProductIconField = (raw: any): any => {
  let v = raw;
  if (typeof v === 'string') {
    try { v = JSON.parse(v); } catch { /* keep as is */ }
  }
  if (typeof v === 'string') {
    try { v = JSON.parse(v); } catch { /* keep as is */ }
  }
  return v;
};

const extractIconData = (parsed: any, fallbackLabel: string): ProductIconData | null => {
  if (!parsed) return null;
  if (parsed.iconData && typeof parsed.iconData === 'object') {
    return parsed.iconData as ProductIconData;
  }
  if (parsed.id && parsed.svgPath) {
    return parsed as ProductIconData;
  }
  if (parsed.svgPath || parsed.svgContent) {
    return {
      id: `derived-${Date.now()}`,
      label: fallbackLabel,
      svgPath: parsed.svgPath || 'M12 2L2 7L12 12L22 7L12 2Z',
      viewBox: parsed.viewBox || '0 0 24 24',
      tileColor: parsed.tileColor || '#0F6DDA',
      outerBg: parsed.outerBg
    };
  }
  return null;
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
  const [hasAnyInput, setHasAnyInput] = useState(false); // Track if form has any input
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRatePlanIds, setSelectedRatePlanIds] = useState<Array<number | string>>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusFilterRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = useState<string[]>([]);
  const [isPaymentTypeFilterOpen, setIsPaymentTypeFilterOpen] = useState(false);
  const paymentTypeFilterRef = React.useRef<HTMLDivElement | null>(null);

  const [selectedBillingFrequencies, setSelectedBillingFrequencies] = useState<string[]>([]);
  const [isBillingFrequencyFilterOpen, setIsBillingFrequencyFilterOpen] = useState(false);
  const billingFrequencyFilterRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedPricingModels, setSelectedPricingModels] = useState<string[]>([]);
  const [isPricingModelFilterOpen, setIsPricingModelFilterOpen] = useState(false);
  const pricingModelFilterRef = React.useRef<HTMLDivElement | null>(null);
  const [createdSortOrder, setCreatedSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isCreatedSortOpen, setIsCreatedSortOpen] = useState(false);
  const createdSortRef = React.useRef<HTMLDivElement | null>(null);
  const [statusFilterPosition, setStatusFilterPosition] = useState({ top: 0, left: 0 });
  const [paymentTypeFilterPosition, setPaymentTypeFilterPosition] = useState({ top: 0, left: 0 });
  const [pricingModelFilterPosition, setPricingModelFilterPosition] = useState({ top: 0, left: 0 });
  const [createdSortPosition, setCreatedSortPosition] = useState({ top: 0, left: 0 });
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = useState(false);
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [activeFilterKey, setActiveFilterKey] = useState<MainFilterKey | null>('ratePlan');
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = useState(false);
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = useState({ top: 0, left: 0 });
  const filterButtonRef = useRef<HTMLButtonElement>(null!);

  /* ---------- details cache ---------- */
  const [detailsById, setDetailsById] = useState<Record<number, RatePlanDetails | 'loading' | 'error'>>({});

  const handleResetRatePlanFilters = () => {
    setSelectedRatePlanIds([]);
    setSelectedStatuses([]);
    setSelectedPaymentTypes([]);
    setSelectedBillingFrequencies([]);
    setSelectedPricingModels([]);
    setIsMainFilterMenuOpen(false);
    setIsMainFilterPanelOpen(false);
    setDetailsById({}); // Clear company-specific data
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // Ignore clicks inside the shared portal root
      const portalRoot = document.getElementById('portal-root');
      if (portalRoot && portalRoot.contains(target)) return;

      if (statusFilterRef.current && !statusFilterRef.current.contains(target)) {
        setIsStatusFilterOpen(false);
      }
      if (paymentTypeFilterRef.current && !paymentTypeFilterRef.current.contains(target)) {
        setIsPaymentTypeFilterOpen(false);
      }
      if (billingFrequencyFilterRef.current && !billingFrequencyFilterRef.current.contains(target)) {
        setIsBillingFrequencyFilterOpen(false);
      }
      if (pricingModelFilterRef.current && !pricingModelFilterRef.current.contains(target)) {
        setIsPricingModelFilterOpen(false);
      }
      if (createdSortRef.current && !createdSortRef.current.contains(target)) {
        setIsCreatedSortOpen(false);
      }
      if (filterButtonRef.current && !filterButtonRef.current.contains(target)) {
        setIsMainFilterMenuOpen(false);
        setIsMainFilterPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const ratePlanOptions = useMemo(() => {
    return Array.from(
      new Map(
        (ratePlansState ?? []).map((plan) => [
          plan.ratePlanId,
          {
            id: plan.ratePlanId,
            label: plan.ratePlanName || `Rate Plan ${plan.ratePlanId}`,
          },
        ])
      ).values()
    );
  }, [ratePlansState]);

  const filteredPlans = (ratePlansState ?? [])
    .filter((p) => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;

      const name = (p.ratePlanName ?? '').toLowerCase();
      const productName = (p.productName ?? p.product?.productName ?? '').toLowerCase();
      const description = (p.description ?? '').toLowerCase();
      const status = (p.status ?? '').toLowerCase();
      const paymentType = (p.paymentType ?? '').toLowerCase();
      const ratePlanType = (p.ratePlanType ?? '').toLowerCase();
      const billingFrequency = (p.billingFrequency ?? '').toLowerCase();

      return (
        name.includes(q) ||
        productName.includes(q) ||
        description.includes(q) ||
        status.includes(q) ||
        paymentType.includes(q) ||
        ratePlanType.includes(q) ||
        billingFrequency.includes(q)
      );
    })
    .filter((p) => {
      if (selectedRatePlanIds.length === 0) return true;
      return selectedRatePlanIds.some((x) => String(x) === String(p.ratePlanId));
    })
    .filter((p) => {
      if (selectedStatuses.length === 0) return true;
      const statusKey = (p.status ?? '').toLowerCase();
      return selectedStatuses.includes(statusKey);
    })
    .filter((p) => {
      if (selectedPaymentTypes.length === 0) return true;
      const paymentTypeKey = (p.paymentType ?? '').toLowerCase();
      return selectedPaymentTypes.includes(paymentTypeKey);
    })
    .filter((p) => {
      if (selectedBillingFrequencies.length === 0) return true;
      const billingFreqKey = (p.billingFrequency ?? '').toLowerCase();
      return selectedBillingFrequencies.includes(billingFreqKey);
    })
    .filter((p) => {
      if (selectedPricingModels.length === 0) return true;
      const details = detailsById[p.ratePlanId];
      if (details === 'loading' || details === 'error' || !details) return false;
      const pricingModelKey = (details.pricingModelName ?? '').toLowerCase();
      return selectedPricingModels.includes(pricingModelKey);
    })
    .sort((a, b) => {
      const aDate = new Date(a.createdOn || 0).getTime();
      const bDate = new Date(b.createdOn || 0).getTime();
      return createdSortOrder === 'newest' ? bDate - aDate : aDate - bDate;
    });

  useEffect(() => {
    const toFetch = filteredPlans
      .map(p => p.ratePlanId)
      .filter(id => !detailsById[id]);
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
  // Product icon fetch (ENHANCED: multiple fallbacks + debugging)
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
        console.log(`❌ RatePlans: Product with ID ${productId} not found in products list`);
        setProductIcons(prev => ({ ...prev, [productId]: { iconData: null, iconUrl: null } }));
        return;
      }

      console.log(`🔍 RatePlans: Found product ${productId} (${product.productName}), checking for icon...`);
      console.log(`🔍 RatePlans: product.productId type: ${typeof product.productId}, value: ${product.productId}`);
      console.log(`🔍 RatePlans: product.productIcon exists:`, !!product.productIcon);
      console.log(`🔍 RatePlans: product.icon exists:`, !!product.icon);

      let iconData: ProductIconData | null = null;
      let iconUrl: string | null = null;

      // ✅ PRIORITY 0: Check localStorage cache first (same as Products.tsx)
      // Try BOTH string and number keys since different components may store differently
      try {
        const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
        console.log(`🔍 RatePlans: iconDataCache keys:`, Object.keys(iconCache));

        // Try string key first (most common), then number key
        let cachedIconJson = iconCache[product.productId] || iconCache[String(productId)] || iconCache[productId];

        if (cachedIconJson) {
          console.log(`✅ RatePlans: Found cached icon for ${productId} in localStorage`);
          const parsedCache = parseProductIconField(cachedIconJson);
          iconData = extractIconData(parsedCache, product.productName || 'Product');
          if (iconData) {
            console.log(`✅ RatePlans: Successfully extracted cached icon for ${productId}:`, iconData);
          } else {
            console.log(`⚠️ RatePlans: Cache entry found but extractIconData returned null`);
          }
        } else {
          console.log(`⚠️ RatePlans: No cached icon found for ${productId} (tried keys: ${product.productId}, ${productId})`);
        }
      } catch (e) {
        console.warn('Failed to read icon cache from localStorage:', e);
      }

      // ✅ PRIORITY 1: Check for structured productIcon field from API response
      if (!iconData && product.productIcon && product.productIcon !== 'null' && product.productIcon !== '') {
        console.log(`🔍 RatePlans: Trying to parse productIcon field for ${productId}`);
        try {
          const parsed = parseProductIconField(product.productIcon);
          console.log(`🔍 RatePlans: Parsed productIcon:`, parsed);

          iconData = extractIconData(parsed, product.productName || 'Product');
          if (iconData) {
            console.log(`✅ RatePlans: Successfully extracted iconData from productIcon field for ${productId}`);
          } else {
            console.log(`⚠️ RatePlans: productIcon field exists but extractIconData returned null`);
          }
        } catch (e) {
          console.error('❌ Error parsing productIcon JSON:', e);
        }
      }

      // ✅ PRIORITY 1.5: Try fetching individual product for more complete data
      if (!iconData) {
        console.log(`🔍 RatePlans: Trying individual product fetch for ${productId}...`);
        try {
          const { getProductById } = await import('../Products/api');
          const individualProduct = await getProductById(product.productId);
          if (individualProduct?.productIcon) {
            console.log(`✅ RatePlans: Found productIcon in individual fetch for ${productId}`);
            const parsed = parseProductIconField(individualProduct.productIcon);
            iconData = extractIconData(parsed, product.productName || 'Product');
            if (iconData) {
              console.log(`✅ RatePlans: Successfully extracted iconData from individual fetch for ${productId}`);
              // Cache it for future use
              try {
                const iconCache = JSON.parse(localStorage.getItem('iconDataCache') || '{}');
                iconCache[product.productId] = JSON.stringify({ iconData });
                localStorage.setItem('iconDataCache', JSON.stringify(iconCache));
                console.log(`💾 RatePlans: Cached icon data for ${productId}`);
              } catch (e) {
                console.warn('Failed to cache icon data:', e);
              }
            }
          } else {
            console.log(`⚠️ RatePlans: Individual fetch also has no productIcon for ${productId}`);
          }
        } catch (e) {
          console.error(`❌ RatePlans: Error fetching individual product ${productId}:`, e);
        }
      }

      // ✅ PRIORITY 2: Only if no structured data, try to fetch from URL
      if (!iconData && product.icon) {
        console.log(`🔍 RatePlans: Trying to fetch icon from URL: ${product.icon}`);
        try {
          const authHeaders = getAuthHeaders();
          const resolvedUrl =
            product.icon.startsWith('http')
              ? product.icon
              : product.icon.startsWith('/uploads')
                ? `${API_ORIGIN}${product.icon}`
                : `${API_BASE_URL}${product.icon.startsWith('/') ? '' : '/'}${product.icon}`;

          console.log(`🔍 RatePlans: Resolved icon URL: ${resolvedUrl}`);

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

          // Extract tile color - try multiple selectors
          const rects = doc.querySelectorAll('rect');
          let tileColor = '#0F6DDA';
          for (const rect of rects) {
            const width = rect.getAttribute('width');
            const fill = rect.getAttribute('fill');
            if (fill && fill.startsWith('#') && fill !== '#FFF' && fill !== '#FFFFFF' && fill !== '#fff' && fill !== '#ffffff') {
              // Use the first non-white colored rect
              tileColor = fill;
              break;
            }
          }

          // Extract icon path - try multiple selectors
          const pathElement = doc.querySelector('path[fill="#FFFFFF"]')
            || doc.querySelector('path[fill="#fff"]')
            || doc.querySelector('path[fill="white"]')
            || doc.querySelector('path[fill="currentColor"]')
            || doc.querySelector('path');

          let svgPath = 'M12 2L2 7L12 12L22 7L12 2Z'; // Default fallback
          let viewBox = '0 0 24 24';

          if (pathElement) {
            svgPath = pathElement.getAttribute('d') || svgPath;
            const svgElement = doc.querySelector('svg');
            if (svgElement) {
              viewBox = svgElement.getAttribute('viewBox') || viewBox;
            }
          }

          // Extract gradient colors if available
          let outerBg: [string, string] | undefined;
          const gradientElement = doc.querySelector('linearGradient');
          if (gradientElement) {
            const stops = gradientElement.querySelectorAll('stop');
            if (stops.length >= 2) {
              const color1 = stops[0].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1]
                || stops[0].getAttribute('stop-color');
              const color2 = stops[1].getAttribute('style')?.match(/stop-color:([^;]+)/)?.[1]
                || stops[1].getAttribute('stop-color');
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

          console.log(`✅ RatePlans: Extracted icon from SVG URL for ${productId}:`, iconData);
        } catch (e: any) {
          console.error(`❌ RatePlans: Error fetching product icon from URL for ${productId}:`, e?.message || e);
        }
      }

      // ✅ PRIORITY 3: Create deterministic fallback only if absolutely no icon data
      if (!iconData && !iconUrl) {
        console.log(`⚠️ RatePlans: No icon data found, using fallback for ${productId}`);
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

      console.log(`✅ RatePlans: Final icon for ${productId}:`, iconData ? 'Found' : 'Fallback');
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <g clip-path="url(#clip0_14251_15772)">
                <path d="M12.0597 6.9135C12.6899 7.14845 13.2507 7.53852 13.6902 8.04763C14.1297 8.55674 14.4337 9.16846 14.5742 9.82621C14.7146 10.484 14.6869 11.1665 14.4937 11.8107C14.3005 12.4549 13.9479 13.04 13.4686 13.5119C12.9893 13.9838 12.3988 14.3272 11.7517 14.5103C11.1045 14.6935 10.4216 14.7105 9.76613 14.5598C9.11065 14.4091 8.50375 14.0956 8.00156 13.6482C7.49937 13.2008 7.1181 12.634 6.89301 12.0002M4.66634 4.00016H5.33301V6.66683M11.1397 9.2535L11.6063 9.72683L9.72634 11.6068M9.33301 5.3335C9.33301 7.54264 7.54215 9.3335 5.33301 9.3335C3.12387 9.3335 1.33301 7.54264 1.33301 5.3335C1.33301 3.12436 3.12387 1.3335 5.33301 1.3335C7.54215 1.3335 9.33301 3.12436 9.33301 5.3335Z" stroke="#19222D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
              </g>
              <defs>
                <clipPath id="clip0_14251_15772">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>          </span>
          Pre-paid
        </span>
      );
    }
    if (raw === 'POSTPAID') {
      return (
        <span className="pill pill--postpaid">
          <span className="pill-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M4.0124 13.6C2.89133 13.6 1.94233 13.2115 1.1654 12.4346C0.388467 11.6577 0 10.7087 0 9.5876C0 9.11693 0.0802666 8.65953 0.2408 8.2154C0.401333 7.77127 0.631333 7.36873 0.9308 7.0078L3.33813 4.11263C3.5917 3.80767 3.64109 3.38169 3.46402 3.02681L2.67551 1.44646C2.34378 0.781608 2.8273 0 3.57031 0H10.0297C10.7727 0 11.2562 0.781609 10.9245 1.44646L10.136 3.02681C9.95891 3.38169 10.0083 3.80767 10.2619 4.11263L12.6692 7.0078C12.9687 7.36873 13.1987 7.77127 13.3592 8.2154C13.5197 8.65953 13.6 9.11693 13.6 9.5876C13.6 10.7087 13.2095 11.6577 12.4284 12.4346C11.6475 13.2115 10.7005 13.6 9.5876 13.6H4.0124ZM6.8 9.7922C6.40107 9.7922 6.06033 9.65093 5.7778 9.3684C5.49513 9.08587 5.3538 8.74513 5.3538 8.3462C5.3538 7.94713 5.49513 7.60633 5.7778 7.3238C6.06033 7.04127 6.40107 6.9 6.8 6.9C7.19893 6.9 7.53967 7.04127 7.8222 7.3238C8.10487 7.60633 8.2462 7.94713 8.2462 8.3462C8.2462 8.74513 8.10487 9.08587 7.8222 9.3684C7.53967 9.65093 7.19893 9.7922 6.8 9.7922ZM4.57702 2.54864C4.74669 2.88664 5.09253 3.1 5.47073 3.1H8.13466C8.51401 3.1 8.86069 2.88535 9.0298 2.54578L9.556 1.48916C9.62221 1.35619 9.52551 1.2 9.37697 1.2H4.22419C4.07537 1.2 3.97868 1.35673 4.04544 1.48973L4.57702 2.54864ZM4.0124 12.4H9.5876C10.3733 12.4 11.0385 12.1264 11.583 11.5792C12.1277 11.032 12.4 10.3681 12.4 9.5876C12.4 9.25733 12.3433 8.93713 12.23 8.627C12.1167 8.31673 11.9549 8.03647 11.7446 7.7862L9.14287 4.66028C8.95287 4.43201 8.67125 4.3 8.37426 4.3H5.2434C4.94775 4.3 4.66726 4.43082 4.47726 4.65732L1.863 7.7738C1.65273 8.02407 1.48967 8.3064 1.3738 8.6208C1.25793 8.93507 1.2 9.25733 1.2 9.5876C1.2 10.3681 1.4736 11.032 2.0208 11.5792C2.568 12.1264 3.23187 12.4 4.0124 12.4Z" fill="#19222D" />
            </svg>          </span>
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
  const RatePlanIcon: React.FC<{ iconData: ProductIconData | null; iconUrl: string | null }> = ({ iconData, iconUrl }: { iconData: ProductIconData | null; iconUrl: string | null }) => {
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
          width: '58px',
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

          {/* Purchase Tag - positioned on left side */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="19"
            viewBox="0 0 14 19"
            fill="none"
            style={{
              position: 'absolute',
              top: '8px',
              left: '1px',
              width: '13px',
              height: '17.944px',
              flexShrink: 0,
              zIndex: 3
            }}
          >
            <path d="M0.405344 9.873C0.401952 9.56718 0.520179 9.27253 0.73402 9.05386L3.62623 6.09766C3.84014 5.87903 4.13213 5.75432 4.43799 5.75097C4.74384 5.74762 5.0385 5.86591 5.25713 6.07982L8.21333 8.97203C8.4319 9.18597 8.55655 9.47796 8.55985 9.78379L8.6375 16.8815C8.64038 17.2509 8.49696 17.6066 8.23857 17.8707C7.98017 18.1348 7.62779 18.2859 7.25834 18.2911L1.89267 18.3498C1.5232 18.3527 1.16759 18.2093 0.903481 17.9509C0.639372 17.6925 0.488211 17.3401 0.482998 16.9707L0.405344 9.873Z" fill="url(#paint0_linear_rp_fallback)" fillOpacity="0.2" style={{ mixBlendMode: 'hard-light' }} />
            <path d="M0.405344 9.873C0.401952 9.56718 0.520179 9.27253 0.73402 9.05386L3.62623 6.09766C3.84014 5.87903 4.13213 5.75432 4.43799 5.75097C4.74384 5.74762 5.0385 5.86591 5.25713 6.07982L8.21333 8.97203C8.4319 9.18597 8.55655 9.47796 8.55985 9.78379L8.6375 16.8815C8.64038 17.2509 8.49696 17.6066 8.23857 17.8707C7.98017 18.1348 7.62779 18.2859 7.25834 18.2911L1.89267 18.3498C1.5232 18.3527 1.16759 18.2093 0.903481 17.9509C0.639372 17.6925 0.488211 17.3401 0.482998 16.9707L0.405344 9.873Z" fill="#E3ADEB" fillOpacity="0.3" />
            <path d="M0.405344 9.873L0.810941 9.86857L0.81094 9.86851L0.405344 9.873ZM0.73402 9.05386L0.444082 8.7702L0.444021 8.77026L0.73402 9.05386ZM3.62623 6.09766L3.91617 6.38132L3.62623 6.09766ZM5.25713 6.07982L5.54079 5.78988L5.25713 6.07982ZM8.21333 8.97203L8.49705 8.68215L8.49699 8.68209L8.21333 8.97203ZM8.55985 9.78379L8.15425 9.78816L8.15425 9.78823L8.55985 9.78379ZM8.6375 16.8815L9.04311 16.8783L9.0431 16.877L8.6375 16.8815ZM7.25834 18.2911L7.26278 18.6967L7.26406 18.6967L7.25834 18.2911ZM1.89267 18.3498L1.89583 18.7555L1.89711 18.7554L1.89267 18.3498ZM0.482998 16.9707L0.0773999 16.9751L0.077418 16.9764L0.482998 16.9707ZM1.97945 14.5368C1.75547 14.5331 1.57091 14.7117 1.56723 14.9357C1.56355 15.1597 1.74215 15.3442 1.96614 15.3479L1.9728 14.9423L1.97945 14.5368ZM5.70527 15.4093C5.92926 15.413 6.11382 15.2344 6.1175 15.0104C6.12117 14.7864 5.94258 14.6018 5.71859 14.5982L5.71193 15.0037L5.70527 15.4093ZM1.8994 16.2076C1.67538 16.2087 1.49466 16.3912 1.49575 16.6152C1.49684 16.8392 1.67932 17.0199 1.90334 17.0189L1.90137 16.6132L1.8994 16.2076ZM3.97158 17.0088C4.1956 17.0077 4.37631 16.8252 4.37523 16.6012C4.37414 16.3772 4.19165 16.1965 3.96764 16.1976L3.96961 16.6032L3.97158 17.0088ZM13.0429 3.40146C13.1432 3.60178 13.3869 3.68288 13.5872 3.5826C13.7875 3.48232 13.8686 3.23864 13.7683 3.03832L13.4056 3.21989L13.0429 3.40146ZM4.04881 7.86447C4.13581 8.0709 4.37369 8.16772 4.58012 8.08072C4.78656 7.99371 4.88337 7.75583 4.79637 7.5494L4.42259 7.70694L4.04881 7.86447ZM7.06014 7.8438L7.39197 8.07707C7.70877 7.62643 8.03961 7.26451 8.46076 7.01157C8.87745 6.76131 9.41143 6.60059 10.1607 6.60059V6.19497V5.78935C9.28747 5.78935 8.60442 5.97899 8.04308 6.31612C7.48621 6.65057 7.07802 7.11306 6.72831 7.61053L7.06014 7.8438ZM0.405344 9.873L0.81094 9.86851C0.808741 9.67024 0.885387 9.47922 1.02402 9.33746L0.73402 9.05386L0.444021 8.77026C0.154971 9.06583 -0.00483659 9.46411 -0.000251353 9.8775L0.405344 9.873ZM0.73402 9.05386L1.02396 9.33752L3.91617 6.38132L3.62623 6.09766L3.33629 5.814L0.444082 8.7702L0.73402 9.05386ZM3.62623 6.09766L3.91617 6.38132C4.05484 6.23958 4.24414 6.15874 4.44242 6.15657L4.43799 5.75097L4.43355 5.34537C4.02012 5.3499 3.62543 5.51847 3.33629 5.814L3.62623 6.09766ZM4.43799 5.75097L4.44242 6.15657C4.64071 6.1544 4.83173 6.23108 4.97347 6.36976L5.25713 6.07982L5.54079 5.78988C5.24526 5.50074 4.84697 5.34085 4.43355 5.34537L4.43799 5.75097ZM5.25713 6.07982L4.97347 6.36976L7.92967 9.26197L8.21333 8.97203L8.49699 8.68209L5.54079 5.78988L5.25713 6.07982ZM8.21333 8.97203L7.92961 9.26191C8.07131 9.4006 8.15211 9.5899 8.15425 9.78816L8.55985 9.78379L8.96545 9.77941C8.96099 9.36602 8.7925 8.97133 8.49705 8.68215L8.21333 8.97203ZM8.55985 9.78379L8.15425 9.78823L8.23191 16.8859L8.6375 16.8815L9.0431 16.877L8.96545 9.77935L8.55985 9.78379ZM8.6375 16.8815L8.23189 16.8846C8.23393 17.147 8.1321 17.3995 7.94863 17.587L8.23857 17.8707L8.5285 18.1543C8.86182 17.8136 9.04682 17.3549 9.04311 16.8783L8.6375 16.8815ZM8.23857 17.8707L7.94863 17.587C7.76516 17.7745 7.51495 17.8819 7.25262 17.8856L7.25834 18.2911L7.26406 18.6967C7.74063 18.69 8.19519 18.495 8.5285 18.1543L8.23857 17.8707ZM7.25834 18.2911L7.2539 17.8855L1.88824 17.9443L1.89267 18.3498L1.89711 18.7554L7.26278 18.6967L7.25834 18.2911ZM1.89267 18.3498L1.88952 17.9442C1.62718 17.9463 1.37468 17.8444 1.18714 17.661L0.903481 17.9509L0.619819 18.2409C0.960506 18.5742 1.41922 18.7592 1.89583 18.7555L1.89267 18.3498ZM0.903481 17.9509L1.18714 17.661C0.999612 17.4775 0.89228 17.2273 0.888579 16.965L0.482998 16.9707L0.077418 16.9764C0.0841416 17.453 0.279132 17.9075 0.619819 18.2409L0.903481 17.9509ZM0.482998 16.9707L0.888595 16.9662L0.810941 9.86857L0.405344 9.873L-0.000252038 9.87744L0.0774019 16.9751L0.482998 16.9707ZM1.9728 14.9423L1.96614 15.3479L5.70527 15.4093L5.71193 15.0037L5.71859 14.5982L1.97945 14.5368L1.9728 14.9423ZM1.90137 16.6132L1.90334 17.0189L3.97158 17.0088L3.96961 16.6032L3.96764 16.1976L1.8994 16.2076L1.90137 16.6132ZM13.4056 3.21989L13.7683 3.03832C13.1495 1.80214 11.9882 0.93063 10.6903 0.449087C9.39204 -0.0326103 7.91818 -0.139654 6.62407 0.191071C5.32529 0.522991 4.18033 1.30614 3.62134 2.61958C3.06508 3.92662 3.12552 5.67378 4.04881 7.86447L4.42259 7.70694L4.79637 7.5494C3.92318 5.47759 3.92751 3.97179 4.36779 2.93726C4.80535 1.90913 5.70959 1.26209 6.82494 0.977052C7.94497 0.690815 9.25018 0.780034 10.4082 1.20967C11.5665 1.63945 12.5388 2.39434 13.0429 3.40146L13.4056 3.21989Z" fill="#AB51B9" />
            <defs>
              <linearGradient id="paint0_linear_rp_fallback" x1="11.43" y1="12.5616" x2="0.771129" y2="8.13689" gradientUnits="userSpaceOnUse">
                <stop stopColor="#291515" />
                <stop offset="1" stopColor="#EFEFEF" />
              </linearGradient>
            </defs>
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
        width: '58px',
        height: '48px',
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

        {/* Purchase Tag - positioned on left side, using icon's tile color */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="19"
          viewBox="0 0 14 19"
          fill="none"
          style={{
            position: 'absolute',
            top: '8px',
            left: '1px',
            width: '13px',
            height: '17.944px',
            flexShrink: 0,
            zIndex: 3
          }}
        >
          <path d="M0.405344 9.873C0.401952 9.56718 0.520179 9.27253 0.73402 9.05386L3.62623 6.09766C3.84014 5.87903 4.13213 5.75432 4.43799 5.75097C4.74384 5.74762 5.0385 5.86591 5.25713 6.07982L8.21333 8.97203C8.4319 9.18597 8.55655 9.47796 8.55985 9.78379L8.6375 16.8815C8.64038 17.2509 8.49696 17.6066 8.23857 17.8707C7.98017 18.1348 7.62779 18.2859 7.25834 18.2911L1.89267 18.3498C1.5232 18.3527 1.16759 18.2093 0.903481 17.9509C0.639372 17.6925 0.488211 17.3401 0.482998 16.9707L0.405344 9.873Z" fill={`url(#paint0_linear_rp_main)`} fillOpacity="0.2" style={{ mixBlendMode: 'hard-light' }} />
          <path d="M0.405344 9.873C0.401952 9.56718 0.520179 9.27253 0.73402 9.05386L3.62623 6.09766C3.84014 5.87903 4.13213 5.75432 4.43799 5.75097C4.74384 5.74762 5.0385 5.86591 5.25713 6.07982L8.21333 8.97203C8.4319 9.18597 8.55655 9.47796 8.55985 9.78379L8.6375 16.8815C8.64038 17.2509 8.49696 17.6066 8.23857 17.8707C7.98017 18.1348 7.62779 18.2859 7.25834 18.2911L1.89267 18.3498C1.5232 18.3527 1.16759 18.2093 0.903481 17.9509C0.639372 17.6925 0.488211 17.3401 0.482998 16.9707L0.405344 9.873Z" fill={hexToRgba(tile, 0.3)} />
          <path d="M0.405344 9.873L0.810941 9.86857L0.81094 9.86851L0.405344 9.873ZM0.73402 9.05386L0.444082 8.7702L0.444021 8.77026L0.73402 9.05386ZM3.62623 6.09766L3.91617 6.38132L3.62623 6.09766ZM5.25713 6.07982L5.54079 5.78988L5.25713 6.07982ZM8.21333 8.97203L8.49705 8.68215L8.49699 8.68209L8.21333 8.97203ZM8.55985 9.78379L8.15425 9.78816L8.15425 9.78823L8.55985 9.78379ZM8.6375 16.8815L9.04311 16.8783L9.0431 16.877L8.6375 16.8815ZM7.25834 18.2911L7.26278 18.6967L7.26406 18.6967L7.25834 18.2911ZM1.89267 18.3498L1.89583 18.7555L1.89711 18.7554L1.89267 18.3498ZM0.482998 16.9707L0.0773999 16.9751L0.077418 16.9764L0.482998 16.9707ZM1.97945 14.5368C1.75547 14.5331 1.57091 14.7117 1.56723 14.9357C1.56355 15.1597 1.74215 15.3442 1.96614 15.3479L1.9728 14.9423L1.97945 14.5368ZM5.70527 15.4093C5.92926 15.413 6.11382 15.2344 6.1175 15.0104C6.12117 14.7864 5.94258 14.6018 5.71859 14.5982L5.71193 15.0037L5.70527 15.4093ZM1.8994 16.2076C1.67538 16.2087 1.49466 16.3912 1.49575 16.6152C1.49684 16.8392 1.67932 17.0199 1.90334 17.0189L1.90137 16.6132L1.8994 16.2076ZM3.97158 17.0088C4.1956 17.0077 4.37631 16.8252 4.37523 16.6012C4.37414 16.3772 4.19165 16.1965 3.96764 16.1976L3.96961 16.6032L3.97158 17.0088ZM13.0429 3.40146C13.1432 3.60178 13.3869 3.68288 13.5872 3.5826C13.7875 3.48232 13.8686 3.23864 13.7683 3.03832L13.4056 3.21989L13.0429 3.40146ZM4.04881 7.86447C4.13581 8.0709 4.37369 8.16772 4.58012 8.08072C4.78656 7.99371 4.88337 7.75583 4.79637 7.5494L4.42259 7.70694L4.04881 7.86447ZM7.06014 7.8438L7.39197 8.07707C7.70877 7.62643 8.03961 7.26451 8.46076 7.01157C8.87745 6.76131 9.41143 6.60059 10.1607 6.60059V6.19497V5.78935C9.28747 5.78935 8.60442 5.97899 8.04308 6.31612C7.48621 6.65057 7.07802 7.11306 6.72831 7.61053L7.06014 7.8438ZM0.405344 9.873L0.81094 9.86851C0.808741 9.67024 0.885387 9.47922 1.02402 9.33746L0.73402 9.05386L0.444021 8.77026C0.154971 9.06583 -0.00483659 9.46411 -0.000251353 9.8775L0.405344 9.873ZM0.73402 9.05386L1.02396 9.33752L3.91617 6.38132L3.62623 6.09766L3.33629 5.814L0.444082 8.7702L0.73402 9.05386ZM3.62623 6.09766L3.91617 6.38132C4.05484 6.23958 4.24414 6.15874 4.44242 6.15657L4.43799 5.75097L4.43355 5.34537C4.02012 5.3499 3.62543 5.51847 3.33629 5.814L3.62623 6.09766ZM4.43799 5.75097L4.44242 6.15657C4.64071 6.1544 4.83173 6.23108 4.97347 6.36976L5.25713 6.07982L5.54079 5.78988C5.24526 5.50074 4.84697 5.34085 4.43355 5.34537L4.43799 5.75097ZM5.25713 6.07982L4.97347 6.36976L7.92967 9.26197L8.21333 8.97203L8.49699 8.68209L5.54079 5.78988L5.25713 6.07982ZM8.21333 8.97203L7.92961 9.26191C8.07131 9.4006 8.15211 9.5899 8.15425 9.78816L8.55985 9.78379L8.96545 9.77941C8.96099 9.36602 8.7925 8.97133 8.49705 8.68215L8.21333 8.97203ZM8.55985 9.78379L8.15425 9.78823L8.23191 16.8859L8.6375 16.8815L9.0431 16.877L8.96545 9.77935L8.55985 9.78379ZM8.6375 16.8815L8.23189 16.8846C8.23393 17.147 8.1321 17.3995 7.94863 17.587L8.23857 17.8707L8.5285 18.1543C8.86182 17.8136 9.04682 17.3549 9.04311 16.8783L8.6375 16.8815ZM8.23857 17.8707L7.94863 17.587C7.76516 17.7745 7.51495 17.8819 7.25262 17.8856L7.25834 18.2911L7.26406 18.6967C7.74063 18.69 8.19519 18.495 8.5285 18.1543L8.23857 17.8707ZM7.25834 18.2911L7.2539 17.8855L1.88824 17.9443L1.89267 18.3498L1.89711 18.7554L7.26278 18.6967L7.25834 18.2911ZM1.89267 18.3498L1.88952 17.9442C1.62718 17.9463 1.37468 17.8444 1.18714 17.661L0.903481 17.9509L0.619819 18.2409C0.960506 18.5742 1.41922 18.7592 1.89583 18.7555L1.89267 18.3498ZM0.903481 17.9509L1.18714 17.661C0.999612 17.4775 0.89228 17.2273 0.888579 16.965L0.482998 16.9707L0.077418 16.9764C0.0841416 17.453 0.279132 17.9075 0.619819 18.2409L0.903481 17.9509ZM0.482998 16.9707L0.888595 16.9662L0.810941 9.86857L0.405344 9.873L-0.000252038 9.87744L0.0774019 16.9751L0.482998 16.9707ZM1.9728 14.9423L1.96614 15.3479L5.70527 15.4093L5.71193 15.0037L5.71859 14.5982L1.97945 14.5368L1.9728 14.9423ZM1.90137 16.6132L1.90334 17.0189L3.97158 17.0088L3.96961 16.6032L3.96764 16.1976L1.8994 16.2076L1.90137 16.6132ZM13.4056 3.21989L13.7683 3.03832C13.1495 1.80214 11.9882 0.93063 10.6903 0.449087C9.39204 -0.0326103 7.91818 -0.139654 6.62407 0.191071C5.32529 0.522991 4.18033 1.30614 3.62134 2.61958C3.06508 3.92662 3.12552 5.67378 4.04881 7.86447L4.42259 7.70694L4.79637 7.5494C3.92318 5.47759 3.92751 3.97179 4.36779 2.93726C4.80535 1.90913 5.70959 1.26209 6.82494 0.977052C7.94497 0.690815 9.25018 0.780034 10.4082 1.20967C11.5665 1.63945 12.5388 2.39434 13.0429 3.40146L13.4056 3.21989Z" fill={tile} />
          <defs>
            <linearGradient id="paint0_linear_rp_main" x1="11.43" y1="12.5616" x2="0.771129" y2="8.13689" gradientUnits="userSpaceOnUse">
              <stop stopColor="#291515" />
              <stop offset="1" stopColor="#EFEFEF" />
            </linearGradient>
          </defs>
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
            <div className="create-plan-body" style={{ flex: 1 }}>
              <CreatePricePlan
                ref={createPlanRef}
                registerSaveDraft={(fn) => setSaveDraftFn(() => fn)}
                draftData={draftPlanData}
                onFieldChange={() => {
                  if (draftSaved) setDraftSaved(false);
                }}
                onHasInputChange={(hasInput) => setHasAnyInput(hasInput)}
                onClose={() => {
                  setDraftPlanData(null);
                  clearAllRatePlanData();
                  setShowCreatePlan(false);
                  loadRatePlans();
                }}
                topBarProps={{
                  onBack: () => {
                    const ok = createPlanRef.current?.validateBeforeBack?.() ?? true;
                    if (ok) {
                      setShowSaveDraftModal(true);
                    } else {
                      createPlanRef.current?.back?.() || setShowCreatePlan(false);
                    }
                  },
                  cancel: { label: 'Discard', onClick: () => setShowConfirmDelete(true), disabled: !hasAnyInput },
                  save: {
                    label: 'Save as Draft',
                    labelWhenSaved: 'Saved as Draft',
                    saved: draftSaved,
                    saving: draftSaving,
                    disabled: !saveDraftFn || !hasAnyInput,
                    onClick: async () => {
                      if (!saveDraftFn) return;
                      setDraftSaved(false);
                      setDraftSaving(true);
                      const ok = await saveDraftFn();
                      setDraftSaving(false);
                      if (!ok) return;
                      setDraftSaved(true);
                    }
                  }
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
                if (currentId) { try { await deleteRatePlan(currentId); } catch { } }
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
          <div className="check-container">
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
              onFilterClick={() => {
                setIsStatusFilterOpen(false);
                setIsPaymentTypeFilterOpen(false);
                setIsBillingFrequencyFilterOpen(false);
                setIsPricingModelFilterOpen(false);
                setIsCreatedSortOpen(false);

                if (filterButtonRef.current) {
                  const rect = filterButtonRef.current.getBoundingClientRect();
                  const menuWidth = 240;
                  const panelWidth = 320;
                  const gap = 12;
                  const margin = 8;

                  let left = rect.left;
                  const minLeft = panelWidth + gap + margin;
                  if (left < minLeft) {
                    left = minLeft;
                  }

                  if (left + menuWidth + margin > window.innerWidth) {
                    left = Math.max(margin, window.innerWidth - menuWidth - margin);
                    if (left < minLeft) {
                      left = minLeft;
                    }
                  }

                  setMainFilterMenuPosition({
                    top: rect.bottom + 8,
                    left,
                  });
                }

                const nextOpen = !isMainFilterMenuOpen;
                setIsMainFilterMenuOpen(nextOpen);
                if (!nextOpen) {
                  setIsMainFilterPanelOpen(false);
                }
              }}
              filterButtonRef={filterButtonRef}
              searchDisabled={!hasRows}
              filterDisabled={!hasRows}
              showPrimary={hasRows}
              showIntegrations={filteredPlans.length > 0} />

            {isMainFilterMenuOpen && (
              <MainFilterMenu
                items={[
                  { key: 'ratePlan', label: 'Rate Plan' },
                  { key: 'paymentType', label: 'Payment Type' },
                  { key: 'status', label: 'Status' },
                  { key: 'date', label: 'Date' },
                ]}
                activeKey={activeFilterKey}
                onSelect={(key) => {
                  setActiveFilterKey(key);
                }}
                onSelectWithRect={(key, rect) => {
                  setActiveFilterKey(key);
                  const panelWidth = key === 'ratePlan' ? 320 : 264;
                  const gap = 12;
                  const margin = 8;

                  let left = rect.left - gap - panelWidth;
                  if (left < margin) {
                    const tryRight = rect.right + gap;
                    if (tryRight + panelWidth + margin <= window.innerWidth) {
                      left = tryRight;
                    } else {
                      left = Math.max(margin, window.innerWidth - panelWidth - margin);
                    }
                  }

                  setMainFilterPanelPosition({
                    top: rect.top,
                    left,
                  });
                  setIsMainFilterPanelOpen(true);
                }}
                anchorTop={mainFilterMenuPosition.top}
                anchorLeft={mainFilterMenuPosition.left}
              />
            )}

            {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'ratePlan' && (
              <FilterDropdown
                options={ratePlanOptions}
                value={selectedRatePlanIds}
                onChange={(next) => setSelectedRatePlanIds(next)}
                placeholder="Search Rate Plans"
                widthPx={320}
                heightPx={300}
                anchorTop={mainFilterPanelPosition.top}
                anchorLeft={mainFilterPanelPosition.left}
              />
            )}

            {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'paymentType' && (
              <SimpleFilterDropdown
                options={['prepaid', 'postpaid'].map((pt) => ({
                  id: pt,
                  label: pt.charAt(0).toUpperCase() + pt.slice(1),
                }))}
                value={selectedPaymentTypes}
                onChange={(next) =>
                  setSelectedPaymentTypes(next.map((x) => String(x).toLowerCase()))
                }
                anchorTop={mainFilterPanelPosition.top}
                anchorLeft={mainFilterPanelPosition.left}
              />
            )}

            {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'status' && (
              <SimpleFilterDropdown
                options={['active', 'draft', 'live'].map((statusKey) => ({
                  id: statusKey,
                  label: statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
                }))}
                value={selectedStatuses}
                onChange={(next) =>
                  setSelectedStatuses(next.map((x) => String(x).toLowerCase()))
                }
                anchorTop={mainFilterPanelPosition.top}
                anchorLeft={mainFilterPanelPosition.left}
              />
            )}

            {isMainFilterMenuOpen && isMainFilterPanelOpen && activeFilterKey === 'date' && (
              <DateSortDropdown
                value={createdSortOrder}
                onChange={(next) => setCreatedSortOrder(next)}
                anchorTop={mainFilterPanelPosition.top}
                anchorLeft={mainFilterPanelPosition.left}
              />
            )}

            <div className="customers-table-wrapper">
              {(selectedRatePlanIds.length > 0 ||
                selectedStatuses.length > 0 ||
                selectedPaymentTypes.length > 0 ||
                selectedBillingFrequencies.length > 0 ||
                selectedPricingModels.length > 0) && (
                <div className="products-active-filters-row">
                  <div className="products-active-filters-chips">
                    {selectedRatePlanIds.map((id) => {
                      const plan = ratePlansState.find((p) => String(p.ratePlanId) === String(id));
                      const label = plan?.ratePlanName || `Rate Plan ${id}`;
                      return (
                        <FilterChip
                          key={`rate-plan-chip-${id}`}
                          label={label}
                          onRemove={() =>
                            setSelectedRatePlanIds((prev) => prev.filter((x) => x !== id))
                          }
                        />
                      );
                    })}
                    {selectedStatuses.map((s) => (
                      <FilterChip
                        key={s}
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        onRemove={() =>
                          setSelectedStatuses((prev) => prev.filter((x) => x !== s))
                        }
                      />
                    ))}

                    {selectedPaymentTypes.map((pt) => (
                      <FilterChip
                        key={pt}
                        label={pt.charAt(0).toUpperCase() + pt.slice(1)}
                        onRemove={() =>
                          setSelectedPaymentTypes((prev) => prev.filter((x) => x !== pt))
                        }
                      />
                    ))}

                    {selectedBillingFrequencies.map((bf) => (
                      <FilterChip
                        key={bf}
                        label={bf.charAt(0).toUpperCase() + bf.slice(1)}
                        onRemove={() =>
                          setSelectedBillingFrequencies((prev) => prev.filter((x) => x !== bf))
                        }
                      />
                    ))}

                    {selectedPricingModels.map((pm) => (
                      <FilterChip
                        key={pm}
                        label={pm.charAt(0).toUpperCase() + pm.slice(1)}
                        onRemove={() =>
                          setSelectedPricingModels((prev) => prev.filter((x) => x !== pm))
                        }
                      />
                    ))}
                  </div>

                  <ResetButton
                    label="Reset"
                    onClick={handleResetRatePlanFilters}
                  />
                </div>
              )}
              <table className="customers-table">
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
                    <th className="products-th-with-filter">
                      <div
                        ref={pricingModelFilterRef}
                        className="products-th-label-with-filter"
                        onMouseEnter={() => {
                          // close others
                          setIsPaymentTypeFilterOpen(false);
                          setIsCreatedSortOpen(false);
                          setIsStatusFilterOpen(false);

                          if (pricingModelFilterRef.current) {
                            const rect = pricingModelFilterRef.current.getBoundingClientRect();
                            setPricingModelFilterPosition({
                              top: rect.bottom + 4,
                              left: rect.left,
                            });
                          }
                          setIsPricingModelFilterOpen(true);
                        }}
                        onMouseLeave={() => {
                          setIsPricingModelFilterOpen(false);
                        }}
                      >
                        <span>Pricing model</span>
                        <button type="button" className={`products-column-filter-trigger ${isPricingModelFilterOpen ? 'is-open' : ''}`} aria-label="Filter by pricing model">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="8" viewBox="0 0 11 8" fill="none">
                            <path d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001" stroke="#19222D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {isPricingModelFilterOpen && (
                          <div className="products-column-filter-popover" onClick={(e) => e.stopPropagation()}>
                            <SimpleFilterDropdown
                              options={['flat fee', 'usage-based', 'tiered', 'volume', 'stair-step'].map((pmKey) => ({
                                id: pmKey,
                                label: pmKey.charAt(0).toUpperCase() + pmKey.slice(1),
                              }))}
                              value={selectedPricingModels}
                              onChange={(next) =>
                                setSelectedPricingModels(next.map((x) => String(x).toLowerCase()))
                              }
                              anchorTop={pricingModelFilterPosition.top}
                              anchorLeft={pricingModelFilterPosition.left}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="products-th-with-filter">
                      <div
                        ref={paymentTypeFilterRef}
                        className="products-th-label-with-filter"
                        onMouseEnter={() => {
                          setIsPricingModelFilterOpen(false);
                          setIsCreatedSortOpen(false);
                          setIsStatusFilterOpen(false);

                          if (paymentTypeFilterRef.current) {
                            const rect = paymentTypeFilterRef.current.getBoundingClientRect();
                            setPaymentTypeFilterPosition({
                              top: rect.bottom + 4,
                              left: rect.left,
                            });
                          }
                          setIsPaymentTypeFilterOpen(true);
                        }}
                        onMouseLeave={() => {
                          setIsPaymentTypeFilterOpen(false);
                        }}
                      >
                        <span>Payment Type</span>
                        <button type="button" className={`products-column-filter-trigger ${isPaymentTypeFilterOpen ? 'is-open' : ''}`} aria-label="Filter by payment type">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="8" viewBox="0 0 11 8" fill="none">
                            <path d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001" stroke="#19222D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {isPaymentTypeFilterOpen && (
                          <div className="products-column-filter-popover" onClick={(e) => e.stopPropagation()}>
                            <SimpleFilterDropdown
                              options={['prepaid', 'postpaid'].map((ptKey) => ({
                                id: ptKey,
                                label: ptKey.charAt(0).toUpperCase() + ptKey.slice(1),
                              }))}
                              value={selectedPaymentTypes}
                              onChange={(next) =>
                                setSelectedPaymentTypes(next.map((x) => String(x).toLowerCase()))
                              }
                              anchorTop={paymentTypeFilterPosition.top}
                              anchorLeft={paymentTypeFilterPosition.left}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="products-th-with-filter">
                      <div
                        ref={createdSortRef}
                        className="products-th-label-with-filter"
                        onMouseEnter={() => {
                          // close others
                          setIsPricingModelFilterOpen(false);
                          setIsPaymentTypeFilterOpen(false);
                          setIsStatusFilterOpen(false);

                          if (createdSortRef.current) {
                            const rect = createdSortRef.current.getBoundingClientRect();
                            setCreatedSortPosition({
                              top: rect.bottom + 4,
                              left: rect.left,
                            });
                          }
                          setIsCreatedSortOpen(true);
                        }}
                        onMouseLeave={() => {
                          setIsCreatedSortOpen(false);
                        }}
                      >
                        <span>Created on</span>
                        <button type="button" className={`products-column-filter-trigger ${isCreatedSortOpen ? 'is-open' : ''}`} aria-label="Sort by created date">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M10.5 8L8.5 10M8.5 10L6.5 8M8.5 10L8.5 2M1.5 4L3.5 2M3.5 2L5.5 4M3.5 2V10" stroke="#25303D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {isCreatedSortOpen && (
                          <div className="products-column-filter-popover products-createdon-popover" onClick={(e) => e.stopPropagation()}>
                            <DateSortDropdown
                              value={createdSortOrder}
                              onChange={(next) => {
                                setCreatedSortOrder(next);
                                setIsCreatedSortOpen(false);
                              }}
                              anchorTop={createdSortPosition.top}
                              anchorLeft={createdSortPosition.left}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="products-th-with-filter">
                      <div
                        ref={statusFilterRef}
                        className="products-th-label-with-filter"
                        onMouseEnter={() => {
                          setIsPricingModelFilterOpen(false);
                          setIsPaymentTypeFilterOpen(false);
                          setIsCreatedSortOpen(false);

                          if (statusFilterRef.current) {
                            const rect = statusFilterRef.current.getBoundingClientRect();
                            setStatusFilterPosition({
                              top: rect.bottom + 4,
                              left: rect.left,
                            });
                          }
                          setIsStatusFilterOpen(true);
                        }}
                        onMouseLeave={() => {
                          setIsStatusFilterOpen(false);
                        }}
                      >
                        <span>Status</span>
                        <button type="button" className={`products-column-filter-trigger ${isStatusFilterOpen ? 'is-open' : ''}`} aria-label="Filter by status">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="8" viewBox="0 0 11 8" fill="none">
                            <path d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001" stroke="#19222D" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        {isStatusFilterOpen && (
                          <div className="products-column-filter-popover" onClick={(e) => e.stopPropagation()}>
                            <SimpleFilterDropdown
                              options={['active', 'draft', 'live'].map((statusKey) => ({
                                id: statusKey,
                                label: statusKey.charAt(0).toUpperCase() + statusKey.slice(1),
                              }))}
                              value={selectedStatuses}
                              onChange={(next) =>
                                setSelectedStatuses(next.map((x) => String(x).toLowerCase()))
                              }
                              anchorTop={statusFilterPosition.top}
                              anchorLeft={statusFilterPosition.left}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                    <th className="actions-cell">Actions</th>
                  </tr>
                </thead>

                {loading && ratePlansState.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                        <div className="rateplan-loading-state">
                          <div className="spinner"></div>
                          <p style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>Loading rate plans...</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                ) : hasRows ? (
                  <tbody>
                    {filteredPlans.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                          <div className="products-empty-state">
                            <img src={NoFileSvg} alt="No results" style={{ width: 170, height: 170 }} />
                            <p className="products-empty-text" style={{ marginTop: 16 }}>
                              {searchQuery.trim() ? (
                                <>
                                  We couldn't find any results for "{searchQuery}"
                                  <br />
                                  Nothing wrong, just adjust your search a bit.
                                </>
                              ) : (
                                <>
                                  Oops! No matches found with these filters.
                                  <br />
                                  Nothing wrong here, just adjust your filters a bit.
                                </>
                              )}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredPlans.map((plan) => (
                        <tr key={plan.ratePlanId}>
                          <td>{renderNameChip(plan)}</td>
                          <td>{renderPricingModel(plan)}</td>
                          <td>{renderPaymentType(plan)}</td>
                          <td>{renderCreatedOn(plan)}</td>
                          <td>
                            <Tooltip
                              position="right"
                              content={
                                String(plan.status || '').toLowerCase() === 'live'
                                  ? 'Rate plan is live and available for sale.'
                                  : String(plan.status || '').toLowerCase() === 'active'
                                    ? 'Rate plan is active and available for sale.'
                                    : String(plan.status || '').toLowerCase() === 'draft'
                                      ? 'Rate plan is in draft. Continue setting it up.'
                                      : formatStatus(plan.status)
                              }
                            >
                              <StatusBadge
                                label={formatStatus(plan.status)}
                                variant={String(plan.status || '').toLowerCase() as Variant}
                                size="sm"
                              />
                            </Tooltip>
                          </td>

                          <td className="actions-cell">
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
                      ))
                    )}
                  </tbody>
                ) : (
                  <tbody>
                    <tr className="pp-empty-row">
                      <td colSpan={6}>
                        <div className="pp-empty-area in-table">
                          <div className="rate-empty">
                            <div className="rate-empty-illustration" aria-hidden="true">
                              <img src={RatePlansEmptyImg} alt="No rate plans" style={{ width: '190px', height: '190px' }} />
                            </div>
                            <p className="customers-empty-state-text">
                              No Rate Plan created yet. Click 'New Rate Plan'<br /> to create your First Rate Plan.
                            </p>
                            <PrimaryButton
                              onClick={() => {
                                clearAllRatePlanData();
                                setDraftPlanData(null);
                                setShowCreatePlan(true);
                                navigate('/get-started/rate-plans');
                              }}
                            >
                              + New Rate Plan
                            </PrimaryButton>
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