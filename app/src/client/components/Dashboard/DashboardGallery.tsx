import React from "react";
import "./DashboardGallery.css";
import PageHeader from "../PageHeader/PageHeader";
import CustomerInsights from "./CustomerInsights";
import CustomerHealthOverview from "./CustomerHealthOverview";
import customerAnalysisImg from "./dashboard imgs/customeranalysis.svg";
import realTimeImg from "./dashboard imgs/real-time.svg";
import dashProductImg from "./dashboard imgs/dashproduct.svg";
import revenueDashImg from "./dashboard imgs/revenuedash.svg";

type DashboardCard = {
  id: string;
  title: string;
  description: string;
  imageSrc: string; // main preview PNG
  icon?: React.ReactNode; // SVG icon component
  live?: boolean;
};

type Props = {
  cards?: DashboardCard[];
  onCardClick?: (card: DashboardCard) => void;
};

const defaultCards: DashboardCard[] = [
  // {
  //   id: "cust",
  //   title: "Customer Analysis",
  //   description: "Understand customer health, growth, churn, and segmentation",
  //   imageSrc: customerAnalysisImg,
  //   icon: (
  //     <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
  //       <path d="M12.4167 15.75V14.0833C12.4167 13.1993 12.0655 12.3514 11.4404 11.7263C10.8152 11.1012 9.96739 10.75 9.08333 10.75H4.08333C3.19928 10.75 2.35143 11.1012 1.72631 11.7263C1.10119 12.3514 0.75 13.1993 0.75 14.0833V15.75M12.4167 0.856667C13.1315 1.04197 13.7645 1.45939 14.2164 2.04339C14.6683 2.62738 14.9135 3.34491 14.9135 4.08333C14.9135 4.82176 14.6683 5.53928 14.2164 6.12328C13.7645 6.70728 13.1315 7.12469 12.4167 7.31M17.4167 15.75V14.0833C17.4161 13.3448 17.1703 12.6273 16.7178 12.0436C16.2653 11.4599 15.6318 11.043 14.9167 10.8583M9.91667 4.08333C9.91667 5.92428 8.42428 7.41667 6.58333 7.41667C4.74238 7.41667 3.25 5.92428 3.25 4.08333C3.25 2.24238 4.74238 0.75 6.58333 0.75C8.42428 0.75 9.91667 2.24238 9.91667 4.08333Z" stroke="#F9FBFD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //     </svg>
  //   ),
  //   live: true,
  // },
  // {
  //   id: "realtime",
  //   title: "Real-Time Tracking",
  //   description: "Live view of usage, billing events, and activity",
  //   imageSrc: realTimeImg,
  //   icon: (
  //     <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
  //       <path d="M15.75 8.25037C15.7499 9.83419 15.2484 11.3773 14.3174 12.6586C13.3864 13.9399 12.0737 14.8936 10.5674 15.383C9.06108 15.8724 7.4385 15.8723 5.9322 15.3829C4.42591 14.8934 3.11323 13.9396 2.1823 12.6583C1.25138 11.3769 0.749989 9.83377 0.75 8.24995C0.750011 6.66612 1.25142 5.12296 2.18237 3.84162C3.11331 2.56028 4.426 1.60654 5.9323 1.1171C7.4386 0.627656 9.06119 0.627633 10.5675 1.11703" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //     </svg>
  //   ),
  //   live: true,
  // },
  {
    id: "product",
    title: "Product Analysis",
    description: "Track feature adoption, usage, and plan performance",
    imageSrc: dashProductImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19" fill="none">
        <path d="M1 4.91496L8.25 9.08162M8.25 9.08162L15.5 4.91496M8.25 9.08162L8.25 17.415M15.75 5.74829C15.7497 5.45602 15.6725 5.16897 15.5263 4.91593C15.38 4.66289 15.1698 4.45276 14.9167 4.30662L9.08333 0.973291C8.82997 0.82701 8.54256 0.75 8.25 0.75C7.95744 0.75 7.67003 0.82701 7.41667 0.973291L1.58333 4.30662C1.33022 4.45276 1.11998 4.66289 0.973718 4.91593C0.827452 5.16897 0.7503 5.45602 0.75 5.74829V12.415C0.7503 12.7072 0.827452 12.9943 0.973718 13.2473C1.11998 13.5004 1.33022 13.7105 1.58333 13.8566L7.41667 17.19C7.67003 17.3362 7.95744 17.4132 8.25 17.4132C8.54256 17.4132 8.82997 17.3362 9.08333 17.19L14.9167 13.8566C15.1698 13.7105 15.38 13.5004 15.5263 13.2473C15.6725 12.9943 15.7497 12.7072 15.75 12.415V5.74829Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    live: true,
  },
  // {
  //   id: "revenue",
  //   title: "Revenue Analysis",
  //   description: "Monitor recurring revenue, ARPC, and billing trends",
  //   imageSrc: revenueDashImg,
  //   icon: (
  //     <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
  //       <path d="M14.1583 7.725C14.9461 8.01869 15.6471 8.50627 16.1965 9.14266C16.7458 9.77905 17.1259 10.5437 17.3015 11.3659C17.477 12.1881 17.4424 13.0413 17.2009 13.8465C16.9593 14.6518 16.5186 15.3832 15.9195 15.973C15.3204 16.5628 14.5823 16.9921 13.7733 17.221C12.9644 17.45 12.1108 17.4712 11.2914 17.2829C10.4721 17.0945 9.71343 16.7026 9.08569 16.1433C8.45795 15.5841 7.98136 14.8756 7.7 14.0833M4.91667 4.08333H5.75V7.41667M13.0083 10.65L13.5917 11.2417L11.2417 13.5917M10.75 5.75C10.75 8.51142 8.51142 10.75 5.75 10.75C2.98858 10.75 0.75 8.51142 0.75 5.75C0.75 2.98858 2.98858 0.75 5.75 0.75C8.51142 0.75 10.75 2.98858 10.75 5.75Z" stroke="#F9FBFD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  //     </svg>
  //   ),
  //   live: true,
  // },
];

