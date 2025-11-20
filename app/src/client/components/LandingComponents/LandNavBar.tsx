import React from "react";
import "./LandNavBar.css";
// import logo from "./logo.svg"; // optional

type Props = {
  active?: "home" | "signin" | "none";
};

const LandNavBar: React.FC<Props> = ({ active = "home" }) => {
  return (
    <header className="af-nav" role="banner">
      <div className="af-nav__inner">
        <a href="/" className="af-brand" aria-label="aforo.ai home">
          {/* {logo ? <img src={logo} alt="aforo.ai" /> : "aforo.ai"} */}
<svg xmlns="http://www.w3.org/2000/svg" width="107" height="25" viewBox="0 0 107 25" fill="none">
  <path d="M6.23003 24.5048C2.66507 24.5048 0 22.4973 0 19.14C0 15.1944 3.77263 13.6715 9.34505 13.4638L11.6294 13.3946V12.8408C11.6294 11.3179 10.5218 10.3142 8.68743 10.3142C6.81842 10.3142 5.84931 11.2833 5.53781 12.6677H0.449947C0.865282 8.99893 3.91107 6.16081 8.68743 6.16081C13.1523 6.16081 16.4404 8.34132 16.4404 12.8062V20.9398C16.4404 22.0128 16.5096 23.5011 16.6134 23.9164V23.9856H11.6986C11.664 23.5703 11.664 22.9819 11.664 22.2551C10.5218 23.5357 8.68743 24.5048 6.23003 24.5048ZM7.61448 20.6629C9.96805 20.6629 11.6294 18.967 11.6294 16.9941V16.2673L10.2103 16.3365C6.95687 16.5442 5.26091 17.271 5.26091 18.7939C5.26091 19.9361 6.26464 20.6629 7.61448 20.6629Z" fill="url(#paint0_linear_12943_27806)"/>
  <path d="M24.8632 23.9856H19.7061V10.6949H16.5565V6.67998H19.7753V3.80724C19.7753 1.17678 20.9521 0 23.5826 0H28.6704V4.15335H25.8669C24.967 4.15335 24.6901 4.43024 24.6901 5.26091V6.67998H28.6704V10.6949H24.8632V23.9856Z" fill="url(#paint1_linear_12943_27806)"/>
  <path d="M36.8618 24.5394C31.6009 24.5394 27.5168 20.6283 27.5168 15.3328C27.5168 10.0027 31.6009 6.1262 36.8618 6.1262C42.0881 6.1262 46.2069 10.0027 46.2069 15.3328C46.2069 20.6283 42.0881 24.5394 36.8618 24.5394ZM36.8618 19.763C39.2154 19.763 40.8421 17.8248 40.8421 15.3328C40.8421 12.7716 39.2154 10.9026 36.8618 10.9026C34.4736 10.9026 32.8469 12.7716 32.8469 15.3328C32.8469 17.8248 34.4736 19.763 36.8618 19.763Z" fill="url(#paint2_linear_12943_27806)"/>
  <path d="M58.2266 6.36848H58.4688V12.0447C58.0189 11.9755 57.6728 11.9409 57.2228 11.9409C54.7308 11.9409 52.2388 13.0831 52.2388 16.5788V23.9856H46.9779V6.67998H52.1004V9.62193C53.381 7.57987 55.7346 6.36848 58.2266 6.36848Z" fill="url(#paint3_linear_12943_27806)"/>
  <path d="M66.677 24.5394C61.4161 24.5394 57.3319 20.6283 57.3319 15.3328C57.3319 10.0027 61.4161 6.1262 66.677 6.1262C71.9033 6.1262 76.022 10.0027 76.022 15.3328C76.022 20.6283 71.9033 24.5394 66.677 24.5394ZM66.677 19.763C69.0305 19.763 70.6573 17.8248 70.6573 15.3328C70.6573 12.7716 69.0305 10.9026 66.677 10.9026C64.2888 10.9026 62.6621 12.7716 62.6621 15.3328C62.6621 17.8248 64.2888 19.763 66.677 19.763Z" fill="url(#paint4_linear_12943_27806)"/>
  <path d="M82.85 23.9856H76.5162V17.9979H82.85V23.9856Z" fill="url(#paint5_linear_12943_27806)"/>
  <path d="M89.5915 24.5048C86.0266 24.5048 83.3615 22.4973 83.3615 19.14C83.3615 15.1944 87.1341 13.6715 92.7065 13.4638L94.9909 13.3946V12.8408C94.9909 11.3179 93.8833 10.3142 92.0489 10.3142C90.1799 10.3142 89.2108 11.2833 88.8993 12.6677H83.8114C84.2268 8.99893 87.2726 6.16081 92.0489 6.16081C96.5138 6.16081 99.8018 8.34132 99.8018 12.8062V20.9398C99.8018 22.0128 99.8711 23.5011 99.9749 23.9164V23.9856H95.0601C95.0255 23.5703 95.0255 22.9819 95.0255 22.2551C93.8833 23.5357 92.0489 24.5048 89.5915 24.5048ZM90.976 20.6629C93.3295 20.6629 94.9909 18.967 94.9909 16.9941V16.2673L93.5718 16.3365C90.3184 16.5442 88.6224 17.271 88.6224 18.7939C88.6224 19.9361 89.6261 20.6629 90.976 20.6629Z" fill="url(#paint6_linear_12943_27806)"/>
  <path d="M106.732 4.74174H101.471V0.103832H106.732V4.74174ZM106.732 23.9856H101.471V6.67998H106.732V23.9856Z" fill="url(#paint7_linear_12943_27806)"/>
  <defs>
    <linearGradient id="paint0_linear_12943_27806" x1="101.654" y1="24.5394" x2="75.6086" y2="57.9852" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint1_linear_12943_27806" x1="101.654" y1="24.5394" x2="75.6086" y2="57.9852" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint2_linear_12943_27806" x1="101.654" y1="24.5394" x2="75.6086" y2="57.9852" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint3_linear_12943_27806" x1="101.654" y1="24.5394" x2="75.6086" y2="57.9852" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint4_linear_12943_27806" x1="101.654" y1="24.5394" x2="75.6086" y2="57.9852" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint5_linear_12943_27806" x1="101.654" y1="24.5394" x2="75.6086" y2="57.9852" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint6_linear_12943_27806" x1="101.654" y1="24.5394" x2="75.6086" y2="57.9852" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
    <linearGradient id="paint7_linear_12943_27806" x1="101.654" y1="24.5394" x2="75.6086" y2="57.9852" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0262A1"/>
      <stop offset="1" stop-color="#00365A"/>
    </linearGradient>
  </defs>
</svg>        </a>

        <nav className="af-nav__links" aria-label="Main">
          <a
            href="/"
            className={`af-nav__link ${active === "home" ? "af-nav__link--active" : ""}`}
            aria-current={active === "home" ? "page" : undefined}
          >
            Home
          </a>
          <a
            href="/signin"
            className={`af-nav__link ${active === "signin" ? "af-nav__link--active" : ""}`}
            aria-current={active === "signin" ? "page" : undefined}
          >
            Sign In
          </a>
        </nav>
      </div>
    </header>
  );
};

export default LandNavBar;
