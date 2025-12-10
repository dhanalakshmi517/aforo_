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
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M11.3263 6.1801C11.9565 6.41505 12.5173 6.80512 12.9568 7.31423C13.3963 7.82334 13.7003 8.43506 13.8408 9.09281C13.9812 9.75056 13.9535 10.4331 13.7603 11.0773C13.5671 11.7216 13.2145 12.3066 12.7352 12.7785C12.2559 13.2504 11.6654 13.5938 11.0183 13.7769C10.3711 13.9601 9.68821 13.9771 9.03273 13.8264C8.37725 13.6757 7.77035 13.3622 7.26816 12.9148C6.76597 12.4674 6.3847 11.9006 6.15961 11.2668M3.93294 3.26676H4.59961V5.93343M10.4063 8.5201L10.8729 8.99343L8.99294 10.8734M8.59961 4.6001C8.59961 6.80924 6.80875 8.6001 4.59961 8.6001C2.39047 8.6001 0.599609 6.80924 0.599609 4.6001C0.599609 2.39096 2.39047 0.600098 4.59961 0.600098C6.80875 0.600098 8.59961 2.39096 8.59961 4.6001Z" stroke="#7B97AE" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
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
            <path d="M4.0124 13.6C2.89133 13.6 1.94233 13.2115 1.1654 12.4346C0.388467 11.6577 0 10.7087 0 9.5876C0 9.11693 0.0802666 8.65953 0.2408 8.2154C0.401333 7.77127 0.631333 7.36873 0.9308 7.0078L3.33813 4.11263C3.5917 3.80767 3.64109 3.38169 3.46402 3.02681L2.67551 1.44646C2.34378 0.781608 2.8273 0 3.57031 0H10.0297C10.7727 0 11.2562 0.781609 10.9245 1.44646L10.136 3.02681C9.95891 3.38169 10.0083 3.80767 10.2619 4.11263L12.6692 7.0078C12.9687 7.36873 13.1987 7.77127 13.3592 8.2154C13.5197 8.65953 13.6 9.11693 13.6 9.5876C13.6 10.7087 13.2095 11.6577 12.4284 12.4346C11.6475 13.2115 10.7005 13.6 9.5876 13.6H4.0124ZM6.8 9.7922C6.40107 9.7922 6.06033 9.65093 5.7778 9.3684C5.49513 9.08587 5.3538 8.74513 5.3538 8.3462C5.3538 7.94713 5.49513 7.60633 5.7778 7.3238C6.06033 7.04127 6.40107 6.9 6.8 6.9C7.19893 6.9 7.53967 7.04127 7.8222 7.3238C8.10487 7.60633 8.2462 7.94713 8.2462 8.3462C8.2462 8.74513 8.10487 9.08587 7.8222 9.3684C7.53967 9.65093 7.19893 9.7922 6.8 9.7922ZM4.57702 2.54864C4.74669 2.88664 5.09253 3.1 5.47073 3.1H8.13466C8.51401 3.1 8.86069 2.88535 9.0298 2.54578L9.556 1.48916C9.62221 1.35619 9.52551 1.2 9.37697 1.2H4.22419C4.07537 1.2 3.97868 1.35673 4.04544 1.48973L4.57702 2.54864ZM4.0124 12.4H9.5876C10.3733 12.4 11.0385 12.1264 11.583 11.5792C12.1277 11.032 12.4 10.3681 12.4 9.5876C12.4 9.25733 12.3433 8.93713 12.23 8.627C12.1167 8.31673 11.9549 8.03647 11.7446 7.7862L9.14287 4.66028C8.95287 4.43201 8.67125 4.3 8.37426 4.3H5.2434C4.94775 4.3 4.66726 4.43082 4.47726 4.65732L1.863 7.7738C1.65273 8.02407 1.48967 8.3064 1.3738 8.6208C1.25793 8.93507 1.2 9.25733 1.2 9.5876C1.2 10.3681 1.4736 11.032 2.0208 11.5792C2.568 12.1264 3.23187 12.4 4.0124 12.4Z" fill="#7B97AE" />
          </svg>
        </span>
        Post-paid
      </span>
    );
  }
  return <span className="pill--">—</span>;
};

// Small rate plan chip
const RatePlanChip: React.FC<{ name?: string }> = ({ name }) => (
  <div className="rp-name-chip">
    <div className="rp-name-initials">
      {(name || 'RP').trim().split(/\s+/).map((s) => s[0]).join('').slice(0, 1).toUpperCase()}
    </div>
    <div className="rp-name-texts">
      <div className="rp-name-title">{name || 'N/A'}</div>
      <div className="rp-name-subtitle">Pricing Model Name</div>
    </div>
  </div>
);

/* ---------- NEW: logo resolution (same approach as Customers.tsx) ---------- */
const FILE_HOST = 'http://44.201.19.187:8081';
const absolutizeUpload = (path: string) => {
  const clean = (path || '').replace(/\\/g, '/').trim();
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  // Ensure single slash between host and path
  const separator = clean.startsWith('/') ? '' : '/';
  return `${FILE_HOST}${separator}${clean}`;
};
const resolveLogoSrc = async (uploadPath?: string): Promise<string | null> => {
  if (!uploadPath) return null;
  const url = encodeURI(absolutizeUpload(uploadPath));
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { ...getAuthHeaders(), Accept: 'image/*' },
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
      console.log('📦 Raw customers from API:', custRaw);
      const custWithLogos: CustomerLite[] = await Promise.all(
        (Array.isArray(custRaw) ? custRaw : []).map(async (c: any) => {
          console.log('Processing customer:', c.customerName, 'companyLogoUrl:', c.companyLogoUrl);
          return {
            ...c,
            __resolvedLogoSrc: await resolveLogoSrc(c.companyLogoUrl),
          };
        })
      );
      console.log('✅ Customers with resolved logos:', custWithLogos);
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
  }).sort((a, b) => {
    // Priority 1: Draft status subscriptions appear first
    const aIsDraft = a.status?.toLowerCase() === 'draft';
    const bIsDraft = b.status?.toLowerCase() === 'draft';

    if (aIsDraft && !bIsDraft) return -1;
    if (!aIsDraft && bIsDraft) return 1;

    // Priority 2: Within same status group, sort by creation time (newest first)
    const aTime = new Date((a as any).createdOn || (a as any).createdAt || 0).getTime();
    const bTime = new Date((b as any).createdOn || (b as any).createdAt || 0).getTime();

    return bTime - aTime; // Descending order (newest first)
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
    <div className="check-container">
      <PageHeader
        title="Purchases"
        searchTerm={searchQuery}
        onSearchTermChange={setSearchQuery}
        primaryLabel="+ New Purchase"
        onPrimaryClick={() => navigate('/get-started/subscriptions/new')}
        onFilterClick={() => { }}
        searchDisabled={searchDisabled}
        filterDisabled={isEmpty}
        showPrimary={!isEmpty}
        showIntegrations={subscriptions.length > 0} // Add this line

      />

      <div className="customers-table-wrapper">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Customer Name</th>
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
                            stroke="#373B40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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