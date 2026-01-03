// GlassAforoTile.tsx
import * as React from "react";
import "./GlassAforoTile.css";

type Props = {
  className?: string;
  title?: string;
};

export default function GlassAforoTile({ className = "", title = "Aforo" }: Props) {
  return (
    <div className={`gat ${className}`} title={title} aria-label={title}>
      <AforoSvg />
    </div>
  );
}

function AforoSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="52"
      height="44"
      viewBox="0 0 52 44"
      fill="none"
      aria-hidden="true"
      className="gatSvg"
    >
      <path
        d="M21.1034 40.8988L17.0833 30.7682C16.1744 28.4779 15.72 27.3327 16.0816 27.1236C16.4432 26.9144 17.2091 27.8795 18.7409 29.8096L27.396 40.7149C28.3146 41.8724 28.7739 42.4511 29.3542 42.8562C29.777 43.1515 30.2444 43.3772 30.7385 43.5249C31.4166 43.7276 32.1554 43.7276 33.6331 43.7276C41.8823 43.7276 46.007 43.7276 48.3254 41.8751C49.9773 40.5552 51.0757 38.6651 51.4046 36.5764C51.8663 33.6449 49.8242 30.0613 45.74 22.894L43.9397 19.7346C36.7379 7.09614 33.137 0.776889 27.7477 0.0879431C26.9651 -0.0120935 26.174 -0.0267839 25.3883 0.0441313C19.9772 0.532519 16.1441 6.71373 8.47803 19.0762L6.88898 21.6387C1.92731 29.6399 -0.553527 33.6406 0.103714 36.9222C0.450406 38.6532 1.32943 40.2326 2.61787 41.4395C5.06042 43.7276 9.76781 43.7276 19.1826 43.7276C20.3135 43.7276 20.879 43.7276 21.2143 43.4508C21.3924 43.3039 21.5247 43.1091 21.5956 42.8894C21.7291 42.4756 21.5205 41.95 21.1034 40.8988Z"
        fill="url(#paint0_linear_15609_28833)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_15609_28833"
          x1="54.5472"
          y1="43.7276"
          x2="17.4794"
          y2="56.7502"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#025A94" />
          <stop offset="1" stopColor="#034A7D" />
        </linearGradient>
      </defs>
    </svg>
  );
}
