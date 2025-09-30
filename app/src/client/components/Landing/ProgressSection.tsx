import React from 'react';
import revenueSvg from './revenue.svg';
import './ProgressSection.css';

const ProgressSection: React.FC = () => {
  const steps = [
    'The building blocks',
    'The building blocks',
    'The building blocks', 
    'The building blocks',
  ];

  return (
    <section className="progress-section">
      <div className="progress-tracker">
        {steps.map((label, index) => (
          <div className={`step ${index === 0 ? 'active' : ''}`} key={index}>
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="36" viewBox="0 0 34 36" fill="none" className="step-icon">
              <path d="M15.6198 19.8401C20.2774 19.8401 23.89 14.6536 23.89 10.1915V8.70713C23.89 4.20571 20.1797 0.542969 15.6198 0.542969C11.0599 0.542969 7.34961 4.20571 7.34961 8.70713V10.1915C7.34961 14.6536 10.9622 19.8401 15.6198 19.8401Z" fill="#47424A"/>
              <path opacity="0.5" d="M34.0005 26.9466L33.5669 21.6758L31.9814 23.4987C30.9125 22.5353 29.5609 22.0023 28.1178 22.0023C24.8887 22.0023 22.2464 24.7077 22.0547 28.1082H23.4864C23.6817 25.5901 25.7209 23.5316 28.1178 23.5316C29.1917 23.5316 30.1977 23.9224 31.0033 24.6243L29.2167 26.6782L34.0005 26.9466Z" fill="#47424A"/>
              <path opacity="0.5" d="M32.5695 29.0273C32.3742 31.5454 30.3351 33.6039 27.9382 33.6039C26.8642 33.6039 25.8582 33.2131 25.0526 32.5112L26.8392 30.4573L22.0547 30.1889L22.4883 35.4597L24.0738 33.6367C25.1427 34.6002 26.4943 35.1332 27.9375 35.1332C31.1665 35.1332 33.8088 32.4278 34.0005 29.0273H32.5695Z" fill="#47424A"/>
              <path d="M20.2568 29.2138C20.2568 26.8386 21.3087 24.7097 22.9727 23.2299C20.9035 22.8674 18.4712 22.5977 15.7553 22.5977C10.8389 22.5977 6.80855 23.471 4.29295 24.2039C1.72558 24.9523 0 27.2187 0 29.8431V32.8894C0 33.2952 0.335363 33.6246 0.750253 33.6246H20.2568V29.2138Z" fill="#47424A"/>
            </svg>
            <div className="step-label">{label}</div>
            <div className="step-subtext">Define Products</div>
          </div>
        ))}
      </div>

      {Array.from({ length: 4 }).map((_, idx) => (
        <div className="progress-content-box" key={idx}>
          <div className="progress-left">
            <h3>
              <span className="highlight">Capture Every Opportunity,</span> Bill with Precision
            </h3>
            <p>
              Aforo ensures all your usage data turns into timely, accurate invoices — seamlessly.
              With Aforo, you streamline usage tracking and invoicing — helping you grow without limits.
            </p>
          </div>
          <div className="progress-right">
            {idx === 0 ? (
              <div className='circle-placeholder'>
              <img src={revenueSvg} alt="Revenue" className="glass-image" />
              </div>
            ) : (
              <div className="square-placeholder" />
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default ProgressSection;
