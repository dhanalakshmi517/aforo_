import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./NewProductButton.css";
import Portal from "./Portal";

type NewProductButtonProps = {
  disabled?: boolean;
  onCreate?: () => void;
  onImport?: () => void;
};

const NewProductButton: React.FC<NewProductButtonProps> = ({
  disabled = false,
  onCreate,
  onImport,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Get the position of the button for the portal
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      // Update position on scroll or resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition]);

  const handleCreateClick = useCallback(() => {
    setOpen(false);

    if (onCreate) {
      onCreate();
    } else {
      navigate("/get-started/products/new");
    }
  }, [navigate, onCreate]);

  const handleImportClick = useCallback(() => {
    setOpen(false);

    if (onImport) {
      onImport();
    } else {
      navigate("/get-started/products/import");
    }
  }, [navigate, onImport]);

  return (
    <div className="npb-wrap" ref={buttonRef}>
      <div className={`npb-split ${disabled ? "is-disabled" : ""}`}>
        {/* LEFT — CREATE */}
        <button
          className="npb-part npb-left"
          disabled={disabled}
          onClick={handleCreateClick}
          aria-label="Create"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14">
            <path
              d="M0.75 6.58333L12.4167 6.58333M6.58333 0.75L6.58333 12.4167"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* RIGHT — DROPDOWN */}
        <button
          className="npb-part npb-right"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          aria-label="Open menu"
          aria-expanded={open}
        >
        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="5" viewBox="0 0 9 5" fill="none">
  <path d="M0.525391 0.524902L4.02539 4.0249L7.52539 0.524902" stroke="#F9FBFD" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
        </button>
      </div>

      {open && !disabled && (
        <Portal>
          <div 
            className="npb-menu-portal" 
            style={{
              position: 'absolute',
              top: `${position.top}px`,
              left: `${position.left}px`,
              width: `${position.width}px`,
              zIndex: 10000,
            }}
          >
            <div className="npb-menu">
              <button 
                className="npb-item npb-item--primary" 
                onClick={handleCreateClick}
              >
                Create
              </button>
              <button 
                className="npb-item" 
                onClick={handleImportClick}
              >
                Import
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
};

export default NewProductButton;
