import React, { useState, useEffect } from "react";
import "./Customers.css";
import CreateCustomer from "./CreateCustomer";
import { getCustomers, deleteCustomer } from "./api";

export interface Customer {
  id: number;
  companyName: string;
  companyType: string;
  status: string;
  companyLogoUrl?: string;
}

interface CustomersProps {
  showNewCustomerForm: boolean;
  setShowNewCustomerForm: (show: boolean) => void;
}

const Customers: React.FC<CustomersProps> = ({
  showNewCustomerForm,
  setShowNewCustomerForm,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

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
              <div className="products-search">
                <svg
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
                </svg>
                <input
                  type="search"
                  placeholder="Search among your customers..."
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

          <table className="customers-table">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Company Name</th>
                <th>Company Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4}>Loading...</td>
                </tr>
              )}
              {errorMsg && (
                <tr>
                  <td colSpan={4}>{errorMsg}</td>
                </tr>
              )}
              {customers.length === 0 && !loading && !errorMsg && (
                <tr>
                  <td colSpan={4}>No customers found</td>
                </tr>
              )}
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    {customer.companyLogoUrl ? (
                      (() => {
                        const raw = customer.companyLogoUrl;
                        let src: string;
                        if (raw.startsWith('http')) {
                          src = raw;
                        } else if (raw.startsWith('/v1/api/uploads/')) {
                          src = `http://43.206.110.213:8081${raw}`;
                        } else if (raw.startsWith('/uploads/')) {
                          src = `http://43.206.110.213:8081${raw}`;
                        } else {
                          src = `http://43.206.110.213:8081/v1/api/uploads/${raw}`;
                        }
                        return (
                          <img
                            src={src}
                            alt={customer.companyName}
                            className="customer-logo"
                            height={32}
                            width={32}
                          />
                        );
                      })()
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{customer.companyName}</td>
                  <td>{customer.companyType}</td>
                  <td><span className="status-badge">{customer.status}</span></td>
                  <td>
                    <div className="action-icons">
                      <button className="edit-btn" aria-label="edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M7.99933 13.3332H13.9993M10.9167 2.41449C11.1821 2.1491 11.542 2 11.9173 2C12.2927 2 12.6526 2.1491 12.918 2.41449C13.1834 2.67988 13.3325 3.03983 13.3325 3.41516C13.3325 3.79048 13.1834 4.15043 12.918 4.41582L4.91133 12.4232C4.75273 12.5818 4.55668 12.6978 4.34133 12.7605L2.42667 13.3192C2.3693 13.3359 2.30849 13.3369 2.25061 13.3221C2.19272 13.3072 2.13988 13.2771 2.09763 13.2349C2.05538 13.1926 2.02526 13.1398 2.01043 13.0819C1.9956 13.024 1.9966 12.9632 2.01333 12.9058L2.572 10.9912C2.63481 10.776 2.75083 10.5802 2.90933 10.4218L10.9167 2.41449Z" stroke="#1D7AFC" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <button className="delete-btn" aria-label="delete" onClick={() => handleDelete(customer.id)}>
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
        </>
      ) : (
        <CreateCustomer onClose={handleCloseForm} />
      )}
    </div>
  );
};

export default Customers;
