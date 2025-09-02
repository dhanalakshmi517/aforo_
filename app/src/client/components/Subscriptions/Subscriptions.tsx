import React, { useState, useEffect } from 'react';
import CreateSubscription from './CreateSubscription';
import EditSubscription from './EditSubscriptions/EditSubscription';
import './Subscriptions.css';
import '../Rateplan/RatePlan.css';
import Search from '../Components/Search';
// inline SVG icons, remove react-icons dependency
const EditIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
  <path d="M6.99933 12.3332H12.9993M9.91667 1.41449C10.1821 1.1491 10.542 1 10.9173 1C11.2927 1 11.6526 1.1491 11.918 1.41449C12.1834 1.67988 12.3325 2.03983 12.3325 2.41516C12.3325 2.79048 12.1834 3.15043 11.918 3.41582L3.91133 11.4232C3.75273 11.5818 3.55668 11.6978 3.34133 11.7605L1.42667 12.3192C1.3693 12.3359 1.30849 12.3369 1.25061 12.3221C1.19272 12.3072 1.13988 12.2771 1.09763 12.2349C1.05538 12.1926 1.02526 12.1398 1.01043 12.0819C0.995599 12.024 0.996602 11.9632 1.01333 11.9058L1.572 9.99116C1.63481 9.77605 1.75083 9.58024 1.90933 9.42182L9.91667 1.41449Z" stroke="#1D7AFC" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
);

// Status badge reused from RatePlans
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  const variant = normalized.includes('active') ? 'active' : normalized.includes('draft') ? 'draft' : 'default';
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'N/A';
  return <span className={`status-badge status-badge--${variant}`}>{label}</span>;
};

const DeleteIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
    <path d="M2.59961 4.00016H14.5996M13.2663 4.00016V13.3335C13.2663 14.0002 12.5996 14.6668 11.9329 14.6668H5.26628C4.59961 14.6668 3.93294 14.0002 3.93294 13.3335V4.00016M5.93294 4.00016V2.66683C5.93294 2.00016 6.59961 1.3335 7.26628 1.3335H9.93294C10.5996 1.3335 11.2663 2.00016 11.2663 2.66683V4.00016M7.26628 7.3335V11.3335M9.93294 7.3335V11.3335" stroke="#E34935" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

import axios from 'axios';

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

/* dummy data removed
  {
    id: 1,
    name: 'Aditya Inc',
    email: 'customer-1@gmail.com',
    ratePlan: 'Individual Plan',
    createdOn: '06 Jan, 2025 08:58 IST',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Customer 2',
    email: 'customer-1@gmail.com',
    ratePlan: 'Enterprise',
    createdOn: '06 Jan, 2025 08:58 IST',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Customer 3',
    email: 'customer-1@gmail.com',
    ratePlan: 'Starters Plan',
    createdOn: '06 Jan, 2025 08:58 IST',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Customer 4',
    email: 'customer-1@gmail.com',
    ratePlan: 'Advanced',
    createdOn: '06 Jan, 2025 08:58 IST',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Customer 5',
    email: 'customer-1@gmail.com',
    ratePlan: 'Advanced',
    createdOn: '06 Jan, 2025 08:58 IST',
    status: 'Active',
  },
dummy data removed */

interface SubscriptionsProps {
  showNewSubscriptionForm: boolean;
  setShowNewSubscriptionForm: (show: boolean) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ showNewSubscriptionForm, setShowNewSubscriptionForm }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // fetch subscriptions once on mount
  useEffect(() => {
    axios.get<Subscription[]>('http://13.113.70.183:8084/api/subscriptions')
      .then(res => setSubscriptions(res.data))
      .catch(err => console.error('Failed to fetch subscriptions', err));
  }, []);

  // Hide sidebar whenever edit wizard is open
  useEffect(() => {
    if (editingSub) {
      setShowNewSubscriptionForm(true); // reuse flag just to hide sidebar
    } else {
      setShowNewSubscriptionForm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSub]);
  if (showNewSubscriptionForm && !editingSub) {
    return <CreateSubscription onClose={() => setShowNewSubscriptionForm(false)} />;
  }

  if (editingSub) {
    return <EditSubscription onClose={() => setEditingSub(null)} />;
  }


  return (
    <div className="subscriptions-container">
      <div className="breadcrumb"><span>Subscriptions</span></div>
    
      <div className="header">
        <h2>Purchases</h2>
        <div className="search-add">
          <Search onSearch={setSearchQuery} />
          <button className="sub-add-btn" onClick={() => setShowNewSubscriptionForm(true)}>+ New Purchase</button>
        </div>
      </div>

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
          {subscriptions.filter(sub => {
            const q = searchQuery.toLowerCase();
            return (
              sub.status?.toLowerCase().includes(q) ||
              String(sub.subscriptionId).includes(q)
            );
          }).map((sub, index) => (
            <tr key={sub.subscriptionId}>
              <td>{sub.subscriptionId}</td>
              <td>{sub.customerId}</td>
              <td>{sub.productId}</td>
              <td>{sub.ratePlanId}</td>
              <td>
                <StatusBadge status={sub.status} />
              </td>
              <td>{new Date(sub.createdAt).toLocaleString()}</td>
              <td className="actions-cell">
                <div className="action-buttons">
                  <button className="prod-edit-button" onClick={() => setEditingSub(sub)}><EditIcon /></button>
                  <button className="prod-delete-button"><DeleteIcon /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};
export default Subscriptions;
