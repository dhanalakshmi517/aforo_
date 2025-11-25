import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastProvider, useToast } from '../componenetsss/ToastProvider';
import EditIconButton from '../componenetsss/EditIconButton';
import DeleteIconButton from '../componenetsss/DeleteIconButton';
import RetryIconButton from '../componenetsss/RetryIconButton';
import { Api, Subscription as SubscriptionType } from './api';
import CreateSubscription from './CreateSubscription';
import EditSubscription from './EditSubscriptions/EditSubscription';
import ConfirmDeleteModal from '../componenetsss/ConfirmDeleteModal';
import './Subscriptions.css';
import '../Rateplan/RatePlan.css';
import PageHeader from '../PageHeader/PageHeader';
import { getAuthHeaders } from '../../utils/auth';
import PrimaryButton from '../componenetsss/PrimaryButton';
import StatusBadge, { Variant } from '../componenetsss/StatusBadge';

// Empty cart SVG icon (file URL)
import purchaseSvg from './purchase.svg';

// ---- helpers (mirror Customers.tsx / RatePlans.tsx) ----
const initialsFrom = (name?: string) =>
  (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]!.toUpperCase())
    .join('') || '•';

const formatIST = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const fmt = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'Asia/Kolkata'
  }).format(d);
  return `${fmt} IST`;
};

