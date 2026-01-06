// KongProducts.tsx
import * as React from "react";
import "./KongProducts.css";

// ✅ use your existing top bar
import ConnectionBar from "./ConnectionBar";
import SearchInput from "../../componenetsss/SearchInput";
import SelectCard from "../../componenetsss/SelectCard";
import Checkbox from "../../componenetsss/Checkbox";
import PrimaryButton from "../../componenetsss/PrimaryButton";
import SecondaryButton from "../../componenetsss/SecondaryButton";
import VerticalScrollbar from "../../componenetsss/VerticalScrollbar";

export type KongProduct = {
  id: string;
  name: string;
  code: string;
  description: string;
  imported?: boolean;
};

type Props = {
  products: KongProduct[];
  onBack: () => void;
  onImport: (selectedIds: string[]) => void;
  onViewHistory?: () => void;
  onManageConnection?: () => void;
};

const demoProducts: KongProduct[] = [
  {
    id: "p1",
    name: "Product Name",
    code: "kong-prod-001",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
  {
    id: "p2",
    name: "Product Name",
    code: "kong-prod-002",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
  {
    id: "p3",
    name: "Product Name",
    code: "kong-prod-003",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
  {
    id: "p4",
    name: "Product Name",
    code: "kong-prod-004",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
  { id: "p5", name: "Product Name", code: "kong-prod-005", description: "Description lorem lorem lorem lorem lorem lorem Description lorem l...", imported: true },
  {
    id: "p6",
    name: "Product Name",
    code: "kong-prod-006",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
  {
    id: "p7",
    name: "Product Name",
    code: "kong-prod-007",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
  { id: "p8", name: "Product Name", code: "kong-prod-008", description: "Description lorem lorem lorem lorem lorem lorem Description lorem l...", imported: true },
  {
    id: "p9",
    name: "Product Name",
    code: "kong-prod-009",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
  {
    id: "p10",
    name: "Product Name",
    code: "kong-prod-010",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
  { id: "p11", name: "Product Name", code: "kong-prod-011", description: "Description lorem lorem lorem lorem lorem lorem Description lorem l...", imported: true },
  {
    id: "p12",
    name: "Product Name",
    code: "kong-prod-012",
    description:
      "Description lorem lorem lorem lorem lorem lorem Description lorem l...",
  },
];

export default function KongProducts({ products, onBack, onImport: onImportProp, onViewHistory, onManageConnection }: Props) {
  const [query, setQuery] = React.useState("");
  const [items] = React.useState<KongProduct[]>(products);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [scrollHeight, setScrollHeight] = React.useState(0);
  const [clientHeight, setClientHeight] = React.useState(0);
  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((p) => {
      const hay = `${p.name} ${p.code} ${p.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const selectableFilteredIds = React.useMemo(() => {
    return filtered.filter((p) => !p.imported).map((p) => p.id);
  }, [filtered]);

  const selectedCount = React.useMemo(() => selectedIds.size, [selectedIds]);

  const allSelectedInFilter = React.useMemo(() => {
    if (selectableFilteredIds.length === 0) return false;
    return selectableFilteredIds.every((id) => selectedIds.has(id));
  }, [selectableFilteredIds, selectedIds]);

  const toggleOne = (p: KongProduct) => {
    if (p.imported) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.add(p.id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selectableFilteredIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearAll = () => {
    selectedIds.clear();
    setSelectedIds(new Set());
  };

  const handleScroll = React.useCallback(() => {
    if (gridContainerRef.current) {
      const element = gridContainerRef.current;
      setScrollPosition(element.scrollTop);
      setScrollHeight(element.scrollHeight);
      setClientHeight(element.clientHeight);
    }
  }, []);

  React.useEffect(() => {
    const element = gridContainerRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
      return () => element.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Calculate scrollbar thumb position and height
  const scrollPercentage = scrollHeight > clientHeight ? scrollPosition / (scrollHeight - clientHeight) : 0;
  const thumbHeight = scrollHeight > clientHeight ? (clientHeight / scrollHeight) * 100 : 0;
  const thumbPosition = scrollPercentage * (100 - thumbHeight);
  const showScrollbar = scrollHeight > clientHeight;

  const onImport = async () => {
    const selected = Array.from(selectedIds);
    if (selected.length === 0) return;
    
    onImportProp(selected);
    clearAll();
  };

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory();
    } else {
      console.log("View History");
    }
  };

  return (
    <div className="kp-page">
      <div className="kp-topbar">
        <ConnectionBar
          title="Import Kong Products"
          onBack={onBack}
          rightActionLabel="Manage Connection"
          onRightAction={onManageConnection}
        />
      </div>

      <div className="kp-content">
        <div className="kp-card">
          {/* header (does NOT scroll) */}
          <div className="kp-cardHead">
            <div className="kp-titleWrap">
              <div className="kp-title">
                Import Kong Products <span className="kp-titleCount">({selectedCount})</span>
              </div>
            </div>

            <div className="kp-headRight">
              <Checkbox
                id="select-all"
                checked={allSelectedInFilter}
                onChange={(checked) => checked ? selectAllFiltered() : clearAll()}
                label="Select All"
                className="kp-selectAll"
              />

              <button
                type="button"
                className="kp-clearAll"
                onClick={clearAll}
                disabled={selectedCount === 0}
              >
                Clear All
              </button>

              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search"
                className="kp-searchInputCustom"
              />
            </div>
          </div>

          {/* ONLY THIS AREA SCROLLS */}
          <div className="kp-gridScroll">
            <div className="kp-gridContainer" ref={gridContainerRef}>
              <div className="kp-grid">
                {filtered.map((p) => {
                  const isSelected = selectedIds.has(p.id);
                  const isImported = !!p.imported;

                  return (
                    <SelectCard
                      key={p.id}
                      title={p.name}
                      subtitle={p.code}
                      description={p.description}
                      disabled={isImported}
                      selected={isSelected}
                      disabledBadgeText="Imported"
                      onClick={() => toggleOne(p)}
                    />
                  );
                })}
              </div>
            </div>
            {showScrollbar && (
              <div className="kp-scrollbar">
                <div 
                  className="kp-scrollbar-track"
                  style={{
                    height: '100%',
                    position: 'relative'
                  }}
                >
                  <div
                    className="kp-scrollbar-thumb"
                    style={{
                      position: 'absolute',
                      top: `${thumbPosition}%`,
                      height: `${thumbHeight}%`,
                      width: '4px',
                      backgroundColor: '#D9DFE8',
                      borderRadius: '2px',
                      transition: 'none'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* footer (does NOT scroll, always bottom) */}
          <div className="kp-footer">
            <SecondaryButton 
            className="kp-secondaryBtn"
            onClick={handleViewHistory}
            disabled>

              View History
            </SecondaryButton>

            <PrimaryButton
              onClick={onImport}
              disabled={selectedCount === 0}
              className="kp-primaryBtn"
            >
              Import {selectedCount || 0} Products
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
