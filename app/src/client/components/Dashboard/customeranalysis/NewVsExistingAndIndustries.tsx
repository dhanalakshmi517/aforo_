import React, { useState } from "react";
import "./NewVsExistingAndIndustries.css";

const NewVsExistingAndIndustries: React.FC = () => {
  const [showAll, setShowAll] = useState(false);

  const handleToggle = () => {
    setShowAll(!showAll);
  };

  return (
    <section className="nei-card nei-right-card">
      <header className="nei-card-header nei-right-header">
        <div className="nei-title-block nei-icon-title">
          <div className="nei-trophy-pill">
            <span className="nei-trophy">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
              >
                <path
                  d="M8.75 13.41V15.036C8.74622 15.3786 8.65448 15.7145 8.48358 16.0115C8.31268 16.3085 8.06834 16.5566 7.774 16.732C7.14914 17.1948 6.64084 17.797 6.28948 18.4907C5.93813 19.1843 5.75341 19.9504 5.75 20.728M12.75 13.41V15.036C12.7538 15.3786 12.8455 15.7145 13.0164 16.0115C13.1873 16.3085 13.4317 16.5566 13.726 16.732C14.3509 17.1948 14.8592 17.797 15.2105 18.4907C15.5619 19.1843 15.7466 19.9504 15.75 20.728M16.75 7.75H18.25C18.913 7.75 19.5489 7.48661 20.0178 7.01777C20.4866 6.54893 20.75 5.91304 20.75 5.25C20.75 4.58696 20.4866 3.95107 20.0178 3.48223C19.5489 3.01339 18.913 2.75 18.25 2.75H16.75M16.75 7.75C16.75 9.3413 16.1179 10.8674 14.9926 11.9926C13.8674 13.1179 12.3413 13.75 10.75 13.75C9.1587 13.75 7.63258 13.1179 6.50736 11.9926C5.38214 10.8674 4.75 9.3413 4.75 7.75M16.75 7.75V1.75C16.75 1.48478 16.6446 1.23043 16.4571 1.04289C16.2696 0.855357 16.0152 0.75 15.75 0.75H5.75C5.48478 0.75 5.23043 0.855357 5.04289 1.04289C4.85536 1.23043 4.75 1.48478 4.75 1.75V7.75M2.75 20.75H18.75M4.75 7.75H3.25C2.58696 7.75 1.95107 7.48661 1.48223 7.01777C1.01339 6.54893 0.75 5.91304 0.75 5.25C0.75 4.58696 1.01339 3.95107 1.48223 3.48223C1.95107 3.01339 2.58696 2.75 3.25 2.75H4.75"
                  stroke="#389315"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
          <h3 className="nei-title">Top Industries</h3>
        </div>
        <div className="nei-right-meta">
          <button className="nei-view-btn" onClick={handleToggle}>
            {showAll ? "View Less" : "View All"}
            <span className="nei-view-arrow">›</span>
          </button>
        </div>
      </header>

      <div className="nei-table">
        <div className="nei-table-header">
          <div>Industry Name</div>
          <div>Total Revenue</div>
          <div className="nei-header-with-icon">
            MRR
            <span className="nei-info-icon">ⓘ</span>
          </div>
          <div>No. Of Customers</div>
        </div>

        {[
          { industry: "Technology", total: "$25,000", mrr: "$5,000", customers: "32,456" },
          { industry: "Finance", total: "$15,482", mrr: "$5,482", customers: "20,458" },
          { industry: "Healthcare", total: "$2,400", mrr: "$1,400", customers: "8,789" },
          { industry: "Education", total: "$5,855", mrr: "$2,855", customers: "11,757" },
        ].map((row) => (
          <div className="nei-table-row" key={row.industry}>
            <div>{row.industry}</div>
            <div>{row.total}</div>
            <div>{row.mrr}</div>
            <div className="nei-customers-cell">
              <div className="nei-avatar-group">
                <span className="nei-avatar">🧑‍💼</span>
                <span className="nei-avatar">🧑‍💻</span>
                <span className="nei-avatar">👩‍💼</span>
              </div>
              <span className="nei-customers-count">{row.customers}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewVsExistingAndIndustries;
