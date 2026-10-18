import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import { IRAN_VIEWBOX, PROVINCES, getProvince } from "./provinces";
import { Tooltip } from "./Tooltip";
import type { Rect } from "./positioning";
import type { IranMapProps, Province, ProvinceColors, ProvinceId, ProvinceState } from "./types";

export const DEFAULT_COLORS: ProvinceColors = {
  background: "transparent",
  fill: "#e2e8f0",
  hoverFill: "#93c5fd",
  selectedFill: "#2563eb",
  selectedHoverFill: "#1d4ed8",
  disabledFill: "#f1f5f9",
  stroke: "#ffffff",
  hoverStroke: "#1e3a8a",
  selectedStroke: "#ffffff",
  strokeWidth: 1,
  hoverStrokeWidth: 1.5,
  label: "#334155",
  hoverLabel: "#0f172a",
  selectedLabel: "#ffffff",
  disabledLabel: "#94a3b8",
};

const LINE_HEIGHT = 1.15;

/** Font size that keeps the label roughly inside the province's free space. */
function fitFontSize(lines: string[], radius: number, max: number) {
  const longest = Math.max(...lines.map((l) => l.length));
  const byWidth = (2.2 * radius) / (longest * 0.55);
  const byHeight = (1.8 * radius) / (lines.length * LINE_HEIGHT);
  return Math.max(7, Math.min(max, byWidth, byHeight));
}

/**
 * Default label lines. "X و Y" / "X and Y" always break after the conjunction; other multi-word
 * names break at the middle space when two lines allow a clearly larger font.
 */
function defaultLabelLines(name: string, radius: number, max: number): string[] {
  const conj = name.match(/^(.+? (?:و|and)) (.+)$/);
  if (conj) return [conj[1], conj[2]];

  const spaces = [...name.matchAll(/ /g)].map((m) => m.index ?? 0);
  if (spaces.length === 0) return [name];
  const mid = spaces.reduce((a, b) => (Math.abs(b - name.length / 2) < Math.abs(a - name.length / 2) ? b : a));
  const split = [name.slice(0, mid), name.slice(mid + 1)];
  return fitFontSize(split, radius, max) > fitFontSize([name], radius, max) * 1.1 ? split : [name];
}

const EMPTY: ProvinceId[] = [];

function isFocusVisible(el: Element) {
  try {
    return el.matches(":focus-visible");
  } catch {
    return true;
  }
}

