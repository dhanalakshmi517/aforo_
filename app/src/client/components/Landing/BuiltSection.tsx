import React from "react";
import BuiltCard from "../LandingComponents/BuiltCard";
import "./BuiltSection.css";

// SVG Icons for each card
const IntegrationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="81" height="86" viewBox="0 0 81 86" fill="none">
    <path d="M28.651 70.0219C19.6009 68.4784 15.0758 67.7067 14.0757 64.5656C13.0756 61.4244 16.3215 58.1785 22.8133 51.6867L50.0516 24.4484C57.1618 17.3382 60.7169 13.7831 63.9602 14.9657C67.2034 16.1483 67.6359 21.1573 68.5007 31.1753L71.2944 63.5354C71.8488 69.9565 72.1259 73.1671 70.1694 74.968C68.2128 76.7689 65.0362 76.2271 58.683 75.1436L28.651 70.0219Z" stroke="#0B80C2" stroke-width="2.8"/>
    <path opacity="0.3" d="M20.651 62.0219C11.6009 60.4784 7.07585 59.7067 6.07573 56.5656C5.07562 53.4244 8.3215 50.1785 14.8133 43.6867L42.0516 16.4484C49.1618 9.33823 52.7169 5.78315 55.9602 6.96572C59.2034 8.14829 59.6359 13.1573 60.5007 23.1753L63.2944 55.5354C63.8488 61.9565 64.1259 65.1671 62.1694 66.968C60.2128 68.7689 57.0362 68.2271 50.683 67.1436L20.651 62.0219Z" stroke="#0B80C2" stroke-width="2.8"/>
  </svg>
);

const DataIngestionIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="74" height="74" viewBox="0 0 74 74" fill="none">
    <path d="M28.651 66.0219C19.6009 64.4784 15.0758 63.7067 14.0757 60.5656C13.0756 57.4244 16.3215 54.1785 22.8133 47.6867L50.0516 20.4484C57.1618 13.3382 60.7169 9.78315 63.9602 10.9657C67.2034 12.1483 67.6359 17.1573 68.5007 27.1753L71.2944 59.5354C71.8488 65.9565 72.1259 69.1671 70.1694 70.968C68.2128 72.7689 65.0362 72.2271 58.683 71.1436L28.651 66.0219Z" stroke="#0B80C2" stroke-width="2.8"/>
    <path opacity="0.3" d="M10.0162 26.2528C6.7595 40.9788 5.13115 48.3418 8.69221 50.2942C12.2533 52.2467 17.5855 46.9145 28.25 36.25L37.6945 26.8055C47.132 17.368 51.8507 12.6493 50.1171 9.16248C48.3834 5.6757 41.773 6.5899 28.5523 8.4183L20.9643 9.4677C17.3545 9.96692 15.5497 10.2165 14.3014 11.3684C13.0532 12.5204 12.6597 14.2994 11.8728 17.8576L10.0162 26.2528Z" stroke="#0B80C2" stroke-width="2.8"/>
  </svg>
);

const PricingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80" fill="none">
    <path d="M16.7996 28.5189C10.7517 22.2873 7.72778 19.1715 8.66299 16.1123C9.59821 13.0531 13.8475 12.1608 22.346 10.3762L46.8406 5.23249C52.9442 3.9508 55.9959 3.30995 58.0039 4.96075C60.0119 6.61155 59.9734 9.72963 59.8964 15.9658L59.526 45.9664C59.3882 57.1295 59.3193 62.711 55.953 64.0518C52.5866 65.3927 48.699 61.3871 40.9239 53.3758L16.7996 28.5189Z" stroke="#0B80C2" stroke-width="2.8"/>
    <path opacity="0.3" d="M3.23693 40.629C3.75232 55.266 4.01002 62.5845 7.89949 63.6103C11.789 64.6361 15.6224 58.3965 23.2892 45.9175L39.8997 18.8814C44.9463 10.6672 47.4696 6.56008 45.6587 3.70516C43.8478 0.850241 39.057 1.38255 29.4754 2.44718L11.9814 4.39095C7.2467 4.91703 4.87935 5.18007 3.49065 6.78767C2.10195 8.39527 2.18576 10.7757 2.3534 15.5366L3.23693 40.629Z" stroke="#0B80C2" stroke-width="2.8"/>
  </svg>
);

const MeteringIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="77" height="76" viewBox="0 0 77 76" fill="none">
    <path d="M30.0081 30.1897C23.3769 24.5829 20.0613 21.7794 20.6912 18.6431C21.3212 15.5068 25.4621 14.2011 33.7441 11.5897L57.6144 4.06302C63.5624 2.18754 66.5364 1.2498 68.6969 2.69521C70.8575 4.14062 71.1257 7.24737 71.6621 13.4609L74.2427 43.3526C75.2029 54.4751 75.683 60.0364 72.4648 61.7017C69.2465 63.367 64.984 59.7629 56.459 52.5548L30.0081 30.1897Z" stroke="#0B80C2" stroke-width="2.8"/>
    <path opacity="0.3" d="M25.5937 48.1664C17.8293 44.1211 13.9471 42.0985 13.8847 38.8857C13.8223 35.673 17.623 33.5011 25.2245 29.1574L51.2957 14.2596C58.5022 10.1416 62.1055 8.08258 64.8027 9.64786C67.5 11.2131 67.5 15.3632 67.5 23.6634V52.1445C67.5 60.1289 67.5 64.1211 64.8932 65.7024C62.2863 67.2836 58.7458 65.439 51.6648 61.7497L25.5937 48.1664Z" stroke="#0B80C2" stroke-width="2.8"/>
  </svg>
);

const BillingIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="77" viewBox="0 0 64 77" fill="none">
    <path d="M14.7771 47.629C12.7744 52.7193 11.773 55.2644 12.7978 57.3947C13.8225 59.525 16.436 60.3313 21.6629 61.9439L37.9994 66.9838C46.5742 69.6293 50.8617 70.952 53.1686 68.6532C55.4755 66.3545 54.168 62.0624 51.553 53.4782L43.5585 27.2356C39.7915 14.8699 37.908 8.68699 34.0631 8.53478C30.2183 8.38257 27.8519 14.3972 23.1191 26.4264L14.7771 47.629Z" stroke="#0B80C2" stroke-width="2.8"/>
    <path opacity="0.3" d="M9.23693 32.871C9.75232 18.234 10.01 10.9155 13.8995 9.88974C17.789 8.86395 21.6224 15.1035 29.2892 27.5825L45.8997 54.6186C50.9463 62.8328 53.4696 66.9399 51.6587 69.7948C49.8478 72.6498 45.057 72.1174 35.4754 71.0528L17.9814 69.109C13.2467 68.583 10.8793 68.3199 9.49065 66.7123C8.10195 65.1047 8.18576 62.7243 8.3534 57.9634L9.23693 32.871Z" stroke="#0B80C2" stroke-width="2.8"/>
  </svg>
);

const AiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="62" height="80" viewBox="0 0 62 80" fill="none">
    <path opacity="0.3" d="M29.3434 62.5213C22.7685 61.8239 19.481 61.4753 18.0936 59.1523C16.7062 56.8293 17.9579 53.7696 20.4614 47.65L25.0381 36.4625C31.7679 20.0118 35.1328 11.7864 39.3464 12.428C43.56 13.0696 44.3243 21.9236 45.8531 39.6318L46.8702 51.4126C47.3932 57.4713 47.6547 60.5006 45.8314 62.2886C44.0081 64.0766 40.9845 63.7559 34.9372 63.1146L29.3434 62.5213Z" stroke="#0B80C2" stroke-width="2.8"/>
    <path d="M9.4316 48.4717C12.1503 61.5214 13.5096 68.0462 17.3743 68.5084C21.239 68.9706 24.0986 62.9503 29.8179 50.9097L45.2618 18.3961C49.1052 10.3048 51.0269 6.25916 49.0876 3.64669C47.1482 1.03423 42.7195 1.70271 33.8621 3.03968L12.3219 6.29103C7.01081 7.09271 4.35526 7.49355 3.02367 9.40775C1.69207 11.3219 2.23982 13.9511 3.33531 19.2095L9.4316 48.4717Z" stroke="#0B80C2" stroke-width="2.8"/>
  </svg>
);

export default function BuiltForSection() {
  return (
    <section className="bfm">
      <div className="bfm__container">
        <header className="bfm__header">
          <h2 className="bfm__title">Built for Modern Monetization</h2>
          <p className="bfm__subtitle">
            Aforo is built for teams who are tired of forcing their unique event streams
            and usage signals into legacy rating engines.
          </p>
        </header>

        <div className="bfm__grid">
          <BuiltCard
            title="NATIVE INTEGRATIONS & PLUG-INS"
            description="Embed pricing and product info into portals, connect easily with API gateways and billing platforms."
            iconSvg={<IntegrationIcon />}
          />

          <BuiltCard
            title="FLEXIBLE DATA INGESTION"
            description="Ingest usage in real time or batch — APIs, LLM tokens, files, or queries — without forcing one data model."
            iconSvg={<DataIngestionIcon />}
          />

          <BuiltCard
            title="DYNAMIC PRICING & RATE PLANS"
            description="Design flat-fee, tiered, volume, or per-transaction models with full control over prepaid and postpaid plans."
            iconSvg={<PricingIcon />}
          />

          <BuiltCard
            title="PRECISE METERING & TRACKING"
            description="Monitor API calls, tokens, jobs, and events with millisecond-level accuracy for transparent, auditable billing."
            iconSvg={<MeteringIcon />}
          />

          <BuiltCard
            title="AUTOMATED INVOICING & BILLING"
            description="Generate detailed invoices instantly, export to CSV, and integrate seamlessly with external finance systems."
            iconSvg={<BillingIcon />}
          />

          <BuiltCard
            title="AI-READY MONETIZATION"
            description="Monetize AI workloads — including LLM tokens — with built-in support for usage-based pricing at scale."
            iconSvg={<AiIcon />}
          />
        </div>
      </div>
    </section>
  );
}
