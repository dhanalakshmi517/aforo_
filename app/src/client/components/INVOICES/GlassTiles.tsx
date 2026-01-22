import React from "react";
import "./GlassTiles.css";

type Props = {
  className?: string;
};

export default function GlassTiles({ className }: Props) {
  return (
    <div className={`glass-tiles ${className || ""}`}>
      {/* BACK TILE */}
      <div className="glass-tile back">
        {/* invoice svg */}
        <svg
          width="113"
          height="123"
          viewBox="0 0 113 123"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* ⬇ keep your full SVG exactly as-is */}
          <path
            d="M16.3361 0.032933C..."
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="56.19"
              y1="0"
              x2="56.19"
              y2="122.526"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#BA8C00" />
              <stop offset="1" stopColor="#1F80BC" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* FRONT TILE */}
      <div className="glass-tile front">
        {/* grid svg */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M29.6063 65.1332V20.724..."
            stroke="#25303D"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
