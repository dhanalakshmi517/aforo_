import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Subscriptions.css";
import "../Rateplan/RatePlan.css";

import PageHeader from "../PageHeader/PageHeader";
import DataTable, { DataTableColumn } from "../componenetsss/DataTable";

import PrimaryButton from "../componenetsss/PrimaryButton";
import StatusBadge, { Variant } from "../componenetsss/StatusBadge";
import EditIconButton from "../componenetsss/EditIconButton";
import DeleteIconButton from "../componenetsss/DeleteIconButton";
import RetryIconButton from "../componenetsss/RetryIconButton";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import PaymentTypePill from "../componenetsss/PayementTypePill";

import FilterChip from "../componenetsss/FilterChip";
import FilterDropdown from "../componenetsss/FilterDropdown";
import SimpleFilterDropdown from "../componenetsss/SimpleFilterDropdown";
import DateSortDropdown from "../componenetsss/DateSortDropdown";
import MainFilterMenu, { MainFilterKey } from "../componenetsss/MainFilterMenu";
import ResetButton from "../componenetsss/ResetButton";

import { useToast } from "../componenetsss/ToastProvider";

import purchaseSvg from "./purchase.svg";
import NoFileSvg from "../componenetsss/nofile.svg";

import { Api, Subscription as SubscriptionType } from "./api";
import CreateSubscription from "./CreateSubscription";
import EditSubscription from "./EditSubscriptions/EditSubscription";
import { getAuthHeaders } from "../../utils/auth";

/* ---------------- helpers ---------------- */

const initialsFrom = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("") || "•";

const formatPurchased = (sub: SubscriptionType) => {
  // If backend already gives a formatted string, use it directly
  const anySub: any = sub as any;
  if (typeof anySub.createdOn === "string" && anySub.createdOn.trim()) return anySub.createdOn;

  const iso = anySub.createdAt || anySub.startDate || anySub.createdOn;
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";

  const fmt = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(d);

  return `${fmt} IST`;
};

const truncate = (t: string, n = 10) => (!t ? t : t.length > n ? `${t.slice(0, n)}...` : t);

const PaymentPill: React.FC<{ value?: string }> = ({ value }) => {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "prepaid") return <PaymentTypePill type="prepaid" />;
  if (raw === "postpaid") return <PaymentTypePill type="postpaid" />;
  return <span className="pill--">—</span>;
};

const RatePlanChip: React.FC<{ name?: string }> = ({ name }) => {
  const displayName = name || "N/A";
  return (
    <div className="rate-plan-chip">
      <div className="rate-plan-chip__badge">
        {(displayName || "RP")
          .trim()
          .split(/\s+/)
          .map((s) => s[0])
          .join("")
          .slice(0, 1)
          .toUpperCase()}
      </div>
      <div className="rate-plan-chip__content">
        <div className="rate-plan-chip__name" title={displayName}>
          {truncate(displayName, 12)}
        </div>
        <div className="rate-plan-chip__label">Pricing Model Name</div>
      </div>
    </div>
  );
};

/* ---------- logo resolve (same approach as Customers.tsx) ---------- */
const FILE_HOST = "http://44.201.19.187:8081";

