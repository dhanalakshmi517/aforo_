import React from 'react';
import './Revenue.css';

const Revenue: React.FC = () => {
  return (
    <div className="revenue-container">
      <h2 className="revenue-title">Let Revenue Flow</h2>
      <p className="revenue-description">
        Let's talk about how Aforo helps you turn every usage event into revenue — accurately, automatically, and at scale.
        Whether you're billing by the minute, user, or feature, Aforo brings structure to complexity and ensures every rupee is accounted for.
        Ready to simplify your billing and maximize growth?
      </p>
      <div className="revenue-buttons">
        <button className="btn-sales">Talk to Sales</button>
        <button className="btn-demo">Get a personalised demo</button>
      </div>
    </div>
  );
};

export default Revenue;
