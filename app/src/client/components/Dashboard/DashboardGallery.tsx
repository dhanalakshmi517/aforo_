import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./DashboardGallery.css";
import PageHeader from "../PageHeader/PageHeader";

import customerAnalysisImg from "./dashboard imgs/customeranalysis.svg";
import realTimeImg from "./dashboard imgs/real-time.svg";
import dashProductImg from "./dashboard imgs/dashproduct.svg";
import revenueDashImg from "./dashboard imgs/revenuedash.svg";

type DashboardCard = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  icon?: React.ReactNode;
  live?: boolean;
};

type Props = {
  cards?: DashboardCard[];
  onCardClick?: (card: DashboardCard) => void;
};

const defaultCards: DashboardCard[] = [
  {
    id: "cust",
    title: "Customer Analysis",
    description: "Understand customer health, growth, churn, and segmentation",
    imageSrc: customerAnalysisImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="17" viewBox="0 0 19 17" fill="none">
  <path d="M12.6667 16V14.3333C12.6667 13.4493 12.3155 12.6014 11.6904 11.9763C11.0652 11.3512 10.2174 11 9.33333 11H4.33333C3.44928 11 2.60143 11.3512 1.97631 11.9763C1.35119 12.6014 1 13.4493 1 14.3333V16M12.6667 1.10667C13.3815 1.29197 14.0145 1.70939 14.4664 2.29339C14.9183 2.87738 15.1635 3.59491 15.1635 4.33333C15.1635 5.07176 14.9183 5.78928 14.4664 6.37328C14.0145 6.95728 13.3815 7.37469 12.6667 7.56M17.6667 16V14.3333C17.6661 13.5948 17.4203 12.8773 16.9678 12.2936C16.5153 11.7099 15.8818 11.293 15.1667 11.1083M10.1667 4.33333C10.1667 6.17428 8.67428 7.66667 6.83333 7.66667C4.99238 7.66667 3.5 6.17428 3.5 4.33333C3.5 2.49238 4.99238 1 6.83333 1C8.67428 1 10.1667 2.49238 10.1667 4.33333Z" stroke="#19222D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
  },
  {
    id: "realtime",
    title: "Real-Time Tracking",
    description: "Live view of usage, billing events, and activity",
    imageSrc: realTimeImg,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
  <path d="M14.4083 7.975C15.1961 8.26869 15.8971 8.75627 16.4465 9.39266C16.9958 10.0291 17.3759 10.7937 17.5515 11.6159C17.727 12.4381 17.6924 13.2913 17.4509 14.0965C17.2093 14.9018 16.7686 15.6332 16.1695 16.223C15.5704 16.8128 14.8323 17.2421 14.0233 17.471C13.2144 17.7 12.3608 17.7212 11.5414 17.5329C10.7221 17.3445 9.96343 16.9526 9.33569 16.3933C8.70795 15.8341 8.23136 15.1256 7.95 14.3333M5.16667 4.33333H6V7.66667M13.2583 10.9L13.8417 11.4917L11.4917 13.8417M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
  },
  {
    id: "product",
    title: "Product Analysis",
    description: "Track feature adoption, usage, and plan performance",
    imageSrc: dashProductImg,
    icon: (
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="19" viewBox="0 0 16 19" fill="none">
  <path d="M6 1H9.33333M7.66667 11L10.1667 8.5M14.3333 11C14.3333 14.6819 11.3486 17.6667 7.66667 17.6667C3.98477 17.6667 1 14.6819 1 11C1 7.3181 3.98477 4.33333 7.66667 4.33333C11.3486 4.33333 14.3333 7.3181 14.3333 11Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
  },
  {
    id: "revenue",
    title: "Revenue Analysis",
    description: "Monitor recurring revenue, ARPC, and billing trends",
    imageSrc: revenueDashImg,
    icon: (
     <svg xmlns="http://www.w3.org/2000/svg" width="17" height="19" viewBox="0 0 17 19" fill="none">
  <path d="M1.25 5.16496L8.5 9.33162M8.5 9.33162L15.75 5.16496M8.5 9.33162L8.5 17.665M16 5.99829C15.9997 5.70602 15.9225 5.41897 15.7763 5.16593C15.63 4.91289 15.4198 4.70276 15.1667 4.55662L9.33333 1.22329C9.07997 1.07701 8.79256 1 8.5 1C8.20744 1 7.92003 1.07701 7.66667 1.22329L1.83333 4.55662C1.58022 4.70276 1.36998 4.91289 1.22372 5.16593C1.07745 5.41897 1.0003 5.70602 1 5.99829V12.665C1.0003 12.9572 1.07745 13.2443 1.22372 13.4973C1.36998 13.7504 1.58022 13.9605 1.83333 14.1066L7.66667 17.44C7.92003 17.5862 8.20744 17.6632 8.5 17.6632C8.79256 17.6632 9.07997 17.5862 9.33333 17.44L15.1667 14.1066C15.4198 13.9605 15.63 13.7504 15.7763 13.4973C15.9225 13.2443 15.9997 12.9572 16 12.665V5.99829Z" stroke="#19222D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
    ),
  },
];

const DashboardGallery: React.FC<Props> = ({ cards = defaultCards, onCardClick }) => {
  const navigate = useNavigate();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (cardId: string) => {
    setLoadedImages((prev) => new Set(prev).add(cardId));
  };

  const handleCardClick = (card: DashboardCard) => {
    onCardClick?.(card);

    if (card.id === "cust") {
      navigate("/get-started/dashboards/customer-analysis");
    } else if (card.id === "realtime") {
      navigate("/get-started/dashboards/real-time-tracking");
    } else if (card.id === "revenue") {
      navigate("/get-started/dashboards/revenue-analysis");
    }
  };

  return (
    <div className="dg-page">
      <div className="dg-header-wrapper">
        <div className="dg-header-left">
          <h1 className="dg-page-title">Dashboards</h1>
        </div>
        <div className="dg-header-right">
          <PageHeader 
            title=""
            showPrimary={false}
            searchDisabled={true}
            filterDisabled={true}
            showIntegrations={false}
            showSearch={false}
            showDivider={false}
          />
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
              {!loadedImages.has(c.id) && (
                <div className="dg-skeleton">
                  <div className="dg-spinner"></div>
                  <p className="dg-loading-text">Loading ...</p>
                </div>
              )}
              <img 
                className={`dg-img ${loadedImages.has(c.id) ? "dg-img--loaded" : ""}`}
                src={c.imageSrc} 
                alt="" 
                onLoad={() => handleImageLoad(c.id)}
              />
            </div>

            <div className="dg-meta">
              <div className="dg-icon-title-row">
                {c.icon && <div className="dg-icon-section">{c.icon}</div>}
                <h3 className="dg-card-title">{c.title}</h3>
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
