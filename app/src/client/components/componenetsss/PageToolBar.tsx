import React from "react";
import styles from "./PageToolbar.module.css";

type Size = number | string;

type IconButton = {
  type?: "settings" | "bell" | "custom";
  icon?: React.ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
  boxSize?: Size;
  iconSize?: Size;
};

type PrimaryButton = {
  text?: string;
  onClick?: () => void;
  width?: Size;
  height?: Size;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type PageToolbarProps = {
  title?: string;
  titleSize?: Size;

  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  onSearchSubmit?: () => void;
  searchWidth?: Size;
  searchHeight?: Size;
  searchDisabled?: boolean;

  showFilter?: boolean;
  onFilterClick?: () => void;
  filterDisabled?: boolean;

  primaryButton?: PrimaryButton;

  rightIcons?: IconButton[];

  height?: Size;
  paddingX?: Size;
  className?: string;
  style?: React.CSSProperties;
};

/* ---- SVG icons ---- */
const BellSVG: React.FC<{ size?: Size }> = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size as number} height={size as number} viewBox="0 0 20 20" fill="none">
    <path
      d="M8.55655 17.5001C8.70283 17.7534 8.91323 17.9638 9.16658 18.1101C9.41994 18.2563 9.70733 18.3333 9.99988 18.3333C10.2924 18.3333 10.5798 18.2563 10.8332 18.1101C11.0865 17.9638 11.2969 17.7534 11.4432 17.5001M2.71821 12.7717C2.60935 12.8911 2.53751 13.0394 2.51143 13.1988C2.48534 13.3582 2.50615 13.5218 2.5713 13.6696C2.63646 13.8174 2.74316 13.943 2.87843 14.0313C3.01369 14.1196 3.1717 14.1666 3.33321 14.1667H16.6665C16.828 14.1668 16.9861 14.1199 17.1214 14.0318C17.2568 13.9437 17.3636 13.8182 17.429 13.6705C17.4943 13.5228 17.5153 13.3593 17.4894 13.1999C17.4635 13.0405 17.3919 12.892 17.2832 12.7726C16.1749 11.6301 14.9999 10.4159 14.9999 6.66675C14.9999 5.34067 14.4731 4.0689 13.5354 3.13121C12.5977 2.19353 11.326 1.66675 9.99988 1.66675C8.6738 1.66675 7.40203 2.19353 6.46435 3.13121C5.52666 4.0689 4.99988 5.34067 4.99988 6.66675C4.99988 10.4159 3.82405 11.6301 2.71821 12.7717Z"
      stroke="#373B40"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SettingsSVG: React.FC<{ size?: Size }> = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size as number} height={size as number} viewBox="0 0 20 20" fill="none">
    <path
      d="M10.1833 1.66675H9.81667C9.37464 1.66675 8.95072 1.84234 8.63816 2.1549C8.3256 2.46746 8.15 2.89139 8.15 3.33341V3.48341C8.1497 3.77569 8.07255 4.06274 7.92628 4.31578C7.78002 4.56882 7.56978 4.77895 7.31667 4.92508L6.95833 5.13341C6.70497 5.2797 6.41756 5.35671 6.125 5.35671C5.83244 5.35671 5.54503 5.2797 5.29167 5.13341L5.16667 5.06675C4.78422 4.84613 4.32987 4.78628 3.90334 4.90034C3.47681 5.01439 3.11296 5.29303 2.89167 5.67508L2.70833 5.99175C2.48772 6.37419 2.42787 6.82855 2.54192 7.25508C2.65598 7.68161 2.93461 8.04546 3.31667 8.26675L3.44167 8.35008C3.69356 8.49551 3.90302 8.70432 4.04921 8.95577C4.1954 9.20723 4.27325 9.49256 4.275 9.78341V10.2084C4.27617 10.5021 4.19971 10.7909 4.05337 11.0455C3.90703 11.3001 3.69601 11.5116 3.44167 11.6584L3.31667 11.7334C2.93461 11.9547 2.65598 12.3186 2.54192 12.7451C2.42787 13.1716 2.48772 13.626 2.70833 14.0084L2.89167 14.3251C3.11296 14.7071 3.47681 14.9858 3.90334 15.0998C4.32987 15.2139 4.78422 15.154 5.16667 14.9334L5.29167 14.8667C5.54503 14.7205 5.83244 14.6435 6.125 14.6435C6.41756 14.6435 6.70497 14.7205 6.95833 14.8667L7.31667 15.0751C7.56978 15.2212 7.78002 15.4313 7.92628 15.6844C8.07255 15.9374 8.1497 16.2245 8.15 16.5167V16.6667C8.15 17.1088 8.3256 17.5327 8.63816 17.8453C8.95072 18.1578 9.37464 18.3334 9.81667 18.3334H10.1833C10.6254 18.3334 11.0493 18.1578 11.3618 17.8453C11.6744 17.5327 11.85 17.1088 11.85 16.6667V16.5167C11.8503 16.2245 11.9275 15.9374 12.0737 15.6844C12.22 15.4313 12.4302 15.2212 12.6833 15.0751L13.0417 14.8667C13.295 14.7205 13.5824 14.6435 13.875 14.6435C14.1676 14.6435 14.455 14.7205 14.7083 14.8667L14.8333 14.9334C15.2158 15.154 15.6701 15.2139 16.0967 15.0998C16.5232 14.9858 16.887 14.7071 17.1083 14.3251L17.2917 14.0001C17.5123 13.6176 17.5721 13.1633 17.4581 12.7367C17.344 12.3102 17.0654 11.9464 16.6833 11.7251L16.5583 11.6584C16.304 11.5116 16.093 11.3001 15.9466 11.0455C15.8003 10.7909 15.7238 10.5021 15.725 10.2084V9.79175C15.7238 9.49806 15.8003 9.20929 15.9466 8.95466C16.093 8.70003 16.304 8.48859 16.5583 8.34175L16.6833 8.26675C17.0654 8.04546 17.344 7.68161 17.4581 7.25508C17.5721 6.82855 17.5123 6.37419 17.2917 5.99175L17.1083 5.67508C16.887 5.29303 16.5232 5.01439 16.0967 4.90034C15.6701 4.78628 15.2158 4.84613 14.8333 5.06675L14.7083 5.13341C14.455 5.2797 14.1676 5.35671 13.875 5.35671C13.5824 5.35671 13.295 5.2797 13.0417 5.13341L12.6833 4.92508C12.4302 4.77895 12.22 4.56882 12.0737 4.31578C11.9275 4.06274 11.8503 3.77569 11.85 3.48341V3.33341C11.85 2.89139 11.6744 2.46746 11.3618 2.1549C11.0493 1.84234 10.6254 1.66675 10.1833 1.66675Z"
      stroke="#373B40"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 12.5001C11.3807 12.5001 12.5 11.3808 12.5 10.0001C12.5 8.61937 11.3807 7.50008 10 7.50008C8.61929 7.50008 7.5 8.61937 7.5 10.0001C7.5 11.3808 8.61929 12.5001 10 12.5001Z"
      stroke="#373B40"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusSVG: React.FC<{ size?: Size }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size as number} height={size as number} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const FilterSVG: React.FC<{ size?: Size }> = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size as number} height={size as number} viewBox="0 0 24 24" fill="none">
    <path d="M4 6h16M7 12h10M10 18h4" stroke="#373B40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PageToolbar: React.FC<PageToolbarProps> = ({
  title = "Products",
  titleSize = 18,
  showSearch = true,
  searchPlaceholder = "Search",
  searchValue,
  onSearchChange,
  onSearchSubmit,
  searchWidth = 220,
  searchHeight = 36,
  searchDisabled = false,
  showFilter = true,
  onFilterClick,
  filterDisabled = false,
  primaryButton = { text: "New Product" },
  rightIcons = [{ type: "settings" }, { type: "bell" }],
  height = 64,
  paddingX = 16,
  className,
  style,
}) => {
  const renderIconBtn = (cfg: IconButton, key: number) => {
    const box = cfg.boxSize ?? 40;
    const icon = cfg.iconSize ?? 20;
    let node: React.ReactNode = cfg.icon;
    if (!node) {
      if (cfg.type === "bell") node = <BellSVG size={icon} />;
      else if (cfg.type === "settings") node = <SettingsSVG size={icon} />;
    }
    return (
      <button
        key={key}
        type="button"
        className={styles.iconBtn}
        style={{ width: box, height: box }}
        aria-label={cfg.ariaLabel || cfg.type || "icon"}
        onClick={cfg.onClick}
      >
        {node}
      </button>
    );
  };

  return (
    <div className={`${styles.wrapper} ${className || ""}`} style={{ height, paddingLeft: paddingX, paddingRight: paddingX, ...style }}>
      <div className={styles.left}>
        <div className={styles.title} style={{ fontSize: titleSize }}>{title}</div>

        {showSearch && (
          <form
            className={styles.searchWrap}
            style={{ width: searchWidth, height: searchHeight }}
            onSubmit={(e) => {
              e.preventDefault();
              onSearchSubmit?.();
            }}
          >
            <span className={styles.searchIcon} aria-hidden></span>
            <input
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              value={searchValue ?? ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              disabled={searchDisabled}
            />
          </form>
        )}

        {showFilter && (
          <button type="button" className={styles.filterBtn} onClick={onFilterClick} disabled={filterDisabled} aria-label="Filter">
            <FilterSVG />
          </button>
        )}
      </div>

      <div className={styles.right}>
        {primaryButton && (
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={primaryButton.onClick}
            style={{
              height: primaryButton.height ?? 40,
              width: primaryButton.width,
            }}
            disabled={primaryButton.disabled}
          >
            {primaryButton.icon ?? <PlusSVG />}
            <span>{primaryButton.text ?? "Create"}</span>
          </button>
        )}
        {rightIcons?.map(renderIconBtn)}
      </div>
    </div>
  );
};

export default PageToolbar;



