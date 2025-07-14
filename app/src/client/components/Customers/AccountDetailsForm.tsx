import React from "react";
import "./Account.css";

const AccountDetailsForm: React.FC = () => {
  return (
    <div className="account-form">
      <h3>ACCOUNT DETAILS</h3>
      <form>
        <div className="form-groups">
          <label>Account Name</label>
          <input type="text" placeholder="Placeholder" />
        </div>

        <div className="form-groups">
          <label>Enter Net Term Days</label>
          <input type="text" placeholder="Placeholder" />
          <small className="note">
            Organization default setting for net term days will be applied. If this is empty, click here to configure
            from organization setting.
          </small>
        </div>

        <div className="form-groups">
          <label>Account ID</label>
          <input type="text" placeholder="Placeholder" />
        </div>

        <div className="form-groups">
          <label>Primary Email</label>
          <input type="email" placeholder="Placeholder" />
        </div>

        <div className="form-groups">
          <label>Email Recipients</label>
          <input type="email" placeholder="Placeholder" />
          <span className="error">* Error text</span>
          <div className="email-actions">
            <button type="button" className="link-btn">+ Add Email Recipients</button>
            <button type="button" className="link-btn">+ Add Additional Email Recipients</button>
          </div>
        </div>

        <div className="form-section">
          <label className="section-title">Account Billing Address</label>
          <div className="checkbox-group">
            <input type="checkbox" id="inheritAddress" />
            <label htmlFor="inheritAddress">Inherit Address from Customer</label>
          </div>
        </div>

        <div className="form-groups">
          <label>Phone Number</label>
          <input type="text" placeholder="45690785890" />
        </div>

        <div className="form-groups">
          <label>Billing Address Line 1</label>
          <input type="text" placeholder="Placeholder" />
        </div>

        <div className="form-groups">
          <label>Billing Address Line 2</label>
          <input type="text" placeholder="Placeholder" />
        </div>

        <div className="form-row">
          <div className="form-groups">
            <label>City</label>
            <input type="text" placeholder="Placeholder" />
          </div>
          <div className="form-groups">
            <label>Postal Code</label>
            <input type="text" placeholder="Placeholder" />
          </div>
        </div>

        <div className="form-groups">
          <label>State</label>
          <input type="text" placeholder="Placeholder" />
        </div>

        <div className="form-groups">
          <label>Country</label>
          <input type="text" placeholder="Placeholder" />
        </div>
      </form>
    </div>
  );
};

export default AccountDetailsForm;
