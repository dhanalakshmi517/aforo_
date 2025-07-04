import React, { useState } from 'react';
import './Customers.css';
import { FaCopy } from 'react-icons/fa';

const customerData = [
  {
    id: 1,
    name: 'Aditya Inc',
    email: 'customer-1@gmail.com',
    customerId: 'GUJ23HBMKK',
    status: 'In Progress',
    createdOn: '06 Jan, 2025 08:58 IST',
  },
  {
    id: 2,
    name: 'Customer 2',
    email: 'customer-2@gmail.com',
    customerId: 'GUJ23HBMKL',
    status: 'In Progress',
    createdOn: '07 Jan, 2025 09:15 IST',
  },
  {
    id: 3,
    name: 'Customer 3',
    email: 'customer-3@gmail.com',
    customerId: 'GUJ23HBMKM',
    status: 'In Progress',
    createdOn: '08 Jan, 2025 10:30 IST',
  },
  {
    id: 4,
    name: 'Customer 4',
    email: 'customer-4@gmail.com',
    customerId: 'GUJ23HBMKN',
    status: 'In Progress',
    createdOn: '09 Jan, 2025 11:45 IST',
  },
  {
    id: 5,
    name: 'Customer 5',
    email: 'customer-5@gmail.com',
    customerId: 'GUJ23HBMKO',
    status: 'In Progress',
    createdOn: '10 Jan, 2025 12:00 IST',
  },
];

const Customers = () => {
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState(['Customers']);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenAddCustomer = () => {
    setShowAddPanel(true);
    setBreadcrumb(['Customers', 'New Customer']);
  };

  const handleCloseAddCustomer = () => {
    setShowAddPanel(false);
    setBreadcrumb(['Customers']);
  };

  const filteredCustomers = customerData.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customers-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        {breadcrumb.map((item, index) => (
          <span
            key={index}
            className={`breadcrumb-item ${
              index === breadcrumb.length - 1 ? 'active' : ''
            }`}
          >
            {item}
            {index < breadcrumb.length - 1 && (
              <span className="separator"> &gt; </span>
            )}
          </span>
        ))}
      </div>

      {/* Header */}
      <div className="customers-header">
        <h2>Customers</h2>
        <div className="customers-actions">
          <input
            type="text"
            placeholder="Search among customers"
            className="customers-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="new-customer-btn" onClick={handleOpenAddCustomer}>
            + New Customer
          </button>
        </div>
      </div>

      {/* Add Customer Panel - Will be implemented later */}
      {showAddPanel && (
        <div className="add-customer-panel">
          <h3>Add New Customer</h3>
          <button onClick={handleCloseAddCustomer}>Close</button>
          {/* Add customer form will go here */}
        </div>
      )}

      {/* Customer Table */}
      <table className="customers-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Name</th>
            <th>Customer ID</th>
            <th>Status</th>
            <th>Actions</th>
            <th>Created On</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer, index) => (
            <tr key={customer.id}>
              <td>{index + 1}</td>
              <td>
                <div className="customer-name">
                  {customer.name}
                  <br />
                  <span className="email">{customer.email}</span>
                </div>
              </td>
              <td>
                <div className="customer-id">
                  {customer.customerId}
                  <FaCopy 
                    className="copy-icon" 
                    onClick={() => {
                      navigator.clipboard.writeText(customer.customerId);
                      // Add toast notification here if needed
                    }}
                  />
                </div>
              </td>
              <td>
                <span className="status">{customer.status}</span>
              </td>
              <td>
                <button className="edit-btn">Edit</button>
                <button className="delete-btn">Delete</button>
              </td>
              <td>{customer.createdOn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;
