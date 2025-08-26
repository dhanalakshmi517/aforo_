import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Customers.css";
import CreateCustomer from "./CreateCustomer";
import { getCustomers, deleteCustomer } from "./api";

export interface Customer {
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

const Customers: React.FC<CustomersProps> = ({
  showNewCustomerForm,
  setShowNewCustomerForm,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
    // search term for live filtering
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async (id?: number) => {
    if (id == null) return;
    if (!window.confirm('Delete this customer?')) return;
    try {
      await deleteCustomer(id);
      setCustomers(prev => prev.filter(c => (c.customerId ?? c.id) !== id));
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


  // derive filtered list based on search term (company name or type or status)
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase();
    return (
      (c.companyName || '').toLowerCase().includes(term) ||
      (c.companyType || '').toLowerCase().includes(term) ||
      (c.status || '').toLowerCase().includes(term)
    );
  });

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
              {filteredCustomers.map((customer) => (
                <tr key={customer.customerId ?? customer.id}>
                  <td>
                    {customer.companyLogoUrl ? (
                      (() => {
                        const raw = customer.companyLogoUrl;
                        const buildSrc = (path: string) => {
                          if (!path) return '';
                          if (path.startsWith('http')) return path;
                          // ensure path starts with '/'
                          const normalized = path.startsWith('/') ? path : `/v1/api/uploads/${path}`;
                          return `http://43.206.110.213:8081${normalized}`;
                        };
                        const src = buildSrc(raw);
                        return (
                          <img
                            src={src}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder-logo.png'; }}
                            alt={customer.companyName}
                            className="customer-logo"
                            height={24}
                            width={24}
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
                      <Link to={`/get-started/customers/${customer.customerId ?? customer.id}/edit`} className="edit-button" aria-label="edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M12.6465 2.64645C12.8417 2.45118 13.1583 2.45118 13.3536 2.64645L14.3536 3.64645C14.5488 3.84171 14.5488 4.15829 14.3536 4.35355L5.20688 13.5003L2 14L2.49974 10.7932L12.6465 2.64645Z" stroke="#2B7194" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>
                      <button className="delete-button" aria-label="delete" onClick={() => handleDelete((customer.customerId ?? customer.id)!)}>
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
      ) }
    </div>
  );
};
export default Customers;
