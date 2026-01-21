import React from "react";
import "./InvoicesPage.css";

type Invoice = {
  id: string;
  productName: string;
  productType: string;
  billableMetrics: string;
  status: string;
  createdOn: string;
};

type Props = {
  invoices: Invoice[];
  onExploreIntegrations: () => void;
};

const InvoicesPage: React.FC<Props> = ({ invoices, onExploreIntegrations }) => {
  const isEmpty = invoices.length === 0;

  return (
    <div className="inv-page">
      {/* Header */}
      <div className="inv-header">
        <h1>Invoices</h1>

        <div className="inv-actions">
          <input
            className="inv-search"
            placeholder="Search"
            disabled={isEmpty}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="inv-table-shell">
        {/* Table Header */}
        <div className="inv-table-head">
          <div>Product Name</div>
          <div>Product Type</div>
          <div>Billable Metrics</div>
          <div>Status</div>
          <div>Created On</div>
          <div>Actions</div>
        </div>

        {/* Table Body */}
        <div className="inv-table-body">
          {isEmpty ? (
            <div className="inv-empty">
              <div className="inv-empty-icon">
                <span className="doc" />
                <span className="cross">×</span>
              </div>

              <p>
                You don’t have any invoices right now. Connect an integration to
                start generating invoices automatically and keep your billing
                in sync.
              </p>

              <button onClick={onExploreIntegrations}>
                Explore Integrations
              </button>
            </div>
          ) : (
            invoices.map((inv) => (
              <div key={inv.id} className="inv-row">
                <div>{inv.productName}</div>
                <div>{inv.productType}</div>
                <div>{inv.billableMetrics}</div>
                <div>{inv.status}</div>
                <div>{inv.createdOn}</div>
                <div>•••</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicesPage;
