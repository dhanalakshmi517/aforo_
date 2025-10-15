import React from "react";
import "./TestimonialBox.css";

const TestimonialBox: React.FC = () => {
  return (
    <div className="testimonial-box">
      <p className="testimonial-text">
        We’ve built and operated APIs and LLM products. Billing slowed us down, 
        so we’re building the system we wanted: fast to ship, precise for finance, 
        and controllable at the gateway. If you want to shape this from the ground up, 
        join us as a founding customer.
      </p>
      <p className="testimonial-author">~ Aforo.ai Team</p>
    </div>
  );
};

export default TestimonialBox;
