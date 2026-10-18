import type { TooltipPlacement } from "./types";

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface PositionOptions {
  placement: TooltipPlacement;
  offset: number;
  padding: number;
  autoFlip: boolean;
  viewport: Size;
}

export interface PositionResult {
  x: number;
  y: number;
  placement: TooltipPlacement;
  /** Arrow position along the tooltip edge, in px from the tooltip's left/top. */
  arrowOffset: number;
}

const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** Order in which sides are tried: preferred, opposite, then the two perpendicular sides. */
export function fallbackOrder(preferred: TooltipPlacement): TooltipPlacement[] {
  const perpendicular: TooltipPlacement[] =
    preferred === "top" || preferred === "bottom" ? ["right", "left"] : ["top", "bottom"];
  return [preferred, OPPOSITE[preferred], ...perpendicular];
}

function rawPosition(anchor: Rect, tip: Size, placement: TooltipPlacement, offset: number) {
  const cx = anchor.left + anchor.width / 2;
  const cy = anchor.top + anchor.height / 2;
  switch (placement) {
    case "top":
      return { x: cx - tip.width / 2, y: anchor.top - offset - tip.height };
    case "bottom":
      return { x: cx - tip.width / 2, y: anchor.top + anchor.height + offset };
    case "left":
      return { x: anchor.left - offset - tip.width, y: cy - tip.height / 2 };
    case "right":
      return { x: anchor.left + anchor.width + offset, y: cy - tip.height / 2 };
  }
}

/**
 * How far the tooltip spills out of the viewport on the axis that the placement controls.
 * (The other axis is fixed later by shifting, so it does not count against a side.)
 */
function overflow(x: number, y: number, tip: Size, placement: TooltipPlacement, o: PositionOptions) {
  const { padding, viewport } = o;
  if (placement === "left" || placement === "right") {
    return Math.max(0, padding - x) + Math.max(0, x + tip.width - (viewport.width - padding));
  }
  return Math.max(0, padding - y) + Math.max(0, y + tip.height - (viewport.height - padding));
}

const clamp = (v: number, min: number, max: number) => (max < min ? min : Math.min(Math.max(v, min), max));

/**
 * Computes a viewport-relative (position: fixed) location for a tooltip.
 * Tries the preferred side first; if it would overflow the viewport (e.g. cause horizontal
 * scrolling), the opposite and then the perpendicular sides are tried. The final position is
 * always shifted back inside the viewport.
 */
export function computeTooltipPosition(anchor: Rect, tip: Size, o: PositionOptions): PositionResult {
  const candidates = o.autoFlip ? fallbackOrder(o.placement) : [o.placement];

  let best = candidates[0];
  let bestOverflow = Infinity;
  for (const p of candidates) {
    const { x, y } = rawPosition(anchor, tip, p, o.offset);
    const ov = overflow(x, y, tip, p, o);
    if (ov === 0) {
      best = p;
      bestOverflow = 0;
      break;
    }
    if (ov < bestOverflow) {
      best = p;
      bestOverflow = ov;
    }
  }

  const raw = rawPosition(anchor, tip, best, o.offset);
  const { padding, viewport } = o;
  const x = clamp(raw.x, padding, viewport.width - padding - tip.width);
  const y = clamp(raw.y, padding, viewport.height - padding - tip.height);

  const vertical = best === "top" || best === "bottom";
  const anchorCenter = vertical ? anchor.left + anchor.width / 2 - x : anchor.top + anchor.height / 2 - y;
  const edge = vertical ? tip.width : tip.height;
  const arrowOffset = clamp(anchorCenter, 10, edge - 10);

  return { x, y, placement: best, arrowOffset };
}
