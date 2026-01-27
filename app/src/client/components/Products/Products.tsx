import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Products.css";
import "../Rateplan/RatePlan.css";
import "./Productnew.css";

import Header from "../componenetsss/Header";
import DataTable, { DataTableColumn } from "../componenetsss/DataTable";
import PrimaryButton from "../componenetsss/PrimaryButton";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import EditIconButton from "../componenetsss/EditIconButton";
import DeleteIconButton from "../componenetsss/DeleteIconButton";
import RetryIconButton from "../componenetsss/RetryIconButton";
import StatusBadge, { Variant } from "../componenetsss/StatusBadge";
import Tooltip from "../componenetsss/Tooltip";
import FilterChip from "../componenetsss/FilterChip";
import SimpleFilterDropdown from "../componenetsss/SimpleFilterDropdown";
import DateSortDropdown from "../componenetsss/DateSortDropdown";
import MainFilterMenu, { MainFilterKey } from "../componenetsss/MainFilterMenu";
import ResetButton from "../componenetsss/ResetButton";
import TertiaryButton from "../componenetsss/TertiaryButton";
import GlassStackTile from "../componenetsss/GlassStackTile";
import ProductIconTile from "../componenetsss/ProductIconTile";
import { ToastProvider, useToast } from "../componenetsss/ToastProvider";

import CreateProduct from "./NewProducts/NewProduct";
import type { DraftProduct } from "./NewProducts/NewProduct";
import EditProduct from "./EditProductsss/EditProduct";
import KongIntegration from "./Kong Integration/KongIntegration";

import ProductIcon, { ProductIconData } from "./ProductIcon";

import EmptyBox from "./Componenets/empty.svg";
import NoFileSvg from "../componenetsss/nofile.svg";

import {
  getProducts,
  getProductById,
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  BASE_URL,
} from "./api";

import { ProductFormData } from "../../../types/productTypes";
import { ProductType } from "./EditProduct/types";
import { getAuthHeaders } from "../../utils/auth";

/* ---------------- types ---------------- */

interface Product {
  productId: string;
  productName: string;
  productDescription?: string;
  productType: string;
  billable?: boolean;
  status: string;
  category: string;
  source?: string;
  internalSkuCode?: string;
  createdOn?: string;

  icon?: string; // raw backend path
  productIcon?: any; // can be stringified JSON OR already an object (important!)
  iconUrl?: string | null; // blob url fetched with auth
  iconData?: ProductIconData | null; // structured icon data

  metrics?: Array<{
    metricName: string;
    unitOfMeasure: string;
    aggregationFunction: string;
    aggregationWindow: string;
  }>;
}

interface ProductsProps {
  showNewProductForm: boolean;
  setShowNewProductForm: (show: boolean) => void;
}

/* ---------------- utils ---------------- */

const formatDateStr = (dateValue?: string) => {
  if (!dateValue) return "-";
  // Backend already returns formatted date string like "21 Jan, 2026 13:06 IST"
  return dateValue;
};

const resolveIconUrl = (icon?: string) => {
  if (!icon) return null;
  if (icon.startsWith("http") || icon.startsWith("data:")) return icon;
  if (icon.startsWith("/uploads")) {
    const serverBase = BASE_URL.replace("/api", "");
    return `${serverBase}${icon}`;
  }
  const leadingSlash = icon.startsWith("/") ? "" : "/";
  return `${BASE_URL}${leadingSlash}${icon}`;
};

