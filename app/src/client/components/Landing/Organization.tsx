import React, { useState } from "react";
import ThankYou from "./ThankYou";
import VisualBg from "./visual.svg";
import { createOrganization, OrganizationPayload } from "./api";
import "./Organization.css";

const Organization: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload: OrganizationPayload = {
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      company: data.get("company"),
      businessEmail: data.get("email"),
      role: data.get("role"),
      employeeSize: data.get("empSize"),
      country: data.get("country"),
      phoneNumber: data.get("phone"),
      howCanWeHelp: data.get("help"),
      marketingOptIn: data.get("agree") === "on",
    };

    try {
      console.log("Submitting organization payload", payload);
      const responseJson = await createOrganization(payload);
      console.log("Organization created successfully", responseJson);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Organization creation failed", err);
      alert(`Failed to submit: ${err.message || err}`);
    }
  };
  if (submitted) return <ThankYou />;

  return (
    <div className="org-page">
      {/* Decorative background SVG */}
      <img src={VisualBg} alt="" className="org-bg" aria-hidden="true"/>


      <div className="org-wrap">
        {/* Left copy */}
        <section className="org-copy">
          <h1 className="org-title">
            You Focus on the Product.
            <br />
            <span>Aforo Will Handle the Billing.</span>
          </h1>
          <p className="org-sub">
            Get expert help from Aforo’s sales team to set up everything —
            from subscriptions and usage-based pricing to automated payments.
          </p>
        </section>

        {/* Right form */}
        <section className="org-form-card">
          <form className="org-form" onSubmit={handleSubmit}>
            <div className="org-row">
              <div className="org-field">
                <label htmlFor="firstName">
                  First Name<span className="req">*</span>
                </label>
                <input id="firstName" name="firstName" placeholder="Placeholder" required />
              </div>

              <div className="org-field">
                <label htmlFor="lastName">
                  Last Name<span className="req">*</span>
                </label>
                <input id="lastName" name="lastName" placeholder="Placeholder" required />
              </div>
            </div>

            <div className="org-field">
              <label htmlFor="email">
                Business Email<span className="req">*</span>
              </label>
              <input id="email" type="email" name="email" placeholder="Placeholder" required />
            </div>

            <div className="org-row">
              <div className="org-field">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" placeholder="Placeholder" required />
              </div>

              <div className="org-field">
                <label htmlFor="role">Your Role</label>
                <select id="role" name="role" defaultValue="" required>
                  <option value="" disabled>
                    Placeholder
                  </option>
                  <option>OWNER</option>
                  <option>ADMIN</option>
                  <option>CEO</option>
                  <option>CTO</option>
                  <option>CFO</option>
                  <option>MANAGER</option>
                  <option>ENGINEER</option>
                  <option>MARKETING</option>
                  <option>SALES</option>
                  <option>SUPPORT</option>
                </select>
              </div>
            </div>

            <div className="org-row">
              <div className="org-field">
                <label htmlFor="empSize">Employee size of the company</label>
                <select id="empSize" name="empSize" defaultValue="" required>
                  <option value="" disabled>
                    Placeholder
                  </option>
                  <option value="_1_10">1-10</option>
                  <option value="_11_50">11-50</option>
                  <option value="_51_100">51-100</option>
                  <option value="_101_500">101-500</option>
                  <option value="_501_1000">501-1000</option>
                  <option value="_1001_5000">1001-5000</option>
                  <option value="_5001_10000">5001-10000</option>
                  <option value="_10001_50000">10001-50000</option>
                  <option value="_50001_100000">50001-100000</option>
                  <option value="_100001_PLUS">100001+</option>
                </select>
              </div>

              <div className="org-field">
                <label htmlFor="country">Country</label>
                <select id="country" name="country" defaultValue="" required>
                  <option value="" disabled>
                    Placeholder
                  </option>
                  <option>AF</option><option>AX</option><option>AL</option><option>DZ</option><option>AS</option><option>AD</option><option>AO</option><option>AI</option><option>AQ</option><option>AG</option><option>AR</option><option>AM</option><option>AW</option><option>AU</option><option>AT</option><option>AZ</option><option>BS</option><option>BH</option><option>BD</option><option>BB</option><option>BY</option><option>BE</option><option>BZ</option><option>BJ</option><option>BM</option><option>BT</option><option>BO</option><option>BQ</option><option>BA</option><option>BW</option><option>BV</option><option>BR</option><option>IO</option><option>BN</option><option>BG</option><option>BF</option><option>BI</option><option>KH</option><option>CM</option><option>CA</option><option>CV</option><option>KY</option><option>CF</option><option>TD</option><option>CL</option><option>CN</option><option>CX</option><option>CC</option><option>CO</option><option>KM</option><option>CG</option><option>CD</option><option>CK</option><option>CR</option><option>CI</option><option>HR</option><option>CU</option><option>CW</option><option>CY</option><option>CZ</option><option>DK</option><option>DJ</option><option>DM</option><option>DO</option><option>EC</option><option>EG</option><option>SV</option><option>GQ</option><option>ER</option><option>EE</option><option>SZ</option><option>ET</option><option>FK</option><option>FO</option><option>FJ</option><option>FI</option><option>FR</option><option>GF</option><option>PF</option><option>TF</option><option>GA</option><option>GM</option><option>GE</option><option>DE</option><option>GH</option><option>GI</option><option>GR</option><option>GL</option><option>GD</option><option>GP</option><option>GU</option><option>GT</option><option>GG</option><option>GN</option><option>GW</option><option>GY</option><option>HT</option><option>HM</option><option>VA</option><option>HN</option><option>HK</option><option>HU</option><option>IS</option><option>IN</option><option>ID</option><option>IR</option><option>IQ</option><option>IE</option><option>IM</option><option>IL</option><option>IT</option><option>JM</option><option>JP</option><option>JE</option><option>JO</option><option>KZ</option><option>KE</option><option>KI</option><option>KP</option><option>KR</option><option>KW</option><option>KG</option><option>LA</option><option>LV</option><option>LB</option><option>LS</option><option>LR</option><option>LY</option><option>LI</option><option>LT</option><option>LU</option><option>MO</option><option>MG</option><option>MW</option><option>MY</option><option>MV</option><option>ML</option><option>MT</option><option>MH</option><option>MQ</option><option>MR</option><option>MU</option><option>YT</option><option>MX</option><option>FM</option><option>MD</option><option>MC</option><option>MN</option><option>ME</option><option>MS</option><option>MA</option><option>MZ</option><option>MM</option><option>NA</option><option>NR</option><option>NP</option><option>NL</option><option>NC</option><option>NZ</option><option>NI</option><option>NE</option><option>NG</option><option>NU</option><option>NF</option><option>MP</option><option>NO</option><option>OM</option><option>PK</option><option>PW</option><option>PS</option><option>PA</option><option>PG</option><option>PY</option><option>PE</option><option>PH</option><option>PN</option><option>PL</option><option>PT</option><option>PR</option><option>QA</option><option>RE</option><option>RO</option><option>RU</option><option>RW</option><option>BL</option><option>SH</option><option>KN</option><option>LC</option><option>MF</option><option>PM</option><option>VC</option><option>WS</option><option>SM</option><option>ST</option><option>SA</option><option>SN</option><option>RS</option><option>SC</option><option>SL</option><option>SG</option><option>SX</option><option>SK</option><option>SI</option><option>SB</option><option>SO</option><option>ZA</option><option>GS</option><option>SS</option><option>ES</option><option>LK</option><option>SD</option><option>SR</option><option>SJ</option><option>SE</option><option>CH</option><option>SY</option><option>TW</option><option>TJ</option><option>TZ</option><option>TH</option><option>TL</option><option>TG</option><option>TK</option><option>TO</option><option>TT</option><option>TN</option><option>TR</option><option>TM</option><option>TC</option><option>TV</option><option>UG</option><option>UA</option><option>AE</option><option>GB</option><option>US</option><option>UM</option><option>UY</option><option>UZ</option><option>VU</option><option>VE</option><option>VN</option><option>VG</option><option>VI</option><option>WF</option><option>EH</option><option>YE</option><option>ZM</option><option>ZW</option>
                </select>
              </div>
            </div>

              <div className="org-field">
                <label htmlFor="phone">Phone Number</label>
                <input id="phone" name="phone" placeholder="Placeholder" required />
              </div>
              <div className="org-field org-empty" />

            <div className="org-field">
              <label htmlFor="help">How can we help you?</label>
              <textarea
                id="help"
                name="help"
                placeholder="Placeholder Placeholder Placeholder"
                rows={4}
                required
              />
            </div>

            <div className="org-terms">
              <input id="agree" name="agree" type="checkbox" />
              <label htmlFor="agree">
                By submit, I agree to share my info, and agree to the{" "}
                <a href="#" aria-label="Terms & Conditions">
                  Terms & Conditions
                </a>{" "}
                and the{" "}
                <a href="#" aria-label="Privacy Policy">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            <button className="org-btn" type="submit">Contact Sales</button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Organization;
