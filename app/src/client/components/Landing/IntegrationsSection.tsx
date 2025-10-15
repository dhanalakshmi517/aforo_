import React from "react";
import "./IntegrationsSection.css";
import triangles from "../LandingComponents/integration.svg";
import PrimaryButton from "../componenetsss/PrimaryButton";
import TertiaryButton from "../componenetsss/TertiaryButton";

type Props = {
  title?: string;
  subtitle?: string;
  onExplore?: () => void;
  onDocs?: () => void;
};

const IntegrationsSection: React.FC<Props> = ({
  title = "Integrations",
  subtitle = "Stop juggling spreadsheets and custom scripts. We help API & LLM teams ship real-time metering, pricing, and invoices quickly and reliably.",
  onExplore,
  onDocs,
}) => {
  return (
    <section className="int">
      <div className="int__inner">
        <header className="int__header">
          <h2 className="int__title">{title}</h2>
          <p className="int__subtitle">{subtitle}</p>
        </header>

        {/* Visual panel */}
        <div className="int__panel">
          <img className="int__art" src={triangles} alt="Integrations artwork" />
        </div>

        {/* Actions */}
        <div className="int__actions">
          <PrimaryButton onClick={onExplore}>
            Explore
          </PrimaryButton>
          <TertiaryButton onClick={onDocs}>
            View Documentation
          </TertiaryButton>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
