import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Customers.css";

import PageHeader from "../PageHeader/PageHeader";
import DataTable, { DataTableColumn } from "../componenetsss/DataTable";
import PrimaryButton from "../componenetsss/PrimaryButton";
import EditIconButton from "../componenetsss/EditIconButton";
import DeleteIconButton from "../componenetsss/DeleteIconButton";
import RetryIconButton from "../componenetsss/RetryIconButton";
import ConfirmDeleteModal from "../componenetsss/ConfirmDeleteModal";
import StatusBadge, { Variant } from "../componenetsss/StatusBadge";
import CreateCustomer from "./CreateCustomer";

import FilterChip from "../componenetsss/FilterChip";
import FilterDropdown from "../componenetsss/FilterDropdown";
import SimpleFilterDropdown from "../componenetsss/SimpleFilterDropdown";
import DateSortDropdown from "../componenetsss/DateSortDropdown";
import MainFilterMenu, { MainFilterKey } from "../componenetsss/MainFilterMenu";
import ResetButton from "../componenetsss/ResetButton";

import CustomersPlat from "./customers-plat.svg";
import NoFileSvg from "./nofile.svg";

import { getCustomers, deleteCustomer } from "./api";
import { isAuthenticated, getAuthHeaders } from "../../utils/auth";

/* ---------------- types ---------------- */

export interface Customer {
  id?: number;
  customerId?: number;
  companyName: string;
  companyType: string;
  customerName?: string;
  primaryEmail?: string;
  status: string;
  createdOn?: string;
  companyLogoUrl?: string;
  phoneNumber?: string;
  additionalEmailRecipients?: string[];
  billingSameAsCustomer?: boolean;
  customerAddressLine1?: string;
  customerAddressLine2?: string;
  customerCity?: string;
  customerState?: string;
  customerPostalCode?: string;
  customerCountry?: string;
  billingAddressLine1?: string;
  billingAddressLine2?: string;
  billingCity?: string;
  billingState?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  __resolvedLogoSrc?: string | null;
}

/* ---------------- utils ---------------- */

const truncateText = (text: string, maxLength: number = 10): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const formatDateStr = (dateValue?: string) => {
  if (!dateValue) return "-";
  // Backend already returns formatted date string like "21 Jan, 2026 13:06 IST"
  // Just return it as-is
  return dateValue;
};

const FILE_HOST = "http://44.201.19.187:8081";

const absolutizeUpload = (path: string) => {
  const clean = path.replace(/\\/g, "/").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  const separator = clean.startsWith("/") ? "" : "/";
  return `${FILE_HOST}${separator}${clean}`;
};

const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = absolutizeUpload(uploadPath);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { ...getAuthHeaders(), Accept: "image/*" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Logo fetch error:', error);
    return null;
  }
};

/* ---------------- component ---------------- */

interface CustomersProps {
  showNewCustomerForm: boolean;
  setShowNewCustomerForm: (show: boolean) => void;
}

