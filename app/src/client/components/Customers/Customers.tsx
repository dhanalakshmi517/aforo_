import React, { useState } from "react";
import "./Customers.css";
import CustomerForm from "./CustomerForm";

interface Customer {
  id: number;
  name: string;
  email: string;
  customerId: string;
  status: string;
  createdOn: string;
}

const dummyCustomers: Customer[] = [
  {
    id: 1,
    name: "Aditya Inc",
    email: "customer-1@gmail.com",
    customerId: "GUJ23H8MXK",
    status: "In Progress",
    createdOn: "06 Jan, 2025 08:58 IST",
  },
  {
    id: 2,
    name: "Customer 2",
    email: "customer-2@gmail.com",
    customerId: "GUJ23H8MXK",
    status: "In Progress",
    createdOn: "06 Jan, 2025 08:58 IST",
  },
];

interface CustomersProps {
  showNewCustomerForm: boolean;
  setShowNewCustomerForm: (show: boolean) => void;
}

const Customers: React.FC<CustomersProps> = ({ showNewCustomerForm, setShowNewCustomerForm }) => {

  const handleNewCustomer = () => {
    setShowNewCustomerForm(true);
  };

  const handleCloseForm = () => {
    setShowNewCustomerForm(false);
  };

  return (
    <div className="customers-container">
      {!showNewCustomerForm ? (
        <>
          <div className="breadcrumb">
            <span>Customers</span>
           
          </div>
          <div className="customers-header">
            <h2>Customers</h2>
            <div className="customers-actions">
              <div className="search-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M17.5 17.5L13.8833 13.8833M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                    stroke="#706C72"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search among customers"
                  className="search-input"
                />
              </div>
              <button className="sam-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667" stroke="#706C72" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
              <button className="new-customer-btn" onClick={handleNewCustomer}>
                + New Customer
              </button>
            </div>
          </div>

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
              {dummyCustomers.map((customer, index) => (
                <tr key={customer.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="name-cell">
                      <div className="name">{customer.name}</div>
                      <div className="email">{customer.email}</div>
                    </div>
                  </td>
                  <td>{customer.customerId}</td>
                  <td>
                    <span className="status-badge">{customer.status}</span>
                  </td>
                  <td>
                    <div className="action-icons">
                      <button className="edit-btn">
edit                      </button>
                      <button className="delete-btn">
delete                      </button>
                    </div>
                  </td>
                  <td>{customer.createdOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <CustomerForm onClose={handleCloseForm} />
      )}
    </div>
  );
};

export default Customers;