// Payment pill (same visuals as RatePlans.tsx)
const PaymentPill: React.FC<{ value?: string }> = ({ value }) => {
  const raw = String(value || '').trim().toUpperCase().replace(/[_-]/g, '');
  if (raw === 'PREPAID') {
    return (
      <span className="pill pill--prepaid">
        <span className="pill-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <g clipPath="url(#clip0_prepaid)">
              <path d="M12.0597 6.9135C12.6899 7.14845 13.2507 7.53852 13.6902 8.04763C14.1297 8.55674 14.4337 9.16846 14.5742 9.82621C14.7146 10.484 14.6869 11.1665 14.4937 11.8107C14.3005 12.4549 13.9479 13.04 13.4686 13.5119C12.9893 13.9838 12.3988 14.3272 11.7517 14.5103C11.1045 14.6935 10.4216 14.7105 9.76613 14.5598C9.11065 14.4091 8.50375 14.0956 8.00156 13.6482C7.49937 13.2008 7.1181 12.634 6.89301 12.0002M4.66634 4.00016H5.33301V6.66683M11.1397 9.2535L11.6063 9.72683L9.72634 11.6068M9.33301 5.3335C9.33301 7.54264 7.54215 9.3335 5.33301 9.3335C3.12387 9.3335 1.33301 7.54264 1.33301 5.3335C1.33301 3.12436 3.12387 1.3335 5.33301 1.3335C7.54215 1.3335 9.33301 3.12436 9.33301 5.3335Z" stroke="#1A2126" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs><clipPath id="clip0_prepaid"><rect width="16" height="16" fill="white"/></clipPath></defs>
          </svg>
        </span>
        Pre-paid
      </span>
    );
  }
  if (raw === 'POSTPAID') {
    return (
      <span className="pill pill--postpaid">
        <span className="pill-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4.2126 13.8002C3.09153 13.8002 2.14253 13.4117 1.3656 12.6348C0.588662 11.8579 0.200195 10.9089 0.200195 9.7878C0.200195 9.31713 0.280462 8.85973 0.440995 8.4156C0.601529 7.97146 0.831529 7.56893 1.131 7.208L3.53833 4.31282C3.79189 4.00787 3.84128 3.58189 3.66422 3.22701L2.8757 1.64665C2.54398 0.981803 3.02749 0.200195 3.77051 0.200195H10.2299C10.9729 0.200195 11.4564 0.981804 11.1247 1.64666L10.3362 3.22701C10.1591 3.58189 10.2085 4.00787 10.4621 4.31282L12.8694 7.208C13.1689 7.56893 13.3989 7.97146 13.5594 8.4156C13.7199 8.85973 13.8002 9.31713 13.8002 9.7878C13.8002 10.9089 13.4097 11.8579 12.6286 12.6348C11.8477 13.4117 10.9007 13.8002 9.7878 13.8002H4.2126Z" fill="var(--icon-color-darkest, #1A2126)"/>
          </svg>
        </span>
        Post-paid
      </span>
    );
  }
  return <span className="pill pill--unknown">—</span>;
};

// Small rate plan chip
const RatePlanChip: React.FC<{ name?: string }> = ({ name }) => (
  <div className="rp-name-chip">
    <div className="rp-name-icon" aria-hidden="true">
      <span className="rp-name-initials">
        {(name || 'RP').trim().split(/\s+/).map((s) => s[0]).join('').slice(0, 3).toUpperCase()}
      </span>
    </div>
    <div className="rp-name-texts">
      <div className="rp-name-title">{name || 'N/A'}</div>
      <div className="rp-name-subtitle">Pricing Model Name</div>
    </div>
  </div>
);

/* ---------- NEW: logo resolution (same approach as Customers.tsx) ---------- */
const FILE_HOST = 'http://43.206.110.213:8081';
const absolutizeUpload = (path: string) => {
  const clean = (path || '').replace(/\\/g, '/').trim();
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  return `${FILE_HOST}${clean.startsWith('/') ? '' : '/'}${clean}`;
};
const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = encodeURI(absolutizeUpload(uploadPath));
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { ...getAuthHeaders(), Accept: 'image/*' },
      credentials: 'include',
      cache: 'no-store',
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

interface SubscriptionsProps {
  showNewSubscriptionForm: boolean;
  setShowNewSubscriptionForm: (show: boolean) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ showNewSubscriptionForm, setShowNewSubscriptionForm }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSub, setEditingSub] = useState<SubscriptionType | null>(null);
  const [draftSub, setDraftSub] = useState<SubscriptionType | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<SubscriptionType | null>(null);

  // lookups for names/emails/logos
  const [customers, setCustomers] = useState<CustomerLite[]>([]);
  const [ratePlans, setRatePlans] = useState<RatePlanLite[]>([]);

  const customerMap = useMemo(() => {
    const m = new Map<number, CustomerLite>();
    customers.forEach(c => { if (c.customerId != null) m.set(c.customerId, c); });
    return m;
  }, [customers]);

  const ratePlanMap = useMemo(() => {
    const m = new Map<number, RatePlanLite>();
    ratePlans.forEach(r => { if (r.ratePlanId != null) m.set(r.ratePlanId, r); });
    return m;
  }, [ratePlans]);

  const fetchSubs = () => {
    Api.getSubscriptions()
      .then(data => setSubscriptions(data ?? []))
      .catch(err => console.error('Failed to fetch subscriptions', err));
  };

  const fetchLookups = async () => {
    try {
      const [custRaw, plans] = await Promise.all([Api.getCustomers?.(), Api.getRatePlans?.()]);
      const custWithLogos: CustomerLite[] = await Promise.all(
        (Array.isArray(custRaw) ? custRaw : []).map(async (c: any) => ({
          ...c,
          __resolvedLogoSrc: await resolveLogoSrc(c.companyLogoUrl),
        }))
      );
      setCustomers(custWithLogos);
      setRatePlans(Array.isArray(plans) ? plans : []);
    } catch (e) {
      console.warn('Failed to fetch lookup data (customers / rate plans)', e);
    }
  };

  const handleDelete = (subscription: SubscriptionType) => {
    setSubscriptionToDelete(subscription);
    setShowDeleteModal(true);
  };

  const { showToast } = useToast();

  const handleConfirmDelete = async () => {
    if (!subscriptionToDelete) return;
    try {
      await Api.deleteSubscription(subscriptionToDelete.subscriptionId);
      fetchSubs();
      setShowDeleteModal(false);
      setSubscriptionToDelete(null);
      showToast({
        kind: 'success',
        title: 'Subscription Deleted',
        message: 'The subscription has been successfully deleted.'
      });
    } catch (error) {
      console.error('Failed to delete subscription', error);
      showToast({
        kind: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete the subscription. Please try again.'
      });
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSubscriptionToDelete(null);
  };

  useEffect(() => {
    fetchSubs();
    fetchLookups();
    return () => {
      // revoke blob URLs
      customers.forEach(c => {
        if (c.__resolvedLogoSrc && c.__resolvedLogoSrc.startsWith('blob:')) {
          URL.revokeObjectURL(c.__resolvedLogoSrc);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingSub || draftSub) setShowNewSubscriptionForm(true);
    else setShowNewSubscriptionForm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSub, draftSub]);

  // create & edit wizards
  if (editingSub) {
    return <EditSubscription onClose={() => setEditingSub(null)} initial={editingSub} onRefresh={fetchSubs} />;
  }

  if (showNewSubscriptionForm && !draftSub) {
    return (
      <CreateSubscription
        onClose={() => setShowNewSubscriptionForm(false)}
        onCreateSuccess={(sub) => {
          setSubscriptions(prev => [sub, ...prev]);
          setShowNewSubscriptionForm(false);
        }}
        onRefresh={fetchSubs}
      />
    );
  }

  if (draftSub) {
    return (
      <CreateSubscription
        onClose={() => {
          setDraftSub(null);
          setShowNewSubscriptionForm(false);
        }}
        onCreateSuccess={(sub) => {
          setSubscriptions(prev => prev.map(s => s.subscriptionId === sub.subscriptionId ? sub : s));
          setDraftSub(null);
          setShowNewSubscriptionForm(false);
        }}
        onRefresh={fetchSubs}
        draftData={draftSub}
      />
    );
  }

  const filtered = subscriptions.filter(sub => {
    const q = (searchQuery || '').toLowerCase();
    const cust = customerMap.get(sub.customerId);
    const rp = ratePlanMap.get(sub.ratePlanId);
    return (
      sub.status?.toLowerCase().includes(q) ||
      String(sub.subscriptionId).toLowerCase().includes(q) ||
      String(sub.customerId).toLowerCase().includes(q) ||
      (cust?.customerName || '').toLowerCase().includes(q) ||
      (cust?.primaryEmail || '').toLowerCase().includes(q) ||
      (rp?.ratePlanName || '').toLowerCase().includes(q) ||
      String(sub.ratePlanId).toLowerCase().includes(q) ||
      String(sub.paymentType || '').toLowerCase().includes(q)
    );
  });

  const isEmpty = subscriptions.length === 0;
  const searchDisabled = isEmpty;

  const handleDownload = (sub: SubscriptionType) => {
    // Simple JSON export of the purchase
    const file = new Blob([JSON.stringify(sub, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-${sub.subscriptionId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="customers-container">
      <PageHeader
        title="Purchases"
        searchTerm={searchQuery}
        onSearchTermChange={setSearchQuery}
        primaryLabel="New Purchase"
        onPrimaryClick={() => navigate('/get-started/subscriptions/new')}
        onFilterClick={() => {}}
        searchDisabled={searchDisabled}
        showPrimary={!isEmpty}
      />

       <div className="customers-table-wrapper">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Rate Plan</th>
              <th>Payment Type</th>
              <th>Purchased On</th>
              <th>Status</th>
              <th className="actions-cell">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(sub => {
              const cust = customerMap.get(sub.customerId);
              const rp = ratePlanMap.get(sub.ratePlanId);
              
              // Backend already returns formatted date string, so use it directly
              const purchased = (sub as any).createdOn || 
                               formatIST((sub as any).createdAt) || 
                               formatIST((sub as any).startDate) || 
                               '—';
              const logo = cust?.__resolvedLogoSrc || null;

              return (
                <tr key={sub.subscriptionId}>
                  {/* Customer: logo + name + email */}
                  <td className="sub-customer-cell">
                    <div className="cell-flex">
                      <div
                        className={`customer-logo${logo ? ' has-image' : ' no-image'}`}
                        aria-label={`${cust?.customerName || 'Customer'} logo`}
                        role="img"
                      >
                        {logo ? <img className="customer-logo-img" src={logo} alt="" /> : null}
                        <span className="avatar-initials">{initialsFrom(cust?.customerName)}</span>
                      </div>
                      <div className="cust-block">
                        <div className="cust-name">{cust?.customerName || `Customer ${sub.customerId}`}</div>
                        <div className="cust-email">{cust?.primaryEmail || '—'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Rate Plan chip */}
                  <td><RatePlanChip name={rp?.ratePlanName || `Plan ${sub.ratePlanId}`} /></td>

                  {/* Payment Type pill */}
                  <td><PaymentPill value={sub.paymentType} /></td>

                  {/* Purchased On */}
                  <td>{purchased}</td>

                  {/* Status */}
                  <td>
                    <StatusBadge
                      label={sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1).toLowerCase() : 'N/A'}
                      variant={sub.status?.toLowerCase().includes('active') ? 'active' : sub.status?.toLowerCase().includes('draft') ? 'draft' : 'archived' as Variant}
                      size="sm"
                    />
                  </td>

                  {/* Actions (Download, Edit/Resume, Delete) */}
                  <td className="actions-cell">
                    <div className="product-action-buttons">
                      {/* Download */}
                      <button
                        className="download-button"
                        onClick={() => handleDownload(sub)}
                        title="Download"
                        aria-label="Download"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 14 14" fill="none">
                          <path d="M7 9V1M7 9L3.66667 5.66667M7 9L10.3333 5.66667M13 9V11.6667C13 12.0203 12.8595 12.3594 12.6095 12.6095C12.3594 12.8595 12.0203 13 11.6667 13H2.33333C1.97971 13 1.64057 12.8595 1.39052 12.6095C1.14048 12.3594 1 12.0203 1 11.6667V9"
                                stroke="#373B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>

                      {sub.status?.toLowerCase() === 'draft' ? (
                        <RetryIconButton
                          onClick={() => setDraftSub(sub)}
                          title="Continue editing draft"
                        />
                      ) : (
                        <EditIconButton
                          onClick={() => setEditingSub(sub)}
                          title="Edit subscription"
                        />
                      )}

                      {/* Delete */}
                      <DeleteIconButton
                        onClick={() => handleDelete(sub)}
                        title="Delete subscription"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* EMPTY STATE OVERLAY (keeps header visible) */}
        {isEmpty && (
          <div className="empty-state-purchases" role="region" aria-label="No purchases yet">
            <img src={purchaseSvg} alt="" className="empty-state-icon" width={190} height={190} />
            <p className="empty-state-text">
              No Purchases yet. Click ‘New Purchase’ to create your First Purchase.
            </p>
            <PrimaryButton
              onClick={() => navigate('/get-started/subscriptions/new')}
              className="empty-new-purchase-btn"
            >
              
             + New Purchase
            </PrimaryButton>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!subscriptionToDelete}
        productName={subscriptionToDelete ? `Subscription ${subscriptionToDelete.subscriptionId}` : ''}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Subscriptions;
