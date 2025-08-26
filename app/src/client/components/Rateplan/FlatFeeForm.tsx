import React, { useEffect, useState } from 'react';
import './FlatFeeForm.css';

export interface FlatFeePayload {
  flatFeeAmount: number;       // base monthly charge
  numberOfApiCalls: number;    // included calls in the plan
  overageUnitRate: number;     // charge per extra unit
  graceBuffer: number;         // extra free units before overage kicks in
}

interface FlatFeeFormProps {
  data: FlatFeePayload;
  onChange: (payload: FlatFeePayload) => void;
}

const toNumber = (s: string): number =>
  s.trim() === '' ? NaN : Number(s);

const numToStr = (n: number | undefined): string => (n && n !== 0 ? n.toString() : '');

const FlatFeeForm: React.FC<FlatFeeFormProps> = ({ data, onChange }) => {
  const [flatFee, setFlatFee] = useState<string>(numToStr(data.flatFeeAmount));
  const [apiCalls, setApiCalls] = useState<string>(numToStr(data.numberOfApiCalls));
  const [overageRate, setOverageRate] = useState<string>(numToStr(data.overageUnitRate));
  const [graceBuffer, setGraceBuffer] = useState<string>(numToStr(data.graceBuffer));
  // field-level validation errors
  const [errors, setErrors] = useState<{ flatFee?: string; api?: string; overage?: string }>({});

  // keep local state in sync if parent data changes
  useEffect(() => {
    setFlatFee(numToStr(data.flatFeeAmount));
    setApiCalls(numToStr(data.numberOfApiCalls));
    setOverageRate(numToStr(data.overageUnitRate));
    setGraceBuffer(numToStr(data.graceBuffer));
  }, [data]);

  const propagate = (ff: string, api: string, ov: string, gr: string) => {
    onChange({
      flatFeeAmount: toNumber(ff),
      numberOfApiCalls: toNumber(api),
      overageUnitRate: toNumber(ov),
      graceBuffer: toNumber(gr),
    });
  };

  const handleChange =
    (
      setter: React.Dispatch<React.SetStateAction<string>>,
      key: 'flatFee' | 'api' | 'overage' | 'grace'
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setter(val);

      // basic validation rules
      setErrors((prev) => {
        const next = { ...prev } as any;
        if (key === 'flatFee' && (val.trim() === '' || Number(val) < 0)) {
          next.flatFee = 'Enter a valid amount';
        } else if (key === 'flatFee') {
          delete next.flatFee;
        }

        if (key === 'api' && (val.trim() === '' || Number(val) < 0)) {
          next.api = 'Enter a valid limit';
        } else if (key === 'api') {
          delete next.api;
        }

        if (key === 'overage' && (val.trim() === '' || Number(val) < 0)) {
          next.overage = 'Enter a valid rate';
        } else if (key === 'overage') {
          delete next.overage;
        }
        return next;
      });

      // compute latest snapshot for propagate
      let ff = flatFee,
        api = apiCalls,
        ov = overageRate,
        gr = graceBuffer;

      if (key === 'flatFee') ff = val;
      if (key === 'api') api = val;
      if (key === 'overage') ov = val;
      if (key === 'grace') gr = val;

      propagate(ff, api, ov, gr);
    };

  return (
    <div className="flat-fee-container">
      <div className="ff-form-sections">
        <label className="ff-label">
          <span>Flat Fee Amount</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Enter amount"
            value={flatFee}
            onChange={handleChange(setFlatFee, 'flatFee')}
            className={errors.flatFee ? 'error-input' : undefined}
          />
          {errors.flatFee && <span className="error-text">{errors.flatFee}</span>}
        </label>

        <label className="ff-label">
          <span>Number of API calls</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="Enter limit"
            value={apiCalls}
            onChange={handleChange(setApiCalls, 'api')}
            className={errors.api ? 'error-input' : undefined}
          />
          {errors.api && <span className="error-text">{errors.api}</span>}
        </label>

        <label className="ff-label">
          <span>Overage unit rate</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Enter overage per unit"
            value={overageRate}
            onChange={handleChange(setOverageRate, 'overage')}
            className={errors.overage ? 'error-input' : undefined}
          />
          {errors.overage && <span className="error-text">{errors.overage}</span>}
        </label>

        <label className="ff-label">
          <span>Grace buffer (Optional)</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            placeholder="Enter grace buffer"
            value={graceBuffer}
            onChange={handleChange(setGraceBuffer, 'grace')}
          />
        </label>
      </div>

      <div className="example-section">
        <h4>EXAMPLE</h4>
        <button type="button" className="linklike">Flat Fee Pricing</button>
        <p>
          <strong>10M units</strong> for <strong>$30</strong>
        </p>
        <p className="consumer-note">
          <span className="note-title">You to consumer:</span>
          <em>“You will get 10M API calls for a flat $30.”</em>
        </p>
      </div>
    </div>
  );
};

export default FlatFeeForm;
