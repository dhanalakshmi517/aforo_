import React from "react";
import "./GetStarted.css";

const GetStarted = () => {
  const steps = [
    {
      title: "Create Customer",
      description:
        "Create account profiles under each customer to track and bill usage.Click “create customer” to fill in \n relevant billing details",
      button: true,
    },
    {
      title: "Create Event Schema",
      description:
        "Define the events to be tracked (e.g., login, purchase, usage duration). Event schema helps you maintain \n consistency in billing calculations",
    },
    {
      title: "Create Usage Meter",
      description:
        "Determine your counting logic (e.g., per login, per transaction, total data used, or time spent) for \n accurate billing.",
    },
    {
      title: "Create Pricing Plan",
      description:
        "Price plan helps you map your rates to billable items. This can include one-time fees, recurring charges, or usage.",
    },
  ];

  const renderDescription = (description: string) => {
    return description.split("\\n").map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < description.split("\\n").length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="getstarted-wrapper">
      <h2 className="stepper-title">Get Started</h2>
      <div className="stepper-container">
        <div className="stepper-wrapper">
          {steps.map((step, index) => (
            <div className="stepper-step" key={index}>
              <div className={`stepper-circle ${index === 0 ? "active" : ""}`}>
                {index + 1}
              </div>
              <div className="stepper-content">
                <h3 className="stepper-heading">{step.title}</h3>
                <p className="stepper-description">
                  {renderDescription(step.description)}
                </p>
                {step.button && (
                  <button className="stepper-button">+ Create Customers</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
