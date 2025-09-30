// RevenueCard.tsx
import React from 'react';
import './RevenueCard.css';
import revenue from './revenue.svg';

type Props = {
  caption?: string;
  alt?: string;
  className?: string;
};

export default function RevenueCard({
  caption = 'Revenue',
  alt = 'Revenue icon',
  className = ''
}: Props): JSX.Element {
  return (
    <div className={`revenue-card ${className}`}>
      {/* Inline once-per-tree. If you reuse many times, move this <svg> to index.html */}
      <svg className="visually-hidden" aria-hidden="true" focusable="false">
        <filter id="af-glass-distortion">
          <feTurbulence type="turbulence" baseFrequency="0.008" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
        </filter>
      </svg>

      {/* Glass wrapper just for the image */}
      <div className="revenue-card__glass">
        <img src={revenue} alt={alt} className="revenue-card__image" />
        <span className="revenue-card__glass-filter" aria-hidden="true"></span>
        <span className="revenue-card__glass-distortion-overlay" aria-hidden="true"></span>
        <span className="revenue-card__glass-overlay" aria-hidden="true"></span>
        <span className="revenue-card__glass-specular" aria-hidden="true"></span>
      </div>

      <div className="revenue-card__caption">{caption}</div>
    </div>
  );
}
