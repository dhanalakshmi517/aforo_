// RatePlans.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./RatePlan.css";

import PageHeader from "../PageHeader/PageHeader";
import DataTable, { DataTableColumn } from "../componenetsss/DataTable";
import CreatePricePlan from "./CreatePricePlan";
import SaveDraft from "../componenetsss/SaveDraft";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import EditIconButton from "../componenetsss/EditIconButton";
import DeleteIconButton from "../componenetsss/DeleteIconButton";
import RetryIconButton from "../componenetsss/RetryIconButton";
import StatusBadge, { Variant } from "../componenetsss/StatusBadge";
import PrimaryButton from "../componenetsss/PrimaryButton";

import FilterChip from "../componenetsss/FilterChip";
import FilterDropdown from "../componenetsss/FilterDropdown";
import SimpleFilterDropdown from "../componenetsss/SimpleFilterDropdown";
import DateSortDropdown from "../componenetsss/DateSortDropdown";
import MainFilterMenu, { MainFilterKey } from "../componenetsss/MainFilterMenu";
import ResetButton from "../componenetsss/ResetButton";

import { ToastProvider, useToast } from "../componenetsss/ToastProvider";

import RatePlansEmptyImg from "./rateplans.svg";
import NoFileSvg from "../componenetsss/nofile.svg";

import {
  fetchRatePlans,
  deleteRatePlan,
  fetchRatePlanWithDetails,
  fetchBillableMetricById,
  checkApiHealth,
} from "./api";

import { clearAllRatePlanData } from "./utils/sessionStorage";
import { getProducts as getProductsApi, BASE_URL as API_BASE_URL, API_ORIGIN } from "../Products/api";
import { ProductIconData } from "../Products/ProductIcon";
import { getAuthHeaders } from "../../utils/auth";

/* ---------------- Types ---------------- */
export interface RatePlan {
  ratePlanId: number;
  ratePlanName: string;
  description: string;
  productId: number;
  productName?: string;
  product?: { productName: string };
  status?: string;
  paymentType?: "PREPAID" | "POSTPAID" | string;
  createdOn?: string;
  lastUpdated?: string;
  ratePlanType?: "PREPAID" | "POSTPAID" | string;
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
  type: "success" | "error";
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
    <path
      d="M12 8V12M12 16H12.01M7.9 20C9.8 21 12 21.2 14.1 20.75C16.2 20.3 18 19.05 19.3 17.3C20.6 15.55 21.15 13.4 20.98 11.3C20.81 9.15 19.89 7.15 18.37 5.63C16.85 4.11 14.85 3.18 12.71 3.02C10.57 2.85 8.44 3.45 6.71 4.72C4.97 5.98 3.75 7.82 3.25 9.91C2.76 12 3.02 14.19 4 16.1L2 22L7.9 20Z"
      stroke="#E34935"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Notification: React.FC<NotificationState> = ({ type, ratePlanName }) => {
  const Icon = type === "success" ? SuccessIcon : ErrorIcon;
  return (
    <div className={`notification ${type === "error" ? "error" : ""}`}>
      <div className="notification-icon">
        <Icon />
      </div>
      <div className="notification-text">
        <h5>{type === "success" ? "Rate Plan Deleted" : "Failed to Delete Rate Plan"}</h5>
        <p className="notification-details">
          {type === "success"
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
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  } catch {
    return undefined;
  }
};

const firstNonEmpty = (obj: any, paths: string[], fallback = ""): string => {
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
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      /* keep as is */
    }
  }
  if (typeof v === "string") {
    try {
      v = JSON.parse(v);
    } catch {
      /* keep as is */
    }
  }
  return v;
};

const extractIconData = (parsed: any, fallbackLabel: string): ProductIconData | null => {
  if (!parsed) return null;
  if (parsed.iconData && typeof parsed.iconData === "object") {
    return parsed.iconData as ProductIconData;
  }
  if (parsed.id && parsed.svgPath) {
    return parsed as ProductIconData;
  }
  if (parsed.svgPath || parsed.svgContent) {
    return {
      id: `derived-${Date.now()}`,
      label: fallbackLabel,
      svgPath: parsed.svgPath || "M12 2L2 7L12 12L22 7L12 2Z",
      viewBox: parsed.viewBox || "0 0 24 24",
      tileColor: parsed.tileColor || "#0F6DDA",
      outerBg: parsed.outerBg,
    };
  }
  return null;
};

/* ---------------- Component Props ---------------- */
export interface RatePlansProps {
  showCreatePlan: boolean;
  setShowCreatePlan: (show: boolean) => void;
  ratePlans?: RatePlan[];
  setRatePlans?: React.Dispatch<React.SetStateAction<RatePlan[]>>;
}

/* ====================================================================== */
/* ============================= INNER ================================== */
/* ====================================================================== */

