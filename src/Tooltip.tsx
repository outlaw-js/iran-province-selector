import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, MutableRefObject, ReactNode } from "react";
import { createPortal } from "react-dom";
import { computeTooltipPosition, type Rect } from "./positioning";
import type { TooltipPlacement } from "./types";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface TooltipProps {
  /** Returns the anchor rect in viewport coordinates. */
  getAnchor: () => Rect | null;
  /** The tooltip writes its `update` function here so callers can reposition without re-rendering. */
  updateRef?: MutableRefObject<(() => void) | null>;
  /** Changing this value forces a reposition (e.g. a new province). */
  anchorKey: string;
  placement: TooltipPlacement;
  offset: number;
  padding: number;
  autoFlip: boolean;
  arrow: boolean;
  className?: string;
  style?: CSSProperties;
  container?: HTMLElement | null;
  children: ReactNode;
}

const ARROW = 10;

const baseStyle: CSSProperties = {
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 9999,
  pointerEvents: "none",
  boxSizing: "border-box",
  maxWidth: "calc(100vw - 16px)",
  padding: "6px 10px",
  borderRadius: 8,
  background: "#0f172a",
  color: "#fff",
  fontSize: 13,
  lineHeight: 1.6,
  boxShadow: "0 6px 24px rgba(15, 23, 42, 0.25)",
  visibility: "hidden",
};

export function Tooltip(props: TooltipProps) {
  const { anchorKey, placement, offset, padding, autoFlip, arrow, className, style, container, children } = props;
  const tipRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);
  const getAnchorRef = useRef(props.getAnchor);
  getAnchorRef.current = props.getAnchor;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const update = useCallback(() => {
    const el = tipRef.current;
    const anchor = getAnchorRef.current();
    if (!el || !anchor) return;

    // Measure at the origin so the browser's shrink-to-fit width is not affected by the old position.
    el.style.left = "0px";
    el.style.top = "0px";
    const { width, height } = el.getBoundingClientRect();
    const root = document.documentElement;

    const pos = computeTooltipPosition(anchor, { width, height }, {
      placement,
      offset: offset + (arrow ? ARROW / 2 : 0),
      padding,
      autoFlip,
      viewport: { width: root.clientWidth, height: root.clientHeight },
    });

    el.style.left = `${Math.round(pos.x)}px`;
    el.style.top = `${Math.round(pos.y)}px`;
    el.style.visibility = "visible";
    el.dataset.placement = pos.placement;

    const a = arrowRef.current;
    if (a) {
      const half = `${-ARROW / 2}px`;
      const along = `${Math.round(pos.arrowOffset - ARROW / 2)}px`;
      a.style.top = a.style.bottom = a.style.left = a.style.right = "";
      if (pos.placement === "top") Object.assign(a.style, { bottom: half, left: along });
      if (pos.placement === "bottom") Object.assign(a.style, { top: half, left: along });
      if (pos.placement === "left") Object.assign(a.style, { right: half, top: along });
      if (pos.placement === "right") Object.assign(a.style, { left: half, top: along });
    }
  }, [placement, offset, padding, autoFlip, arrow]);

  if (props.updateRef) props.updateRef.current = update;

  useIsoLayoutEffect(() => {
    if (mounted) update();
  }, [mounted, update, anchorKey, children]);

  // Keep the position right while scrolling, resizing, or when the content's size changes.
  useEffect(() => {
    if (!mounted) return;
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && tipRef.current) {
      ro = new ResizeObserver(() => update());
      ro.observe(tipRef.current);
    }
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
      ro?.disconnect();
    };
  }, [mounted, update]);

  if (!mounted) return null;

  return createPortal(
    <div ref={tipRef} role="tooltip" className={className} style={{ ...baseStyle, ...style }}>
      {arrow && (
        <span
          ref={arrowRef}
          aria-hidden
          style={{
            position: "absolute",
            width: ARROW,
            height: ARROW,
            background: "inherit",
            transform: "rotate(45deg)",
            borderRadius: 2,
          }}
        />
      )}
      <div style={{ position: "relative" }}>{children}</div>
    </div>,
    container ?? document.body,
  );
}