export function IranMap(props: IranMapProps) {
  const {
    selectionMode = "multiple",
    selected,
    defaultSelected,
    onSelectionChange,
    maxSelected,
    disabledProvinces = EMPTY,
    onProvinceClick,
    onProvinceHover,
    showTooltip = true,
    renderTooltip,
    tooltipPlacement = "top",
    tooltipAutoFlip = true,
    tooltipOffset = 10,
    tooltipViewportPadding = 8,
    tooltipFollowCursor = false,
    tooltipArrow = true,
    tooltipClassName,
    tooltipStyle,
    tooltipContainer,
    showLabels = false,
    renderLabel,
    labelFontSize = 16,
    labelAutoSize = true,
    labelStyle,
    labelPositions,
    colors: colorOverrides,
    getProvinceStyle,
    transitionDuration = 150,
    locale = "fa",
    className,
    style,
    svgProps,
  } = props;

  const colors = { ...DEFAULT_COLORS, ...colorOverrides };
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  /* ---------- selection (controlled or uncontrolled) ---------- */
  const [internalSelected, setInternalSelected] = useState<ProvinceId[]>(defaultSelected ?? EMPTY);
  const isControlled = selected !== undefined;
  const selectedIds = isControlled ? selected : internalSelected;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  // Latest selection, so several clicks before a re-render don't overwrite each other.
  const latestSelected = useRef(selectedIds);
  latestSelected.current = selectedIds;
  const disabledSet = useMemo(() => new Set(disabledProvinces), [disabledProvinces]);

  /* ---------- hover ---------- */
  const [hoveredId, setHoveredId] = useState<ProvinceId | null>(null);
  const lastPointerType = useRef<string>("mouse");
  const svgRef = useRef<SVGSVGElement>(null);
  const mainPathRefs = useRef(new Map<ProvinceId, SVGPathElement>());
  const cursorRef = useRef<{ x: number; y: number } | null>(null);
  const tooltipUpdateRef = useRef<(() => void) | null>(null);

  const onHoverRef = useRef(onProvinceHover);
  onHoverRef.current = onProvinceHover;
  const hoveredRef = useRef<ProvinceId | null>(null);
  const changeHover = useCallback((id: ProvinceId | null) => {
    if (hoveredRef.current === id) return;
    hoveredRef.current = id;
    setHoveredId(id);
    onHoverRef.current?.(id ? getProvince(id) ?? null : null);
  }, []);
  const clearHover = (id: ProvinceId) => {
    if (hoveredRef.current === id) changeHover(null);
  };

  // Touch has no "leave": keep the tooltip until the user taps outside the map.
  useEffect(() => {
    if (!hoveredId || lastPointerType.current !== "touch") return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!svgRef.current?.contains(e.target as Node)) changeHover(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [hoveredId, changeHover]);

  /* ---------- click / keyboard activation ---------- */
  const activate = (province: Province, event: MouseEvent<SVGGElement> | KeyboardEvent<SVGGElement>) => {
    if (disabledSet.has(province.id)) return;
    onProvinceClick?.(province, event);
    if (event.defaultPrevented || selectionMode === "none") return;

    const id = province.id;
    const current = latestSelected.current;
    const isSelected = current.includes(id);
    let next: ProvinceId[];
    if (selectionMode === "single") {
      next = isSelected ? [] : [id];
    } else if (isSelected) {
      next = current.filter((x) => x !== id);
    } else {
      if (maxSelected !== undefined && current.length >= maxSelected) return;
      next = [...current, id];
    }

    latestSelected.current = next;
    if (!isControlled) setInternalSelected(next);
    onSelectionChange?.(next, next.map((x) => getProvince(x)).filter((p): p is Province => !!p));
  };

  /* ---------- tooltip anchor ---------- */
  const getAnchor = (): Rect | null => {
    if (!hoveredId) return null;
    if (tooltipFollowCursor && cursorRef.current && lastPointerType.current === "mouse") {
      return { left: cursorRef.current.x, top: cursorRef.current.y, width: 0, height: 0 };
    }
    const el = mainPathRefs.current.get(hoveredId);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  };

  const stateOf = (id: ProvinceId): ProvinceState => ({
    hovered: hoveredId === id,
    selected: selectedSet.has(id),
    disabled: disabledSet.has(id),
  });

  const hoveredProvince = hoveredId ? getProvince(hoveredId) : undefined;
  const tooltipContent =
    showTooltip && hoveredProvince
      ? renderTooltip
        ? renderTooltip(hoveredProvince, stateOf(hoveredProvince.id))
        : locale === "fa"
          ? hoveredProvince.nameFa
          : hoveredProvince.nameEn
      : null;

  const interactive = selectionMode !== "none" || !!onProvinceClick;
  const transition = transitionDuration
    ? `fill ${transitionDuration}ms ease, stroke ${transitionDuration}ms ease, opacity ${transitionDuration}ms ease`
    : undefined;

  return (
    <div className={className} style={{ position: "relative", background: colors.background, ...style }}>
      <svg
        ref={svgRef}
        viewBox={IRAN_VIEWBOX}
        role="group"
        aria-label={locale === "fa" ? "نقشه استان‌های ایران" : "Map of Iran's provinces"}
        {...svgProps}
        style={{ display: "block", width: "100%", height: "auto", ...svgProps?.style }}
      >
        {PROVINCES.map((p) => {
          const state = stateOf(p.id);
          const custom = getProvinceStyle?.(p, state);
          const fill = state.disabled
            ? colors.disabledFill
            : state.selected
              ? state.hovered
                ? colors.selectedHoverFill
                : colors.selectedFill
              : state.hovered
                ? colors.hoverFill
                : colors.fill;
          const stroke = state.hovered ? colors.hoverStroke : state.selected ? colors.selectedStroke : colors.stroke;
          const strokeWidth = state.hovered ? colors.hoverStrokeWidth : colors.strokeWidth;

          return (
            <g
              key={p.id}
              id={`${uid}-${p.id}`}
              data-province={p.id}
              data-selected={state.selected || undefined}
              data-hovered={state.hovered || undefined}
              data-disabled={state.disabled || undefined}
              role={selectionMode === "none" ? (onProvinceClick ? "button" : undefined) : "checkbox"}
              aria-checked={selectionMode === "none" ? undefined : state.selected}
              aria-disabled={state.disabled || undefined}
              aria-label={locale === "fa" ? p.nameFa : p.nameEn}
              tabIndex={state.disabled ? -1 : 0}
              style={{
                fill: custom?.fill ?? fill,
                stroke: custom?.stroke ?? stroke,
                strokeWidth: custom?.strokeWidth ?? strokeWidth,
                opacity: custom?.opacity,
                cursor: custom?.cursor ?? (state.disabled ? "not-allowed" : interactive ? "pointer" : "default"),
                transition,
                outline: "none",
              }}
              onPointerEnter={(e: PointerEvent<SVGGElement>) => {
                lastPointerType.current = e.pointerType;
                cursorRef.current = { x: e.clientX, y: e.clientY };
                if (!state.disabled) changeHover(p.id);
              }}
              onPointerMove={(e: PointerEvent<SVGGElement>) => {
                if (!tooltipFollowCursor) return;
                cursorRef.current = { x: e.clientX, y: e.clientY };
                tooltipUpdateRef.current?.();
              }}
              onPointerLeave={(e: PointerEvent<SVGGElement>) => {
                if (e.pointerType !== "touch") clearHover(p.id);
              }}
              onFocus={(e) => {
                // Only keyboard focus opens the tooltip; focus caused by a click is ignored.
                if (!isFocusVisible(e.currentTarget) || state.disabled) return;
                lastPointerType.current = "keyboard";
                changeHover(p.id);
              }}
              onBlur={() => {
                if (lastPointerType.current === "keyboard") clearHover(p.id);
              }}
              onClick={(e) => activate(p, e)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" && e.key !== " ") return;
                activate(p, e);
                e.preventDefault();
              }}
            >
              {p.paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  vectorEffect="non-scaling-stroke"
                  ref={
                    i === 0
                      ? (el) => {
                          if (el) mainPathRefs.current.set(p.id, el);
                          else mainPathRefs.current.delete(p.id);
                        }
                      : undefined
                  }
                />
              ))}
            </g>
          );
        })}

        {/* Re-draw the hovered province on top so its border is not covered by neighbours. */}
        {hoveredId && <use href={`#${uid}-${hoveredId}`} pointerEvents="none" aria-hidden />}

        {showLabels && (
          <g aria-hidden style={{ pointerEvents: "none", userSelect: "none" }}>
            {PROVINCES.map((p) => {
              const state = stateOf(p.id);
              const custom = renderLabel
                ? renderLabel(p, state)
                : defaultLabelLines(locale === "fa" ? p.nameFa : p.nameEn, p.label.radius, labelFontSize);
              if (custom == null) return null;
              const lines = Array.isArray(custom) ? custom : [custom];
              if (lines.length === 0) return null;

              const pos = labelPositions?.[p.id] ?? p.label;
              const fontSize = labelAutoSize ? fitFontSize(lines, p.label.radius, labelFontSize) : labelFontSize;
              const fill = state.disabled
                ? colors.disabledLabel
                : state.selected
                  ? colors.selectedLabel
                  : state.hovered
                    ? colors.hoverLabel
                    : colors.label;
              const firstDy = (-(lines.length - 1) / 2) * LINE_HEIGHT;

              return (
                <text
                  key={p.id}
                  data-label={p.id}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  direction={locale === "fa" ? "rtl" : "ltr"}
                  style={{ fill, fontSize, fontFamily: "inherit", transition, ...labelStyle }}
                >
                  {lines.map((line, i) => (
                    <tspan key={i} x={pos.x} dy={`${i === 0 ? firstDy : LINE_HEIGHT}em`}>
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            })}
          </g>
        )}
      </svg>

      {tooltipContent != null && tooltipContent !== false && (
        <Tooltip
          getAnchor={getAnchor}
          updateRef={tooltipUpdateRef}
          anchorKey={hoveredId ?? ""}
          placement={tooltipPlacement}
          offset={tooltipOffset}
          padding={tooltipViewportPadding}
          autoFlip={tooltipAutoFlip}
          arrow={tooltipArrow}
          className={tooltipClassName}
          style={tooltipStyle}
          container={tooltipContainer}
        >
          {tooltipContent}
        </Tooltip>
      )}
    </div>
  );
}