const Customers: React.FC<CustomersProps> = ({ showNewCustomerForm, setShowNewCustomerForm }) => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Array<number | string>>([]);
  const [selectedCustomerNames, setSelectedCustomerNames] = useState<string[]>([]);
  const [createdSortOrder, setCreatedSortOrder] =
    useState<"newest" | "oldest">("newest");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const pendingName = useRef("");

  /* ---- draft customer state ---- */
  const [resumeDraft, setResumeDraft] = useState<Customer | null>(null);

  /* ---- filter menu state ---- */
  const filterButtonRef = useRef<HTMLButtonElement>(null!);
  const [isMainFilterMenuOpen, setIsMainFilterMenuOpen] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState<MainFilterKey | null>(null);
  const [mainFilterMenuPosition, setMainFilterMenuPosition] = useState({ top: 0, left: 0 });
  const [mainFilterPanelPosition, setMainFilterPanelPosition] = useState({ top: 0, left: 0 });
  const [isMainFilterPanelOpen, setIsMainFilterPanelOpen] = useState(false);

  /* ---- customer column filter dropdown state ---- */
  const customerFilterRef = useRef<HTMLDivElement>(null!);
  const [isCustomerFilterOpen, setIsCustomerFilterOpen] = useState(false);
  const [isCustomerFilterHovered, setIsCustomerFilterHovered] = useState(false);

  /* ---- status column filter dropdown state ---- */
  const statusFilterRef = useRef<HTMLDivElement>(null!);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isStatusFilterHovered, setIsStatusFilterHovered] = useState(false);

  /* ---- date column filter dropdown state ---- */
  const dateFilterRef = useRef<HTMLDivElement>(null!);
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [isDateFilterHovered, setIsDateFilterHovered] = useState(false);

  /* ---------------- effects ---------------- */

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }
    fetchCustomers();
  }, []);

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking inside portal (FilterDropdown renders in portal)
      const portalRoot = document.getElementById('portal-root');
      if (portalRoot && target && portalRoot.contains(target)) {
        return;
      }
      
      // Don't close if clicking inside filter dropdowns
      if (target.closest('.products-column-filter-popover')) {
        return;
      }
      
      // Don't close if clicking on filter headers or buttons
      if (target.closest('.products-th-label-with-filter')) {
        return;
      }
      
      // Don't close if clicking on customer filter dropdown
      if (customerFilterRef.current && customerFilterRef.current.contains(target)) {
        return;
      }

      // Don't close if clicking on status filter dropdown
      if (statusFilterRef.current && statusFilterRef.current.contains(target)) {
        return;
      }

      // Don't close if clicking on date filter dropdown
      if (dateFilterRef.current && dateFilterRef.current.contains(target)) {
        return;
      }
      
      // Don't close if clicking on main filter menu
      if (target.closest('[role="menu"]')) {
        return;
      }
      
      // Don't close if clicking inside DataTable body rows
      if (target.closest('tbody')) {
        return;
      }
      
      // Close filters when clicking anywhere else
      if (isMainFilterMenuOpen || isMainFilterPanelOpen || isCustomerFilterOpen || isStatusFilterOpen || isDateFilterOpen) {
        setIsMainFilterMenuOpen(false);
        setIsMainFilterPanelOpen(false);
        setIsCustomerFilterOpen(false);
        setIsStatusFilterOpen(false);
        setIsDateFilterOpen(false);
      }
      
      // Close hover states when clicking anywhere
      if (isCustomerFilterHovered || isStatusFilterHovered || isDateFilterHovered) {
        setIsCustomerFilterHovered(false);
        setIsStatusFilterHovered(false);
        setIsDateFilterHovered(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMainFilterMenuOpen, isMainFilterPanelOpen, isCustomerFilterOpen, isStatusFilterOpen, isDateFilterOpen, isCustomerFilterHovered, isStatusFilterHovered, isDateFilterHovered]);

  /* ---- attach hover listeners to filterable header cells ---- */
  useEffect(() => {
    const attachHoverListeners = () => {
      const customerHeader = customerFilterRef.current;
      const statusHeader = statusFilterRef.current;
      const dateHeader = dateFilterRef.current;

      if (customerHeader) {
        customerHeader.addEventListener('mouseenter', () => setIsCustomerFilterHovered(true));
        customerHeader.addEventListener('mouseleave', (e) => {
          // Check if mouse is moving to the dropdown
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="customer"]');
          if (dropdown && dropdown.contains(relatedTarget)) {
            return; // Don't close if moving to dropdown
          }
          setIsCustomerFilterHovered(false);
        });
      }

      if (statusHeader) {
        statusHeader.addEventListener('mouseenter', () => setIsStatusFilterHovered(true));
        statusHeader.addEventListener('mouseleave', (e) => {
          // Check if mouse is moving to the dropdown
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="status"]');
          if (dropdown && dropdown.contains(relatedTarget)) {
            return; // Don't close if moving to dropdown
          }
          setIsStatusFilterHovered(false);
        });
      }

      if (dateHeader) {
        dateHeader.addEventListener('mouseenter', () => setIsDateFilterHovered(true));
        dateHeader.addEventListener('mouseleave', (e) => {
          // Check if mouse is moving to the dropdown
          const relatedTarget = e.relatedTarget as HTMLElement;
          const dropdown = document.querySelector('[data-dropdown="date"]');
          if (dropdown && dropdown.contains(relatedTarget)) {
            return; // Don't close if moving to dropdown
          }
          setIsDateFilterHovered(false);
        });
      }
    };

    // Small delay to ensure DOM is rendered
    const timeoutId = setTimeout(attachHoverListeners, 100);

    return () => {
      clearTimeout(timeoutId);
      // Clean up event listeners
      const customerHeader = customerFilterRef.current;
      const statusHeader = statusFilterRef.current;
      const dateHeader = dateFilterRef.current;

      if (customerHeader) {
        customerHeader.removeEventListener('mouseenter', () => setIsCustomerFilterHovered(true));
        customerHeader.removeEventListener('mouseleave', () => {});
      }

      if (statusHeader) {
        statusHeader.removeEventListener('mouseenter', () => setIsStatusFilterHovered(true));
        statusHeader.removeEventListener('mouseleave', () => {});
      }

      if (dateHeader) {
        dateHeader.removeEventListener('mouseenter', () => setIsDateFilterHovered(true));
        dateHeader.removeEventListener('mouseleave', () => {});
      }
    };
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      
      // Show customers immediately without waiting for logos
      const customersWithoutLogos: Customer[] = (data || []).map((c: Customer) => ({
        ...c,
        __resolvedLogoSrc: null, // Will be populated async
      }));
      setCustomers(customersWithoutLogos);

      // Load logos asynchronously in the background (don't block UI)
      customersWithoutLogos.forEach(async (c, index) => {
        if (c.companyLogoUrl) {
          const resolved = await resolveLogoSrc(c.companyLogoUrl);
          if (resolved) {
            // Update just this customer's logo without re-fetching all
            setCustomers(prev => prev.map((cust, i) =>
              i === index ? { ...cust, __resolvedLogoSrc: resolved } : cust
            ));
          }
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- filters ---------------- */

  const companyOptions = useMemo(() => {
    return Array.from(
      new Map(
        customers.map((c) => {
          const id = c.customerId ?? c.id ?? 0;
          return [id, {
            id,
            label: c.companyName || `Customer ${id}`,
          }];
        })
      ).values()
    );
  }, [customers]);

  const customerNameOptions = useMemo(() => {
    return Array.from(
      new Map(
        customers.map((c) => {
          const name = c.customerName || '';
          return [name, { id: name, label: name }];
        })
      ).values()
    ).filter(opt => opt.id);
  }, [customers]);

  const filteredCustomers = customers
    .filter((c) => {
      const q = searchTerm.toLowerCase();
      if (!q) return true;

      const companyName = (c.companyName || '').toLowerCase();
      const customerName = (c.customerName || '').toLowerCase();
      const primaryEmail = (c.primaryEmail || '').toLowerCase();
      const companyType = (c.companyType || '').toLowerCase();
      const status = (c.status || '').toLowerCase();
      const phoneNumber = (c.phoneNumber || '').toLowerCase();
      const customerCity = (c.customerCity || '').toLowerCase();
      const customerState = (c.customerState || '').toLowerCase();
      const customerCountry = (c.customerCountry || '').toLowerCase();
      const billingCity = (c.billingCity || '').toLowerCase();
      const billingState = (c.billingState || '').toLowerCase();
      const billingCountry = (c.billingCountry || '').toLowerCase();

      return (
        companyName.includes(q) ||
        customerName.includes(q) ||
        primaryEmail.includes(q) ||
        companyType.includes(q) ||
        status.includes(q) ||
        phoneNumber.includes(q) ||
        customerCity.includes(q) ||
        customerState.includes(q) ||
        customerCountry.includes(q) ||
        billingCity.includes(q) ||
        billingState.includes(q) ||
        billingCountry.includes(q)
      );
    })
    .filter((c) => {
      if (!selectedStatuses.length) return true;
      const statusKey = (c.status || '').toLowerCase();
      return selectedStatuses.includes(statusKey);
    })
    .filter((c) => {
      if (!selectedCompanyIds.length) return true;
      const id = (c.customerId ?? c.id ?? 0);
      return selectedCompanyIds.some((x) => String(x) === String(id));
    })
    .filter((c) => {
      if (!selectedCustomerNames.length) return true;
      return selectedCustomerNames.includes(c.customerName || '');
    })
    .sort((a, b) => {
      const aStatus = (a.status || '').toLowerCase();
      const bStatus = (b.status || '').toLowerCase();

      const aDraft = aStatus === 'draft';
      const bDraft = bStatus === 'draft';
      if (aDraft && !bDraft) return -1;
      if (!aDraft && bDraft) return 1;

      const parseDate = (d?: string) => {
        if (!d) return 0;
        const t = Date.parse(d);
        return Number.isNaN(t) ? 0 : t;
      };

      const aDate = parseDate(a.createdOn);
      const bDate = parseDate(b.createdOn);

      if (aDate === bDate) return 0;
      if (createdSortOrder === 'oldest') {
        return aDate - bDate;
      }
      return bDate - aDate;
    });

  /* ---------------- delete ---------------- */

  const handleDeleteClick = (id?: number, name?: string) => {
    if (!id) return;
    pendingName.current = name || "";
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteCustomer(deleteId);
    setCustomers((prev) =>
      prev.filter((c) => (c.customerId ?? c.id) !== deleteId)
    );
    setShowDeleteModal(false);
  };

  /* ---- draft customer handlers ---- */
  const handleResumeDraft = (c: Customer) => {
    setResumeDraft(c);
    setShowNewCustomerForm(true);
  };

  const handleCloseForm = () => {
    setShowNewCustomerForm(false);
    setResumeDraft(null);
  };

  /* ---------------- columns ---------------- */

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "companyName",
      title: "Company Name",
      filterable: true,
      ref: customerFilterRef,
      onFilterClick: () => setIsCustomerFilterOpen(true),
      render: (c) => {
        return (
          <div className="cell-flex" style={{ paddingLeft: '16px' }}>
            <div
              className={`customer-logo${c.__resolvedLogoSrc ? " has-image" : " no-image"}`}
              style={c.__resolvedLogoSrc ? {
                backgroundImage: `url(${c.__resolvedLogoSrc})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              } : undefined}
            >
              {!c.__resolvedLogoSrc && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15.8334 17.5V15.8333C15.8334 14.9493 15.4822 14.1014 14.8571 13.4763C14.232 12.8512 13.3841 12.5 12.5001 12.5H7.50008C6.61603 12.5 5.76818 12.8512 5.14306 13.4763C4.51794 14.1014 4.16675 14.9493 4.16675 15.8333V17.5M13.3334 5.83333C13.3334 7.67428 11.841 9.16667 10.0001 9.16667C8.15913 9.16667 6.66675 7.67428 6.66675 5.83333C6.66675 3.99238 8.15913 2.5 10.0001 2.5C11.841 2.5 13.3334 3.99238 13.3334 5.83333Z" stroke="#034A7D" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              )}
            </div>
            <div className="company-block">
              <div className="person-name" title={c.companyName}>{c.companyName}</div>
              <div className="person-email">{c.companyType}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: "customerName",
      title: "Customer",
      render: (c) => (
        <div className="cell-stack">
          <div className="person-name" title={c.customerName || "-"}>{c.customerName || "-"}</div>
          <div className="person-email">{c.primaryEmail || "-"}</div>
        </div>
      ),
    },
    {
      key: "createdOn",
      title: "Created On",
      width: 300,
      render: (c) => (
        <span data-date>{formatDateStr(c.createdOn)}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      filterable: true,
      ref: statusFilterRef,
      onFilterClick: () => setIsStatusFilterOpen(true),
      render: (c) => (
        <div className="status-cell-padded">
          <StatusBadge
            label={c.status.charAt(0) + c.status.slice(1).toLowerCase()}
            variant={c.status.toLowerCase() as Variant}
            size="sm"
          />
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      width: 120,
      render: (c) => {
        const id = c.customerId ?? c.id;
        return (
          <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
            {c.status?.toLowerCase() === "draft" ? (
              <RetryIconButton onClick={() => navigate("/get-started/customers/new", { state: { draftCustomer: c } })} title="Continue editing draft" />
            ) : (
              <EditIconButton onClick={() => navigate(`/get-started/customers/${id}/edit`)} />
            )}
            <DeleteIconButton onClick={() => handleDeleteClick(id, c.companyName)} />
          </div>
        );
      },
    },
  ];

  /* ---------------- render ---------------- */

  return (
    <div className={`check-container ${customers.length > 0 ? 'has-customers' : ''}`}>
      {/* ===== PAGE HEADER (UNCHANGED) ===== */}
      <PageHeader
        title="Customers"
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        searchDisabled={customers.length === 0}
        showPrimary={customers.length > 0}
        primaryLabel="+ New Customer"
        onPrimaryClick={() => navigate("/get-started/customers/new")}
        filterButtonRef={filterButtonRef}
        filterActive={isMainFilterMenuOpen || isMainFilterPanelOpen}
        onFilterClick={() => {
          if (!filterButtonRef.current) return;
          const rect = filterButtonRef.current.getBoundingClientRect();
          setMainFilterMenuPosition({ top: rect.bottom + 8, left: rect.left });
          setIsMainFilterMenuOpen((v) => !v);
          setIsMainFilterPanelOpen(false);
        }}
      />

      {/* ===== FILTER MENUS ===== */}
      {isMainFilterMenuOpen && (
        <MainFilterMenu
          items={[
            { key: "companyName", label: "Company Name" },
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

      {isMainFilterPanelOpen && activeFilterKey === "companyName" && (
        <FilterDropdown
          options={companyOptions}
          value={selectedCompanyIds}
          onChange={setSelectedCompanyIds}
          anchorTop={mainFilterPanelPosition.top}
          anchorLeft={mainFilterPanelPosition.left}
        />
      )}

      {isMainFilterPanelOpen && activeFilterKey === "status" && (
        <SimpleFilterDropdown
          options={[
            { id: "active", label: "Active" },
            { id: "draft", label: "Draft" },
          ]}
          value={selectedStatuses}
          onChange={(v) => setSelectedStatuses(v.map(String))}
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

      {/* ===== CUSTOMER COLUMN FILTER DROPDOWN ===== */}
      {(isCustomerFilterOpen || isCustomerFilterHovered) && customerFilterRef.current && (
        <div data-dropdown="customer">
          <FilterDropdown
            options={customerNameOptions}
            value={selectedCustomerNames}
            onChange={(v) => setSelectedCustomerNames(v.map(String))}
            anchorTop={customerFilterRef.current.getBoundingClientRect().bottom + 8}
            anchorLeft={customerFilterRef.current.getBoundingClientRect().left}
          />
        </div>
      )}

      {/* ===== STATUS COLUMN FILTER DROPDOWN ===== */}
      {(isStatusFilterOpen || isStatusFilterHovered) && statusFilterRef.current && (
        <div data-dropdown="status">
          <SimpleFilterDropdown
            options={[
              { id: "active", label: "Active" },
              { id: "draft", label: "Draft" },
            ]}
            value={selectedStatuses}
            onChange={(v) => setSelectedStatuses(v.map(String))}
            anchorTop={statusFilterRef.current.getBoundingClientRect().bottom + 8}
            anchorLeft={statusFilterRef.current.getBoundingClientRect().left}
          />
        </div>
      )}

      {/* ===== DATE COLUMN FILTER DROPDOWN ===== */}
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
      {isCustomerFilterOpen && customerFilterRef.current && (
        <style>{`.dt-header-cell:nth-child(1) { background-color: var(--color-neutral-200) !important; border-radius: 0 !important; } .dt-header-cell:nth-child(1) .dt-filter-trigger { opacity: 1 !important; pointer-events: auto !important; }`}</style>
      )}
      {isStatusFilterOpen && statusFilterRef.current && (
        <style>{`.dt-header-cell:nth-child(4) { background-color: var(--color-neutral-200) !important; border-radius: 0 !important; } .dt-header-cell:nth-child(4) .dt-filter-trigger { opacity: 1 !important; pointer-events: auto !important; }`}</style>
      )}

      {/* ===== DATA TABLE (FULL HEIGHT) ===== */}
      {!showNewCustomerForm && (
      <DataTable
        columns={columns}
        rows={filteredCustomers}
        rowKey={(c, i) => String(c.customerId ?? c.id ?? i)}
        topContent={
          selectedStatuses.length || selectedCompanyIds.length || selectedCustomerNames.length ? (
            <div className="customers-active-filters-row">
              <div className="customers-active-filters-chips">
                {selectedStatuses.map((s) => (
                  <FilterChip
                    key={s}
                    label={s}
                    onRemove={() =>
                      setSelectedStatuses((prev) => prev.filter((x) => x !== s))
                    }
                  />
                ))}
                {selectedCompanyIds.map((id) => (
                  <FilterChip
                    key={id}
                    label={
                      customers.find((c) => String(c.customerId ?? c.id) === String(id))
                        ?.companyName || ""
                    }
                    onRemove={() =>
                      setSelectedCompanyIds((prev) => prev.filter((x) => x !== id))
                    }
                  />
                ))}
                {selectedCustomerNames.map((name) => (
                  <FilterChip
                    key={name}
                    label={name}
                    onRemove={() =>
                      setSelectedCustomerNames((prev) => prev.filter((x) => x !== name))
                    }
                  />
                ))}
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                <ResetButton
                  label="Reset"
                  onClick={() => {
                    setSelectedStatuses([]);
                    setSelectedCompanyIds([]);
                    setSelectedCustomerNames([]);
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
              <span style={{ color: "#666", fontSize: "14px" }}>Loading customers...</span>
            </div>
          ) : searchTerm.trim() || selectedStatuses.length || selectedCompanyIds.length ? (
            <img src={NoFileSvg} width={170} height={170} />
          ) : (
            <img src={CustomersPlat} width={190} height={190} />
          )
        }
        emptyText={
          isLoading ? (
            undefined
          ) : searchTerm.trim() ? (
            "No customers found for \"" + searchTerm + "\"\nTry searching with different keywords"
          ) : selectedStatuses.length || selectedCompanyIds.length ? (
            "Oops! No matches found with these filters.\nTry adjusting your search or filters"
          ) : (
            "No Customer created yet. Click 'New Customer' \nto create your First Customer."
          )
        }
        emptyAction={
          customers.length === 0 ? (
            <PrimaryButton
              onClick={() => navigate("/get-started/customers/new")}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
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
              New Customer
            </PrimaryButton>
          ) : undefined
        }
      />
      )}

      {showNewCustomerForm ? (
        <CreateCustomer
          onClose={handleCloseForm}
          draftCustomer={resumeDraft ?? undefined}
          initialLogoUrl={resumeDraft?.__resolvedLogoSrc ?? null}
        />
      ) : null}

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        productName={pendingName.current}
        entityType="customer"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default Customers;
