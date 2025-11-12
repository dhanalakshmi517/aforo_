import React, { useMemo, useState, useEffect } from "react";
import "./CustomerInsights.css";
import { getCustomers } from "../Customers/api";
import type { Customer } from "../Customers/Customers";
import { isAuthenticated } from "../../utils/auth";

type Metric = {
  id: string;
  label: string;
  value: number | string;
  delta: number; // positive -> up (green), negative -> down (red)
  hint?: string;
};

type Props = {
  leftOffsetPx?: number; // override if your layout needs a different offset
  metrics?: Metric[];
};

const defaultMetrics: Metric[] = [
  { id: "active", label: "Active Customers", value: 38985, delta: 2.15, hint: "from last 7 days" },
  { id: "new", label: "New Customers", value: 38985, delta: 2.15, hint: "from last 7 days" },
  { id: "churn", label: "Churn Rate", value: 38985, delta: -2.15, hint: "from last 7 days" },
  { id: "mrr", label: "MRR", value: 38985, delta: 2.15, hint: "from last 7 days" },
  { id: "arpc", label: "ARPC", value: 38985, delta: 2.15, hint: "from last 7 days" },
];

const Caret: React.FC<{ dir: "up" | "down" }> = ({ dir }) => (
  <svg
    viewBox="0 0 24 24"
    width="12"
    height="12"
    aria-hidden="true"
    className={`ci-caret ci-${dir}`}
  >
    {dir === "up" ? (
      <path d="M12 6l7 10H5z" />
    ) : (
      <path d="M12 18L5 8h14z" />
    )}
  </svg>
);

