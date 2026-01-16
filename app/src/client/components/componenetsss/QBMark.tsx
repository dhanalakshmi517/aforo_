// QBmark.tsx
import * as React from "react";
import GlassAforoTile from "./GlassAforoTile";
import QBTile from "./QBTile";
import "./IntegrationBlurMark.css";

type Props = {
  className?: string;
};

export default function QBmark({ className = "" }: Props) {
  return (
    <div className={`ibm ${className}`}>
      {/* BLURRED BACK SVG (only this layer is blurred) */}
      <div className="ibmBlur" aria-hidden="true">
        <LinkBlurSvg />
      </div>

      {/* ICON TILES (NOT blurred) */}
      <div className="ibmTiles" aria-hidden="true">
        <GlassAforoTile />
        <QBTile />
      </div>
    </div>
  );
}

function LinkBlurSvg() {
  const gid = React.useId().replace(/:/g, "");
  const gradId = `paint0_linear_${gid}`;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="311" height="311" viewBox="0 0 311 311" fill="none">
      <path
        d="M128.275 168.889C134.108 176.688 141.551 183.141 150.097 187.81C158.644 192.479 168.095 195.256 177.809 195.952C187.523 196.647 197.273 195.246 206.397 191.842C215.522 188.438 223.808 183.112 230.693 176.224L271.443 135.474C283.815 122.665 290.661 105.509 290.506 87.7015C290.351 69.894 283.208 52.8596 270.616 40.2673C258.024 27.675 240.989 20.5323 223.182 20.3776C205.374 20.2228 188.218 27.0684 175.409 39.44L152.046 62.6675M182.608 141.723C176.775 133.924 169.333 127.471 160.786 122.802C152.24 118.132 142.789 115.356 133.075 114.66C123.361 113.964 113.611 115.366 104.486 118.77C95.3612 122.173 87.0752 127.5 80.19 134.388L39.44 175.138C27.0684 187.947 20.2228 205.103 20.3776 222.91C20.5323 240.718 27.675 257.752 40.2673 270.344C52.8596 282.937 69.894 290.079 87.7015 290.234C105.509 290.389 122.665 283.543 135.474 271.172L158.702 247.944"
        stroke={`url(#${gradId})`}
        strokeWidth="40.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={gradId}
          x1="277.658"
          y1="290.237"
          x2="117.064"
          y2="337.698"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#025A94" />
          <stop offset="1" stopColor="#034A7D" />
        </linearGradient>
      </defs>
    </svg>
  );
}