const DashboardGallery: React.FC<Props> = ({
  cards = defaultCards,
  onCardClick,
}) => {
  const handleCardClick = (card: DashboardCard) => {
    onCardClick?.(card);
  };

  return (
    <div className="dg-page">
      <div className="dg-topbar-spacer">
        <h1 className="dg-page-title">Dashboards</h1>
        <div className="dg-actions">
          <button className="dg-icon-btn" aria-label="Add">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <g clip-path="url(#clip0_12503_17352)">
    <path d="M8.26259 2.11034C8.29473 1.9383 8.38602 1.7829 8.52067 1.67108C8.65531 1.55926 8.82482 1.49805 8.99984 1.49805C9.17487 1.49805 9.34438 1.55926 9.47902 1.67108C9.61366 1.7829 9.70496 1.9383 9.73709 2.11034L10.5253 6.27884C10.5813 6.5752 10.7253 6.84781 10.9386 7.06107C11.1519 7.27434 11.4245 7.41836 11.7208 7.47434L15.8893 8.26259C16.0614 8.29473 16.2168 8.38602 16.3286 8.52067C16.4404 8.65531 16.5016 8.82482 16.5016 8.99984C16.5016 9.17487 16.4404 9.34438 16.3286 9.47902C16.2168 9.61366 16.0614 9.70496 15.8893 9.73709L11.7208 10.5253C11.4245 10.5813 11.1519 10.7253 10.9386 10.9386C10.7253 11.1519 10.5813 11.4245 10.5253 11.7208L9.73709 15.8893C9.70496 16.0614 9.61366 16.2168 9.47902 16.3286C9.34438 16.4404 9.17487 16.5016 8.99984 16.5016C8.82482 16.5016 8.65531 16.4404 8.52067 16.3286C8.38602 16.2168 8.29473 16.0614 8.26259 15.8893L7.47434 11.7208C7.41836 11.4245 7.27434 11.1519 7.06107 10.9386C6.84781 10.7253 6.5752 10.5813 6.27884 10.5253L2.11034 9.73709C1.9383 9.70496 1.7829 9.61366 1.67108 9.47902C1.55926 9.34438 1.49805 9.17487 1.49805 8.99984C1.49805 8.82482 1.55926 8.65531 1.67108 8.52067C1.7829 8.38602 1.9383 8.29473 2.11034 8.26259L6.27884 7.47434C6.5752 7.41836 6.84781 7.27434 7.06107 7.06107C7.27434 6.84781 7.41836 6.5752 7.47434 6.27884L8.26259 2.11034Z" stroke="#373B40" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  <defs>
    <clipPath id="clip0_12503_17352">
      <rect width="18" height="18" fill="white"/>
    </clipPath>
  </defs>
</svg>
          </button>
         
          <button className="dg-icon-btn" aria-label="Bell">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M7.70094 15.7498C7.8326 15.9778 8.02195 16.1671 8.24997 16.2987C8.47799 16.4304 8.73665 16.4997 8.99994 16.4997C9.26323 16.4997 9.52189 16.4304 9.74991 16.2987C9.97793 16.1671 10.1673 15.9778 10.2989 15.7498M2.44644 11.4943C2.34846 11.6016 2.28381 11.7352 2.26033 11.8786C2.23686 12.0221 2.25558 12.1693 2.31422 12.3023C2.37286 12.4353 2.46889 12.5484 2.59063 12.6279C2.71237 12.7073 2.85457 12.7496 2.99994 12.7498H14.9999C15.1453 12.7498 15.2875 12.7076 15.4093 12.6283C15.5312 12.549 15.6273 12.4361 15.6861 12.3031C15.7449 12.1702 15.7638 12.0231 15.7405 11.8796C15.7172 11.7361 15.6528 11.6025 15.5549 11.495C14.5574 10.4668 13.4999 9.37401 13.4999 5.99976C13.4999 4.80628 13.0258 3.66169 12.1819 2.81778C11.338 1.97386 10.1934 1.49976 8.99994 1.49976C7.80647 1.49976 6.66187 1.97386 5.81796 2.81778C4.97405 3.66169 4.49994 4.80628 4.49994 5.99976C4.49994 9.37401 3.44169 10.4668 2.44644 11.4943Z" stroke="#373B40" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
          </button>
        </div>
      </div>

      <div className="dg-grid">
        {cards.map((c) => (
          <article
            key={c.id}
            className="dg-card"
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(c)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleCardClick(c);
            }}
          >
            <div className="dg-media">
              <img className="dg-img" src={c.imageSrc} alt="" />
              {c.icon && (
                <div className="dg-corner">
                  {c.icon}
                </div>
              )}
            </div>

            <div className="dg-meta">
              <div className="dg-title-row">
                <h3 className="dg-card-title">{c.title}</h3>
                {c.live && (
                  <span className="dg-live-badge">LIVE</span>
                )}
              </div>
              <p className="dg-desc">{c.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default DashboardGallery;
