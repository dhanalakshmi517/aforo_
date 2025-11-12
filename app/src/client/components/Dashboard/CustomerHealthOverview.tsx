import React, { useMemo, useEffect, useState } from "react";
import "./CustomerHealthOverview.css";
import { getCustomers } from "../Customers/api";
import { isAuthenticated } from "../../utils/auth";

type HealthBucket = {
  label: string;
  value: number;
  color: string;
  note: string;
};

type Props = {
  leftOffsetPx?: number;
  buckets?: HealthBucket[];
  lineSeries?: number[];    // 0..100 percentages, one per month
  months?: string[];        // labels for x-axis
  updatedAgo?: string;      // e.g., "3 mins ago"
};

const DEFAULT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul"];
const DEFAULT_SERIES = [40, 70, 55, 45, 50, 68, 83];

const CustomerHealthOverview: React.FC<Props> = ({
  leftOffsetPx = 250,
  lineSeries = DEFAULT_SERIES,
  months = DEFAULT_MONTHS,
  updatedAgo = "3 mins ago",
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customer data
  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!isAuthenticated()) {
        setError("Please sign in to view customer health");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const customerData = await getCustomers();
        setCustomers(customerData || []);
        setError(null);
      } catch (err) {
        setError("Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  // Calculate real customer stats
  const stats = useMemo(() => {
    if (loading || error || customers.length === 0) {
      return [
        { label: "Healthy Customers", value: 0, color: "#25A36F", note: "Active customers" },
        { label: "At-Risk Customers", value: 0, color: "#F5C542", note: "Draft customers" }
      ];
    }

    // Active customers (healthy)
    const activeCustomers = customers.filter(customer => 
      customer.status?.toLowerCase() === "active" || 
      customer.status?.toLowerCase() === "enabled" ||
      customer.status?.toLowerCase() === "live"
    ).length;

    // Draft customers (at-risk)
    const draftCustomers = customers.filter(customer => 
      customer.status?.toLowerCase() === "draft"
    ).length;

    return [
      { label: "Healthy Customers", value: activeCustomers, color: "#25A36F", note: "Active customers" },
      { label: "At-Risk Customers", value: draftCustomers, color: "#F5C542", note: "Draft customers" }
    ];
  }, [customers, loading, error]);

  return (
    <div className="cho-page" style={{ marginLeft: leftOffsetPx }}>
      <h1 className="cho-h1">
        Customer Health Overview
        <span className="cho-help" aria-hidden="true">ⓘ</span>
      </h1>

      <div className="cho-row">
        {/* Left card - Chart */}
        <section className="cho-card">
          <div className="cho-card-head">
            <h3>Customer Health Overview</h3>
            <span className="cho-upd">Updated {updatedAgo}</span>
          </div>

          <div className="cho-chart-container">
            <iframe 
              src="http://localhost:3001/d-solo/adb2nc2/donut?orgId=1&from=1762818107995&to=1762839707995&timezone=browser&panelId=panel-1&__feature.dashboardSceneSolo=true&theme=light" 
              width="500" 
              height="400" 
              frameBorder="0"
            ></iframe>
          </div>
        </section>

        {/* Right card - Status Counts */}
        <section className="cho-card">
          <div className="cho-card-head">
            <h3>Customer Status</h3>
            <span className="cho-upd">Updated {updatedAgo}</span>
          </div>

          <div className="cho-side">
            {stats.map((s) => (
              <div key={s.label} className="cho-chip" style={{ ["--band" as any]: s.color }}>
                <div className="cho-chip-title">{s.label}</div>
                <div className="cho-chip-val">{s.value.toLocaleString()}</div>
                <div className="cho-chip-note">{s.note}</div>
              </div>
            ))}

            <ul className="cho-legend">
              {stats.map((s) => (
                <li key={s.label}>
                  <span className="cho-dot" style={{ background: s.color }} />
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CustomerHealthOverview;
