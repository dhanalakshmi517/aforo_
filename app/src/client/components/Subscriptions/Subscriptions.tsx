import React, { useState, useEffect } from 'react';
import CreateSubscription from './CreateSubscription';
import EditSubscription from './EditSubscriptions/EditSubscription';
import './Subscriptions.css';
import Search from '../Components/Search';
import { FiEdit2, FiTrash } from 'react-icons/fi';
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
          <button className="add-btn" onClick={() => setShowNewSubscriptionForm(true)}>+ New Purchase</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Rate Plan</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Actions</th>
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
              <td>{index + 1}</td>
              <td>{sub.subscriptionId}</td>
              <td>{sub.customerId}</td>
              <td>{sub.productId}</td>
              <td>{sub.ratePlanId}</td>
              <td>
                <span className={`status ${sub.status?.toLowerCase()}`}>{sub.status}</span>
              </td>
              <td>{new Date(sub.createdAt).toLocaleString()}</td>
              <td>
                <FiEdit2 className="icon edit" onClick={() => setEditingSub(sub)} />
                <FiTrash className="icon delete" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Subscriptions;
