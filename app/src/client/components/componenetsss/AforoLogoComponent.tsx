import React from "react";

type Props = {
  className?: string;
};

const AforoLogoComponent: React.FC<Props> = ({ className = "" }) => {
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        backgroundColor: "transparent",
      }}
    >
      {/* Triangle mark */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="27"
        height="23"
        viewBox="0 0 27 23"
        fill="none"
      >
        <path
          d="M10.751 20.8351L8.70301 15.6743C8.24 14.5075 8.0085 13.9241 8.19271 13.8175C8.37693 13.711 8.7671 14.2026 9.54746 15.1859L9.54747 15.1859L13.9566 20.7414C14.4246 21.3311 14.6586 21.6259 14.9542 21.8323C15.1696 21.9827 15.4077 22.0976 15.6594 22.1729C16.0048 22.2761 16.3812 22.2761 17.134 22.2761C21.3364 22.2761 23.4376 22.2761 24.6187 21.3324C25.4603 20.6601 26.0198 19.6972 26.1874 18.6331C26.4225 17.1397 25.3822 15.3141 23.3016 11.6629L23.3016 11.6629L22.3845 10.0534C18.7157 3.61496 16.8813 0.395738 14.1358 0.0447679C13.7371 -0.00619364 13.3341 -0.0136771 12.9339 0.022449C10.1772 0.271248 8.22456 3.42015 4.31922 9.71795L3.50971 11.0234C0.982078 15.0995 -0.281738 17.1375 0.0530822 18.8093C0.229698 19.6911 0.6775 20.4957 1.33387 21.1106C2.57818 22.2761 4.97627 22.2761 9.77246 22.2761C10.3486 22.2761 10.6367 22.2761 10.8075 22.1352C10.8982 22.0603 10.9656 21.9611 11.0017 21.8491C11.0697 21.6384 10.9635 21.3706 10.751 20.8351L10.751 20.8351Z"
          fill="url(#paint0_radial_13835_1121)"
        />
        <defs>
          <radialGradient
            id="paint0_radial_13835_1121"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(21.3514 15.1361 -8.92996 36.0545 11.8981 8.51148)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
        </defs>
      </svg>

      {/* Text logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="72"
        height="17"
        viewBox="0 0 72 17"
        fill="none"
      >
        <path
          d="M4.12328 16.7775C1.84837 16.7775 0 15.4031 0 13.1518C0 10.2608 2.86734 9.33663 6.32711 9.19445L7.9859 9.14705V8.7442C7.9859 7.46456 7.1565 6.63517 5.68729 6.63517C4.24177 6.63517 3.41237 7.39347 3.1991 8.53093H0.355455C0.592426 6.09014 2.48819 4.21807 5.68729 4.21807C8.72051 4.21807 10.7348 5.78207 10.7348 8.72051V14.3367C10.7348 15.0713 10.8058 16.0903 10.8532 16.3746V16.422H8.00959C7.9859 16.1377 7.9859 15.5926 7.9859 15.0713C7.08541 16.1377 5.85317 16.7775 4.12328 16.7775ZM4.92898 14.55C6.87214 14.55 7.9859 13.0808 7.9859 11.5878V10.9717C7.79632 10.9717 7.27499 10.9954 6.89583 11.0191C4.54983 11.1613 2.98583 11.5641 2.98583 12.9623C2.98583 13.9575 3.79152 14.55 4.92898 14.55Z"
          fill="url(#paint0_radial_13835_1123)"
        />
        <path
          d="M16.2515 16.422H13.3842V6.82474H11.2752V4.57353H13.4079V2.18013C13.4079 0.853093 14.261 0 15.5406 0H18.9767V2.27491H17.0098C16.4648 2.27491 16.2278 2.55928 16.2278 3.08061V4.57353H18.9767V6.82474H16.2515V16.422Z"
          fill="url(#paint1_radial_13835_1123)"
        />
        <path
          d="M24.6762 16.7775C21.1453 16.7775 18.4913 14.1471 18.4913 10.4978C18.4913 6.84844 21.1453 4.21807 24.6762 4.21807C28.1834 4.21807 30.8611 6.84844 30.8611 10.4978C30.8611 14.1471 28.1834 16.7775 24.6762 16.7775ZM24.6762 14.0997C26.5009 14.0997 27.8279 12.6542 27.8279 10.4978C27.8279 8.34135 26.5009 6.89583 24.6762 6.89583C22.8278 6.89583 21.5245 8.34135 21.5245 10.4978C21.5245 12.6542 22.8278 14.0997 24.6762 14.0997Z"
          fill="url(#paint2_radial_13835_1123)"
        />
        <path
          d="M39.0792 4.36025H39.2687V7.53565C38.937 7.48826 38.7237 7.46456 38.2735 7.46456C36.3777 7.46456 34.8848 8.48353 34.8848 10.948V16.422H31.9227V4.57353H34.8611V6.84844C35.7379 5.16595 37.3256 4.36025 39.0792 4.36025Z"
          fill="url(#paint3_radial_13835_1123)"
        />
        <path
          d="M44.8816 16.7775C41.3508 16.7775 38.6967 14.1471 38.6967 10.4978C38.6967 6.84844 41.3508 4.21807 44.8816 4.21807C48.3888 4.21807 51.0665 6.84844 51.0665 10.4978C51.0665 14.1471 48.3888 16.7775 44.8816 16.7775ZM44.8816 14.0997C46.7063 14.0997 48.0333 12.6542 48.0333 10.4978C48.0333 8.34135 46.7063 6.89583 44.8816 6.89583C43.0332 6.89583 41.7299 8.34135 41.7299 10.4978C41.7299 12.6542 43.0332 14.0997 44.8816 14.0997Z"
          fill="url(#paint4_radial_13835_1123)"
        />
        <path
          d="M55.4457 16.422H51.8674V12.9149H55.4457V16.422Z"
          fill="url(#paint5_radial_13835_1123)"
        />
        <path
          d="M60.4352 16.7775C58.1603 16.7775 56.3119 15.4031 56.3119 13.1518C56.3119 10.2608 59.1792 9.33663 62.639 9.19445L64.2978 9.14705V8.7442C64.2978 7.46456 63.4684 6.63517 61.9992 6.63517C60.5537 6.63517 59.7243 7.39347 59.511 8.53093H56.6674C56.9043 6.09014 58.8001 4.21807 61.9992 4.21807C65.0324 4.21807 67.0467 5.78207 67.0467 8.72051V14.3367C67.0467 15.0713 67.1178 16.0903 67.1651 16.3746V16.422H64.3215C64.2978 16.1377 64.2978 15.5926 64.2978 15.0713C63.3973 16.1377 62.1651 16.7775 60.4352 16.7775ZM61.2409 14.55C63.184 14.55 64.2978 13.0808 64.2978 11.5878V10.9717C64.1082 10.9717 63.5869 10.9954 63.2077 11.0191C60.8617 11.1613 59.2977 11.5641 59.2977 12.9623C59.2977 13.9575 60.1034 14.55 61.2409 14.55Z"
          fill="url(#paint6_radial_13835_1123)"
        />
        <path
          d="M71.8018 3.03322H68.7923V0.0710902H71.8018V3.03322ZM71.7781 16.422H68.816V4.57353H71.7781V16.422Z"
          fill="url(#paint7_radial_13835_1123)"
        />
        <defs>
          <radialGradient
            id="paint0_radial_13835_1123"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(46.7148 9.2079 -19.5379 21.9334 33.62 8.40392)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
          <radialGradient
            id="paint1_radial_13835_1123"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(46.7148 9.2079 -19.5379 21.9334 33.62 8.40392)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
          <radialGradient
            id="paint2_radial_13835_1123"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(46.7148 9.2079 -19.5379 21.9334 33.62 8.40392)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
          <radialGradient
            id="paint3_radial_13835_1123"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(46.7148 9.2079 -19.5379 21.9334 33.62 8.40392)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
          <radialGradient
            id="paint4_radial_13835_1123"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(46.7148 9.2079 -19.5379 21.9334 33.62 8.40392)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
          <radialGradient
            id="paint5_radial_13835_1123"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(46.7148 9.2079 -19.5379 21.9334 33.62 8.40392)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
          <radialGradient
            id="paint6_radial_13835_1123"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(46.7148 9.2079 -19.5379 21.9334 33.62 8.40392)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
          <radialGradient
            id="paint7_radial_13835_1123"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(46.7148 9.2079 -19.5379 21.9334 33.62 8.40392)"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="0.329859" stopColor="#F6F8F9" />
            <stop offset="1" stopColor="#B8C9D1" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default AforoLogoComponent;
