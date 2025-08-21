import React from "react";
import "./ThankYou.css";

const ThankYou: React.FC = () => {
  return (
    <section className="thankyou">
      <div className="thankyou-content">
        <div className="check-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="81" height="80" viewBox="0 0 81 80" fill="none">
            <mask id="mask0_5294_3245" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="81" height="80">
              <rect x="0.5" width="80" height="80" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_5294_3245)">
              <path d="M35.8327 55.3346L59.3327 31.8346L54.666 27.168L35.8327 46.0013L26.3327 36.5013L21.666 41.168L35.8327 55.3346ZM40.4993 73.3346C35.8882 73.3346 31.5549 72.4596 27.4993 70.7096C23.4438 68.9596 19.916 66.5846 16.916 63.5846C13.916 60.5846 11.541 57.0569 9.79102 53.0013C8.04102 48.9457 7.16602 44.6124 7.16602 40.0013C7.16602 35.3902 8.04102 31.0569 9.79102 27.0013C11.541 22.9457 13.916 19.418 16.916 16.418C19.916 13.418 23.4438 11.043 27.4993 9.29297C31.5549 7.54297 35.8882 6.66797 40.4993 6.66797C45.1105 6.66797 49.4438 7.54297 53.4994 9.29297C57.5549 11.043 61.0827 13.418 64.0827 16.418C67.0827 19.418 69.4577 22.9457 71.2077 27.0013C72.9577 31.0569 73.8327 35.3902 73.8327 40.0013C73.8327 44.6124 72.9577 48.9457 71.2077 53.0013C69.4577 57.0569 67.0827 60.5846 64.0827 63.5846C61.0827 66.5846 57.5549 68.9596 53.4994 70.7096C49.4438 72.4596 45.1105 73.3346 40.4993 73.3346Z" fill="#3088B4" />
            </g>
          </svg>
        </div>
        <h1>Thanks for choosing Aforo!</h1>
        <p>You'll hear from us shortly to help you launch billing your way.</p>
      </div>
    </section>
  );
};

export default ThankYou;