const RatePlansInner: React.FC<RatePlansProps> = ({
  showCreatePlan,
  setShowCreatePlan,
  ratePlans,
  setRatePlans: setRatePlansFromParent,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const createPlanRef = useRef<{
    back: () => boolean;
    getRatePlanId: () => number | null;
    validateBeforeBack: () => boolean;
  }>(null);

  // saveDraftFn returns boolean: true when saved, false when validation stopped it
  const [saveDraftFn, setSaveDraftFn] = useState<null | (() => Promise<boolean>)>(null);
  const [draftSaving, setDraftSaving] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [hasAnyInput, setHasAnyInput] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [draftPlanData, setDraftPlanData] = useState<any>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Table row delete modal states
  const [showTableDeleteModal, setShowTableDeleteModal] = useState(false);
  const [deleteRatePlanName, setDeleteRatePlanName] = useState<string>("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Product icons state
  const [productIcons, setProductIcons] = useState<
    Record<number, { iconData: ProductIconData | null; iconUrl: string | null }>
  >({});
  const [loadingProductIcons, setLoadingProductIcons] = useState<Set<number>>(new Set());

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (localStorage.getItem("ratePlanWizardOpen") === "true") {
      setShowCreatePlan(true);
      setDraftSaved(false);
      localStorage.removeItem("ratePlanWizardOpen");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [ratePlansState, setRatePlansState] = useState<RatePlan[]>(ratePlans || []);
  const [loading, setLoading] = useState(false);

  const loadRatePlans = async () => {
    try {
      setLoading(true);

      // Health check (keep your existing behavior)
      const isHealthy = await checkApiHealth();
      if (!isHealthy) {
        console.warn("⚠️ API health check failed, but attempting to fetch rate plans anyway...");
      }

      const data = await fetchRatePlans();
      setRatePlansState(data);
      if (setRatePlansFromParent) setRatePlansFromParent(data);
    } catch (err) {
      console.error("Failed to load rate plans", err);
    } finally {
      setLoading(false);
    }
  };

  // details cache (pricing model + billable metric)
  const [detailsById, setDetailsById] = useState<Record<number, RatePlanDetails | "loading" | "error">>({});

  useEffect(() => {
    loadRatePlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh when coming back from edit
  useEffect(() => {
    const handleFocus = () => {
      loadRatePlans();
      setDetailsById({});
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadRatePlans();
        setDetailsById({});
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Filters (match Customers page structure) ---------------- */
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedRatePlanIds, setSelectedRatePlanIds] = useState<Array<number | string>>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = useState<string[]>([]);
  const [selectedBillingFrequencies, setSelectedBillingFrequencies] = useState<string[]>([]);
  const [selectedPricingModels, setSelectedPricingModels] = useState<string[]>([]);
  const [createdSortOrder, setCreatedSortOrder] = useState<"newest" | "oldest" | null>(null);

  // Main filter menu (same pattern as Customers)
  const filterButtonRef = useRef<HTMLButtonElement>(null!);
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState<MainFilterKey | null>(null);
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = useState({ top: 0, left: 0 });
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = useState(false);

  // Column filter dropdowns (same hover/open logic as Customers)
  const ratePlanColRef = useRef<HTMLDivElement>(null!);
  const [isRatePlanColOpen, setIsRatePlanColOpen] = useState(false);
  const [isRatePlanColHovered, setIsRatePlanColHovered] = useState(false);

  const statusColRef = useRef<HTMLDivElement>(null!);
  const [isStatusColOpen, setIsStatusColOpen] = useState(false);
  const [isStatusColHovered, setIsStatusColHovered] = useState(false);

  // Click outside (same as Customers – keep portal checks)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      const portalRoot = document.getElementById("portal-root");
      if (portalRoot && target && portalRoot.contains(target)) return;

      if (target.closest(".products-column-filter-popover")) return;
      if (target.closest(".products-th-label-with-filter")) return;

      if (ratePlanColRef.current && ratePlanColRef.current.contains(target)) return;
      if (statusColRef.current && statusColRef.current.contains(target)) return;

      if (target.closest('[role="menu"]')) return;
      if (target.closest("tbody")) return;

      if (
        isMainFilterMenuOpen ||
        isMainFilterPanelOpen ||
        isRatePlanColOpen ||
        isStatusColOpen
      ) {
        setIsMainFilterMenuOpen(false);
        setIsMainFilterPanelOpen(false);
        setIsRatePlanColOpen(false);
        setIsStatusColOpen(false);
      }

      if (isRatePlanColHovered || isStatusColHovered) {
        setIsRatePlanColHovered(false);
        setIsStatusColHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMainFilterMenuOpen, isMainFilterPanelOpen, isRatePlanColOpen, isStatusColOpen, isRatePlanColHovered, isStatusColHovered]);

  // Hover attach (clean + stable)
  useEffect(() => {
    const elPlan = ratePlanColRef.current;
    const elStatus = statusColRef.current;

    if (!elPlan || !elStatus) return;

    const onPlanEnter = () => setIsRatePlanColHovered(true);
    const onPlanLeave = (e: any) => {
      const related = e.relatedTarget as HTMLElement;
      const dropdown = document.querySelector('[data-dropdown="rateplan"]');
      if (dropdown && related && dropdown.contains(related)) return;
      setIsRatePlanColHovered(false);
    };

    const onStatusEnter = () => setIsStatusColHovered(true);
    const onStatusLeave = (e: any) => {
      const related = e.relatedTarget as HTMLElement;
      const dropdown = document.querySelector('[data-dropdown="status"]');
      if (dropdown && related && dropdown.contains(related)) return;
      setIsStatusColHovered(false);
    };

    elPlan.addEventListener("mouseenter", onPlanEnter);
    elPlan.addEventListener("mouseleave", onPlanLeave);
    elStatus.addEventListener("mouseenter", onStatusEnter);
    elStatus.addEventListener("mouseleave", onStatusLeave);

    return () => {
      elPlan.removeEventListener("mouseenter", onPlanEnter);
      elPlan.removeEventListener("mouseleave", onPlanLeave);
      elStatus.removeEventListener("mouseenter", onStatusEnter);
      elStatus.removeEventListener("mouseleave", onStatusLeave);
    };
  }, []);

  const ratePlanOptions = useMemo(() => {
    return Array.from(
      new Map(
        (ratePlansState ?? []).map((plan) => [
          plan.ratePlanId,
          { id: plan.ratePlanId, label: plan.ratePlanName || `Rate Plan ${plan.ratePlanId}` },
        ])
      ).values()
    );
  }, [ratePlansState]);

  const filteredPlans = (ratePlansState ?? [])
    .filter((p) => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;

      const name = (p.ratePlanName ?? "").toLowerCase();
      const productName = (p.productName ?? p.product?.productName ?? "").toLowerCase();
      const description = (p.description ?? "").toLowerCase();
      const status = (p.status ?? "").toLowerCase();
      const paymentType = (p.paymentType ?? "").toLowerCase();
      const ratePlanType = (p.ratePlanType ?? "").toLowerCase();
      const billingFrequency = (p.billingFrequency ?? "").toLowerCase();

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
      const statusKey = (p.status ?? "").toLowerCase();
      return selectedStatuses.includes(statusKey);
    })
    .filter((p) => {
      if (selectedPaymentTypes.length === 0) return true;
      const paymentTypeKey = (p.paymentType ?? "").toLowerCase();
      return selectedPaymentTypes.includes(paymentTypeKey);
    })
    .filter((p) => {
      if (selectedBillingFrequencies.length === 0) return true;
      const billingFreqKey = (p.billingFrequency ?? "").toLowerCase();
      return selectedBillingFrequencies.includes(billingFreqKey);
    })
    .filter((p) => {
      if (selectedPricingModels.length === 0) return true;
      const details = detailsById[p.ratePlanId];
      if (details === "loading" || details === "error" || !details) return false;
      const pricingModelKey = (details.pricingModelName ?? "").toLowerCase();
      return selectedPricingModels.includes(pricingModelKey);
    })
    .sort((a, b) => {
      const aDate = new Date(a.createdOn || 0).getTime();
      const bDate = new Date(b.createdOn || 0).getTime();
      if (createdSortOrder === "newest") return bDate - aDate;
      if (createdSortOrder === "oldest") return aDate - bDate;
      return 0;
    });

  // Fetch rate plan details in parallel (same logic you had)
  useEffect(() => {
    const toFetch = filteredPlans.map((p) => p.ratePlanId).filter((id) => !detailsById[id]);
    if (toFetch.length === 0) return;

    setDetailsById((prev) => {
      const updated = { ...prev };
      toFetch.forEach((id) => {
        updated[id] = "loading";
      });
      return updated;
    });

    const fetchAllDetails = async () => {
      const results = await Promise.all(
        toFetch.map(async (id) => {
          try {
            const d = await fetchRatePlanWithDetails(id);

            const pricingModelName = firstNonEmpty(
              d,
              [
                "pricingModelName",
                "pricingModel.name",
                "pricingModel",
                "modelName",
                "pricingModelType",
                "pricing.name",
                "rateCard.pricingModelName",
              ],
              "—"
            );

            let bmName = "";
            let uomShort = "";

            bmName = firstNonEmpty(
              d,
              [
                "billableMetric.name",
                "billableMetric.metricName",
                "billableMetricName",
                "metricName",
                "metric.name",
                "billableMetric.title",
              ],
              ""
            );

            uomShort = firstNonEmpty(
              d,
              [
                "billableMetric.uomShort",
                "billableMetric.uom.short",
                "billableMetric.uom",
                "uom.short",
                "uomShort",
                "uom",
                "billableMetricUom",
                "billableMetric.uomSymbol",
              ],
              ""
            );

            if (!bmName && d.billableMetricId) {
              try {
                const billableMetric = await fetchBillableMetricById(d.billableMetricId);
                if (billableMetric) {
                  bmName = billableMetric.metricName || "";
                  uomShort = billableMetric.unitOfMeasure || billableMetric.uomShort || billableMetric.uom || "";
                }
              } catch (bmError) {
                console.warn(`Failed to fetch billable metric ${d.billableMetricId}:`, bmError);
              }
            }

            const normalized: RatePlanDetails = {
              ratePlanId: id,
              pricingModelName,
              billableMetric: { uomShort, name: bmName },
            };

            return { id, data: normalized };
          } catch (e) {
            console.error(`Failed to fetch rate plan ${id}:`, e);
            return { id, data: "error" as const };
          }
        })
      );

      setDetailsById((prev) => {
        const updated = { ...prev };
        results.forEach(({ id, data }) => {
          updated[id] = data as any;
        });
        return updated;
      });
    };

    fetchAllDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPlans]);

  // ============================================================
  // Product icon fetch (keep your existing behavior)
  // ============================================================
  const fetchProductIcon = async (productId: number) => {
    if (loadingProductIcons.has(productId) || productIcons[productId]) return;

    setLoadingProductIcons((prev) => new Set(prev).add(productId));

    try {
      const products = await getProductsApi();
      const product = products.find((p: any) => parseInt(p.productId) === productId);

      if (!product) {
        setProductIcons((prev) => ({ ...prev, [productId]: { iconData: null, iconUrl: null } }));
        return;
      }

      let iconData: ProductIconData | null = null;
      let iconUrl: string | null = null;

      // PRIORITY 0: localStorage cache
      try {
        const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
        const cachedIconJson = iconCache[product.productId] || iconCache[String(productId)] || iconCache[productId];
        if (cachedIconJson) {
          const parsedCache = parseProductIconField(cachedIconJson);
          iconData = extractIconData(parsedCache, product.productName || "Product");
        }
      } catch (e) {
        console.warn("Failed to read icon cache from localStorage:", e);
      }

      // PRIORITY 1: structured productIcon
      if (!iconData && product.productIcon && product.productIcon !== "null" && product.productIcon !== "") {
        try {
          const parsed = parseProductIconField(product.productIcon);
          iconData = extractIconData(parsed, product.productName || "Product");
        } catch (e) {
          console.error("Error parsing productIcon JSON:", e);
        }
      }

      // PRIORITY 1.5: individual fetch
      if (!iconData) {
        try {
          const { getProductById } = await import("../Products/api");
          const individualProduct = await getProductById(product.productId);
          if (individualProduct?.productIcon) {
            const parsed = parseProductIconField(individualProduct.productIcon);
            iconData = extractIconData(parsed, product.productName || "Product");
            if (iconData) {
              try {
                const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
                iconCache[product.productId] = JSON.stringify({ iconData });
                localStorage.setItem("iconDataCache", JSON.stringify(iconCache));
              } catch (e) {
                console.warn("Failed to cache icon data:", e);
              }
            }
          }
        } catch (e) {
          console.error(`Error fetching individual product ${productId}:`, e);
        }
      }

      // PRIORITY 2: URL icon
      if (!iconData && product.icon) {
        try {
          const authHeaders = getAuthHeaders();
          const resolvedUrl =
            product.icon.startsWith("http")
              ? product.icon
              : product.icon.startsWith("/uploads")
              ? `${API_ORIGIN}${product.icon}`
              : `${API_BASE_URL}${product.icon.startsWith("/") ? "" : "/"}${product.icon}`;

          const response = await axios.get(resolvedUrl, {
            responseType: "blob",
            headers: authHeaders,
            timeout: 5000,
          });

          iconUrl = URL.createObjectURL(response.data);

          const svgText = await (response.data as Blob).text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgText, "image/svg+xml");

          const rects = doc.querySelectorAll("rect");
          let tileColor = "#0F6DDA";
          for (const rect of Array.from(rects)) {
            const fill = rect.getAttribute("fill");
            if (
              fill &&
              fill.startsWith("#") &&
              fill.toLowerCase() !== "#fff" &&
              fill.toLowerCase() !== "#ffffff"
            ) {
              tileColor = fill;
              break;
            }
          }

          const pathElement =
            doc.querySelector('path[fill="#FFFFFF"]') ||
            doc.querySelector('path[fill="#fff"]') ||
            doc.querySelector('path[fill="white"]') ||
            doc.querySelector('path[fill="currentColor"]') ||
            doc.querySelector("path");

          let svgPath = "M12 2L2 7L12 12L22 7L12 2Z";
          let viewBox = "0 0 24 24";

          if (pathElement) {
            svgPath = pathElement.getAttribute("d") || svgPath;
            const svgElement = doc.querySelector("svg");
            if (svgElement) viewBox = svgElement.getAttribute("viewBox") || viewBox;
          }

          let outerBg: [string, string] | undefined;
          const gradientElement = doc.querySelector("linearGradient");
          if (gradientElement) {
            const stops = gradientElement.querySelectorAll("stop");
            if (stops.length >= 2) {
              const c1 =
                stops[0].getAttribute("style")?.match(/stop-color:([^;]+)/)?.[1] ||
                stops[0].getAttribute("stop-color");
              const c2 =
                stops[1].getAttribute("style")?.match(/stop-color:([^;]+)/)?.[1] ||
                stops[1].getAttribute("stop-color");
              if (c1 && c2) outerBg = [c1.trim(), c2.trim()];
            }
          }

          iconData = {
            id: `product-${product.productId}`,
            label: product.productName || "Product",
            svgPath,
            tileColor,
            viewBox,
            ...(outerBg && { outerBg }),
          };
        } catch (e: any) {
          console.error(`Error fetching product icon from URL for ${productId}:`, e?.message || e);
        }
      }

      // PRIORITY 3: deterministic fallback
      if (!iconData && !iconUrl) {
        const colors = ["#0F6DDA", "#23A36D", "#CC9434", "#E3ADEB", "#FF6B6B", "#4ECDC4", "#95E77E", "#FFD93D"];
        const colorIndex = productId % colors.length;
        iconData = {
          id: `product-fallback-${productId}`,
          label: product.productName || "Product",
          svgPath: "M12 2L2 7V12L12 17L22 12V7L12 2ZM12 12L4.53 8.19L12 4.36L19.47 8.19L12 12Z",
          tileColor: colors[colorIndex],
          viewBox: "0 0 24 24",
        };
      }

      setProductIcons((prev) => ({ ...prev, [productId]: { iconData, iconUrl } }));
    } catch (e) {
      console.error("Error loading product icon:", e);
      setProductIcons((prev) => ({ ...prev, [productId]: { iconData: null, iconUrl: null } }));
    } finally {
      setLoadingProductIcons((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Fetch icons for visible rate plans
  useEffect(() => {
    const productIds = new Set(filteredPlans.map((p) => p.productId).filter(Boolean));
    productIds.forEach((productId) => {
      if (!productIcons[productId] && !loadingProductIcons.has(productId)) {
        fetchProductIcon(productId);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredPlans]);

  /* ---------------- actions ---------------- */
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
      console.error("Failed to fetch detailed draft data:", error);
      const plan = ratePlansState.find((p) => p.ratePlanId === id);
      if (plan) {
        setDraftPlanData(plan);
        setDraftSaved(false);
        setShowCreatePlan(true);
      }
    }
  };

  const handleDeleteClick = (id: number) => {
    const plan = ratePlansState.find((p) => p.ratePlanId === id);
    setDeleteTargetId(id);
    setDeleteRatePlanName(plan?.ratePlanName || "Unknown Plan");
    setShowTableDeleteModal(true);
  };

  const handleTableDeleteConfirm = async () => {
    if (deleteTargetId == null) return;

    try {
      setIsDeleting(true);
      await deleteRatePlan(deleteTargetId);
      const next = ratePlansState.filter((p) => p.ratePlanId !== deleteTargetId);
      setRatePlansState(next);
      if (setRatePlansFromParent) setRatePlansFromParent(next);
      showToast?.({ message: "Rate plan deleted successfully", kind: "success" });
    } catch (error) {
      console.error("Delete failed:", error);
      showToast?.({ message: "Failed to delete rate plan", kind: "error" });
    } finally {
      setIsDeleting(false);
      setShowTableDeleteModal(false);
      setDeleteTargetId(null);
      setDeleteRatePlanName("");
    }
  };

  const handleTableDeleteCancel = () => {
    setShowTableDeleteModal(false);
    setDeleteTargetId(null);
    setDeleteRatePlanName("");
  };

  const handleResetRatePlanFilters = () => {
    setSelectedRatePlanIds([]);
    setSelectedStatuses([]);
    setSelectedPaymentTypes([]);
    setSelectedBillingFrequencies([]);
    setSelectedPricingModels([]);
    setCreatedSortOrder(null);
    setIsMainFilterMenuOpen(false);
    setIsMainFilterPanelOpen(false);
  };

  /* ---------------- render helpers ---------------- */
  const renderCreatedOn = (p: RatePlan) => (p.createdOn && p.createdOn.trim()) || "—";

  const renderPaymentType = (p: RatePlan) => {
    const raw = String(p.paymentType || p.ratePlanType || "")
      .trim()
      .toUpperCase()
      .replace(/[_-]/g, "");

    if (raw === "PREPAID") {
      return (
        <span className="pill pill--prepaid">
          <span className="pill-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <g clipPath="url(#clip0_14251_15772)">
                <path
                  d="M12.0597 6.9135C12.6899 7.14845 13.2507 7.53852 13.6902 8.04763C14.1297 8.55674 14.4337 9.16846 14.5742 9.82621C14.7146 10.484 14.6869 11.1665 14.4937 11.8107C14.3005 12.4549 13.9479 13.04 13.4686 13.5119C12.9893 13.9838 12.3988 14.3272 11.7517 14.5103C11.1045 14.6935 10.4216 14.7105 9.76613 14.5598C9.11065 14.4091 8.50375 14.0956 8.00156 13.6482C7.49937 13.2008 7.1181 12.634 6.89301 12.0002M4.66634 4.00016H5.33301V6.66683M11.1397 9.2535L11.6063 9.72683L9.72634 11.6068M9.33301 5.3335C9.33301 7.54264 7.54215 9.3335 5.33301 9.3335C3.12387 9.3335 1.33301 7.54264 1.33301 5.3335C1.33301 3.12436 3.12387 1.3335 5.33301 1.3335C7.54215 1.3335 9.33301 3.12436 9.33301 5.3335Z"
                  stroke="#19222D"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_14251_15772">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </span>
          Pre-paid
        </span>
      );
    }

    if (raw === "POSTPAID") {
      return (
        <span className="pill pill--postpaid">
          <span className="pill-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M4.0124 13.6C2.89133 13.6 1.94233 13.2115 1.1654 12.4346C0.388467 11.6577 0 10.7087 0 9.5876C0 9.11693 0.0802666 8.65953 0.2408 8.2154C0.401333 7.77127 0.631333 7.36873 0.9308 7.0078L3.33813 4.11263C3.5917 3.80767 3.64109 3.38169 3.46402 3.02681L2.67551 1.44646C2.34378 0.781608 2.8273 0 3.57031 0H10.0297C10.7727 0 11.2562 0.781609 10.9245 1.44646L10.136 3.02681C9.95891 3.38169 10.0083 3.80767 10.2619 4.11263L12.6692 7.0078C12.9687 7.36873 13.1987 7.77127 13.3592 8.2154C13.5197 8.65953 13.6 9.11693 13.6 9.5876C13.6 10.7087 13.2095 11.6577 12.4284 12.4346C11.6475 13.2115 10.7005 13.6 9.5876 13.6H4.0124ZM6.8 9.7922C6.40107 9.7922 6.06033 9.65093 5.7778 9.3684C5.49513 9.08587 5.3538 8.74513 5.3538 8.3462C5.3538 7.94713 5.49513 7.60633 5.7778 7.3238C6.06033 7.04127 6.40107 6.9 6.8 6.9C7.19893 6.9 7.53967 7.04127 7.8222 7.3238C8.10487 7.60633 8.2462 7.94713 8.2462 8.3462C8.2462 8.74513 8.10487 9.08587 7.8222 9.3684C7.53967 9.65093 7.19893 9.7922 6.8 9.7922Z"
                fill="#19222D"
              />
            </svg>
          </span>
          Post-paid
        </span>
      );
    }

    return <span className="pill pill--unknown">—</span>;
  };

  const renderPricingModel = (p: RatePlan) => {
    const d = detailsById[p.ratePlanId];
    if (d === "loading" || d === undefined) return <div className="pricing-skel" aria-label="loading" />;
    if (d === "error") return <span className="pricing-error">—</span>;

    const uom = d.billableMetric?.uomShort || "";
    const metricName = d.billableMetric?.name || "";
    const model = d.pricingModelName || "—";
    const hasModel = model && model !== "—";

    return (
      <div className="pricing-cell">
        <div className="bm-badge" title={`${uom}${metricName ? " • " + metricName : ""}`}>
          <div className="bm-badge-uom">{uom || "—"}</div>
          <div className="bm-badge-sub">{metricName || "Billable metric"}</div>
        </div>
        <div className="pricing-model-name">{hasModel ? `• ${model}` : "—"}</div>
      </div>
    );
  };

  const RatePlanIcon: React.FC<{ iconData: ProductIconData | null; iconUrl: string | null }> = ({
    iconData,
    iconUrl,
  }) => {
    if (!iconData) {
      return (
        <div
          style={{
            display: "flex",
            padding: "8px 8px 8px 6px",
            justifyContent: "center",
            alignItems: "center",
            gap: "-4px",
            borderRadius: "12px",
            border: "0.6px solid var(--border-border-2, #D5D4DF)",
            background: "var(--multi-colors-Products-Fuchsia-opac-1, rgba(227, 173, 235, 0.30))",
            width: "58px",
            height: "48px",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: "#E3ADEB",
              color: "#1A2126",
            }}
          >
            {iconUrl ? (
              <img src={iconUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : (
              "PR"
            )}
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="19"
            viewBox="0 0 14 19"
            fill="none"
            style={{
              position: "absolute",
              top: "8px",
              left: "1px",
              width: "13px",
              height: "17.944px",
              flexShrink: 0,
              zIndex: 3,
            }}
          >
            <path
              d="M0.405344 9.873C0.401952 9.56718 0.520179 9.27253 0.73402 9.05386L3.62623 6.09766C3.84014 5.87903 4.13213 5.75432 4.43799 5.75097C4.74384 5.74762 5.0385 5.86591 5.25713 6.07982L8.21333 8.97203C8.4319 9.18597 8.55655 9.47796 8.55985 9.78379L8.6375 16.8815C8.64038 17.2509 8.49696 17.6066 8.23857 17.8707C7.98017 18.1348 7.62779 18.2859 7.25834 18.2911L1.89267 18.3498C1.5232 18.3527 1.16759 18.2093 0.903481 17.9509C0.639372 17.6925 0.488211 17.3401 0.482998 16.9707L0.405344 9.873Z"
              fill="url(#paint0_linear_rp_fallback)"
              fillOpacity="0.2"
              style={{ mixBlendMode: "hard-light" }}
            />
            <path
              d="M0.405344 9.873C0.401952 9.56718 0.520179 9.27253 0.73402 9.05386L3.62623 6.09766C3.84014 5.87903 4.13213 5.75432 4.43799 5.75097C4.74384 5.74762 5.0385 5.86591 5.25713 6.07982L8.21333 8.97203C8.4319 9.18597 8.55655 9.47796 8.55985 9.78379L8.6375 16.8815C8.64038 17.2509 8.49696 17.6066 8.23857 17.8707C7.98017 18.1348 7.62779 18.2859 7.25834 18.2911L1.89267 18.3498C1.5232 18.3527 1.16759 18.2093 0.903481 17.9509C0.639372 17.6925 0.488211 17.3401 0.482998 16.9707L0.405344 9.873Z"
              fill="#E3ADEB"
              fillOpacity="0.3"
            />
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

    const tile = iconData.tileColor ?? "#CC9434";
    const hexToRgba = (hex: string, opacity: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    return (
      <div
        style={{
          display: "flex",
          padding: "8px 8px 8px 6px",
          justifyContent: "center",
          alignItems: "center",
          gap: "-4px",
          borderRadius: "12px",
          border: "0.6px solid var(--border-border-2, #D5D4DF)",
          background: hexToRgba(tile, 0.3),
          width: "58px",
          height: "48px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "10px",
            top: "6px",
            width: "26.6px",
            height: "26.6px",
            borderRadius: "5.7px",
            background: tile,
            flexShrink: 0,
          }}
        />

        <div
          style={{
            width: "28px",
            height: "28px",
            padding: "1.661px 3.321px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2.214px",
            flexShrink: 0,
            borderRadius: "6px",
            border: "0.6px solid #FFF",
            background: hexToRgba(tile, 0.1),
            backdropFilter: "blur(3.875px)",
            transform: "translate(3px, 2px)",
            boxShadow: "inset 0 1px 8px rgba(255,255,255,0.35)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14.727"
            height="14.727"
            viewBox={iconData.viewBox ?? "0 0 18 18"}
            fill="none"
            style={{ flexShrink: 0, aspectRatio: "14.73 / 14.73", display: "block" }}
          >
            <path d={iconData.svgPath} fill="#FFFFFF" />
          </svg>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="19"
          viewBox="0 0 14 19"
          fill="none"
          style={{
            position: "absolute",
            top: "8px",
            left: "1px",
            width: "13px",
            height: "17.944px",
            flexShrink: 0,
            zIndex: 3,
          }}
        >
          <path
            d="M0.405344 9.873C0.401952 9.56718 0.520179 9.27253 0.73402 9.05386L3.62623 6.09766C3.84014 5.87903 4.13213 5.75432 4.43799 5.75097C4.74384 5.74762 5.0385 5.86591 5.25713 6.07982L8.21333 8.97203C8.4319 9.18597 8.55655 9.47796 8.55985 9.78379L8.6375 16.8815C8.64038 17.2509 8.49696 17.6066 8.23857 17.8707C7.98017 18.1348 7.62779 18.2859 7.25834 18.2911L1.89267 18.3498C1.5232 18.3527 1.16759 18.2093 0.903481 17.9509C0.639372 17.6925 0.488211 17.3401 0.482998 16.9707L0.405344 9.873Z"
            fill={`url(#paint0_linear_rp_main)`}
            fillOpacity="0.2"
            style={{ mixBlendMode: "hard-light" }}
          />
          <path
            d="M0.405344 9.873C0.401952 9.56718 0.520179 9.27253 0.73402 9.05386L3.62623 6.09766C3.84014 5.87903 4.13213 5.75432 4.43799 5.75097C4.74384 5.74762 5.0385 5.86591 5.25713 6.07982L8.21333 8.97203C8.4319 9.18597 8.55655 9.47796 8.55985 9.78379L8.6375 16.8815C8.64038 17.2509 8.49696 17.6066 8.23857 17.8707C7.98017 18.1348 7.62779 18.2859 7.25834 18.2911L1.89267 18.3498C1.5232 18.3527 1.16759 18.2093 0.903481 17.9509C0.639372 17.6925 0.488211 17.3401 0.482998 16.9707L0.405344 9.873Z"
            fill={hexToRgba(tile, 0.3)}
          />
          <path
            d="M13.4056 3.21989L13.7683 3.03832C13.1495 1.80214 11.9882 0.93063 10.6903 0.449087C9.39204 -0.0326103 7.91818 -0.139654 6.62407 0.191071C5.32529 0.522991 4.18033 1.30614 3.62134 2.61958C3.06508 3.92662 3.12552 5.67378 4.04881 7.86447"
            fill={tile}
          />
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

  const renderNameCell = (p: RatePlan) => {
    const productName = p.productName ?? p.product?.productName ?? "—";
    const productIcon = productIcons[p.productId];

    const go = () => {
      if ((p.status || "").toLowerCase() === "draft") handleDraft(p.ratePlanId);
      else handleEdit(p.ratePlanId);
    };

    return (
      <div
        role="button"
        tabIndex={0}
        onClick={go}
        onKeyDown={(e) => {
          if (e.key === "Enter") go();
        }}
        style={{ cursor: "pointer" }}
      >
        <div
          style={{
            display: "flex",
            padding: "8px 16px",
            alignItems: "center",
            gap: "4px",
            alignSelf: "stretch",
          }}
        >
          <RatePlanIcon iconData={productIcon?.iconData || null} iconUrl={productIcon?.iconUrl || null} />

          <div className="rp-name-texts" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                overflow: "hidden",
                color: "var(--text-text-darkest, #1A2126)",
                textOverflow: "ellipsis",
                fontFamily: 'var(--type-font-family-primary, "IBM Plex Sans")',
                fontSize: "var(--fontsize-body-md, 14px)",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "var(--line-height-body-md, 20px)",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
                alignSelf: "stretch",
              }}
              title={p.ratePlanName || "N/A"}
            >
              {p.ratePlanName || "N/A"}
            </div>
            <div
              style={{
                overflow: "hidden",
                color: "var(--text-text-light, #767183)",
                textOverflow: "ellipsis",
                fontFamily: 'var(--type-font-family-primary, "IBM Plex Sans")',
                fontSize: "var(--fontsize-body-sm, 12px)",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "var(--line-height-body-sm, 16px)",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
                alignSelf: "stretch",
              }}
              title={productName}
            >
              {productName}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ---------------- DataTable columns (Customers-style) ---------------- */
  const columns: DataTableColumn<RatePlan>[] = [
    {
      key: "ratePlanName",
      title: "Rate Plan",
      filterable: true,
      ref: ratePlanColRef,
      onFilterClick: () => setIsRatePlanColOpen(true),
      render: (p) => renderNameCell(p),
    },
    {
      key: "pricingModel",
      title: "Pricing Model",
      render: (p) => renderPricingModel(p),
    },
    {
      key: "paymentType",
      title: "Payment Type",
      width: 180,
      render: (p) => renderPaymentType(p),
    },
    {
      key: "createdOn",
      title: "Created On",
      width: 260,
      render: (p) => <span data-date>{renderCreatedOn(p)}</span>,
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      ref: statusColRef,
      onFilterClick: () => setIsStatusColOpen(true),
      render: (p) => (
        <div className="status-cell-padded">
          <StatusBadge
            label={(p.status || "N/A").charAt(0) + (p.status || "N/A").slice(1).toLowerCase()}
            variant={(String(p.status || "").toLowerCase() as Variant) || ("draft" as Variant)}
            size="sm"
          />
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: 120,
      render: (p) => (
        <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
          {(p.status || "").toLowerCase() === "draft" ? (
            <RetryIconButton onClick={() => handleDraft(p.ratePlanId)} title="Continue editing draft" />
          ) : (
            <EditIconButton onClick={() => handleEdit(p.ratePlanId)} />
          )}
          <DeleteIconButton onClick={() => handleDeleteClick(p.ratePlanId)} />
        </div>
      ),
    },
  ];

  const hasRows = ratePlansState.length > 0;

  /* ---------------- JSX ---------------- */
  return (
    <div className="main-container">
      {notification && (
        <div className="notification-container">
          <Notification {...notification} />
        </div>
      )}

      {showCreatePlan ? (
        <div className="create-plan-container" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
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
                cancel: { label: "Discard", onClick: () => setShowConfirmDelete(true), disabled: !hasAnyInput },
                save: {
                  label: "Save as Draft",
                  labelWhenSaved: "Saved as Draft",
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
                  },
                },
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
                const ok = await saveDraftFn();
                setDraftSaving(false);

                if (!ok) {
                  setShowSaveDraftModal(false);
                  return;
                }

                setShowSaveDraftModal(false);
                setShowCreatePlan(false);
                await loadRatePlans();
              } catch {
                setDraftSaving(false);
              }
            }}
            onDelete={async () => {
              setShowSaveDraftModal(false);
              const currentId = createPlanRef.current?.getRatePlanId();
              if (currentId) {
                try {
                  await deleteRatePlan(currentId);
                } catch {}
              }
              setShowCreatePlan(false);
              await loadRatePlans();
            }}
          />

          <ConfirmDeleteModal
            isOpen={showConfirmDelete}
            productName={createPlanRef.current?.getRatePlanId() ? "Rate Plan" : "Draft Rate Plan"}
            onConfirm={async () => {
              setShowConfirmDelete(false);
              const currentId = createPlanRef.current?.getRatePlanId();
              if (currentId) {
                try {
                  await deleteRatePlan(currentId);
                  setNotification({ type: "success", ratePlanName: "Rate Plan" });
                  setTimeout(() => setNotification(null), 3000);
                } catch {
                  setNotification({ type: "error", ratePlanName: "Rate Plan" });
                  setTimeout(() => setNotification(null), 3000);
                }
              }
              setShowCreatePlan(false);
              await loadRatePlans();
            }}
            onCancel={() => setShowConfirmDelete(false)}
          />
        </div>
      ) : (
        <div className={`check-container check-containers ${hasRows ? "has-rateplans" : ""}`}>
          <PageHeader
            title="Rate Plans"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            searchDisabled={!hasRows}
            filterDisabled={!hasRows}
            showPrimary={hasRows}
            primaryLabel="+ New Rate Plan"
            onPrimaryClick={() => {
              clearAllRatePlanData();
              setDraftSaved(false);
              setShowCreatePlan(true);
              navigate("/get-started/rate-plans");
            }}
            filterButtonRef={filterButtonRef}
            filterActive={isMainFilterMenuOpen || isMainFilterPanelOpen}
            onFilterClick={() => {
              if (!filterButtonRef.current) return;
              const rect = filterButtonRef.current.getBoundingClientRect();

              // keep your clamp logic
              const menuWidth = 240;
              const panelWidth = 320;
              const gap = 12;
              const margin = 8;

              let left = rect.left;
              const minLeft = panelWidth + gap + margin;
              if (left < minLeft) left = minLeft;

              if (left + menuWidth + margin > window.innerWidth) {
                left = Math.max(margin, window.innerWidth - menuWidth - margin);
                if (left < minLeft) left = minLeft;
              }

              setMainFilterMenuPosition({ top: rect.bottom + 8, left });

              setIsMainFilterMenuOpen((v) => !v);
              setIsMainFilterPanelOpen(false);
            }}
          />

          {/* ===== MAIN FILTER MENU ===== */}
          {isMainFilterMenuOpen && (
            <MainFilterMenu
              items={[
                { key: "ratePlan", label: "Rate Plan" },
                { key: "paymentType", label: "Payment Type" },
                { key: "status", label: "Status" },
                { key: "date", label: "Date" },
              ]}
              activeKey={activeFilterKey}
              onSelect={(key) => setActiveFilterKey(key)}
              onSelectWithRect={(key, rect) => {
                setActiveFilterKey(key);

                const panelWidth = key === "ratePlan" ? 320 : 264;
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

                setMainFilterPanelPosition({ top: rect.top, left });
                setIsMainFilterPanelOpen(true);
              }}
              anchorTop={mainFilterMenuPosition.top}
              anchorLeft={mainFilterMenuPosition.left}
            />
          )}

          {isMainFilterPanelOpen && activeFilterKey === "ratePlan" && (
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

          {isMainFilterPanelOpen && activeFilterKey === "paymentType" && (
            <SimpleFilterDropdown
              options={["prepaid", "postpaid"].map((pt) => ({
                id: pt,
                label: pt.charAt(0).toUpperCase() + pt.slice(1),
              }))}
              value={selectedPaymentTypes}
              onChange={(next) => setSelectedPaymentTypes(next.map((x) => String(x).toLowerCase()))}
              anchorTop={mainFilterPanelPosition.top}
              anchorLeft={mainFilterPanelPosition.left}
            />
          )}

          {isMainFilterPanelOpen && activeFilterKey === "status" && (
            <SimpleFilterDropdown
              options={["active", "draft", "live"].map((s) => ({
                id: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
              }))}
              value={selectedStatuses}
              onChange={(next) => setSelectedStatuses(next.map((x) => String(x).toLowerCase()))}
              anchorTop={mainFilterPanelPosition.top}
              anchorLeft={mainFilterPanelPosition.left}
            />
          )}

          {isMainFilterPanelOpen && activeFilterKey === "date" && (
            <DateSortDropdown
              value={createdSortOrder}
              onChange={(next) => setCreatedSortOrder(next)}
              anchorTop={mainFilterPanelPosition.top}
              anchorLeft={mainFilterPanelPosition.left}
            />
          )}

          {/* ===== COLUMN FILTER: RATE PLAN (hover/open) ===== */}
          {(isRatePlanColOpen || isRatePlanColHovered) && ratePlanColRef.current && (
            <div data-dropdown="rateplan">
              <FilterDropdown
                options={ratePlanOptions}
                value={selectedRatePlanIds}
                onChange={(v) => setSelectedRatePlanIds(v)}
                anchorTop={ratePlanColRef.current.getBoundingClientRect().bottom + 8}
                anchorLeft={ratePlanColRef.current.getBoundingClientRect().left}
                placeholder="Search Rate Plans"
                widthPx={320}
                heightPx={300}
              />
            </div>
          )}

          {/* ===== COLUMN FILTER: STATUS (hover/open) ===== */}
          {(isStatusColOpen || isStatusColHovered) && statusColRef.current && (
            <div data-dropdown="status">
              <SimpleFilterDropdown
                options={[
                  { id: "active", label: "Active" },
                  { id: "draft", label: "Draft" },
                  { id: "live", label: "Live" },
                ]}
                value={selectedStatuses}
                onChange={(v) => setSelectedStatuses(v.map(String))}
                anchorTop={statusColRef.current.getBoundingClientRect().bottom + 8}
                anchorLeft={statusColRef.current.getBoundingClientRect().left}
              />
            </div>
          )}

          {/* ===== FORCE HOVER STATE WHEN DROPDOWN IS OPEN (same trick as Customers) ===== */}
          {isRatePlanColOpen && (
            <style>{`
              .dt-header-cell:nth-child(1) { background-color: var(--color-neutral-200) !important; border-radius: 0 !important; }
              .dt-header-cell:nth-child(1) .dt-filter-trigger { opacity: 1 !important; pointer-events: auto !important; }
            `}</style>
          )}
          {isStatusColOpen && (
            <style>{`
              .dt-header-cell:nth-child(5) { background-color: var(--color-neutral-200) !important; border-radius: 0 !important; }
              .dt-header-cell:nth-child(5) .dt-filter-trigger { opacity: 1 !important; pointer-events: auto !important; }
            `}</style>
          )}

          {/* ===== DATA TABLE (Customers-style) ===== */}
          <DataTable
            columns={columns}
            rows={filteredPlans}
            rowKey={(p) => String(p.ratePlanId)}
            topContent={
              selectedRatePlanIds.length ||
              selectedStatuses.length ||
              selectedPaymentTypes.length ||
              selectedBillingFrequencies.length ||
              selectedPricingModels.length ||
              createdSortOrder ? (
                <div className="customers-active-filters-row">
                  <div className="customers-active-filters-chips">
                    {selectedRatePlanIds.map((id) => {
                      const plan = ratePlansState.find((p) => String(p.ratePlanId) === String(id));
                      const label = plan?.ratePlanName || `Rate Plan ${id}`;
                      return (
                        <FilterChip
                          key={`rate-plan-chip-${id}`}
                          label={label}
                          onRemove={() => setSelectedRatePlanIds((prev) => prev.filter((x) => x !== id))}
                        />
                      );
                    })}

                    {selectedStatuses.map((s) => (
                      <FilterChip
                        key={`status-${s}`}
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        onRemove={() => setSelectedStatuses((prev) => prev.filter((x) => x !== s))}
                      />
                    ))}

                    {selectedPaymentTypes.map((pt) => (
                      <FilterChip
                        key={`pt-${pt}`}
                        label={pt.charAt(0).toUpperCase() + pt.slice(1)}
                        onRemove={() => setSelectedPaymentTypes((prev) => prev.filter((x) => x !== pt))}
                      />
                    ))}

                    {selectedBillingFrequencies.map((bf) => (
                      <FilterChip
                        key={`bf-${bf}`}
                        label={bf}
                        onRemove={() => setSelectedBillingFrequencies((prev) => prev.filter((x) => x !== bf))}
                      />
                    ))}

                    {selectedPricingModels.map((m) => (
                      <FilterChip
                        key={`pm-${m}`}
                        label={m}
                        onRemove={() => setSelectedPricingModels((prev) => prev.filter((x) => x !== m))}
                      />
                    ))}

                    {createdSortOrder ? (
                      <FilterChip
                        key={`sort-${createdSortOrder}`}
                        label={createdSortOrder === "newest" ? "Newest" : "Oldest"}
                        onRemove={() => setCreatedSortOrder(null)}
                      />
                    ) : null}
                  </div>

                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                    <ResetButton label="Reset" onClick={handleResetRatePlanFilters} />
                  </div>
                </div>
              ) : null
            }
            emptyIcon={
              loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <div className="spinner" />
                  <span style={{ color: "#666", fontSize: "14px" }}>Loading rate plans...</span>
                </div>
              ) : searchTerm.trim() ||
                selectedRatePlanIds.length ||
                selectedStatuses.length ||
                selectedPaymentTypes.length ||
                createdSortOrder ? (
                <img src={NoFileSvg} width={170} height={170} />
              ) : (
                <img src={RatePlansEmptyImg} width={190} height={190} />
              )
            }
            emptyText={
              loading
                ? undefined
                : searchTerm.trim()
                ? `No rate plans found for "${searchTerm}"\nTry searching with different keywords`
                : selectedRatePlanIds.length || selectedStatuses.length || selectedPaymentTypes.length || createdSortOrder
                ? "Oops! No matches found with these filters.\nTry adjusting your search or filters"
                : "No Rate Plan created yet. Click 'New Rate Plan'\nto create your First Rate Plan."
            }
            emptyAction={
              ratePlansState.length === 0 ? (
                <PrimaryButton
                  onClick={() => {
                    clearAllRatePlanData();
                    setDraftSaved(false);
                    setShowCreatePlan(true);
                    navigate("/get-started/rate-plans");
                  }}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 5V19M5 12H19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                  iconPosition="left"
                >
                  New Rate Plan
                </PrimaryButton>
              ) : undefined
            }
          />

          {/* ===== ROW DELETE MODAL ===== */}
          <ConfirmDeleteModal
            isOpen={showTableDeleteModal}
            productName={deleteRatePlanName}
            entityType="rate plan"
            onConfirm={handleTableDeleteConfirm}
            onCancel={handleTableDeleteCancel}
          />
        </div>
      )}
    </div>
  );
};

/* ====================================================================== */
/* ============================= WRAPPER ================================ */
/* ====================================================================== */

const RatePlans: React.FC<RatePlansProps> = (props) => {
  return (
    <ToastProvider>
      <RatePlansInner {...props} />
    </ToastProvider>
  );
};

export default RatePlans;
