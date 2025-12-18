import * as React from "react";
import "./FilterDropdown.css";
import SearchInput from "./SearchInput";
import Checkbox from "./Checkbox";
import VerticalScrollbar from "./VerticalScrollbar";
import Portal from "./Portal";

export type FilterOption = {
  id: string | number;
  label: string;
  subLabel?: string; // optional (like tiny gray text)
  disabled?: boolean;
};

type Props = {
  options: FilterOption[];
  value: Array<string | number>;
  onChange: (next: Array<string | number>) => void;

  placeholder?: string; // "Search Products"
  widthPx?: number;     // default 264
  heightPx?: number;    // default 300
  className?: string;
  anchorTop?: number;   // viewport Y for portal positioning
  anchorLeft?: number;  // viewport X for portal positioning
};

const includesId = (arr: Array<string | number>, id: string | number) =>
  arr.some((x) => String(x) === String(id));

const toggleId = (arr: Array<string | number>, id: string | number) => {
  if (includesId(arr, id)) return arr.filter((x) => String(x) !== String(id));
  return [...arr, id];
};

const FilterDropdown: React.FC<Props> = ({
  options,
  value,
  onChange,
  placeholder = "Search Products",
  widthPx = 264,
  heightPx = 300,
  className = "",
  anchorTop = 0,
  anchorLeft = 0,
}) => {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <Portal>
      <div
        className={`fd-root ${className}`.trim()}
        style={{
          position: "absolute",
          top: anchorTop,
          left: anchorLeft,
          width: `${widthPx}px`,
          height: `${heightPx}px`,
        }}
        role="listbox"
        aria-multiselectable="true"
      >
        {/* Sticky Search */}
        <div className="fd-searchWrap">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder={placeholder}
            className="fd-search"
          />
        </div>

      {/* Scroll Area */}
      <div className="fd-list" role="presentation">
        {filtered.map((opt) => {
          const checked = includesId(value, opt.id);
          const disabled = !!opt.disabled;

          return (
            <div
              key={String(opt.id)}
              className={`fd-row ${checked ? "is-checked" : ""} ${
                disabled ? "is-disabled" : ""
              }`.trim()}
            >
              <Checkbox
                checked={checked}
                disabled={disabled}
                onChange={(next) => {
                  if (disabled) return;
                  if (next) {
                    onChange([...value, opt.id]);
                  } else {
                    onChange(value.filter((x) => String(x) !== String(opt.id)));
                  }
                }}
                className="fd-checkbox"
              />

              <span className="fd-rowText">
                <span className="fd-label">{opt.label}</span>
                {opt.subLabel ? <span className="fd-subLabel">{opt.subLabel}</span> : null}
              </span>
            </div>
          );
        })}

        {filtered.length === 0 ? (
          <div className="fd-empty">No matches</div>
        ) : null}
      </div>
      <VerticalScrollbar
        className="fd-vscroll"
        height={heightPx - 60}
      />
      </div>
    </Portal>
  );
};

export default FilterDropdown;