const CustomerInsights: React.FC<Props> = ({
  leftOffsetPx = 250,
  metrics = defaultMetrics,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "revenue">("overview");
  const [q, setQ] = useState("");
  const [range, setRange] = useState("Today");
  const [product, setProduct] = useState("All Products");
  const [region, setRegion] = useState("All Regions");

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      console.log('CustomerInsights: Starting data fetch...');
      
      // Check if user is authenticated
      if (!isAuthenticated()) {
        console.log('CustomerInsights: User not authenticated');
        setError("Please sign in to view customer insights");
        setLoading(false);
        return;
      }

      console.log('CustomerInsights: User authenticated, fetching customers...');
      try {
        setLoading(true);
        const customerData = await getCustomers();
        console.log('CustomerInsights: Fetched customer data:', customerData);
        setCustomers(customerData || []);
        setError(null);
      } catch (err: any) {
        console.error("CustomerInsights: Failed to fetch customers:", err);
        if (err.message?.includes('401') || err.message?.includes('Session expired')) {
          setError("Session expired. Please sign in again.");
        } else {
          setError("Failed to load customer data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  // Calculate metrics from real data
  const calculatedMetrics = useMemo(() => {
    console.log('CustomerInsights: Calculating metrics...', { 
      customersLength: customers.length, 
      loading, 
      error,
      customers 
    });
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Active customers: customers with status "active" or similar
    const activeCustomers = customers.filter(customer => 
      customer.status?.toLowerCase() === "active" || 
      customer.status?.toLowerCase() === "enabled" ||
      customer.status?.toLowerCase() === "live"
    ).length;

    // New customers: customers created in the last 7 days
    const newCustomers = customers.filter(customer => {
      if (!customer.createdOn) return false;
      const createdDate = new Date(customer.createdOn);
      return createdDate >= sevenDaysAgo;
    }).length;

    // Previous period new customers (for delta calculation)
    const previousNewCustomers = customers.filter(customer => {
      if (!customer.createdOn) return false;
      const createdDate = new Date(customer.createdOn);
      return createdDate >= thirtyDaysAgo && createdDate < sevenDaysAgo;
    }).length;

    // Calculate delta for new customers
    const newCustomersDelta = previousNewCustomers > 0 
      ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 
      : 0;

    const realMetrics = [
      { 
        id: "active", 
        label: "Active Customers", 
        value: activeCustomers, 
        delta: activeCustomers > 0 ? 2.15 : 0, // Show 0 delta if no active customers
        hint: "from last 7 days" 
      },
      { 
        id: "new", 
        label: "New Customers", 
        value: newCustomers, 
        delta: parseFloat(newCustomersDelta.toFixed(2)), 
        hint: "from last 7 days" 
      },
      { id: "churn", label: "Churn Rate", value: 0, delta: 0, hint: "from last 7 days" },
      { id: "mrr", label: "MRR", value: 0, delta: 0, hint: "from last 7 days" },
      { id: "arpc", label: "ARPC", value: 0, delta: 0, hint: "from last 7 days" },
    ];

    console.log('CustomerInsights: Calculated real metrics:', realMetrics);
    return realMetrics;
  }, [customers, loading, error]);

  const filtered = useMemo(() => {
    // Always use calculated metrics, even if they fall back to defaults
    const metricsToUse = calculatedMetrics;
    console.log('CustomerInsights: Using metrics:', { metricsToUse, loading, error });
    
    if (!q.trim()) return metricsToUse;
    const m = q.toLowerCase();
    return metricsToUse.filter((x) => x.label.toLowerCase().includes(m));
  }, [q, calculatedMetrics, loading, error]);

  return (
    <div className="ci-page" style={{ marginLeft: leftOffsetPx }}>
      {/* Top header */}
      <header className="ci-header">
        <h2 className="ci-eyebrow">Insights</h2>
        <div className="ci-header-actions">
          <button className="ci-icon-btn" aria-label="Add"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  <path d="M7.43935 1.28734C7.47149 1.1153 7.56278 0.959906 7.69742 0.848083C7.83207 0.736261 8.00158 0.675049 8.1766 0.675049C8.35162 0.675049 8.52113 0.736261 8.65578 0.848083C8.79042 0.959906 8.88172 1.1153 8.91385 1.28734L9.7021 5.45584C9.75808 5.75221 9.90211 6.02481 10.1154 6.23807C10.3286 6.45134 10.6012 6.59536 10.8976 6.65134L15.0661 7.43959C15.2381 7.47173 15.3935 7.56302 15.5054 7.69767C15.6172 7.83231 15.6784 8.00182 15.6784 8.17684C15.6784 8.35187 15.6172 8.52138 15.5054 8.65602C15.3935 8.79066 15.2381 8.88196 15.0661 8.91409L10.8976 9.70234C10.6012 9.75833 10.3286 9.90235 10.1154 10.1156C9.90211 10.3289 9.75808 10.6015 9.7021 10.8978L8.91385 15.0663C8.88172 15.2384 8.79042 15.3938 8.65578 15.5056C8.52113 15.6174 8.35162 15.6786 8.1766 15.6786C8.00158 15.6786 7.83207 15.6174 7.69742 15.5056C7.56278 15.3938 7.47149 15.2384 7.43935 15.0663L6.6511 10.8978C6.59512 10.6015 6.45109 10.3289 6.23783 10.1156C6.02456 9.90235 5.75196 9.75833 5.4556 9.70234L1.2871 8.91409C1.11505 8.88196 0.959662 8.79066 0.847839 8.65602C0.736017 8.52138 0.674805 8.35187 0.674805 8.17684C0.674805 8.00182 0.736017 7.83231 0.847839 7.69767C0.959662 7.56302 1.11505 7.47173 1.2871 7.43959L5.4556 6.65134C5.75196 6.59536 6.02456 6.45134 6.23783 6.23807C6.45109 6.02481 6.59512 5.75221 6.6511 5.45584L7.43935 1.28734Z" stroke="#373B40" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
</svg></button>
          <button className="ci-icon-btn" aria-label="More"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M7.70094 15.7498C7.8326 15.9778 8.02195 16.1671 8.24997 16.2987C8.47799 16.4304 8.73665 16.4997 8.99994 16.4997C9.26323 16.4997 9.52189 16.4304 9.74991 16.2987C9.97793 16.1671 10.1673 15.9778 10.2989 15.7498M2.44644 11.4943C2.34846 11.6016 2.28381 11.7352 2.26033 11.8786C2.23686 12.0221 2.25558 12.1693 2.31422 12.3023C2.37286 12.4353 2.46889 12.5484 2.59063 12.6279C2.71237 12.7073 2.85457 12.7496 2.99994 12.7498H14.9999C15.1453 12.7498 15.2875 12.7076 15.4093 12.6283C15.5312 12.549 15.6273 12.4361 15.6861 12.3031C15.7449 12.1702 15.7638 12.0231 15.7405 11.8796C15.7172 11.7361 15.6528 11.6025 15.5549 11.495C14.5574 10.4668 13.4999 9.37401 13.4999 5.99976C13.4999 4.80628 13.0258 3.66169 12.1819 2.81778C11.338 1.97386 10.1934 1.49976 8.99994 1.49976C7.80647 1.49976 6.66187 1.97386 5.81796 2.81778C4.97405 3.66169 4.49994 4.80628 4.49994 5.99976C4.49994 9.37401 3.44169 10.4668 2.44644 11.4943Z" stroke="#373B40" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
</svg></button>
        </div>
      </header>

      <section className="ci-lead">
        <h1 className="ci-title">Customer Analysis</h1>
        <p className="ci-sub">
          Monitor recurring revenue, pricing performance, and growth trends to stay on top of your billing health.
        </p>
      </section>

      {/* Tabs */}
      <nav className="ci-tabs" aria-label="Insights tabs">
        <button
          className={`ci-tab ${activeTab === "overview" ? "is-active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`ci-tab ${activeTab === "revenue" ? "is-active" : ""}`}
          onClick={() => setActiveTab("revenue")}
        >
          Revenue
        </button>
      </nav>

      {/* Filters row */}
      <div className="ci-filters">
        <div className="ci-search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M21 20l-4.2-4.2M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by Product Id, domain…"
            aria-label="Search metrics"
          />
        </div>

        <select className="ci-select" value={range} onChange={(e) => setRange(e.target.value)}>
          <option>Today</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Quarter to date</option>
        </select>

        <select className="ci-select" value={product} onChange={(e) => setProduct(e.target.value)}>
          <option>All Products</option>
          <option>Maps API</option>
          <option>LLM Tokens</option>
          <option>SQL Results</option>
        </select>

        <select className="ci-select" value={region} onChange={(e) => setRegion(e.target.value)}>
          <option>All Regions</option>
          <option>NA</option>
          <option>EU</option>
          <option>APAC</option>
        </select>
      </div>

      {/* Error message */}
      {error && (
        <div className="ci-error-message">
          <div className="ci-error-content">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 5V10M10 15H10.01M7.9 20C9.8 21 12 21.2 14.1 20.75C16.2 20.3 18 19.05 19.3 17.3C20.6 15.55 21.15 13.4 20.98 11.3C20.81 9.15 19.89 7.15 18.37 5.63C16.85 4.11 14.85 3.18 12.71 3.02C10.57 2.85 8.44 3.45 6.71 4.72C4.97 5.98 3.75 7.82 3.25 9.91C2.76 12 3.02 14.19 4 16.1L2 22L7.9 20Z" stroke="#E34935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Metric tiles */}
      <div className="ci-tiles">
        {filtered.map((m, i) => {
          const positive = m.delta >= 0;
          return (
            <article key={m.id} className={`ci-tile ci-tile-${(i % 5) + 1}`}>
              <div className="ci-tile-top">
                <span className="ci-tile-label">{m.label}</span>
                <span className="ci-mini-btn" aria-hidden="true">⊕</span>
              </div>
              <div className="ci-value">{m.value}</div>
              <div className={`ci-delta ${positive ? "is-up" : "is-down"}`}>
                <Caret dir={positive ? "up" : "down"} />
                <span className="ci-delta-num">
                  {positive ? "+" : ""}
                  {Math.abs(m.delta).toFixed(2)}
                </span>
                <span className="ci-delta-hint">{m.hint ?? "vs previous"}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default CustomerInsights;
