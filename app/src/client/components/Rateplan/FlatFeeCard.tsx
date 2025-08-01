import React from 'react';
import './FlatFeeCard.css';

const FlatFeeCard: React.FC = () => {
  return (
    <div className="flat-fee-card">
      <div className="tiles-container">
        <div className="tile tile1">55</div>
        <div className="tile tile2">8</div>
        <div className="tile tile3">...</div>
        <div className="tile tile4">01</div>
        <div className="tile tile5">x</div>
        <div className="tile tile6">12</div>
        <div className="tile tile7">65</div>
        <div className="tile tile8">...</div>
        <div className="tile tile9">17</div>
        <div className="tile tile10">78</div>
        <div className="tile tile11">...</div>
        <div className="tile tile12">45</div>




        <div className="tile infinity">∞</div>
      </div>
      <div className="flat-fee-text">
        <h3>Flat Fee</h3>
        <p>Offer infinite access with a single rate</p>
      </div>
    </div>
  );
};

export default FlatFeeCard;
