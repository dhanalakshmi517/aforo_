import React from "react";
import "./RevenueAnalyticsDash5.css";

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
  return (
    <section className="ra5-section">
      <article className="ra5-card">
        {/* Header */}
        <div className="ra5-card-header">
          <div className="ra5-header-left">
            <div className="ra5-icon-box">
              <span className="ra5-icon">👥</span>
            </div>
            <span className="ra5-title">
              Top 10 Cross-sell Prospects (single-product users)
            </span>
          </div>
          <div className="ra5-header-right">
            <span className="ra5-updated">Updated 3 mins ago</span>
            <button className="ra5-view-all">
              View All <span className="ra5-view-arrow">↗</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="ra5-table-wrapper">
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
