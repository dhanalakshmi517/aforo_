import React, { useState, useEffect } from 'react';
import CreateSubscription from './CreateSubscription';
import EditSubscription from './EditSubscriptions/EditSubscription';
import './Subscriptions.css';
import Search from '../Components/Search';
import { FiEdit2, FiTrash } from 'react-icons/fi';

interface Subscription {
  id: number;
  name: string;
  email: string;
  ratePlan: string;
  createdOn: string;
  status: string;
}

const allSubscriptions: Subscription[] = [
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
];

interface SubscriptionsProps {
  showNewSubscriptionForm: boolean;
  setShowNewSubscriptionForm: (show: boolean) => void;
}

const Subscriptions: React.FC<SubscriptionsProps> = ({ showNewSubscriptionForm, setShowNewSubscriptionForm }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

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
        <h2>Subscriptions</h2>
        <div className="search-add">
          <Search onSearch={setSearchQuery} />
          <button className="add-btn" onClick={() => setShowNewSubscriptionForm(true)}>+ New Purchase</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Rate Plan</th>
            <th>Created On</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {allSubscriptions.filter(sub =>
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            sub.email.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((sub, index) => (
            <tr key={sub.id}>
              <td>{index + 1}</td>
              <td>
                <div className="name-email">
                  <div>{sub.name}</div>
                  <div className="email">{sub.email}</div>
                </div>
              </td>
              <td>{sub.ratePlan}</td>
              <td>{sub.createdOn}</td>
              <td>
                <span className={`status ${sub.status.toLowerCase()}`}>{sub.status}</span>
              </td>
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
