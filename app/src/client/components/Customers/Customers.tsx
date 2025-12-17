import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Customers.css";
import "../Rateplan/RatePlan.css";
import PageHeader from "../PageHeader/PageHeader";
import CreateCustomer from "./CreateCustomer";
import { getCustomers, deleteCustomer } from "./api";
import { getAuthHeaders, isAuthenticated } from "../../utils/auth";
import { ToastProvider, useToast } from '../componenetsss/ToastProvider';
import EditIconButton from '../componenetsss/EditIconButton';
import DeleteIconButton from '../componenetsss/DeleteIconButton';
import RetryIconButton from '../componenetsss/RetryIconButton';
import PrimaryButton from "../componenetsss/PrimaryButton";
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import StatusBadge, { Variant } from '../componenetsss/StatusBadge';
import VerticalScrollbar from '../componenetsss/VerticalScrollbar';
import CustomersPlat from './customers-plat.svg';
import { Checkbox } from '../componenetsss/Checkbox';
import FilterChip from '../componenetsss/FilterChip';

interface NotificationState { type: "success" | "error"; message: string; }

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

const Notification: React.FC<NotificationState> = ({ type, message }) => {
  const Icon = type === "success" ? SuccessIcon : ErrorIcon;
  return (
    <div className={`notification ${type === "error" ? "error" : ""}`}>
      <div className="notification-icon"><Icon /></div>
      <div className="notification-text">
        <h5>{type === "success" ? "Customer Deleted" : "Failed to Delete Customer"}</h5>
        <p className="notification-details">{message}</p>
      </div>
    </div>
  );
};

const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M5.66602 8V6M5.66602 4H5.67102M10.666 6C10.666 8.76142 8.42744 11 5.66602 11C2.90459 11 0.666016 8.76142 0.666016 6C0.666016 3.23858 2.90459 1 5.66602 1C8.42744 1 10.666 3.23858 10.666 6Z" stroke="#98959A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface Customer {
  createdOn?: string;
  id?: number;
  customerId?: number;
  companyName: string;
  companyType: string;
  status: string;
  companyLogoUrl?: string;
  customerName?: string;

  phoneNumber?: string;
  primaryEmail?: string;
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

interface CustomersProps {
  showNewCustomerForm: boolean;
  setShowNewCustomerForm: (show: boolean) => void;
}

const formatDateStr = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (!isNaN(d.getTime())) {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(d);
    return `${fmt} IST`;
  }
  return iso;
};

const FILE_HOST = "http://44.201.19.187:8081";
const absolutizeUpload = (path: string) => {
  const clean = path.replace(/\\/g, "/").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  // Ensure single slash between host and path
  const separator = clean.startsWith("/") ? "" : "/";
  return `${FILE_HOST}${separator}${clean}`;
};

const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = absolutizeUpload(uploadPath);

  // Skip direct URL check - it always fails with 401
  // Go straight to authenticated fetch for faster loading
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

const initialsFrom = (name?: string) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join("") || "•";

const prettyType = (t?: string) =>
  (t || "-").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

