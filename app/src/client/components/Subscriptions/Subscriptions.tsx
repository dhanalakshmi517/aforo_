import React, { useEffect, useState } from 'react';
import { Api, Subscription as SubscriptionType } from './api';
import CreateSubscription from './CreateSubscription';
import EditSubscription from './EditSubscriptions/EditSubscription';
import './Subscriptions.css';
import '../Rateplan/RatePlan.css';
import PageHeader from '../PageHeader/PageHeader';
// axios removed - using Api

/* Inline SVG icons (keep lightweight) */
const EditIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
    <path d="M6.99933 12.3332H12.9993M9.91667 1.41449C10.1821 1.1491 10.542 1 10.9173 1C11.2927 1 11.6526 1.1491 11.918 1.41449C12.1834 1.67988 12.3325 2.03983 12.3325 2.41516C12.3325 2.79048 12.1834 3.15043 11.918 3.41582L3.91133 11.4232C3.75273 11.5818 3.55668 11.6978 3.34133 11.7605L1.42667 12.3192C1.3693 12.3359 1.30849 12.3369 1.25061 12.3221C1.19272 12.3072 1.13988 12.2771 1.09763 12.2349C1.05538 12.1926 1.02526 12.1398 1.01043 12.0819C0.995599 12.024 0.996602 11.9632 1.01333 11.9058L1.572 9.99116C1.63481 9.77605 1.75083 9.58024 1.90933 9.42182L9.91667 1.41449Z" stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DeleteIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path d="M2.59961 4.00016H14.5996M13.2663 4.00016V13.3335C13.2663 14.0002 12.5996 14.6668 11.9329 14.6668H5.26628C4.59961 14.6668 3.93294 14.0002 3.93294 13.3335V4.00016M5.93294 4.00016V2.66683C5.93294 2.00016 6.59961 1.3335 7.26628 1.3335H9.93294C10.5996 1.3335 11.2663 2.00016 11.2663 2.66683V4.00016M7.26628 7.3335V11.3335M9.93294 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  const variant = normalized.includes('active') ? 'active' : normalized.includes('draft') ? 'draft' : 'default';
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'N/A';
  return <span className={`status-badge status-badge--${variant}`}>{label}</span>;
};

interface Subscription {
  subscriptionId: number;
  customerId: number;
  productId: number;
  ratePlanId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentType: string;
  adminNotes: string;
}

interface SubscriptionsProps {
  showNewSubscriptionForm: boolean;
  setShowNewSubscriptionForm: (show: boolean) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ showNewSubscriptionForm, setShowNewSubscriptionForm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingSub, setEditingSub] = useState<SubscriptionType | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionType[]>([]);

  // fetch subscriptions
  const fetchSubs = () => {
    Api.getSubscriptions()
      .then(data => setSubscriptions(data ?? []))
      .catch(err => console.error('Failed to fetch subscriptions', err));
  };

  useEffect(() => {
    fetchSubs();
  }, []);

  // hide sidebar when edit wizard opens (reusing provided flag)
  useEffect(() => {
    if (editingSub) {
      setShowNewSubscriptionForm(true);
    } else {
      setShowNewSubscriptionForm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSub]);

  // create & edit wizards
  if (showNewSubscriptionForm && !editingSub) {
    return (
      <CreateSubscription
        onClose={() => setShowNewSubscriptionForm(false)}
        onCreateSuccess={(sub) => {
          // add new subscription to list & refresh view
          setSubscriptions(prev => [sub, ...prev]);
          setShowNewSubscriptionForm(false);
        }}
      />
    );
  }
  if (editingSub) {
    return <EditSubscription onClose={() => setEditingSub(null)} />;
  }

  const filtered = subscriptions.filter(sub => {
    const q = (searchQuery || '').toLowerCase();
    return (
      sub.status?.toLowerCase().includes(q) ||
      String(sub.subscriptionId).toLowerCase().includes(q) ||
      String(sub.customerId).toLowerCase().includes(q) ||
      String(sub.productId).toLowerCase().includes(q) ||
      String(sub.ratePlanId).toLowerCase().includes(q)
    );
  });

  const searchDisabled = subscriptions.length === 0;

  return (
    <div className="subscriptions-container">
      <PageHeader
        title="Purchases"
        searchTerm={searchQuery}
        onSearchTermChange={setSearchQuery}
        primaryLabel="New Purchase"
        onPrimaryClick={() => setShowNewSubscriptionForm(true)}
        onFilterClick={() => {/* future filters */}}
        searchDisabled={searchDisabled}
        showPrimary={true}
      />

      <div className="subscriptions-table-wrapper">
        <table className="subscriptions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Rate Plan</th>
              <th>Status</th>
              <th>Created At</th>
              <th className="actions-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => (
              <tr key={sub.subscriptionId}>
                <td>{sub.subscriptionId}</td>
                <td>{sub.customerId}</td>
                <td>{sub.productId}</td>
                <td>{sub.ratePlanId}</td>
                <td><StatusBadge status={sub.status} /></td>
                <td>{new Date(sub.createdAt).toLocaleString()}</td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    {sub.status?.toLowerCase() === 'draft' ? (
                      <button 
                        className="resume-button" 
                        onClick={() => setEditingSub(sub)} 
                        title="Resume Draft"
                        aria-label="Resume Draft"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true">
                          <path d="M11.75 3.25a5.5 5.5 0 1 1-7.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M5.25 8h5.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8.5 6l2.25 2-2.25 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    ) : (
                      <button 
                        className="edit-button" 
                        onClick={() => setEditingSub(sub)} 
                        title="Edit"
                        aria-label="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M7.99933 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z"
                            stroke="#1D7AFC" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                    <button className="delete-button" title="Delete" aria-label="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M2 4.00016H14M12.6667 4.00016V13.3335C12.6667 14.0002 12 14.6668 11.3333 14.6668H4.66667C4 14.6668 3.33333 14.0002 3.33333 13.3335V4.00016M5.33333 4.00016V2.66683C5.33333 2.00016 6 1.3335 6.66667 1.3335H9.33333C10 1.3335 10.6667 2.00016 10.6667 2.66683V4.00016M6.66667 7.3335V11.3335M9.33333 7.3335V11.3335"
                          stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* Optional: empty state row */}
            {subscriptions.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '60px 0', borderBottom: 'none' }}>
                  No purchases yet. Click “New Purchase” to create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Subscriptions;
