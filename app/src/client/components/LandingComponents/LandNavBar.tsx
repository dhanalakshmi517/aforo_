import React from "react";
import "./LandNavBar.css";
// import logo from "./logo.svg"; // optional

type Props = {
  active?: "home" | "signin";
};

const LandNavBar: React.FC<Props> = ({ active = "home" }) => {
  return (
    <header className="af-nav" role="banner">
      <div className="af-nav__inner">
        <a href="/" className="af-brand" aria-label="aforo.ai home">
          {/* {logo ? <img src={logo} alt="aforo.ai" /> : "aforo.ai"} */}
          aforo.ai
        </a>

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