const Customers: React.FC<CustomersProps> = ({ showNewCustomerForm, setShowNewCustomerForm }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [createdSortOrder, setCreatedSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const { showToast } = useToast();

  // NEW: resume draft payload
  const [resumeDraft, setResumeDraft] = useState<Customer | null>(null);

  const pendingName = useRef("");
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement | null>(null);
  const createdSortRef = useRef<HTMLDivElement | null>(null);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const [isCreatedSortOpen, setIsCreatedSortOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/signin");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    return () => {
      customers.forEach((c) => {
        if (c.__resolvedLogoSrc && c.__resolvedLogoSrc.startsWith("blob:")) {
          URL.revokeObjectURL(c.__resolvedLogoSrc);
        }
      });
    };
  }, [customers]);

  // Close popovers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (statusFilterRef.current && target && !statusFilterRef.current.contains(target)) {
        setIsStatusFilterOpen(false);
      }

      if (createdSortRef.current && target && !createdSortRef.current.contains(target)) {
        setIsCreatedSortOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDeleteClick = (id?: number, name?: string) => {
    if (id == null) return;
    setDeleteId(id);
    setShowDeleteModal(true);
    pendingName.current = name ?? "";
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deleteId);
      setCustomers(prev => prev.filter(c => (c.customerId ?? c.id) !== deleteId));
      setShowDeleteModal(false);
      showToast({
        kind: "success",
        title: "Customer Deleted",
        message: `The customer "${pendingName.current}" was successfully deleted.`,
        duration: 5000
      });
    } catch {
      setNotification({ type: "error", message: `Failed to delete the customer "${pendingName.current}". Please try again.` });
    } finally {
      setIsDeleting(false);
    }
  };

  const fetchCustomersAndLogos = async () => {
    if (!isAuthenticated()) return;
    try {
      setLoading(true);
      const data = await getCustomers();

      // Show customers immediately without waiting for logos
      const customersWithoutLogos: Customer[] = (data || []).map((c: Customer) => ({
        ...c,
        __resolvedLogoSrc: null, // Will be populated async
      }));
      setCustomers(customersWithoutLogos);
      setLoading(false);

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
    } catch (err: any) {
      if (err.message?.includes("Session expired") || err.message?.includes("Not authenticated")) return;
      setErrorMsg(err.message || "Failed to load customers");
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkOverflow = () => {
      if (tableWrapperRef.current) {
        const isOverflowing = tableWrapperRef.current.scrollHeight > tableWrapperRef.current.clientHeight;
        setHasOverflow(isOverflowing);
      }
    };

    const handleScroll = () => {
      if (tableWrapperRef.current) {
        setScrollPosition(tableWrapperRef.current.scrollTop);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    tableWrapperRef.current?.addEventListener('scroll', handleScroll);

    // Also check after a small delay to ensure DOM is fully rendered
    const timer = setTimeout(checkOverflow, 100);

    return () => {
      window.removeEventListener('resize', checkOverflow);
      tableWrapperRef.current?.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [customers]);

  useEffect(() => { fetchCustomersAndLogos(); }, []);
  useEffect(() => { if (!showNewCustomerForm) fetchCustomersAndLogos(); }, [showNewCustomerForm]);

  const handleNewCustomer = () => {
    navigate('/get-started/customers/new');
  };
  const handleCloseForm = () => {
    setShowNewCustomerForm(false);
    setResumeDraft(null); // reset so next "New Customer" is clean
  };

  // NEW: Resume Draft → open Create flow with prefill
  const handleResumeDraft = (c: Customer) => {
    setResumeDraft(c);
    setShowNewCustomerForm(true);
  };

  const filteredCustomers = customers.filter(c => {
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
  // Status filter
  .filter((c) => {
    if (selectedStatuses.length === 0) return true;
    const statusKey = (c.status || '').toLowerCase();
    return selectedStatuses.includes(statusKey);
  })
  // Sort: drafts first, then by createdOn according to createdSortOrder
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

  const searchDisabled = customers.length === 0 && !loading && !errorMsg;

  return (
    <div className="check-container">
      {!showNewCustomerForm ? (
        <>
          <PageHeader
            title="Customers"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            primaryLabel={customers.length > 0 ? " + New Customer" : ""}
            onPrimaryClick={handleNewCustomer}
            onFilterClick={() => { }}
            searchDisabled={searchDisabled}
            filterDisabled={customers.length === 0}
            showPrimary={customers.length > 0}
            showIntegrations={customers.length > 0} // Add this line

          />

          {selectedStatuses.length > 0 && (
            <div className="products-active-filters-row">
              <div className="products-active-filters-chips">
                {selectedStatuses.map((s) => (
                  <FilterChip
                    key={s}
                    label={s.charAt(0).toUpperCase() + s.slice(1)}
                    onRemove={() =>
                      setSelectedStatuses((prev) => prev.filter((x) => x !== s))
                    }
                  />
                ))}
              </div>
              <button
                type="button"
                className="products-filters-reset"
                onClick={() => {
                  setSelectedStatuses([]);
                }}
              >
                Clear all
              </button>
            </div>
          )}

          <div className="customers-table-wrapper" ref={tableWrapperRef}>
            <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <table className="customers-table">
                  <thead>
                    <tr>
                      <th>Company Name </th>
                      <th>Customer </th>
                      <th className="products-th-with-filter">
                        <div
                          ref={createdSortRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => setIsCreatedSortOpen(true)}
                        >
                          <span>Created On </span>
                          <button
                            type="button"
                            className={`products-column-filter-trigger ${
                              isCreatedSortOpen ? 'is-open' : ''
                            }`}
                            aria-label="Sort by created date"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M10.5 8L8.5 10M8.5 10L6.5 8M8.5 10L8.5 2M1.5 4L3.5 2M3.5 2L5.5 4M3.5 2V10"
                                stroke="#25303D"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {isCreatedSortOpen && (
                            <div
                              className="products-column-filter-popover products-createdon-popover"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                className={`products-sort-option ${
                                  createdSortOrder === 'newest' ? 'is-active' : ''
                                }`}
                                onClick={() => {
                                  setCreatedSortOrder('newest');
                                  setIsCreatedSortOpen(false);
                                }}
                              >
                                <span className="products-sort-option-icon">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13"
                                    height="13"
                                    viewBox="0 0 13 13"
                                    fill="none"
                                  >
                                    <path
                                      d="M0.600098 6.43294L6.43343 0.599609M6.43343 0.599609L12.2668 6.43294M6.43343 0.599609V12.2663"
                                      stroke="#25303D"
                                      strokeWidth="1.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                                <span className="products-sort-option-label">Newest first</span>
                              </button>

                              <button
                                type="button"
                                className={`products-sort-option ${
                                  createdSortOrder === 'oldest' ? 'is-active' : ''
                                }`}
                                onClick={() => {
                                  setCreatedSortOrder('oldest');
                                  setIsCreatedSortOpen(false);
                                }}
                              >
                                <span className="products-sort-option-icon">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M11.8333 6V17.6667M11.8333 17.6667L17.6667 11.8333M11.8333 17.6667L6 11.8333"
                                      stroke="#25303D"
                                      strokeWidth="1.2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                                <span className="products-sort-option-label">Oldest first</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="products-th-with-filter">
                        <div
                          ref={statusFilterRef}
                          className="products-th-label-with-filter"
                          onMouseEnter={() => setIsStatusFilterOpen(true)}
                        >
                          <span>Status </span>
                          <button
                            type="button"
                            className={`products-column-filter-trigger ${
                              isStatusFilterOpen ? 'is-open' : ''
                            }`}
                            aria-label="Filter by status"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="11"
                              height="8"
                              viewBox="0 0 11 8"
                              fill="none"
                            >
                              <path
                                d="M0.600098 0.599609H9.6001M2.6001 3.59961H7.6001M4.1001 6.59961H6.1001"
                                stroke="#19222D"
                                strokeWidth="1.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {isStatusFilterOpen && (
                            <div
                              className="products-column-filter-popover"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="products-column-filter-list">
                                {['active', 'draft'].map((statusKey) => (
                                  <div
                                    key={statusKey}
                                    className="products-column-filter-list-item"
                                  >
                                    <Checkbox
                                      checked={selectedStatuses.includes(statusKey)}
                                      onChange={(checked) => {
                                        setSelectedStatuses((prev) => {
                                          if (checked) {
                                            if (prev.includes(statusKey)) return prev;
                                            return [...prev, statusKey];
                                          }
                                          return prev.filter((x) => x !== statusKey);
                                        });
                                      }}
                                      label={
                                        statusKey.charAt(0).toUpperCase() + statusKey.slice(1)
                                      }
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </th>
                      <th className="actions-cell">Actions </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading && customers.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                          <div className="customers-loading-state">
                            <div className="spinner"></div>
                            <p style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>Loading customers...</p>
                          </div>
                        </td>
                      </tr>
                    ) : errorMsg ? (
                      <tr><td colSpan={5}>{errorMsg}</td></tr>
                    ) : customers.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                          <div className="customers-empty-state">
                            <img src={CustomersPlat} alt="No customers" style={{ width: '190px', height: '190px' }} />
                            <p className="customers-empty-state-text" >
                              No Customer created yet. Click "New Customer"<br /> to create your first Customer.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                              <PrimaryButton onClick={() => setShowNewCustomerForm(true)}>
                                + New Customer
                              </PrimaryButton>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}

                    {filteredCustomers.map((customer) => {
                      const id = customer.customerId ?? customer.id;
                      const companyTitle = customer.companyName || "-";
                      const personTitle = customer.customerName || "-";
                      const initials = initialsFrom(companyTitle);
                      const imgSrc = customer.__resolvedLogoSrc ?? null;
                      const logoClass = `customer-logo${imgSrc ? " has-image" : " no-image"}`;


                      return (
                        <tr key={id}>
                          {/* 1) Company Name */}
                          <td className="name-cell">
                            <div className="cell-flex">
                              <div
                                className={logoClass}
                                aria-label={`${companyTitle} logo`}
                                role="img"
                                style={imgSrc ? {
                                  backgroundImage: `url(${imgSrc})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat'
                                } : undefined}
                              >
                                {!imgSrc && <span className="avatar-initials">{initials}</span>}
                              </div>
                              <div className="company-block">
                                <div className="company-name">{companyTitle}</div>
                                <div className="company-type">{prettyType(customer.companyType)}</div>
                              </div>
                            </div>
                          </td>

                          {/* 2) Customer */}
                          <td className="customer-cell">
                            <div className="cell-stack">
                              <div className="person-name">{personTitle}</div>
                              <div className="person-email">{customer.primaryEmail ?? "-"}</div>
                            </div>
                          </td>

                          {/* 3) Created On */}
                          <td>{formatDateStr(customer.createdOn)}</td>

                          {/* 4) Status */}
                          <td>
                            <StatusBadge
                              label={customer.status ? customer.status.charAt(0).toUpperCase() + customer.status.slice(1).toLowerCase() : "N/A"}
                              variant={customer.status?.toLowerCase().includes("active") ? "active" : customer.status?.toLowerCase().includes("draft") ? "draft" : "archived" as Variant}
                              size="sm"
                            />
                          </td>

                          {/* 5) Actions */}
                          <td className="actions-cell">
                            <div className="product-action-buttons">
                              {customer.status?.toLowerCase() === "draft" ? (
                                <RetryIconButton
                                  onClick={() => handleResumeDraft(customer)}
                                  title="Continue editing draft"
                                />
                              ) : (
                                <EditIconButton
                                  onClick={() => navigate(`/get-started/customers/${id}/edit`)}
                                  title="Edit customer"
                                />
                              )}
                              <DeleteIconButton
                                onClick={() => handleDeleteClick(id!, companyTitle)}
                                title="Delete customer"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {hasOverflow && tableWrapperRef.current && (
                <div
                  className="scrollbar-container-customers"
                  style={{
                    transform: `translateY(${(scrollPosition / (tableWrapperRef.current.scrollHeight - tableWrapperRef.current.clientHeight)) * (tableWrapperRef.current.clientHeight - 49)}px)`
                  }}
                >
                  <VerticalScrollbar color="#C3C2D0" thickness={4} />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <CreateCustomer
          onClose={handleCloseForm}
          // NEW: pass draft to prefill Create flow when resuming
          draftCustomer={resumeDraft ?? undefined}
          initialLogoUrl={resumeDraft?.__resolvedLogoSrc ?? null}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        productName={pendingName.current || "this customer"}
        entityType="customer"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {notification && <Notification type={notification.type} message={notification.message} />}
    </div>
  );
};
export default Customers;
