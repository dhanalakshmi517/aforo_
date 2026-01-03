import * as React from "react";
import "./ImportActionsMenu.css";

type Props = {
  open: boolean;
  onClose: () => void;

  onImportHistory?: () => void;
  onImportProducts?: () => void;
  onRemove?: () => void;

  /** optional: for positioning near a trigger */
  anchorRef?: React.RefObject<HTMLElement>;
  /** optional: default is bottom-right of anchor */
  align?: "bottom-right" | "bottom-left";
};

export default function ImportActionsMenu({
  open,
  onClose,
  onImportHistory,
  onImportProducts,
  onRemove,
  anchorRef,
  align = "bottom-right",
}: Props) {
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = React.useState<{ top: number; left: number } | null>(
    null
  );

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const onPointerDown = (e: MouseEvent | PointerEvent) => {
      const target = e.target as Node;
      if (!menuRef.current) return;
      if (menuRef.current.contains(target)) return;
      if (anchorRef?.current && anchorRef.current.contains(target)) return;
      onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose, anchorRef]);

  React.useLayoutEffect(() => {
    if (!open) return;

    const calc = () => {
      if (!anchorRef?.current) return;

      const r = anchorRef.current.getBoundingClientRect();
      const scrollX = window.scrollX || document.documentElement.scrollLeft;
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      const gap = 8; // little breathing space from trigger
      const width = 152;

      let left =
        align === "bottom-left" ? r.left + scrollX : r.right + scrollX - width;

      let top = r.bottom + scrollY + gap;

      // keep inside viewport (basic)
      const vw = window.innerWidth;
      if (left + width > vw - 8) left = vw - 8 - width;
      if (left < 8) left = 8;

      setPos({ top, left });
    };

    calc();
    window.addEventListener("resize", calc);
    window.addEventListener("scroll", calc, true);
    return () => {
      window.removeEventListener("resize", calc);
      window.removeEventListener("scroll", calc, true);
    };
  }, [open, anchorRef, align]);

  if (!open) return null;

  const style: React.CSSProperties =
    anchorRef?.current && pos
      ? { position: "absolute", top: pos.top, left: pos.left }
      : { position: "absolute" };

  return (
    <div
      ref={menuRef}
      className="iamenu"
      style={style}
      role="menu"
      aria-label="Import actions"
    >
      <button
        type="button"
        className="iamenu__item"
        role="menuitem"
        onClick={() => {
          onImportHistory?.();
          onClose();
        }}
      >
        Import History
      </button>

      <button
        type="button"
        className="iamenu__item"
        role="menuitem"
        onClick={() => {
          onImportProducts?.();
          onClose();
        }}
      >
        Import Products
      </button>

      <button
        type="button"
        className="iamenu__item iamenu__item--danger"
        role="menuitem"
        onClick={() => {
          onRemove?.();
          onClose();
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
