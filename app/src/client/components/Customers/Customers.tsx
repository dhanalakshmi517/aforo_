import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Customers.css";
import styles from "./Customers.module.css";
import "../Rateplan/RatePlan.css";
import CreateCustomer from "./CreateCustomer";
import { getCustomers, deleteCustomer } from "./api";

// ------------ Toast Notification Helpers ------------
interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

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
  const Icon = type === 'success' ? SuccessIcon : ErrorIcon;
  return (
    <div className={`notification ${type === 'error' ? 'error' : ''}`}>
      <div className="notification-icon">
        <Icon />
      </div>
      <div className="notification-text">
        <h5>{type === 'success' ? 'Customer Deleted' : 'Failed to Delete Customer'}</h5>
        <p className="notification-details">{message}</p>
      </div>
    </div>
  );
};

// Reusable status badge from RatePlans
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  const variant = normalized.includes('active') ? 'active' : normalized.includes('draft') ? 'draft' : 'default';
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'N/A';
  return <span className={`status-badge status-badge--${variant}`}>{label}</span>;
};

const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M5.66602 8V6M5.66602 4H5.67102M10.666 6C10.666 8.76142 8.42744 11 5.66602 11C2.90459 11 0.666016 8.76142 0.666016 6C0.666016 3.23858 2.90459 1 5.66602 1C8.42744 1 10.666 3.23858 10.666 6Z" stroke="#98959A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export interface Customer {
  createdOn?: string;  // ISO date string
  id?: number;            // optional because API might return customerId instead
  customerId?: number;    // alternative id field from API
  companyName: string;
  companyType: string;
  status: string;
  companyLogoUrl?: string;
  customerName?: string;

  // Optional detailed contact & address fields (used in EditCustomer)
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
}

interface CustomersProps {
  showNewCustomerForm: boolean;
  setShowNewCustomerForm: (show: boolean) => void;
}

// util to format ISO date to "06 Jan, 2025 08:58 IST"
const formatDateStr = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  // If parse succeeds treat as ISO else assume already formatted string
  if (!isNaN(d.getTime())) {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
      timeZone: 'Asia/Kolkata',
    }).format(d);
    return `${fmt} IST`;
  }
  // fallback: show original (likely already formatted)
  return iso;
};

