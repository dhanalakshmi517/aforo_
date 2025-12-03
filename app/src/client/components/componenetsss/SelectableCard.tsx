import React, { useState } from 'react';
import './SelectableCard.css';
import { Checkbox } from './Checkbox';

export type SelectableCardProps = {
  title: string;                 // e.g., "FGG API Pro"
  version?: string;              // e.g., "version 3.4r"
  meta?: string;                 // small helper text (one or two lines)
  selected: boolean;
  onSelectedChange: (next: boolean) => void;
  ariaLabel?: string;
  className?: string;
  children?: React.ReactNode;    // optional extra content
};

const SelectableCard: React.FC<SelectableCardProps> = ({
  title,
  version,
  meta,
  selected,
  onSelectedChange,
  ariaLabel,
  className,
  children,
}) => {
  const [pressed, setPressed] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={ariaLabel || title}
      className={[
        'selcard',
        selected ? 'is-selected' : '',
        pressed && selected ? 'is-pressed' : '',
        className || '',
      ].join(' ').trim()}
      onClick={() => onSelectedChange(!selected)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectedChange(!selected);
        }
      }}
      onMouseDown={() => selected && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
    >
      <div className="selcard__checkbox">
        <Checkbox
          checked={selected}
          onChange={onSelectedChange}
          size={20}
          aria-label={`Select ${title}`}
        />
      </div>
      <div className="selcard__content">
        <div className="selcard__title">{title}</div>
        {version && <div className="selcard__version">{version}</div>}
        {meta && <div className="selcard__meta">{meta}</div>}
        {children}
      </div>
    </div>
  );
};

export default SelectableCard;