const fetchIconWithAuth = async (iconPath?: string): Promise<string | null> => {
  if (!iconPath) return null;
  const resolved = resolveIconUrl(iconPath);
  if (!resolved) return null;

  try {
    const authHeaders = getAuthHeaders();
    const cacheBustUrl = resolved.includes("?")
      ? `${resolved}&_cb=${Date.now()}`
      : `${resolved}?_cb=${Date.now()}`;

    const response = await axios.get(cacheBustUrl, {
      responseType: "blob",
      headers: authHeaders,
    });
    return URL.createObjectURL(response.data);
  } catch (e: any) {
    if (e?.response?.status === 500) {
      console.warn(`Icon not available on server: ${iconPath}`);
    }
    return null;
  }
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

  // Typical: { iconData: {...} }
  if (parsed.iconData && typeof parsed.iconData === "object") {
    return parsed.iconData as ProductIconData;
  }

  // Some APIs may store the icon data directly
  if (parsed.id && parsed.svgPath) {
    return parsed as ProductIconData;
  }

  // Minimal: only svgPath/viewBox provided
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

/* ---------------- component ---------------- */

export default function Products({ showNewProductForm, setShowNewProductForm }: ProductsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  // icon caching + optimistic updates
  const [updatedIcons, setUpdatedIcons] = useState<Record<string, string>>({});
  const [preserveLocalIcons, setPreserveLocalIcons] = useState(false);

  // search
  const [searchTerm, setSearchTerm] = useState<string>("");

  // filters (same concept as Customers)
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [createdSortOrder, setCreatedSortOrder] = useState<"newest" | "oldest" | null>(null);

  // delete modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const pendingName = useRef("");

  // create/edit panes + kong integration
  const [showCreateProduct, setShowCreateProduct] = useState(showNewProductForm);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showKongIntegration, setShowKongIntegration] = useState(false);

  /* ---- main filter menu state ---- */
  const filterButtonRef = useRef<HTMLButtonElement>(null!);
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState<MainFilterKey | null>(null);
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = useState({ top: 0, left: 0 });
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = useState(false);

  /* ---- column filter dropdown state (hover + open) ---- */
  const productTypeFilterRef = useRef<HTMLDivElement>(null!);
  const [isProductTypeFilterOpen, setIsProductTypeFilterOpen] = useState(false);
  const [isProductTypeFilterHovered, setIsProductTypeFilterHovered] = useState(false);

  const sourceFilterRef = useRef<HTMLDivElement>(null!);
  const [isSourceFilterOpen, setIsSourceFilterOpen] = useState(false);
  const [isSourceFilterHovered, setIsSourceFilterHovered] = useState(false);

  const statusFilterRef = useRef<HTMLDivElement>(null!);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isStatusFilterHovered, setIsStatusFilterHovered] = useState(false);

  const dateFilterRef = useRef<HTMLDivElement>(null!);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isDateFilterHovered, setIsDateFilterHovered] = useState(false);

  /* ---------------- effects ---------------- */

  useEffect(() => {
    // keep existing behavior
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Hide sidebar when create/edit is open (kept)
  useEffect(() => {
    if (showCreateProduct || isEditFormOpen) {
      document.body.classList.add("hide-sidebar");
    } else {
      document.body.classList.remove("hide-sidebar");
    }
  }, [showCreateProduct, isEditFormOpen]);

  // Sync prop -> internal
  useEffect(() => {
    if (showCreateProduct !== showNewProductForm) {
      setShowCreateProduct(showNewProductForm);
    }
  }, [showNewProductForm, showCreateProduct]);

  // Close dropdowns on outside click (same style as Customers)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      const portalRoot = document.getElementById("portal-root");
      if (portalRoot && target && portalRoot.contains(target)) return;

      if (target.closest(".products-column-filter-popover")) return;
      if (target.closest(".products-th-label-with-filter")) return;

      if (productTypeFilterRef.current && productTypeFilterRef.current.contains(target)) return;
      if (sourceFilterRef.current && sourceFilterRef.current.contains(target)) return;
      if (statusFilterRef.current && statusFilterRef.current.contains(target)) return;
      if (dateFilterRef.current && dateFilterRef.current.contains(target)) return;

      if (target.closest('[role="menu"]')) return;
      if (target.closest("tbody")) return;

      if (
        isMainFilterMenuOpen ||
        isMainFilterPanelOpen ||
        isProductTypeFilterOpen ||
        isSourceFilterOpen ||
        isStatusFilterOpen ||
        isDateFilterOpen
      ) {
        setIsMainFilterMenuOpen(false);
        setIsMainFilterPanelOpen(false);
        setIsProductTypeFilterOpen(false);
        setIsSourceFilterOpen(false);
        setIsStatusFilterOpen(false);
        setIsDateFilterOpen(false);
      }

      if (isProductTypeFilterHovered || isSourceFilterHovered || isStatusFilterHovered || isDateFilterHovered) {
        setIsProductTypeFilterHovered(false);
        setIsSourceFilterHovered(false);
        setIsStatusFilterHovered(false);
        setIsDateFilterHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    isMainFilterMenuOpen,
    isMainFilterPanelOpen,
    isProductTypeFilterOpen,
    isSourceFilterOpen,
    isStatusFilterOpen,
    isDateFilterOpen,
    isProductTypeFilterHovered,
    isSourceFilterHovered,
    isStatusFilterHovered,
    isDateFilterHovered,
  ]);

  // Attach hover listeners (kept pattern like Customers)
  useEffect(() => {
    const attachHoverListeners = () => {
      const pt = productTypeFilterRef.current;
      const src = sourceFilterRef.current;
      const st = statusFilterRef.current;
      const dt = dateFilterRef.current;

      if (pt) {
        pt.addEventListener("mouseenter", () => setIsProductTypeFilterHovered(true));
        pt.addEventListener("mouseleave", (e) => {
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="productType"]');
          if (dropdown && dropdown.contains(relatedTarget)) return;
          setIsProductTypeFilterHovered(false);
        });
      }

      if (src) {
        src.addEventListener("mouseenter", () => setIsSourceFilterHovered(true));
        src.addEventListener("mouseleave", (e) => {
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="source"]');
          if (dropdown && dropdown.contains(relatedTarget)) return;
          setIsSourceFilterHovered(false);
        });
      }

      if (st) {
        st.addEventListener("mouseenter", () => setIsStatusFilterHovered(true));
        st.addEventListener("mouseleave", (e) => {
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="status"]');
          if (dropdown && dropdown.contains(relatedTarget)) return;
          setIsStatusFilterHovered(false);
        });
      }

      if (dt) {
        dt.addEventListener("mouseenter", () => setIsDateFilterHovered(true));
        dt.addEventListener("mouseleave", (e) => {
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="date"]');
          if (dropdown && dropdown.contains(relatedTarget)) return;
          setIsDateFilterHovered(false);
        });
      }
    };

    const timeoutId = setTimeout(attachHoverListeners, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  // Extra refresh on visibility/focus (kept)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchProducts();
    };
    const handleWindowFocus = () => fetchProducts();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refresh on location change + productUpdated signal (kept)
  useEffect(() => {
    const updateSignal = localStorage.getItem("productUpdated");
    if (updateSignal) {
      localStorage.removeItem("productUpdated");
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Listen for product updates from other tabs/pages (kept)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "productUpdated" && e.newValue) {
        fetchProducts();
        localStorage.removeItem("productUpdated");
      }
    };

    const checkForUpdates = () => {
      const updateSignal = localStorage.getItem("productUpdated");
      if (updateSignal) {
        fetchProducts();
        localStorage.removeItem("productUpdated");
      }
    };

    checkForUpdates();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", checkForUpdates);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", checkForUpdates);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- handlers ---------------- */

  // Function to handle icon updates from EditProduct (kept)
  const handleIconUpdate = (productId: string, iconData: ProductIconData | null) => {
    if (iconData) {
      const iconJson = JSON.stringify({ iconData });
      setUpdatedIcons((prev) => ({ ...prev, [productId]: iconJson }));
    } else {
      setUpdatedIcons((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
    }

    // Optimistically update UI
    setProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.productId === productId
          ? {
              ...p,
              productIcon: iconData ? JSON.stringify({ iconData }) : null, // null signals explicit removal
              iconData: iconData || null,
              icon: iconData ? p.icon : undefined, // clear icon path to prevent SVG fallback
            }
          : p
      )
    );

    setPreserveLocalIcons(true);
    setTimeout(() => setPreserveLocalIcons(false), 5000);
  };

  const handleResetProductFilters = () => {
    setSelectedProductTypes([]);
    setSelectedSources([]);
    setSelectedStatuses([]);
    setCreatedSortOrder(null);
  };

  const handleCreateProductCancel = React.useCallback(() => {
    setShowCreateProduct(false);
    setShowNewProductForm(false);
    setEditingProduct(null);
    fetchProducts();
  }, [setShowNewProductForm]);

  const handleDeleteClick = (productId: string, productName: string) => {
    pendingName.current = productName || "";
    setDeleteProductId(productId);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProductId) return;
    setIsDeleting(true);
    try {
      await deleteProductApi(deleteProductId);
      showToast?.({ message: "Product deleted successfully", kind: "success" });
      fetchProducts();
    } catch (e) {
      console.error("Error deleting product:", e);
      showToast?.({ message: "Failed to delete product", kind: "error" });
    } finally {
      setIsDeleting(false);
      setShowConfirmDeleteModal(false);
      setDeleteProductId(null);
      pendingName.current = "";
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmDeleteModal(false);
    setDeleteProductId(null);
    pendingName.current = "";
  };

  const handleNewProductSubmit = async (formData: ProductFormData) => {
    setShowNewProductForm(false);
    try {
      await createProductApi(formData);
      await fetchProducts();
      setShowCreateProduct(false);
      setShowNewProductForm(false);
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product. Please try again.");
    }
  };

  /* ---------------- fetch ---------------- */

  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const list = await getProducts();

      const productsWithExtrasPromises = (list || []).map(async (product: any) => {
        const iconUrl = await fetchIconWithAuth(product.icon);

        let iconData: ProductIconData | null = null;

        // FIRST: Check if icon was EXPLICITLY removed (null or empty string from backend)
        // IMPORTANT: undefined means field was never set - NOT removed!
        const isEmptyObject = (val: any) => val && typeof val === "object" && Object.keys(val).length === 0;

        const iconWasRemoved =
          product.productIcon !== undefined &&
          (product.productIcon === null ||
            product.productIcon === "" ||
            product.productIcon === "null" ||
            isEmptyObject(product.productIcon));

        if (iconWasRemoved) {
          // clear caches
          try {
            const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
            if (iconCache[product.productId]) {
              delete iconCache[product.productId];
              localStorage.setItem("iconDataCache", JSON.stringify(iconCache));
            }
          } catch (e) {
            console.warn("Failed to clear icon cache:", e);
          }
        } else {
          // 1) in-memory cache
          const localIconJson = updatedIcons[product.productId];
          if (localIconJson) {
            const parsedLocal = parseProductIconField(localIconJson);
            iconData = extractIconData(parsedLocal, product.productName || "Product");
          }

          // 2) localStorage cache
          if (!iconData) {
            try {
              const iconCache = JSON.parse(localStorage.getItem("iconDataCache") || "{}");
              const cachedIconJson = iconCache[product.productId];
              if (cachedIconJson) {
                const parsedCache = parseProductIconField(cachedIconJson);
                iconData = extractIconData(parsedCache, product.productName || "Product");
              }
            } catch (e) {
              console.warn("Failed to read icon cache:", e);
            }
          }

          // 3) backend productIcon
          if (!iconData && product.productIcon) {
            const parsed = parseProductIconField(product.productIcon);
            iconData = extractIconData(parsed, product.productName || "Product");
          }

          // 4) fallback: fetch individual product
          if (!iconData) {
            try {
              const individualProduct = await getProductById(product.productId);
              if (
                individualProduct?.productIcon &&
                individualProduct.productIcon !== null &&
                individualProduct.productIcon !== ""
              ) {
                const parsed = parseProductIconField(individualProduct.productIcon);
                iconData = extractIconData(parsed, product.productName || "Product");
              }
            } catch (e) {
              console.error(`Error fetching individual product ${product.productId}:`, e);
            }
          }

          // 5) fallback: reconstruct from SVG file
          if (!iconData && product.icon && iconUrl) {
            try {
              const svgResponse = await fetch(iconUrl);
              const svgText = await svgResponse.text();
              const parser = new DOMParser();
              const doc = parser.parseFromString(svgText, "image/svg+xml");

              const rects = doc.querySelectorAll("rect");
              let tileColor = "#0F6DDA";
              for (const rect of Array.from(rects)) {
                const width = rect.getAttribute("width");
                const fill = rect.getAttribute("fill");
                if (width && fill && fill.startsWith("#")) {
                  const w = parseFloat(width);
                  if (w > 29 && w < 30) {
                    tileColor = fill;
                    break;
                  }
                }
              }

              const pathElement = doc.querySelector('path[fill="#FFFFFF"]') || doc.querySelector("path");
              let svgPath = "M12 2L2 7L12 12L22 7L12 2Z";
              let viewBox = "0 0 24 24";
              if (pathElement) {
                svgPath = pathElement.getAttribute("d") || svgPath;
                const svgEl = pathElement.closest("svg");
                if (svgEl) viewBox = svgEl.getAttribute("viewBox") || viewBox;
              }

              let outerBg: [string, string] | undefined;
              const gradientElement = doc.querySelector("linearGradient");
              if (gradientElement) {
                const stops = gradientElement.querySelectorAll("stop");
                if (stops.length >= 2) {
                  const color1 = stops[0].getAttribute("style")?.match(/stop-color:([^;]+)/)?.[1];
                  const color2 = stops[1].getAttribute("style")?.match(/stop-color:([^;]+)/)?.[1];
                  if (color1 && color2) outerBg = [color1.trim(), color2.trim()];
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
            } catch (err) {
              console.error("Failed to parse SVG:", err);
            }
          }
        }

        return {
          ...product,
          metrics: product.billableMetrics || [],
          iconUrl,
          iconData,
        } as Product;
      });

      const resolved = await Promise.all(productsWithExtrasPromises);

      if (preserveLocalIcons && Object.keys(updatedIcons).length > 0) {
        const merged = resolved.map((p) => {
          const local = updatedIcons[p.productId];
          if (local) {
            const parsedLocal = parseProductIconField(local);
            const localData = extractIconData(parsedLocal, p.productName || "Product");
            return {
              ...p,
              productIcon: local,
              iconData: localData || p.iconData,
            };
          }
          return p;
        });
        setProducts(merged);
      } else {
        setProducts(resolved);
      }

      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [preserveLocalIcons, updatedIcons]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ---------------- derived ---------------- */

  const productTypeNames: Record<string, string> = {
    [ProductType.API]: "API",
    [ProductType.FLATFILE]: "FlatFile",
    [ProductType.SQLRESULT]: "SQLResult",
    [ProductType.LLMTOKEN]: "LLM Token",
  };

  const filteredProducts = products
    .filter((p) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;

      const name = (p.productName || "").toLowerCase();
      const type = (p.productType || "").toLowerCase();
      const status = (p.status || "").toLowerCase();
      const metricsText = (p.metrics || [])
        .map((m) => `${m.metricName || ""} ${m.unitOfMeasure || ""}`)
        .join(" ")
        .toLowerCase();

      return name.includes(q) || type.includes(q) || status.includes(q) || metricsText.includes(q);
    })
    .filter((p) => {
      if (!selectedProductTypes.length) return true;
      const typeKey = (p.productType || "").toLowerCase();
      return selectedProductTypes.includes(typeKey);
    })
    .filter((p) => {
      if (!selectedSources.length) return true;
      const srcKey = (p.source || "MANUAL").toLowerCase();
      return selectedSources.includes(srcKey);
    })
    .filter((p) => {
      if (!selectedStatuses.length) return true;
      const statusKey = (p.status || "").toLowerCase();
      return selectedStatuses.includes(statusKey);
    })
    .sort((a, b) => {
      const aStatus = (a.status || "").toLowerCase();
      const bStatus = (b.status || "").toLowerCase();

      // drafts first
      if (aStatus === "draft" && bStatus !== "draft") return -1;
      if (aStatus !== "draft" && bStatus === "draft") return 1;

      const parseDate = (d?: string) => {
        if (!d) return 0;
        const t = Date.parse(d);
        return Number.isNaN(t) ? 0 : t;
      };

      const aDate = parseDate(a.createdOn);
      const bDate = parseDate(b.createdOn);

      if (aDate === bDate) return 0;
      if (createdSortOrder === "oldest") return aDate - bDate;
      if (createdSortOrder === "newest") return bDate - aDate;

      return 0;
    });

  /* ---------------- mini icon renderer ---------------- */

  const TableProductIcon: React.FC<{ iconData: ProductIconData }> = ({ iconData }) => {
    return (
      <ProductIconTile
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox={iconData.viewBox ?? "0 0 18 18"} fill="none">
            <path d={iconData.svgPath} fill="currentColor" />
          </svg>
        }
        accent={iconData.tileColor}
        iconColor="#FFFFFF"
        size={48}
        padding={6}
        bgOpacity={0.08}
        borderOpacity={0.16}
        backPlateSize={30}
        backOffsetX={-1}
        backOffsetY={-1}
        frontOffsetX={4}
        frontOffsetY={2}
      />
    );
  };

  /* ---------------- columns (Customers-style) ---------------- */

  const columns: DataTableColumn<Product>[] = [
    {
      key: "productName",
      title: "Product Name",
      width: 250,
      render: (p) => {
        return (
          <div className="product-name-cell" style={{ paddingLeft: 16 }}>
            <div
              className="product-name-cell__icon"
              
            >
              {p.iconData ? (
                <TableProductIcon iconData={p.iconData} />
              ) : p.iconUrl ? (
                <ProductIconTile
                  icon={
                    <img
                      src={p.iconUrl}
                      alt={`${p.productName} icon`}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => {
                        e.currentTarget.remove();
                      }}
                    />
                  }
                  accent={["#D06CE0", "#2A559C", "#CC9434", "#0F6DDA", "#6B5B95"][parseInt(p.productId) % 5]}
                  iconColor="#FFFFFF"
                  size={48}
                  padding={6}
                  bgOpacity={0.08}
                />
              ) : (
                <ProductIconTile
                  icon={
                    <span style={{ fontSize: 14, fontWeight: 500 }}>
                      {p.productName?.substring(0, 2).toUpperCase() || "PR"}
                    </span>
                  }
                  accent={["#D06CE0", "#2A559C", "#CC9434", "#0F6DDA", "#6B5B95"][parseInt(p.productId) % 5]}
                  iconColor="#FFFFFF"
                  size={48}
                  padding={6}
                  bgOpacity={0.08}
                  borderOpacity={0.16}
                  backPlateSize={30}
                  backOffsetX={-1}
                  backOffsetY={-1}
                  frontOffsetX={4}
                  frontOffsetY={2}
                />
              )}
            </div>

            <div className="product-name-cell__content">
              <div className="product-name-text-group">
                <div className="product-name" title={p.productName}>
                  {(() => {
                    const name = p.productName || "";
                    if (name.length <= 14) return name;
                    return name.slice(0, 14) + "…";
                  })()}
                </div>
                {p.internalSkuCode && (
                  <div className="product-new-sku" title={p.internalSkuCode}>
                    {p.internalSkuCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "productType",
      title: "Product Type",
      filterable: true,
      ref: productTypeFilterRef,
      onFilterClick: () => setIsProductTypeFilterOpen(true),
      render: (p) => (
        <span className={`product-type-badge--${p.productType?.toLowerCase() || "default"}`}>
          {(() => {
            const normalized = (p.productType || "").toLowerCase();
            return productTypeNames[normalized] || p.productType || "-";
          })()}
        </span>
      ),
    },
    {
      key: "source",
      title: "Source",
      filterable: true,
      ref: sourceFilterRef,
      onFilterClick: () => setIsSourceFilterOpen(true),
      render: (p) => {
        const raw = p.source || "MANUAL";
        const lower = raw.toLowerCase();
        const isManual = lower === "manual";
        const displayText = lower.charAt(0).toUpperCase() + lower.slice(1);

        return (
          <div className={`pro-source-badge ${isManual ? "pro-source-badge--manual" : `pro-source-badge--${lower}`}`}>
            {displayText}
          </div>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      ref: statusFilterRef,
      onFilterClick: () => setIsStatusFilterOpen(true),
      render: (p) => (
        <div className="status-cell-padded">
          <Tooltip
            position="right"
            content={
              p.status.toLowerCase() === "live"
                ? "Product is live and available for sale."
                : p.status.toLowerCase() === "draft"
                ? "Product is in draft. Continue setting it up."
                : p.status.charAt(0) + p.status.slice(1).toLowerCase()
            }
          >
            <StatusBadge
              label={p.status.charAt(0) + p.status.slice(1).toLowerCase()}
              variant={p.status.toLowerCase() as Variant}
              size="sm"
            />
          </Tooltip>
        </div>
      ),
    },
    {
      key: "createdOn",
      title: "Created On",
      width: 200,
      filterable: true,
      ref: dateFilterRef,
      onFilterClick: () => setIsDateFilterOpen(true),
      render: (p) => <span data-date>{formatDateStr(p.createdOn)}</span>,
    },
    {
      key: "actions",
      title: "Actions",
      width: 120,
      render: (p) => {
        const id = p.productId;
        const statusLower = (p.status || "").toLowerCase();

        return (
          <div className="product-action-buttons" onClick={(e) => e.stopPropagation()}>
            {statusLower === "draft" ? (
              <RetryIconButton
                onClick={() => {
                  navigate("/get-started/products/new", { state: { draftProduct: p as any as DraftProduct } });
                }}
                title="Resume Draft"
              />
            ) : (
              <EditIconButton
                onClick={() => navigate(`/get-started/products/edit/${id}`)}
                title="Edit product"
              />
            )}
            <DeleteIconButton
              onClick={() => handleDeleteClick(p.productId, p.productName)}
              disabled={isDeleting}
              title="Delete product"
            />
          </div>
        );
      },
    },
  ];

  /* ---------------- render ---------------- */

  return (
    <ToastProvider>
      <div style={{ width: "calc(100% - 10px)" }}>
        {/* ===== DELETE MODAL ===== */}
        {showConfirmDeleteModal && (
          <ConfirmDeleteModal
            isOpen={showConfirmDeleteModal}
            productName={pendingName.current}
            entityType="product"
            onCancel={handleDeleteCancel}
            onConfirm={handleConfirmDelete}
          />
        )}

        {/* ===== CREATE / EDIT / KONG PANES (kept) ===== */}
        {showCreateProduct && <CreateProduct onClose={handleCreateProductCancel} />}

        {isEditFormOpen && editingProduct && (
          <EditProduct
            productId={editingProduct.productId}
            onClose={() => {
              setIsEditFormOpen(false);
              setEditingProduct(null);
              fetchProducts();
            }}
            onIconUpdate={handleIconUpdate}
          />
        )}

        {showKongIntegration && <KongIntegration onClose={() => setShowKongIntegration(false)} />}

        {/* ===== SINGLE LIST VIEW CONTAINER ===== */}
        <div className={`check-container ${products.length > 0 ? "has-products" : ""}`}>
          <Header
            title="Products"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            searchDisabled={products.length === 0}
            showPrimary={products.length > 0}
            primaryLabel="+ Create Product"
            onPrimaryClick={() => navigate("/get-started/products/new")}
            filterButtonRef={filterButtonRef}
            onFilterClick={() => {
              if (!filterButtonRef.current) return;
              const rect = filterButtonRef.current.getBoundingClientRect();
              setMainFilterMenuPosition({ top: rect.bottom + 8, left: rect.left });
              setIsMainFilterMenuOpen((v) => !v);
              setIsMainFilterPanelOpen(false);
            }}
          />

          {/* ===== MAIN FILTER MENU ===== */}
          {isMainFilterMenuOpen && (
            <MainFilterMenu
              items={[
                { key: "productType", label: "Product Type" },
                { key: "source", label: "Source" },
                { key: "status", label: "Status" },
                { key: "date", label: "Date" },
              ]}
              activeKey={activeFilterKey}
              onSelect={(key) => setActiveFilterKey(key)}
              onSelectWithRect={(key, rect) => {
                setActiveFilterKey(key);
                setMainFilterPanelPosition({
                  top: rect.top,
                  left: rect.left - 280,
                });
                setIsMainFilterPanelOpen(true);
              }}
              anchorTop={mainFilterMenuPosition.top}
              anchorLeft={mainFilterMenuPosition.left}
            />
          )}

          {isMainFilterPanelOpen && activeFilterKey === "productType" && (
            <SimpleFilterDropdown
              options={[ProductType.API, ProductType.FLATFILE, ProductType.SQLRESULT, ProductType.LLMTOKEN].map((t) => ({
                id: String(t).toLowerCase(),
                label: productTypeNames[t as any] || String(t),
              }))}
              value={selectedProductTypes}
              onChange={(v) => setSelectedProductTypes(v.map((x) => String(x).toLowerCase()))}
              anchorTop={mainFilterPanelPosition.top}
              anchorLeft={mainFilterPanelPosition.left}
            />
          )}

          {isMainFilterPanelOpen && activeFilterKey === "source" && (
            <SimpleFilterDropdown
              options={["manual", "apigee", "kong"].map((s) => ({
                id: s,
                label: s.charAt(0).toUpperCase() + s.slice(1),
              }))}
              value={selectedSources}
              onChange={(v) => setSelectedSources(v.map((x) => String(x).toLowerCase()))}
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
              onChange={(v) => setSelectedStatuses(v.map((x) => String(x).toLowerCase()))}
              anchorTop={mainFilterPanelPosition.top}
              anchorLeft={mainFilterPanelPosition.left}
            />
          )}

          {isMainFilterPanelOpen && activeFilterKey === "date" && (
            <DateSortDropdown
              value={createdSortOrder}
              onChange={setCreatedSortOrder}
              anchorTop={mainFilterPanelPosition.top}
              anchorLeft={mainFilterPanelPosition.left}
            />
          )}

          {/* ===== COLUMN FILTER DROPDOWNS (hover + click like Customers) ===== */}
          {(isProductTypeFilterOpen || isProductTypeFilterHovered) && productTypeFilterRef.current && (
            <div data-dropdown="productType">
              <SimpleFilterDropdown
                options={[ProductType.API, ProductType.FLATFILE, ProductType.SQLRESULT, ProductType.LLMTOKEN].map((t) => ({
                  id: String(t).toLowerCase(),
                  label: productTypeNames[t as any] || String(t),
                }))}
                value={selectedProductTypes}
                onChange={(v) => setSelectedProductTypes(v.map((x) => String(x).toLowerCase()))}
                anchorTop={productTypeFilterRef.current.getBoundingClientRect().bottom + 8}
                anchorLeft={productTypeFilterRef.current.getBoundingClientRect().left}
              />
            </div>
          )}

          {(isSourceFilterOpen || isSourceFilterHovered) && sourceFilterRef.current && (
            <div data-dropdown="source">
              <SimpleFilterDropdown
                options={["manual", "apigee", "kong"].map((s) => ({
                  id: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                }))}
                value={selectedSources}
                onChange={(v) => setSelectedSources(v.map((x) => String(x).toLowerCase()))}
                anchorTop={sourceFilterRef.current.getBoundingClientRect().bottom + 8}
                anchorLeft={sourceFilterRef.current.getBoundingClientRect().left}
              />
            </div>
          )}

          {(isStatusFilterOpen || isStatusFilterHovered) && statusFilterRef.current && (
            <div data-dropdown="status">
              <SimpleFilterDropdown
                options={["active", "draft", "live"].map((s) => ({
                  id: s,
                  label: s.charAt(0).toUpperCase() + s.slice(1),
                }))}
                value={selectedStatuses}
                onChange={(v) => setSelectedStatuses(v.map((x) => String(x).toLowerCase()))}
                anchorTop={statusFilterRef.current.getBoundingClientRect().bottom + 8}
                anchorLeft={statusFilterRef.current.getBoundingClientRect().left}
              />
            </div>
          )}

          {(isDateFilterOpen || isDateFilterHovered) && dateFilterRef.current && (
            <div data-dropdown="date">
              <DateSortDropdown
                value={createdSortOrder}
                onChange={setCreatedSortOrder}
                anchorTop={dateFilterRef.current.getBoundingClientRect().bottom + 8}
                anchorLeft={dateFilterRef.current.getBoundingClientRect().left}
              />
            </div>
          )}

          {/* ===== FORCE HOVER STATE WHEN DROPDOWN IS OPEN ===== */}
          {isProductTypeFilterOpen && (
            <style>{`.dt-header-cell:nth-child(2){background-color:var(--color-neutral-200)!important;border-radius:0!important;}
              .dt-header-cell:nth-child(2) .dt-filter-trigger{opacity:1!important;pointer-events:auto!important;}`}</style>
          )}
          {isSourceFilterOpen && (
            <style>{`.dt-header-cell:nth-child(3){background-color:var(--color-neutral-200)!important;border-radius:0!important;}
              .dt-header-cell:nth-child(3) .dt-filter-trigger{opacity:1!important;pointer-events:auto!important;}`}</style>
          )}
          {isStatusFilterOpen && (
            <style>{`.dt-header-cell:nth-child(4){background-color:var(--color-neutral-200)!important;border-radius:0!important;}
              .dt-header-cell:nth-child(4) .dt-filter-trigger{opacity:1!important;pointer-events:auto!important;}`}</style>
          )}
          {isDateFilterOpen && (
            <style>{`.dt-header-cell:nth-child(5){background-color:var(--color-neutral-200)!important;border-radius:0!important;}
              .dt-header-cell:nth-child(5) .dt-filter-trigger{opacity:1!important;pointer-events:auto!important;}`}</style>
          )}

          {/* ===== DATA TABLE ===== */}
          <DataTable
            columns={columns}
            rows={filteredProducts}
            rowKey={(p, i) => `${p.productId}-${i}-${refreshKey}`}
              topContent={
                selectedProductTypes.length || selectedSources.length || selectedStatuses.length || createdSortOrder ? (
                  <div className="customers-active-filters-row">
                    <div className="customers-active-filters-chips">
                      {selectedProductTypes.map((t) => (
                        <FilterChip
                          key={t}
                          label={productTypeNames[t] || t}
                          onRemove={() => setSelectedProductTypes((prev) => prev.filter((x) => x !== t))}
                        />
                      ))}
                      {selectedSources.map((s) => (
                        <FilterChip
                          key={s}
                          label={s.charAt(0).toUpperCase() + s.slice(1)}
                          onRemove={() => setSelectedSources((prev) => prev.filter((x) => x !== s))}
                        />
                      ))}
                      {selectedStatuses.map((s) => (
                        <FilterChip
                          key={s}
                          label={s.charAt(0).toUpperCase() + s.slice(1)}
                          onRemove={() => setSelectedStatuses((prev) => prev.filter((x) => x !== s))}
                        />
                      ))}
                      {createdSortOrder ? (
                        <FilterChip
                          key={`date-${createdSortOrder}`}
                          label={createdSortOrder === "newest" ? "Newest" : "Oldest"}
                          onRemove={() => setCreatedSortOrder(null)}
                        />
                      ) : null}
                    </div>

                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                      <ResetButton label="Reset" onClick={handleResetProductFilters} />
                    </div>
                  </div>
                ) : null
              }
              emptyIcon={
                isLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    <div className="spinner" />
                    <span style={{ color: "#666", fontSize: "14px" }}>Loading products...</span>
                  </div>
                ) : !isLoading && (searchTerm.trim() || selectedProductTypes.length || selectedSources.length || selectedStatuses.length) ? (
                  <img src={NoFileSvg} width={170} height={170} />
                ) : !isLoading ? (
                  <img src={EmptyBox} width={200} height={200} />
                ) : null
              }
              emptyText={
                !isLoading && (searchTerm.trim()
                  ? `We couldn't find any results for "${searchTerm}"\nNothing wrong, just adjust your search a bit.`
                  : selectedProductTypes.length || selectedSources.length || selectedStatuses.length
                  ? "Oops! No matches found with these filters.\nTry adjusting your search or filters"
                  : 'No products available. Click "Create Product" to \ncreate your first product.') || undefined
              }
              emptyAction={
                !isLoading && products.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
                    <PrimaryButton onClick={() => navigate("/get-started/products/new")}>+ Create Product</PrimaryButton>
                    <TertiaryButton onClick={() => navigate("/get-started/products/import")}>
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                          <path
                            d="M5.83333 13.8333V3.83333C5.83333 3.65652 5.7631 3.48695 5.63807 3.36193C5.51305 3.2369 5.34348 3.16667 5.16667 3.16667H1.83333C1.47971 3.16667 1.14057 3.30714 0.890524 3.55719C0.640476 3.80724 0.5 4.14638 0.5 4.5V12.5C0.5 12.8536 0.640476 13.1928 0.890524 13.4428C1.14057 13.6929 1.47971 13.8333 1.83333 13.8333H9.83333C10.187 13.8333 10.5261 13.6929 10.7761 13.4428C11.0262 13.1928 11.1667 12.8536 11.1667 12.5V9.16667C11.1667 8.98986 11.0964 8.82029 10.9714 8.69526C10.8464 8.57024 10.6768 8.5 10.5 8.5H0.5M9.16667 0.5H13.1667C13.5349 0.5 13.8333 0.798477 13.8333 1.16667V5.16667C13.8333 5.53486 13.5349 5.83333 13.1667 5.83333H9.16667C8.79848 5.83333 8.5 5.53486 8.5 5.16667V1.16667C8.5 0.798477 8.79848 0.5 9.16667 0.5Z"
                            stroke="#034A7D"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Import Products
                      </span>
                    </TertiaryButton>
                  </div>
                ) : undefined
              }
            />
          </div>
        );
      </div>
    </ToastProvider>
  );
}