const absolutizeUpload = (path: string) => {
  const clean = (path || "").replace(/\\/g, "/").trim();
  if (!clean) return "";
  if (/^https?:\/\//i.test(clean)) return clean;
  const separator = clean.startsWith("/") ? "" : "/";
  return `${FILE_HOST}${separator}${clean}`;
};

const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = encodeURI(absolutizeUpload(uploadPath));
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { ...getAuthHeaders(), Accept: "image/*" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
};

type CustomerLite = {
  customerId: number;
  customerName?: string;
  primaryEmail?: string;
  companyLogoUrl?: string;
  __resolvedLogoSrc?: string | null;
};

type RatePlanLite = { ratePlanId: number; ratePlanName?: string };

/* ---------------- component ---------------- */

interface SubscriptionsProps {
  showNewSubscriptionForm: boolean;
  setShowNewSubscriptionForm: (show: boolean) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({
  showNewSubscriptionForm,
  setShowNewSubscriptionForm,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
  const [customers, setCustomers] = useState<CustomerLite[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanLite[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = useState<string[]>([]);
  const [selectedRatePlanIds, setSelectedRatePlanIds] = useState<Array<number | string>>([]);
  const [purchasedSortOrder, setPurchasedSortOrder] = useState<"newest" | "oldest" | null>("newest");

  const [isLoading, setIsLoading] = useState(false);

  const [editingSub, setEditingSub] = useState<SubscriptionType | null>(null);
  const [draftSub, setDraftSub] = useState<SubscriptionType | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subToDelete, setSubToDelete] = useState<SubscriptionType | null>(null);

  /* ---- main filter menu state (same as Customers) ---- */
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState<MainFilterKey | null>(null);
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = useState({ top: 0, left: 0 });
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = useState(false);

  /* ---- column dropdown state (same pattern as Customers) ---- */
  const ratePlanFilterRef = useRef<HTMLDivElement>(null);
  const paymentTypeFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  const [isRatePlanFilterOpen, setIsRatePlanFilterOpen] = useState(false);
  const [isPaymentTypeFilterOpen, setIsPaymentTypeFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);

  const [isRatePlanFilterHovered, setIsRatePlanFilterHovered] = useState(false);
  const [isPaymentTypeFilterHovered, setIsPaymentTypeFilterHovered] = useState(false);
  const [isStatusFilterHovered, setIsStatusFilterHovered] = useState(false);
  const [isDateFilterHovered, setIsDateFilterHovered] = useState(false);

  /* ---------------- fetch ---------------- */

  const fetchSubs = async () => {
    setIsLoading(true);
    try {
      const data = await Api.getSubscriptions();
      setSubscriptions(data ?? []);
    } catch (e) {
      console.error("Failed to fetch subscriptions", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [custRaw, plans] = await Promise.all([Api.getCustomers?.(), Api.getRatePlans?.()]);

      // Show customers immediately (no logo blocking)
      const quickCustomers: CustomerLite[] = (Array.isArray(custRaw) ? custRaw : []).map((c: any) => ({
        ...c,
        __resolvedLogoSrc: null,
      }));
      setCustomers(quickCustomers);

      // Load logos async per row (like Customers.tsx)
      quickCustomers.forEach(async (c, index) => {
        if (!c.companyLogoUrl) return;
        const resolved = await resolveLogoSrc(c.companyLogoUrl);
        if (resolved) {
          setCustomers((prev) =>
            prev.map((x, i) => (i === index ? { ...x, __resolvedLogoSrc: resolved } : x))
          );
        }
      });

      setRatePlans(Array.isArray(plans) ? plans : []);
    } catch (e) {
      console.warn("Failed to fetch lookups (customers / rate plans)", e);
    }
  };

  useEffect(() => {
    fetchSubs();
    fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingSub || draftSub) setShowNewSubscriptionForm(true);
    else setShowNewSubscriptionForm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSub, draftSub]);

  /* ---------------- click outside to close (same logic as Customers) ---------------- */

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      const portalRoot = document.getElementById("portal-root");
      if (portalRoot && target && portalRoot.contains(target)) return;

      if (target.closest(".products-column-filter-popover")) return;
      if (target.closest(".products-th-label-with-filter")) return;
      if (target.closest("[role='menu']")) return;
      if (target.closest("tbody")) return;

      if (
        isMainFilterMenuOpen ||
        isMainFilterPanelOpen ||
        isRatePlanFilterOpen ||
        isPaymentTypeFilterOpen ||
        isStatusFilterOpen ||
        isDateFilterOpen
      ) {
        setIsMainFilterMenuOpen(false);
        setIsMainFilterPanelOpen(false);
        setIsRatePlanFilterOpen(false);
        setIsPaymentTypeFilterOpen(false);
        setIsStatusFilterOpen(false);
        setIsDateFilterOpen(false);
      }

      if (isRatePlanFilterHovered || isPaymentTypeFilterHovered || isStatusFilterHovered || isDateFilterHovered) {
        setIsRatePlanFilterHovered(false);
        setIsPaymentTypeFilterHovered(false);
        setIsStatusFilterHovered(false);
        setIsDateFilterHovered(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [
    isMainFilterMenuOpen,
    isMainFilterPanelOpen,
    isRatePlanFilterOpen,
    isPaymentTypeFilterOpen,
    isStatusFilterOpen,
    isDateFilterOpen,
    isRatePlanFilterHovered,
    isPaymentTypeFilterHovered,
    isStatusFilterHovered,
    isDateFilterHovered,
  ]);

  /* ---------------- maps/options ---------------- */

  const customerMap = useMemo(() => {
    const m = new Map<number, CustomerLite>();
    customers.forEach((c) => {
      if (c.customerId != null) m.set(c.customerId, c);
    });
    return m;
  }, [customers]);

  const ratePlanMap = useMemo(() => {
    const m = new Map<number, RatePlanLite>();
    ratePlans.forEach((r) => {
      if (r.ratePlanId != null) m.set(r.ratePlanId, r);
    });
    return m;
  }, [ratePlans]);

  const ratePlanOptions = useMemo(() => {
    return Array.from(
      new Map(
        ratePlans.map((rp) => [
          rp.ratePlanId,
          { id: rp.ratePlanId, label: rp.ratePlanName || `Plan ${rp.ratePlanId}` },
        ])
      ).values()
    );
  }, [ratePlans]);

  /* ---------------- filtering/sorting ---------------- */

  const filteredSubs = subscriptions
    .filter((sub) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;

      const cust = customerMap.get(sub.customerId);
      const rp = ratePlanMap.get(sub.ratePlanId);

      const name = (cust?.customerName || "").toLowerCase();
      const email = (cust?.primaryEmail || "").toLowerCase();
      const plan = (rp?.ratePlanName || "").toLowerCase();
      const paymentType = (sub.paymentType || "").toLowerCase();
      const status = (sub.status || "").toLowerCase();

      return name.includes(q) || email.includes(q) || plan.includes(q) || paymentType.includes(q) || status.includes(q);
    })
    .filter((sub) => {
      if (!selectedStatuses.length) return true;
      return selectedStatuses.includes((sub.status || "").toLowerCase());
    })
    .filter((sub) => {
      if (!selectedPaymentTypes.length) return true;
      return selectedPaymentTypes.includes((sub.paymentType || "").toLowerCase());
    })
    .filter((sub) => {
      if (!selectedRatePlanIds.length) return true;
      return selectedRatePlanIds.some((x) => String(x) === String(sub.ratePlanId));
    })
    .sort((a, b) => {
      const aStatus = (a.status || "").toLowerCase();
      const bStatus = (b.status || "").toLowerCase();

      const aDraft = aStatus === "draft";
      const bDraft = bStatus === "draft";
      if (aDraft && !bDraft) return -1;
      if (!aDraft && bDraft) return 1;

      const parseDate = (s: SubscriptionType) => {
        const anyS: any = s as any;
        const iso = anyS.createdAt || anyS.startDate || anyS.createdOn;
        if (!iso) return 0;
        const t = Date.parse(iso);
        return Number.isNaN(t) ? 0 : t;
      };

      const ad = parseDate(a);
      const bd = parseDate(b);

      if (purchasedSortOrder === "oldest") return ad - bd;
      if (purchasedSortOrder === "newest") return bd - ad;
      return 0;
    });

  /* ---------------- delete ---------------- */

  const handleDeleteClick = (sub: SubscriptionType) => {
    setSubToDelete(sub);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!subToDelete) return;
    try {
      await Api.deleteSubscription(subToDelete.subscriptionId);
      await fetchSubs();
      setShowDeleteModal(false);
      setSubToDelete(null);
      showToast({
        kind: "success",
        title: "Purchase Deleted",
        message: "The purchase has been successfully deleted.",
      });
    } catch (e) {
      console.error("Failed to delete subscription", e);
      showToast({
        kind: "error",
        title: "Deletion Failed",
        message: "Failed to delete the purchase. Please try again.",
      });
    }
  };

  /* ---------------- columns (DataTable) ---------------- */

  const columns: DataTableColumn<SubscriptionType>[] = [
    {
      key: "customer",
      title: "Customer Name",
      width: undefined,
      render: (sub) => {
        const cust = customerMap.get(sub.customerId);
        const logo = cust?.__resolvedLogoSrc || null;
        const name = cust?.customerName || `Customer ${sub.customerId}`;

        return (
          <div className="cell-flex" style={{ paddingLeft: "16px" }}>
            <div
              className={`customer-logo${logo ? " has-image" : " no-image"}`}
              style={
                logo
                  ? {
                      backgroundImage: `url(${logo})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }
                  : undefined
              }
            >
              {!logo && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15.8334 17.5V15.8333C15.8334 14.9493 15.4822 14.1014 14.8571 13.4763C14.232 12.8512 13.3841 12.5 12.5001 12.5H7.50008C6.61603 12.5 5.76818 12.8512 5.14306 13.4763C4.51794 14.1014 4.16675 14.9493 4.16675 15.8333V17.5M13.3334 5.83333C13.3334 7.67428 11.841 9.16667 10.0001 9.16667C8.15913 9.16667 6.66675 7.67428 6.66675 5.83333C6.66675 3.99238 8.15913 2.5 10.0001 2.5C11.841 2.5 13.3334 3.99238 13.3334 5.83333Z" stroke="#034A7D" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              )}
            </div>

            <div className="cust-block">
              <div className="cust-name" title={name}>
                {truncate(name, 12)}
              </div>
              <div className="cust-email">{cust?.primaryEmail || "—"}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "ratePlan",
      title: "Rate Plan",
      filterable: true,
      ref: ratePlanFilterRef,
      onFilterClick: () => setIsRatePlanFilterOpen(true),
      width: undefined,
      render: (sub) => {
        const rp = ratePlanMap.get(sub.ratePlanId);
        return <RatePlanChip name={rp?.ratePlanName || `Plan ${sub.ratePlanId}`} />;
      },
    },
    {
      key: "paymentType",
      title: "Payment Type",
      filterable: true,
      ref: paymentTypeFilterRef,
      onFilterClick: () => setIsPaymentTypeFilterOpen(true),
      render: (sub) => <PaymentPill value={sub.paymentType} />,
    },
    {
      key: "purchasedOn",
      title: "Purchased On",
      filterable: true,
      ref: dateFilterRef,
      onFilterClick: () => setIsDateFilterOpen(true),
      width: 230,
      render: (sub) => <span data-date>{formatPurchased(sub)}</span>,
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      ref: statusFilterRef,
      onFilterClick: () => setIsStatusFilterOpen(true),
      render: (sub) => (
        <div className="status-cell-padded">
          <StatusBadge
            label={sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1).toLowerCase() : "N/A"}
            variant={(sub.status || "draft").toLowerCase() as Variant}
            size="sm"
          />
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: 110,
      render: (sub) => {
        return (
          <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
            {sub.status?.toLowerCase() === "draft" ? (
              <RetryIconButton onClick={() => setDraftSub(sub)} title="Continue editing draft" />
            ) : (
              <EditIconButton onClick={() => setEditingSub(sub)} title="Edit purchase" />
            )}

            <DeleteIconButton onClick={() => handleDeleteClick(sub)} title="Delete purchase" />
          </div>
        );
      },
    },
  ];

  /* ---------------- render routing between list / create / edit ---------------- */

  if (editingSub) {
    return (
      <div className="check-container">
        <EditSubscription
          initial={editingSub}
          onClose={() => {
            setEditingSub(null);
            fetchSubs();
          }}
        />
      </div>
    );
  }

  if (draftSub) {
    return (
      <div className="check-container">
        <CreateSubscription
          draftData={draftSub}
          onClose={() => {
            setDraftSub(null);
            fetchSubs();
          }}
          onCreateSuccess={() => {
            setDraftSub(null);
            fetchSubs();
          }}
        />
      </div>
    );
  }

  const isEmpty = subscriptions.length === 0;
  const filterApplied =
    selectedStatuses.length || selectedPaymentTypes.length || selectedRatePlanIds.length;

  return (
    <div className={`check-container ${subscriptions.length > 0 ? "has-customers" : ""}`}>
      <PageHeader
        title="Purchases"
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchDisabled={isEmpty}
        showPrimary={!isEmpty}
        primaryLabel="+ New Purchase"
        onPrimaryClick={() => navigate("/get-started/subscriptions/new")}
        filterButtonRef={filterButtonRef}
        filterDisabled={isEmpty}
        filterActive={isMainFilterMenuOpen || isMainFilterPanelOpen}
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
            { key: "ratePlan", label: "Rate Plan" },
            { key: "paymentType", label: "Payment Type" },
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

      {/* ===== MAIN FILTER PANELS ===== */}
      {isMainFilterPanelOpen && activeFilterKey === "ratePlan" && (
        <FilterDropdown
          options={ratePlanOptions}
          value={selectedRatePlanIds}
          onChange={setSelectedRatePlanIds}
          placeholder="Search Rate Plans"
          widthPx={320}
          heightPx={300}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}

      {isMainFilterPanelOpen && activeFilterKey === "paymentType" && (
        <SimpleFilterDropdown
          options={[
            { id: "prepaid", label: "Prepaid" },
            { id: "postpaid", label: "Postpaid" },
          ]}
          value={selectedPaymentTypes}
          onChange={(v) => setSelectedPaymentTypes(v.map((x) => String(x).toLowerCase()))}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}

      {isMainFilterPanelOpen && activeFilterKey === "status" && (
        <SimpleFilterDropdown
          options={[
            { id: "active", label: "Active" },
            { id: "draft", label: "Draft" },
            { id: "cancelled", label: "Cancelled" },
          ]}
          value={selectedStatuses}
          onChange={(v) => setSelectedStatuses(v.map((x) => String(x).toLowerCase()))}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}

      {isMainFilterPanelOpen && activeFilterKey === "date" && (
        <DateSortDropdown
          value={purchasedSortOrder}
          onChange={setPurchasedSortOrder}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}

      {/* ===== COLUMN DROPDOWNS (HOVER + OPEN) ===== */}
      {(isRatePlanFilterOpen || isRatePlanFilterHovered) && ratePlanFilterRef.current && (
        <div data-dropdown="ratePlan">
          <FilterDropdown
            options={ratePlanOptions}
            value={selectedRatePlanIds}
            onChange={setSelectedRatePlanIds}
            placeholder="Search Rate Plans"
            widthPx={320}
            heightPx={300}
            anchorTop={ratePlanFilterRef.current.getBoundingClientRect().bottom + 8}
            anchorLeft={ratePlanFilterRef.current.getBoundingClientRect().left}
          />
        </div>
      )}

      {(isPaymentTypeFilterOpen || isPaymentTypeFilterHovered) && paymentTypeFilterRef.current && (
        <div data-dropdown="paymentType">
          <SimpleFilterDropdown
            options={[
              { id: "prepaid", label: "Prepaid" },
              { id: "postpaid", label: "Postpaid" },
            ]}
            value={selectedPaymentTypes}
            onChange={(v) => setSelectedPaymentTypes(v.map((x) => String(x).toLowerCase()))}
            anchorTop={paymentTypeFilterRef.current.getBoundingClientRect().bottom + 8}
            anchorLeft={paymentTypeFilterRef.current.getBoundingClientRect().left}
          />
        </div>
      )}

      {(isDateFilterOpen || isDateFilterHovered) && dateFilterRef.current && (
        <div data-dropdown="date">
          <DateSortDropdown
            value={purchasedSortOrder}
            onChange={setPurchasedSortOrder}
            anchorTop={dateFilterRef.current.getBoundingClientRect().bottom + 8}
            anchorLeft={dateFilterRef.current.getBoundingClientRect().left}
          />
        </div>
      )}

      {(isStatusFilterOpen || isStatusFilterHovered) && statusFilterRef.current && (
        <div data-dropdown="status">
          <SimpleFilterDropdown
            options={[
              { id: "active", label: "Active" },
              { id: "draft", label: "Draft" },
              { id: "cancelled", label: "Cancelled" },
            ]}
            value={selectedStatuses}
            onChange={(v) => setSelectedStatuses(v.map((x) => String(x).toLowerCase()))}
            anchorTop={statusFilterRef.current.getBoundingClientRect().bottom + 8}
            anchorLeft={statusFilterRef.current.getBoundingClientRect().left}
          />
        </div>
      )}

      {/* ===== DataTable ===== */}
      <DataTable
        columns={columns}
        rows={filteredSubs}
        rowKey={(s, i) => String((s as any).subscriptionId ?? i)}
        topContent={
          filterApplied ? (
            <div className="customers-active-filters-row">
              <div className="customers-active-filters-chips">
                {selectedRatePlanIds.map((id) => {
                  const numericId = Number(id);
                  const rp = ratePlanMap.get(numericId);
                  const label = rp?.ratePlanName || `Plan ${numericId}`;
                  return (
                    <FilterChip
                      key={`rp-${id}`}
                      label={label}
                      onRemove={() => setSelectedRatePlanIds((prev) => prev.filter((x) => x !== id))}
                    />
                  );
                })}

                {selectedPaymentTypes.map((pt) => (
                  <FilterChip
                    key={`pt-${pt}`}
                    label={pt}
                    onRemove={() => setSelectedPaymentTypes((prev) => prev.filter((x) => x !== pt))}
                  />
                ))}

                {selectedStatuses.map((s) => (
                  <FilterChip
                    key={`st-${s}`}
                    label={s}
                    onRemove={() => setSelectedStatuses((prev) => prev.filter((x) => x !== s))}
                  />
                ))}
              </div>

              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                <ResetButton
                  label="Reset"
                  onClick={() => {
                    setSelectedRatePlanIds([]);
                    setSelectedPaymentTypes([]);
                    setSelectedStatuses([]);
                    setPurchasedSortOrder("newest");
                  }}
                />
              </div>
            </div>
          ) : null
        }
        emptyIcon={
          isLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div className="spinner" />
              <span style={{ color: "#666", fontSize: "14px" }}>Loading purchases...</span>
            </div>
          ) : searchTerm.trim() || filterApplied ? (
            <img src={NoFileSvg} width={170} height={170} />
          ) : (
            <img src={purchaseSvg} width={190} height={190} />
          )
        }
        emptyText={
          isLoading ? (
            undefined
          ) : searchTerm.trim() ? (
            `No purchases found for "${searchTerm}"\nTry searching with different keywords`
          ) : filterApplied ? (
            "Oops! No matches found with these filters.\nTry adjusting your search or filters"
          ) : (
            "No Purchases yet. Click 'New Purchase' \nto create your First Purchase."
          )
        }
        emptyAction={
          subscriptions.length === 0 ? (
            <PrimaryButton
              onClick={() => navigate("/get-started/subscriptions/new")}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              iconPosition="left"
            >
              New Purchase
            </PrimaryButton>
          ) : undefined
        }
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        productName={subToDelete ? `Subscription ${subToDelete.subscriptionId}` : ""}
        entityType="purchase"
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSubToDelete(null);
        }}
      />
    </div>
  );
};

export default Subscriptions;
