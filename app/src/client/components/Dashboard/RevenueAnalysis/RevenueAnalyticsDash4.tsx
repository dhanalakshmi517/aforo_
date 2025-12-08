import React, { useState, useRef } from "react";
import "./RevenueAnalyticsDash4.css";
import VerticalScrollbar from "../../componenetsss/VerticalScrollbar";

type OverStatus = "ok" | "warning" | "critical";

interface UpsellRow {
  id: number;
  customerName: string;
  initial: string;
  plan: string;
  averageMrr: string;
  limitUsage: string; // "1000 / 1200"
  overLimitPercent: number;
  status: OverStatus;
}

const rows: UpsellRow[] = [
  {
    id: 1,
    customerName: "Customer 1",
    initial: "C1",
    plan: "Basic",
    averageMrr: "$2,400",
    limitUsage: "1000 / 1200",
    overLimitPercent: 75,
    status: "warning",
  },
  {
    id: 2,
    customerName: "Customer 2",
    initial: "C2",
    plan: "Pro",
    averageMrr: "$4,204",
    limitUsage: "1000 / 1500",
    overLimitPercent: 95,
    status: "critical",
  },
  {
    id: 3,
    customerName: "Customer 3",
    initial: "C3",
    plan: "Business",
    averageMrr: "$8,486",
    limitUsage: "10,000 / 20,000",
    overLimitPercent: 75,
    status: "ok",
  },
];

const statusDotClass = (status: OverStatus) => {
  switch (status) {
    case "ok":
      return "ra4-dot ra4-dot-green";
    case "warning":
      return "ra4-dot ra4-dot-amber";
    case "critical":
      return "ra4-dot ra4-dot-red";
    default:
      return "ra4-dot";
  }
};

const RevenueAnalyticsDash4: React.FC = () => {
  const [showAll, setShowAll] = useState(false);
  const tableWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <section className="ra4-section">
      <article className="ra4-card">
        {/* Header row */}
        <div className="ra4-card-header">
          <div className="ra4-header-left">
            <div className="ra4-icon-box">
              <span className="ra4-icon"><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 21 21" fill="none">
  <path d="M6.0186 20.4C4.337 20.4 2.9135 19.8173 1.7481 18.6519C0.5827 17.4865 0 16.063 0 14.3814C0 13.6754 0.1204 12.9893 0.3612 12.3231C0.602 11.6569 0.947 11.0531 1.3962 10.5117L5.11152 6.04348C5.42847 5.66229 5.49021 5.12981 5.26888 4.68622L3.83283 1.80807C3.41818 0.97701 4.02257 0 4.95134 0H15.4487C16.3774 0 16.9818 0.977011 16.5672 1.80808L15.1311 4.68622C14.9098 5.12981 14.9715 5.66229 15.2885 6.04348L19.0038 10.5117C19.453 11.0531 19.798 11.6569 20.0388 12.3231C20.2796 12.9893 20.4 13.6754 20.4 14.3814C20.4 16.063 19.8142 17.4865 18.6426 18.6519C17.4712 19.8173 16.0508 20.4 14.3814 20.4H6.0186ZM10.2 14.6883C9.6016 14.6883 9.0905 14.4764 8.6667 14.0526C8.2427 13.6288 8.0307 13.1177 8.0307 12.5193C8.0307 11.9207 8.2427 11.4095 8.6667 10.9857C9.0905 10.5619 9.6016 10.35 10.2 10.35C10.7984 10.35 11.3095 10.5619 11.7333 10.9857C12.1573 11.4095 12.3693 11.9207 12.3693 12.5193C12.3693 13.1177 12.1573 13.6288 11.7333 14.0526C11.3095 14.4764 10.7984 14.6883 10.2 14.6883ZM6.93472 3.9608C7.14682 4.3833 7.57912 4.65 8.05186 4.65H12.3568C12.831 4.65 13.2643 4.38169 13.4757 3.95723L14.37 2.16144C14.4528 1.99524 14.3319 1.8 14.1462 1.8H6.25523C6.06921 1.8 5.94835 1.99591 6.0318 2.16216L6.93472 3.9608ZM6.0186 18.6H14.3814C15.56 18.6 16.5577 18.1896 17.3745 17.3688C18.1915 16.548 18.6 15.5522 18.6 14.3814C18.6 13.886 18.515 13.4057 18.345 12.9405C18.175 12.4751 17.9323 12.0547 17.6169 11.6793L13.6393 6.90035C13.4018 6.61501 13.0498 6.45 12.6786 6.45H7.74849C7.37894 6.45 7.02833 6.61352 6.79082 6.89666L2.7945 11.6607C2.4791 12.0361 2.2345 12.4596 2.0607 12.9312C1.8869 13.4026 1.8 13.886 1.8 14.3814C1.8 15.5522 2.2104 16.548 3.0312 17.3688C3.852 18.1896 4.8478 18.6 6.0186 18.6Z" fill="#6685CC"/>
</svg></span>
            </div>
            <span className="ra4-title">
              Top Upsell Opportunities (hitting limits)
            </span>
          </div>
          <div className="ra4-header-right">
            {/* <span className="ra4-updated">Updated 3 mins ago</span> */}
            <button className="ra4-view-all" onClick={() => setShowAll((prev) => !prev)}>
              {showAll ? "View Less" : "View All"} <span className="ra4-view-arrow"><svg xmlns="http://www.w3.org/2000/svg" width="5" height="9" viewBox="0 0 5 9" fill="none">
  <path d="M0.600098 7.6001L4.1001 4.1001L0.600098 0.600098" stroke="#2A455E" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg></span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className={`ra4-table-wrapper ${showAll ? 'ra4-show-all' : ''}`} ref={tableWrapperRef}>
          <div className="ra4-scrollbar-container">
            <VerticalScrollbar height="100%" color="#D9DFE8" thickness={4} />
          </div>
          <table className="ra4-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Plan</th>
                <th>Average MRR</th>
                <th>Limit / Usage</th>
                <th>Over Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <div className="ra4-name-cell">
                      <div className="ra4-avatar">{row.initial}</div>
                      <span className="ra4-name-text">{row.customerName}</span>
                    </div>
                  </td>
                  <td>{row.plan}</td>
                  <td>{row.averageMrr}</td>
                  <td>{row.limitUsage}</td>
                  <td>
                    <div className="ra4-over-limit">
                      <span className={statusDotClass(row.status)} />
                      <span className="ra4-over-text">
                        {row.overLimitPercent}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <button className="ra4-view-btn">View</button>
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

export default RevenueAnalyticsDash4;
