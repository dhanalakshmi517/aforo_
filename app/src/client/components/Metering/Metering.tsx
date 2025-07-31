import React from "react";
import CreateUsageMetric from "./CreateUsageMetric";
import "./Metering.css";

interface Metric {
  id: number;
  usageMetric: string;
  productName: string;
  unit: string;
  status: "Active" | "Inactive";
  createdOn: string;
}

const metrics: Metric[] = [
  {
    id: 1,
    usageMetric: "Google Maps API",
    productName: "Google Maps API",
    unit: "GB",
    status: "Active",
    createdOn: "06 Jan, 2025",
  },
  {
    id: 2,
    usageMetric: "Stripe’s payment processing",
    productName: "Stripe’s payment processing",
    unit: "Requests",
    status: "Active",
    createdOn: "06 Jan, 2025",
  },
  {
    id: 3,
    usageMetric: "Dropbox",
    productName: "Dropbox",
    unit: "Emails",
    status: "Active",
    createdOn: "06 Jan, 2025",
  },
  {
    id: 4,
    usageMetric: "Microsoft OneDrive",
    productName: "Microsoft OneDrive",
    unit: "Sessions",
    status: "Inactive",
    createdOn: "06 Jan, 2025",
  },
  {
    id: 5,
    usageMetric: "Data Set Prod",
    productName: "Data Set Prod",
    unit: "Messages",
    status: "Inactive",
    createdOn: "06 Jan, 2025",
  },
];

interface MeteringProps {
  showNewUsageMetricForm: boolean;
  setShowNewUsageMetricForm: (show: boolean) => void;
}

const Metering: React.FC<MeteringProps> = ({ showNewUsageMetricForm, setShowNewUsageMetricForm }) => {
  if (showNewUsageMetricForm) {
    return <CreateUsageMetric onClose={() => setShowNewUsageMetricForm(false)} />;
  }
  return (
    <div className="metering-container">
      <div className="breadcrumb">
        <span>Usage Metrics</span>
      </div>
      <div className="metering-header">
        <h2>Usage Metrics</h2>
        <div className="metering-actions">
           <div className="search-wrappers">
             {/* <svg
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
            </svg>   */}
            <input
              type="text"
              placeholder="Search among customers"
              className="search-input"
            />
          </div> 
          <button className="sam-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5H17.5M5.83333 10H14.1667M8.33333 15H11.6667" stroke="#706C72" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button className="new-button" onClick={() => setShowNewUsageMetricForm(true)}>+ New Usage Metric</button>
        </div>
      </div>
      <table className="metering-table">
        <thead>
          <tr>
            <th>Usage Metric</th>
            <th>Product Name</th>
            <th>Unit Of Measure</th>
            <th>Status</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((metric) => (
            <tr key={metric.id}>
              <td>{metric.usageMetric}</td>
              <td>{metric.productName}</td>
              <td>{metric.unit}</td>
              <td>
                <span
                  className={`status-tag ${metric.status === "Active" ? "active" : "inactive"
                    }`}
                >
                  {metric.status}
                </span>
              </td>
              <td>{metric.createdOn}</td>
              <td className="actions">
                <button className="edit-btn">✎</button>
                <button className="delete-btn">🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Metering;
