import React, { useState, useRef } from "react";
import "./RevenueAnalyticsDash5.css";
import VerticalScrollbar from "../../componenetsss/VerticalScrollbar";

interface CrossSellRow {
  id: number;
  customerName: string;
  initial: string;
  plan: string;
  product: string;
  averageMrr: string;
  suggested: string;
}

const rows: CrossSellRow[] = [
  {
    id: 1,
    customerName: "Customer 1",
    initial: "C1",
    plan: "Basic",
    product: "Billing API",
    averageMrr: "$2,400",
    suggested: "Analytics Add-on",
  },
  {
    id: 2,
    customerName: "Customer 2",
    initial: "C2",
    plan: "Pro",
    product: "Chatbot LLM",
    averageMrr: "$4,204",
    suggested: "Analytics Add-on",
  },
  {
    id: 3,
    customerName: "Customer 3",
    initial: "C3",
    plan: "Business",
    product: "Weather API",
    averageMrr: "$8,486",
    suggested: "Analytics Add-on",
  },
];

const RevenueAnalyticsDash5: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <section className="ra5-section">
      <article className="ra5-card">
        {/* Header */}
        <div className="ra5-card-header">
          <div className="ra5-header-left">
            <div className="ra5-icon-box">
              <span className="ra5-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 22 20" fill="none">
  <path d="M14.75 18.75V16.75C14.75 15.6891 14.3286 14.6717 13.5784 13.9216C12.8283 13.1714 11.8109 12.75 10.75 12.75H4.75C3.68913 12.75 2.67172 13.1714 1.92157 13.9216C1.17143 14.6717 0.75 15.6891 0.75 16.75V18.75M14.75 0.878C15.6078 1.10037 16.3674 1.60126 16.9097 2.30206C17.452 3.00286 17.7462 3.86389 17.7462 4.75C17.7462 5.63611 17.452 6.49714 16.9097 7.19794C16.3674 7.89874 15.6078 8.39963 14.75 8.622M20.75 18.75V16.75C20.7493 15.8637 20.4544 15.0028 19.9114 14.3023C19.3684 13.6019 18.6081 13.1016 17.75 12.88M11.75 4.75C11.75 6.95914 9.95914 8.75 7.75 8.75C5.54086 8.75 3.75 6.95914 3.75 4.75C3.75 2.54086 5.54086 0.75 7.75 0.75C9.95914 0.75 11.75 2.54086 11.75 4.75Z" stroke="#8566CC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
            </div>
            <span className="ra5-title">
              Top Cross-sell Prospects (single-product users)
            </span>
          </div>
          <div className="ra5-header-right">
            {/* <span className="ra5-updated">Updated 3 mins ago</span> */}
            <button className="ra5-view-all" onClick={() => setShowAll((prev) => !prev)}>
              {showAll ? "View Less" : "View All"} <span className="ra5-view-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9" fill="none">
  <path d="M0.600098 7.6001L4.1001 4.1001L0.600098 0.600098" stroke="#2A455E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={`ra5-table-wrapper ${showAll ? 'ra5-show-all' : ''}`} ref={tableWrapperRef}>
          <div className="ra5-scrollbar-container">
            <VerticalScrollbar height="100%" color="#D9DFE8" thickness={4} />
          </div>
          <table className="ra5-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Plan</th>
                <th>Product(s)</th>
                <th>Average MRR</th>
                <th>Suggested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="ra5-name-cell">
                      <div className="ra5-avatar">{row.initial}</div>
                      <span className="ra5-name-text">{row.customerName}</span>
                    </div>
                  </td>
                  <td>{row.plan}</td>
                  <td>{row.product}</td>
                  <td>{row.averageMrr}</td>
                  <td>{row.suggested}</td>
                  <td>
                    <button className="ra5-view-btn">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

export default RevenueAnalyticsDash5;
