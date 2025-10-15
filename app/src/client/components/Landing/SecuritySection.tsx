import React from "react";
import "./SecuritySection.css";
import lock from "../LandingComponents/lock.svg"; // ← update the path if needed

type Item = { title: string; note?: string };

const items: Item[] = [
  { title: "SOC 2 Type 2", note: "In Progress; we can share our security brief under NDA." },
  { title: "SSO/SAML, RBAC", note: "Available on Growth & Enterprise" },
  { title: "Data Handling", note: "Least privilege, end-to-end encryption, customer-owned archives" },
  { title: "DPA", note: "Standard DPA with SCCs; subscriptions list on request." },
];

const SecuritySection: React.FC = () => {
  return (
    <section className="sec">
      <div className="sec__inner">
        {/* LEFT: glass card with lock.svg */}
       
       <div className="sec__art">
  <div className="sec__artCard">
    <img className="sec__artImg" src={lock} alt="Security lock" />
  </div>
</div>


        {/* RIGHT: copy + checklist */}
        <div className="sec__content">
          <h2 className="sec__title">Security for early adopters</h2>

          <ul className="sec__list" role="list">
            {items.map((it, idx) => (
              <li className="sec__listItem" key={idx}>
                <span className="sec__tickBox" aria-hidden="true">
                  {/* your exact check icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M23.4007 7.78213C23.4782 7.68075 23.5243 7.55533 23.5212 7.42575C23.5181 7.29623 23.4671 7.17419 23.3776 7.08471C23.2882 6.99523 23.1661 6.94423 23.0366 6.94118C22.907 6.93806 22.7816 6.98415 22.6802 7.06162C22.3383 7.3235 21.9983 7.58739 21.6604 7.85328C18.619 10.2463 15.7397 12.8013 13.0225 15.5185C11.8903 16.6507 10.7863 17.811 9.71038 18.9995H11.4629C9.79903 17.4933 8.08002 16.0422 6.30585 14.6463C5.96791 14.3804 5.62798 14.1165 5.28604 13.8546C5.18466 13.7772 5.05923 13.7311 4.92965 13.7342C4.80014 13.7372 4.6781 13.7882 4.58862 13.8777C4.49914 13.9672 4.44814 14.0892 4.44509 14.2188C4.44197 14.3483 4.48806 14.4738 4.56553 14.5751C4.82741 14.9171 5.09129 15.257 5.35718 15.595C6.75309 17.3691 8.20415 19.0881 9.71038 20.752C10.2301 21.2224 10.9924 21.2717 11.4629 20.752C12.6513 19.6761 13.8116 18.5721 14.9438 17.4399C17.661 14.7227 20.2161 11.8434 22.6091 8.80194C22.875 8.46401 23.1388 8.12407 23.4007 7.78213Z" fill="#6AB349"/>
                  </svg>
                </span>

                <div className="sec__text">
                  <div className="sec__itemTitle">{it.title}</div>
                  {it.note && <div className="sec__itemNote">{it.note}</div>}
                </div>
              </li>
            ))}
          </ul>

          <button className="sec__cta" type="button">
            Request Security Brief
            <span className="sec__ctaArrow" aria-hidden>›</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;