const Customers: React.FC<CustomersProps> = ({
  showNewCustomerForm,
  setShowNewCustomerForm,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
    // search term for live filtering
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const navigate = useNavigate();

  // open modal
  const handleDeleteClick = (id?: number, name?: string) => {
    if (id == null) return;
    setDeleteId(id);
    setShowDeleteModal(true);
    pendingName.current = name ?? '';
  };

  const pendingName = React.useRef('');
  // confirm and perform deletion
  const confirmDelete = async () => {
    if (deleteId == null) return;
    setIsDeleting(true);
    try {
      await deleteCustomer(deleteId);
      setCustomers(prev => prev.filter(c => (c.customerId ?? c.id) !== deleteId));
      setShowDeleteModal(false);
      setNotification({type:'success', message:`The customer “${pendingName.current}” was successfully deleted.`});
    } catch (err: any) {
      setNotification({type:'error', message:`Failed to delete the customer “${pendingName.current}”. Please try again.`});
    }
  };

  // auto-dismiss notification
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getCustomers();
        setCustomers(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load customers");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNewCustomer = () => {
    setShowNewCustomerForm(true);
  };

  const handleCloseForm = () => {
    setShowNewCustomerForm(false);
  };


  // derive filtered list based on search term (company name or type or status)
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.customerName || '').toLowerCase().includes(term) ||
      (c.companyType || '').toLowerCase().includes(term) ||
      (c.status || '').toLowerCase().includes(term)
    );
  });

  const renderBreadcrumb = () => {
    if (showNewCustomerForm) return null;
    return (
      <div className={styles.breadcrumb}>
        <span className={`${styles.breadcrumbItem} ${styles.active}`}>Customers</span>
        <div className={styles.breadcrumbRight}>
          {/* Bell Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M7.55606 16.5003C7.70234 16.7537 7.91274 16.964 8.16609 17.1103C8.41945 17.2566 8.70684 17.3336 8.99939 17.3336C9.29194 17.3336 9.57933 17.2566 9.83269 17.1103C10.086 16.964 10.2964 16.7537 10.4427 16.5003M1.71772 11.772C1.60886 11.8913 1.53702 12.0397 1.51094 12.1991C1.48486 12.3585 1.50566 12.522 1.57081 12.6698C1.63597 12.8176 1.74267 12.9433 1.87794 13.0316C2.0132 13.1198 2.17121 13.1669 2.33272 13.167H15.6661C15.8276 13.167 15.9856 13.1202 16.1209 13.0321C16.2563 12.944 16.3631 12.8184 16.4285 12.6708C16.4938 12.5231 16.5148 12.3596 16.4889 12.2001C16.4631 12.0407 16.3914 11.8923 16.2827 11.7728C15.1744 10.6303 13.9994 9.41616 13.9994 5.66699C13.9994 4.34091 13.4726 3.06914 12.5349 2.13146C11.5972 1.19378 10.3255 0.666992 8.99939 0.666992C7.67331 0.666992 6.40154 1.19378 5.46386 2.13146C4.52618 3.06914 3.99939 4.34091 3.99939 5.66699C3.99939 9.41616 2.82356 10.6303 1.71772 11.772Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {/* Gear Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9.18236 0.666992H8.81569C8.37366 0.666992 7.94974 0.842587 7.63718 1.15515C7.32462 1.46771 7.14902 1.89163 7.14902 2.33366V2.48366C7.14872 2.77593 7.07157 3.06298 6.92531 3.31602C6.77904 3.56906 6.56881 3.77919 6.31569 3.92533L5.95736 4.13366C5.70399 4.27994 5.41659 4.35695 5.12402 4.35695C4.83146 4.35695 4.54406 4.27994 4.29069 4.13366L4.16569 4.06699C3.78325 3.84638 3.32889 3.78653 2.90236 3.90058C2.47583 4.01464 2.11198 4.29327 1.89069 4.67533L1.70736 4.99199C1.48674 5.37444 1.42689 5.82879 1.54095 6.25532C1.655 6.68185 1.93364 7.0457 2.31569 7.26699L2.44069 7.35033C2.69259 7.49575 2.90204 7.70457 3.04823 7.95602C3.19443 8.20747 3.27227 8.4928 3.27403 8.78366V9.20866C3.27519 9.50234 3.19873 9.79112 3.05239 10.0457C2.90606 10.3004 2.69503 10.5118 2.44069 10.6587L2.31569 10.7337C1.93364 10.955 1.655 11.3188 1.54095 11.7453C1.42689 12.1719 1.48674 12.6262 1.70736 13.0087L1.89069 13.3253C2.11198 13.7074 2.47583 13.986 2.90236 14.1001C3.32889 14.2141 3.78325 14.1543 4.16569 13.9337L4.29069 13.867C4.54406 13.7207 4.83146 13.6437 5.12402 13.6437C5.41659 13.6437 5.70399 13.7207 5.95736 13.867L6.31569 14.0753C6.56881 14.2215 6.77904 14.4316 6.92531 14.6846C7.07157 14.9377 7.14872 15.2247 7.14902 15.517V15.667C7.14902 16.109 7.32462 16.5329 7.63718 16.8455C7.94974 17.1581 8.37366 17.3337 8.81569 17.3337H9.18236C9.62439 17.3337 10.0483 17.1581 10.3609 16.8455C10.6734 16.5329 10.849 16.109 10.849 15.667V15.517C10.8493 15.2247 10.9265 14.9377 11.0727 14.6846C11.219 14.4316 11.4292 14.2215 11.6824 14.0753L12.0407 13.867C12.2941 13.7207 12.5815 13.6437 12.874 13.6437C13.1666 13.6437 13.454 13.7207 13.7074 13.867L13.8324 13.9337C14.2148 14.1543 14.6692 14.2141 15.0957 14.1001C15.5222 13.986 15.8861 13.7074 16.1074 13.3253L16.2907 13.0003C16.5113 12.6179 16.5712 12.1635 16.4571 11.737C16.343 11.3105 16.0644 10.9466 15.6824 10.7253L15.5574 10.6587C15.303 10.5118 15.092 10.3004 14.9457 10.0457C14.7993 9.79112 14.7229 9.50234 14.724 9.20866V8.79199C14.7229 8.50394 14.6434 8.21971 14.4927 7.96861C14.342 7.71751 14.1259 7.50839 13.8657 7.35866L13.7407 7.28366C13.4868 7.13766 13.2769 6.92724 13.1308 6.67395C12.9846 6.42066 12.906 6.13319 12.9074 5.83366V5.417C12.9063 5.12332 12.8299 4.83454 12.6835 4.57991C12.5372 4.32528 12.3261 4.11387 12.0717 3.96783L11.7134 3.75966C11.4603 3.61349 11.2501 3.40317 11.1039 3.15006C10.9578 2.89695 10.8792 2.6096 10.8805 2.31033V2.16699C10.8805 1.72496 10.7049 1.30104 10.3923 0.988478C10.0797 0.675918 9.65579 0.500324 9.21375 0.500324H9.18236Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="customers-container">
      {!showNewCustomerForm ? (
        <>
          {/* <nav className="breadcrumb-nav">
           {/* <nav className="breadcrumb-nav">
            <div className="breadcrumb"><svg className="breadcrumb-back" onClick={() => navigate(-1)} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.834 10.0003H4.16732M4.16732 10.0003L10.0007 4.16699M4.16732 10.0003L10.0007 15.8337" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="breadcrumb-item" onClick={() => navigate('/get-started')}>Get Started</span>
              <span className="breadcrumb-item">/</span>
              <span className="breadcrumb-item">Customers</span>
              <div className={styles.breadcrumbRight}> */}
                {/* Gear icon */}
                 {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9.18236 0.666992H8.81569C8.37366 0.666992 7.94974 0.842587 7.63718 1.15515C7.32462 1.46771 7.14902 1.89163 7.14902 2.33366V2.48366C7.14872 2.77593 7.07157 3.06298 6.92531 3.31602C6.77904 3.56906 6.56881 3.77919 6.31569 3.92533L5.95736 4.13366C5.70399 4.27994 5.41659 4.35695 5.12402 4.35695C4.83146 4.35695 4.54406 4.27994 4.29069 4.13366L4.16569 4.06699C3.78325 3.84638 3.32889 3.78653 2.90236 3.90058C2.47583 4.01464 2.11198 4.29327 1.89069 4.67533L1.70736 4.99199C1.48674 5.37444 1.42689 5.82879 1.54095 6.25532C1.655 6.68185 1.93364 7.0457 2.31569 7.26699L2.44069 7.35033C2.69259 7.49575 2.90204 7.70457 3.04823 7.95602C3.19443 8.20747 3.27227 8.4928 3.27403 8.78366V9.20866C3.27519 9.50234 3.19873 9.79112 3.05239 10.0457C2.90606 10.3004 2.69503 10.5118 2.44069 10.6587L2.31569 10.7337C1.93364 10.955 1.655 11.3188 1.54095 11.7453C1.42689 12.1719 1.48674 12.6262 1.70736 13.0087L1.89069 13.3253C2.11198 13.7074 2.47583 13.986 2.90236 14.1001C3.32889 14.2141 3.78325 14.1543 4.16569 13.9337L4.29069 13.867C4.54406 13.7207 4.83146 13.6437 5.12402 13.6437C5.41659 13.6437 5.70399 13.7207 5.95736 13.867L6.31569 14.0753C6.56881 14.2215 6.77904 14.4316 6.92531 14.6846C7.07157 14.9377 7.14872 15.2247 7.14902 15.517V15.667C7.14902 16.109 7.32462 16.5329 7.63718 16.8455C7.94974 17.1581 8.37366 17.3337 8.81569 17.3337H9.18236C9.62439 17.3337 10.0483 17.1581 10.3609 16.8455C10.6734 16.5329 10.849 16.109 10.849 15.667V15.517C10.8493 15.2247 10.9265 14.9377 11.0727 14.6846C11.219 14.4316 11.4292 14.2215 11.6824 14.0753L12.0407 13.867C12.2941 13.7207 12.5815 13.6437 12.874 13.6437C13.1666 13.6437 13.454 13.7207 13.7074 13.867L13.8324 13.9337C14.2148 14.1543 14.6692 14.2141 15.0957 14.1001C15.5222 13.986 15.8861 13.7074 16.1074 13.3253L16.2907 13.0003C16.5113 12.6179 16.5712 12.1635 16.4571 11.737C16.343 11.3105 16.0644 10.9466 15.6824 10.7253L15.5574 10.6587C15.303 10.5118 15.092 10.3004 14.9457 10.0457C14.7993 9.79112 14.7229 9.50234 14.724 9.20866V8.79199C14.7229 8.49831 14.7993 8.20953 14.9457 7.9549C15.092 7.70027 15.303 7.48883 15.5574 7.34199L15.6824 7.26699C16.0644 7.0457 16.343 6.68185 16.4571 6.25532C16.5712 5.82879 16.5113 5.37444 16.2907 4.99199L16.1074 4.67533C15.8861 4.29327 15.5222 4.01464 15.0957 3.90058C14.6692 3.78653 14.2148 3.84638 13.8324 4.06699L13.7074 4.13366C13.454 4.27994 13.1666 4.35695 12.874 4.35695C12.5815 4.35695 12.2941 4.27994 12.0407 4.13366L11.6824 3.92533C11.4292 3.77919 11.219 3.56906 11.0727 3.31602C10.9265 3.06298 10.8493 2.77593 10.849 2.48366V2.33366C10.849 1.89163 10.6734 1.46771 10.3609 1.15515C10.0483 0.842587 9.62439 0.666992 9.18236 0.666992Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8.99902 11.5003C10.3797 11.5003 11.499 10.381 11.499 9.00033C11.499 7.61961 10.3797 6.50033 8.99902 6.50033C7.61831 6.50033 6.49902 7.61961 6.49902 9.00033C6.49902 10.381 7.61831 11.5003 8.99902 11.5003Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg> */}
                {/* Bell icon */}
                {/* <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M8.55606 17.5003C8.70234 17.7537 8.91274 17.964 9.16609 18.1103C9.41945 18.2566 9.70684 18.3336 9.99939 18.3336C10.2919 18.3336 10.5793 18.2566 10.8327 18.1103C11.086 17.964 11.2964 17.7537 11.4427 17.5003M2.71772 12.772C2.60886 12.8913 2.53702 13.0397 2.51094 13.1991C2.48486 13.3585 2.50566 13.522 2.57081 13.6698C2.63597 13.8176 2.74267 13.9433 2.87794 14.0316C3.0132 14.1198 3.17121 14.1669 3.33272 14.167H16.6661C16.8276 14.167 16.9856 14.1202 17.1209 14.0321C17.2563 13.944 17.3631 13.8184 17.4285 13.6708C17.4938 13.5231 17.5148 13.3596 17.4889 13.2001C17.4631 13.0407 17.3914 12.8923 17.2827 12.7728C16.1744 11.6303 14.9994 10.4162 14.9994 6.66699C14.9994 5.34091 14.4726 4.06914 13.5349 3.13146C12.5972 2.19378 11.3255 1.66699 9.99939 1.66699C8.67331 1.66699 7.40154 2.19378 6.46386 3.13146C5.52618 4.06914 4.99939 5.34091 4.99939 6.66699C4.99939 10.4162 3.82356 11.6303 2.71772 12.772Z" stroke="#706C72" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div> 
            </div>
          </nav> */}
          {renderBreadcrumb()}
          <div className="customers-header">
            <h2>Customers</h2>
            <div className="customers-actions">
              <div className="products-search">
                {/* <svg
                  className="search-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M17.5 17.5L13.8833 13.8833M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg> */}
                <input
                  type="search"
                  placeholder="Search among your customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="products-search-input"
                />
              </div>
              <button className="sam-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667"
                    stroke="#706C72"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button className="new-customer-btn" onClick={handleNewCustomer}>
                + New Customer
              </button>
            </div>
          </div>

          <div className="customers-table-wrapper">
            <table className="customers-table">
            <thead>
              <tr>
                <th>Customer Name <InfoIcon /></th>
                <th>Company Type <InfoIcon /></th>
                <th>Status <InfoIcon /></th>
                <th>Created On <InfoIcon /></th>
                <th className="actions-cell">Actions<InfoIcon /></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5}>Loading...</td>
                </tr>
              )}
              {errorMsg && (
                <tr>
                  <td colSpan={5}>{errorMsg}</td>
                </tr>
              )}
              {customers.length === 0 && !loading && !errorMsg && (
                <tr>
                  <td colSpan={5}>No customers found</td>
                </tr>
              )}
              {filteredCustomers.map((customer) => (
                <tr key={customer.customerId ?? customer.id}>
                  <td className="name-cell">
                    {customer.companyLogoUrl && (
                      <img
                        src={`http://43.206.110.213:8081${customer.companyLogoUrl}`}
                        alt={`${customer.customerName ?? customer.companyName} logo`}
                        className="customer-logo"
                      />
                    )}
                    <div className="name-email">
                      <div className="name">{customer.customerName ?? customer.companyName}</div>
                      <div className="email">{customer.primaryEmail ?? '-'}</div>
                    </div>
                  </td>
                  <td>{customer.companyType}</td>
                  <td><StatusBadge status={customer.status} /></td>
                  <td>{formatDateStr(customer.createdOn)}</td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/get-started/customers/${customer.customerId ?? customer.id}/edit`} className="edit-button" aria-label="edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                                <path d="M8.59894 13.3332H14.5989M11.5163 2.41449C11.7817 2.1491 12.1416 2 12.5169 2C12.8923 2 13.2522 2.1491 13.5176 2.41449C13.783 2.67988 13.9321 3.03983 13.9321 3.41516C13.9321 3.79048 13.783 4.15043 13.5176 4.41582L5.51094 12.4232C5.35234 12.5818 5.15629 12.6978 4.94094 12.7605L3.02628 13.3192C2.96891 13.3359 2.9081 13.3369 2.85022 13.3221C2.79233 13.3072 2.73949 13.2771 2.69724 13.2349C2.65499 13.1926 2.62487 13.1398 2.61004 13.0819C2.59521 13.024 2.59621 12.9632 2.61294 12.9058L3.17161 10.9912C3.23442 10.776 3.35044 10.5802 3.50894 10.4218L11.5163 2.41449Z" stroke="#1D7AFC" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                      </Link>
                      <button className="product-delete-button" aria-label="delete" onClick={() => handleDeleteClick((customer.customerId ?? customer.id)!, customer.customerName ?? customer.companyName)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M2 3.99967H14M12.6667 3.99967V13.333C12.6667 13.9997 12 14.6663 11.3333 14.6663H4.66667C4 14.6663 3.33333 13.9997 3.33333 13.333V3.99967M5.33333 3.99967V2.66634C5.33333 1.99967 6 1.33301 6.66667 1.33301H9.33333C10 1.33301 10.6667 1.99967 10.6667 2.66634V3.99967M6.66667 7.33301V11.333M9.33333 7.33301V11.333" stroke="#E34935" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      ) : (
        <CreateCustomer onClose={handleCloseForm} />
      ) }
    {notification && <Notification type={notification.type} message={notification.message} />}
    {showDeleteModal && (
        <div className="rate-delete-modal-overlay">
          <div className="rate-delete-modal-content">
            <div className="rate-delete-modal-body">
              <h5>Are you sure you want to delete this <br />customer?</h5>
              <p>This action cannot be undone.</p>
            </div>
            <div className="rate-delete-modal-footer">
              <button className="rate-delete-modal-cancel" onClick={() => setShowDeleteModal(false)}>Back</button>
              <button className="rate-delete-modal-confirm" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Customers;
