import React, { useMemo } from 'react';
import './BillableIcon.css';

type BillableIconProps = {
  /** Top line – e.g. "API" or "GB" */
  label: string;
  /** Second line – e.g. "Google" or "Micro" */
  subLabel?: string;
  /** Optional extra class for layout overrides */
  className?: string;
};

type ColorPair = { bg: string; text: string };

const COLOR_PALETTE: ColorPair[] = [
  { bg: '#EAD4AE', text: '#81632E' }, // lilac
  { bg: '#E2B6BE', text: '#AA3C4E' }, // pink
  { bg: '#E2B6CC', text: '#AC3C73' }, // blue
  { bg: '#DCB6E2 ', text: '#90449C' }, // teal
  { bg: '#CCB7E1', text: '#693E92' }, // orange
  { bg: '#C4B7E1', text: '#6547A8' }, // green
  { bg: '#B7B8E1', text: '#4749AF' }, // red
  { bg: '#B6C7E2', text: '#2A559C' }, // indigo
  { bg: '#AED7EA', text: '#1C5F7D' }, // warm orange
  { bg: '#AEE1EA', text: '#206D79' }, 
    { bg: '#AEEAD6 ', text: '#1C6C51' }, 
  { bg: '#AEEAC4', text: '#2AA055' }, 
  { bg: '#AFE9E3', text: '#177167' }, 
  { bg: '', text: '' }, 
  { bg: '', text: '' }, 
  { bg: '', text: '' }, 
  { bg: '', text: '' }, 
  { bg: '', text: '' }, 
  { bg: '', text: '' }, 
  { bg: '', text: '' }, 
  { bg: '', text: '' }, 
{ bg: '', text: '' }, 

];

const BillableIcon: React.FC<BillableIconProps> = ({ label, subLabel, className = '' }) => {
  // pick color once per mount
  const color = useMemo(
    () => COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)],
    []
  );

  return (
    <div
      className={`billable-icon ${className}`}
      style={
        {
          // CSS custom props used in .css file
          '--billable-bg': color.bg,
          '--billable-text': color.text,
        } as React.CSSProperties
      }
    >
      <span className="billable-icon-main">{label}</span>
      {subLabel && <span className="billable-icon-sub">{subLabel}</span>}
    </div>
  );
};

export default BillableIcon;
