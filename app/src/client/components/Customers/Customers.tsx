import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Customers.css";
import "../Rateplan/RatePlan.css";
import PageHeader from "../PageHeader/PageHeader";
import CreateCustomer from "./CreateCustomer";
import SuccessToast from "./SuccessToast";
import { getCustomers, deleteCustomer } from "./api";
import { getAuthHeaders, isAuthenticated } from "../../utils/auth";
import PrimaryButton from "../componenetsss/PrimaryButton";

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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = (status || "").toLowerCase();
  const variant = normalized.includes("active") ? "active" : normalized.includes("draft") ? "draft" : "default";
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "N/A";
  return <span className={`status-badge status-badge--${variant}`}>{label}</span>;
};

const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M5.66602 8V6M5.66602 4H5.67102M10.666 6C10.666 8.76142 8.42744 11 5.66602 11C2.90459 11 0.666016 8.76142 0.666016 6C0.666016 3.23858 2.90459 1 5.66602 1C8.42744 1 10.666 3.23858 10.666 6Z" stroke="#98959A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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

const FILE_HOST = "http://43.206.110.213:8081";
const absolutizeUpload = (path: string) => {
  const clean = path.replace(/\\/g, "/").trim();
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${FILE_HOST}${clean.startsWith("/") ? "" : "/"}${clean}`;
};

const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = encodeURI(absolutizeUpload(uploadPath));
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { ...getAuthHeaders(), Accept: "image/*" },
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // NEW: resume draft payload
  const [resumeDraft, setResumeDraft] = useState<Customer | null>(null);

  const pendingName = useRef("");
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
      setToastMessage(`The customer "${pendingName.current}" was successfully deleted.`);
      setShowSuccessToast(true);
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
      const withLogos: Customer[] = await Promise.all(
        (data || []).map(async (c: Customer) => ({
          ...c,
          __resolvedLogoSrc: await resolveLogoSrc(c.companyLogoUrl),
        }))
      );
      setCustomers(withLogos);
    } catch (err: any) {
      if (err.message?.includes("Session expired") || err.message?.includes("Not authenticated")) return;
      setErrorMsg(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomersAndLogos(); }, []);
  useEffect(() => { if (!showNewCustomerForm) fetchCustomersAndLogos(); }, [showNewCustomerForm]);

  const handleNewCustomer = () => {
    setResumeDraft(null);
    setShowNewCustomerForm(true);
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
    const term = searchTerm.toLowerCase();
    return (
      (c.companyName || "").toLowerCase().includes(term) ||
      (c.customerName || "").toLowerCase().includes(term) ||
      (c.primaryEmail || "").toLowerCase().includes(term) ||
      (c.companyType || "").toLowerCase().includes(term) ||
      (c.status || "").toLowerCase().includes(term)
    );
  });

  const searchDisabled = customers.length === 0 && !loading && !errorMsg;

  return (
    <div className="customers-container">
      {!showNewCustomerForm ? (
        <>
          <PageHeader
            title="Customers"
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            primaryLabel="New Customer"
            onPrimaryClick={handleNewCustomer}
            onFilterClick={() => {}}
            searchDisabled={searchDisabled}
          />

          <div className="customers-table-wrapper">
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Company Name <InfoIcon /></th>
                  <th>Customer <InfoIcon /></th>
                  <th>Status <InfoIcon /></th>
                  <th>Created On <InfoIcon /></th>
                  <th className="actions-cell">Actions <InfoIcon /></th>
                </tr>
              </thead>

              <tbody>
                {loading && <tr><td colSpan={5}>Loading...</td></tr>}
                {errorMsg && <tr><td colSpan={5}>{errorMsg}</td></tr>}
                {customers.length === 0 && !loading && !errorMsg && (
                  <tr><td colSpan={5}>No customers found</td></tr>
                )}

                {filteredCustomers.map((customer) => {
                  const id = customer.customerId ?? customer.id;
                  const companyTitle = customer.companyName || "-";
                  const personTitle  = customer.customerName || "-";
                  const initials = initialsFrom(companyTitle);
                  const imgSrc = customer.__resolvedLogoSrc ?? null;

                  return (
                    <tr key={id}>
                      {/* 1) Company Name */}
                      <td className="name-cell">
                        <div className="cell-flex">
                          <div
                            className={`customer-logo${imgSrc ? " has-image" : " no-image"}`}
                            aria-label={`${companyTitle} logo`}
                            role="img"
                          >
                            {imgSrc ? <img className="customer-logo-img" src={imgSrc} alt="" /> : null}
                            <span className="avatar-initials">{initials}</span>
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

                      {/* 3) Status */}
                      <td><StatusBadge status={customer.status} /></td>

                      {/* 4) Created On */}
                      <td>{formatDateStr(customer.createdOn)}</td>

                      {/* 5) Actions */}
                      <td className="actions-cell">
                        <div className="action-buttons">
                          {customer.status?.toLowerCase() === "draft" ? (
                            // UPDATED: open Create flow with prefill instead of Edit route
                            <PrimaryButton
                              type="button"
                              className="resume-button"
                              onClick={() => handleResumeDraft(customer)}
                              aria-label="Resume Draft"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
                                <path d="M11.75 3.25a5.5 5.5 0 1 1-7.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M5.25 8h5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M8.5 6l2.25 2-2.25 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </PrimaryButton>
                          ) : (
                            <Link to={`/get-started/customers/${id}/edit`} className="edit-button" title="Edit" aria-label="Edit">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M7.99933 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </Link>
                          )}
                          <button
                            className="delete-button"
                            title="Delete"
                            aria-label="Delete"
                            onClick={() => handleDeleteClick(id!, companyTitle)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
      {showDeleteModal && (
        <div className="rate-delete-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cust-delete-title">
          <div className="rate-delete-modal-content">
            <div className="rate-delete-modal-body">
              <h5 id="cust-delete-title">Delete this customer?</h5>
              <p>This action cannot be undone.</p>
            </div>
            <div className="rate-delete-modal-footer">
              <button className="rate-delete-modal-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="rate-delete-modal-confirm" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && <Notification type={notification.type} message={notification.message} />}
      {showSuccessToast && (
        <SuccessToast title="Customer Deleted" message={toastMessage} onClose={() => setShowSuccessToast(false)} />
      )}
    </div>
  );
};
export default Customers;

