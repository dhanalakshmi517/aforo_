import React from 'react';
import './Features.css';
import DashboardIcon from './Dashboard.svg';
import PlanIcon from './Plan.svg';
import MeterIcon from './Meter.svg';
import BillingIcon from './Billing.svg';

const Features: React.FC = () => {
  return (
    <section className="feature-grid">
      <div className="feature-card">
        <img src={DashboardIcon} alt="SaaS Billing Dashboard" />
        <h3>SaaS Billing Dashboard</h3>
        <p>Manage products, pricing, usage, and billing—all in one place.</p>
      </div>
      <div className="feature-card">
        <img src={PlanIcon} alt="Flexible Product & Plan Setup" />
        <h3>Flexible Product & Plan Setup</h3>
        <p>Create products with multiple rate plans—per-use, subscription, or tiered.</p>
      </div>
      <div className="feature-card">
        <img src={MeterIcon} alt="Accurate Metering & Usage Tracking" />
        <h3>Accurate Metering & Usage Tracking</h3>
        <p>Track usage and billing accurately across all your products.</p>
      </div>
      <div className="feature-card">
        <img src={BillingIcon} alt="Prepaid & Postpaid Billing" />
        <h3>Prepaid & Postpaid Billing</h3>
        <p>Support both prepaid and postpaid billing models with ease.</p>
      </div>
    </section>
  );
};

export default Features;
