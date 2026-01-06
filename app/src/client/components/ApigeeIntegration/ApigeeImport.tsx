// src/pages/Apigee/ApigeeImport.tsx
import * as React from "react";
import { useNavigate } from "react-router-dom";

// ✅ reuse KongProducts layout + classnames
import "./ApigeeImport.css";

// use your existing top bar + shared components
import ConnectionBar from "./ApigeeConnection";
import { InputField, SelectField } from "../componenetsss/Inputs";
import PrimaryButton from "../componenetsss/PrimaryButton";
import SecondaryButton from "../componenetsss/SecondaryButton";
import Checkbox from "../componenetsss/Checkbox";
import SearchInput from "../componenetsss/SearchInput";
import SelectCard from "../componenetsss/SelectCard";

// your Apigee APIs
import { getApigeeProducts, importSelectedApigeeProducts, ApigeeProduct } from "./api";
import ApigeeConnection from "./ApigeeConnection";
import ProductsImportedApigee from "./ProductsImportedApigee";

export default function ApigeeImport() {
  const navigate = useNavigate();

  const [showLeaveModal, setShowLeaveModal] = React.useState(false);

  const [items, setItems] = React.useState<ApigeeProduct[]>([]);
  const [query, setQuery] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [importSuccess, setImportSuccess] = React.useState(false);
  const [importedCount, setImportedCount] = React.useState(0);

  // selection
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // scroll tracking for custom scrollbar (same as KongProducts)
  const gridContainerRef = React.useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [scrollHeight, setScrollHeight] = React.useState(0);
  const [clientHeight, setClientHeight] = React.useState(0);

  // ===== fetch products on mount =====
  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getApigeeProducts();
        setItems(data || []);
      } catch (err: any) {
        console.error("[ApigeeImport] Failed to fetch products:", err);
        setError(err?.response?.data?.message || "Failed to load Apigee products. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ===== derived filtered list =====
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((p) => {
      const hay = `${p.display_name || ""} ${p.name || ""} ${p.quota || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  // support "imported" if your API returns it; otherwise everything selectable
  const selectableFilteredIds = React.useMemo(() => {
    return filtered
      .filter((p) => !(p as any).imported)
      .map((p) => p.name); // name is the stable id in your existing import API
  }, [filtered]);

  const selectedCount = React.useMemo(() => selectedIds.size, [selectedIds]);

  const allSelectedInFilter = React.useMemo(() => {
    if (selectableFilteredIds.length === 0) return false;
    return selectableFilteredIds.every((id) => selectedIds.has(id));
  }, [selectableFilteredIds, selectedIds]);

  // ===== selection actions =====
  const toggleOne = (p: ApigeeProduct) => {
    const isImported = !!(p as any).imported;
    if (isImported) return;

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(p.name)) next.delete(p.name);
      else next.add(p.name);
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

  // ===== back / modal =====
  const onBack = () => {
    // Just navigate back without showing any popup
    navigate('/apigee-integration');
  };

  const handleKeepSelecting = () => setShowLeaveModal(false);

  const handleLeavePage = () => {
    setShowLeaveModal(false);
    navigate("/get-started/integrations");
  };

  const handleCloseModal = () => setShowLeaveModal(false);

  // ===== topbar right actions =====
  const onManageConnection = () => {
    navigate("/apigee-integration");
  };

  const onViewHistory = () => {
    // adjust route if you already have a page
    navigate("/get-started/integrations/apigee/import-history");
  };

  // ===== import =====
  const onImport = async () => {
    const selected = Array.from(selectedIds);
    if (selected.length === 0 || importing) return;

    setImporting(true);
    setError(null);

    try {
      const res = await importSelectedApigeeProducts(selected);
      console.log("[ApigeeImport] Import selected response:", res);

      const count =
        typeof (res as any)?.importedCount === "number" ? (res as any).importedCount : selected.length;

      setImportedCount(count);
      setImportSuccess(true);
      clearAll();
    } catch (err: any) {
      console.error("[ApigeeImport] Failed to import selected products:", err);
      setError(err?.response?.data?.message || "Failed to import selected products. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  // ===== scrollbar calc (same as KongProducts) =====
  const handleScroll = React.useCallback(() => {
    if (!gridContainerRef.current) return;
    const el = gridContainerRef.current;
    setScrollPosition(el.scrollTop);
    setScrollHeight(el.scrollHeight);
    setClientHeight(el.clientHeight);
  }, []);

  // ===== callbacks for ProductsImportedApigee =====
  const handleImportedBack = () => {
    setImportSuccess(false);
    setImportedCount(0);
  };

  const handleManageConnectionFromImported = () => {
    navigate("/apigee-integration");
  };

  const handleViewHistoryFromImported = () => {
    navigate("/get-started/integrations/apigee/import-history");
  };

  const handleImportMoreFromImported = () => {
    setImportSuccess(false);
    setImportedCount(0);
  };

  React.useEffect(() => {
    const el = gridContainerRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollPercentage = scrollHeight > clientHeight ? scrollPosition / (scrollHeight - clientHeight) : 0;
  const thumbHeight = scrollHeight > clientHeight ? (clientHeight / scrollHeight) * 100 : 0;
  const thumbPosition = scrollPercentage * (100 - thumbHeight);
  const showScrollbar = scrollHeight > clientHeight;

  // Show ProductsImportedApigee when import is successful
  if (importSuccess) {
    return (
      <ProductsImportedApigee
        importedCount={importedCount}
        onBack={handleImportedBack}
        onManageConnection={handleManageConnectionFromImported}
        onViewHistory={handleViewHistoryFromImported}
        onImportMore={handleImportMoreFromImported}
      />
    );
  }

  return (
    <div className="kp-page">
      <div className="kp-topbar">
        <ApigeeConnection
          title="Import Apigee Products"
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
                Import Apigee Products <span className="kp-titleCount">({selectedCount})</span>
              </div>
            </div>

            <div className="kp-headRight">
              <Checkbox
                id="select-all"
                checked={allSelectedInFilter}
                onChange={(checked: boolean) => (checked ? selectAllFiltered() : clearAll())}
                label="Select All"
                className="kp-selectAll"
              />

              <button type="button" className="kp-clearAll" onClick={clearAll} disabled={selectedCount === 0}>
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
                {loading ? (
                  <div style={{ padding: 16, color: "#667085" }}>Loading products…</div>
                ) : error ? (
                  <div style={{ padding: 16, color: "#B42318" }}>{error}</div>
                ) : filtered.length === 0 ? (
                  <div style={{ padding: 16, color: "#667085" }}>No products found.</div>
                ) : (
                  filtered.map((p) => {
                    const isSelected = selectedIds.has(p.name);
                    const isImported = !!(p as any).imported;

                    const title = p.display_name || p.name;
                    const subtitle = p.name;
                    const description = `Quota: ${p.quota ?? "N/A"}`;

                    return (
                      <SelectCard
                        key={p.name}
                        title={title}
                        subtitle={subtitle}
                        description={description}
                        disabled={isImported}
                        selected={isSelected}
                        disabledBadgeText="Imported"
                        onClick={() => toggleOne(p)}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {showScrollbar && (
              <div className="kp-scrollbar">
                <div className="kp-scrollbar-track" style={{ height: "100%", position: "relative" }}>
                  <div
                    className="kp-scrollbar-thumb"
                    style={{
                      position: "absolute",
                      top: `${thumbPosition}%`,
                      height: `${thumbHeight}%`,
                      width: "4px",
                      backgroundColor: "#D9DFE8",
                      borderRadius: "2px",
                      transition: "none",
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* footer (does NOT scroll, always bottom) */}
          <div className="kp-footer">
            <SecondaryButton className="kp-secondaryBtn" onClick={onViewHistory} disabled>
              View History
            </SecondaryButton>

            <PrimaryButton onClick={onImport} disabled={selectedCount === 0 || importing} className="kp-primaryBtn">
              {importing ? `Importing…` : `Import ${selectedCount || 0} Products`}
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Leave Confirmation Modal (kept from your original) */}
      {showLeaveModal && (
        <div className="modal-overlay">
          <div className="leave-modal">
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="modal-title">Are You Sure Want to Leave This Page?</h2>

            <p className="modal-description">Your selected products won&apos;t be imported if you leave now.</p>

            <div className="modal-buttons">
              <button className="keep-selecting-btn" onClick={handleKeepSelecting}>
                Keep Selecting
              </button>

              <button className="leave-page-btn" onClick={handleLeavePage}>
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
