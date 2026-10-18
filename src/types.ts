import type { CSSProperties, ReactNode, SVGProps } from "react";

export type ProvinceId =
  | "alborz"
  | "ardabil"
  | "azerbaijan-east"
  | "azerbaijan-west"
  | "bushehr"
  | "chahar-mahaal-bakhtiari"
  | "fars"
  | "gilan"
  | "golestan"
  | "hamedan"
  | "hormozgan"
  | "ilam"
  | "isfahan"
  | "kerman"
  | "kermanshah"
  | "khorasan-north"
  | "khorasan-razavi"
  | "khorasan-south"
  | "khuzestan"
  | "kohgiluyeh-boyer-ahmad"
  | "kurdistan"
  | "lorestan"
  | "markazi"
  | "mazandaran"
  | "qazvin"
  | "qom"
  | "semnan"
  | "sistan-baluchestan"
  | "tehran"
  | "yazd"
  | "zanjan";

/** Raw shape entry used by the data files. */
export interface ProvinceShape {
  id: ProvinceId;
  d: string;
}

export interface Province {
  id: ProvinceId;
  /** Persian name, e.g. "تهران" */
  nameFa: string;
  /** English name, e.g. "Tehran" */
  nameEn: string;
  /** SVG path data. Index 0 is the mainland; the rest are islands. */
  paths: string[];
  /** Where the name label goes (viewBox units). `radius` is the free space around that point. */
  label: { x: number; y: number; radius: number };
}

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface ProvinceState {
  hovered: boolean;
  selected: boolean;
  disabled: boolean;
}

export interface ProvinceColors {
  /** Background of the map container. */
  background: string;
  fill: string;
  hoverFill: string;
  selectedFill: string;
  selectedHoverFill: string;
  disabledFill: string;
  stroke: string;
  hoverStroke: string;
  selectedStroke: string;
  strokeWidth: number;
  hoverStrokeWidth: number;
  /** Name label colors (used when `showLabels` is on). */
  label: string;
  hoverLabel: string;
  selectedLabel: string;
  disabledLabel: string;
}

export interface ProvinceStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  cursor?: CSSProperties["cursor"];
}

export type SelectionMode = "none" | "single" | "multiple";

export interface IranMapProps {
  /* ---------- selection ---------- */
  /** "multiple" (default), "single" or "none". */
  selectionMode?: SelectionMode;
  /** Controlled list of selected province ids. */
  selected?: ProvinceId[];
  /** Initial selection when uncontrolled. */
  defaultSelected?: ProvinceId[];
  /** Fires whenever the selection changes. */
  onSelectionChange?: (ids: ProvinceId[], provinces: Province[]) => void;
  /** Upper limit of selected provinces in "multiple" mode. */
  maxSelected?: number;
  /** Provinces that cannot be hovered, clicked or selected. */
  disabledProvinces?: ProvinceId[];

  /* ---------- events ---------- */
  /**
   * Fires on every click (also in selectionMode "none").
   * Call `event.preventDefault()` to stop the click from toggling selection.
   */
  onProvinceClick?: (province: Province, event: React.MouseEvent<SVGGElement> | React.KeyboardEvent<SVGGElement>) => void;
  /** Fires when the hovered province changes (null on leave). */
  onProvinceHover?: (province: Province | null) => void;

  /* ---------- tooltip ---------- */
  /** Set to false to disable tooltips. Default true. */
  showTooltip?: boolean;
  /** Custom tooltip content. Return null to hide the tooltip for a province. */
  renderTooltip?: (province: Province, state: ProvinceState) => ReactNode;
  /** Preferred side. Default "top". */
  tooltipPlacement?: TooltipPlacement;
  /** Flip to another side when the preferred one does not fit the viewport. Default true. */
  tooltipAutoFlip?: boolean;
  /** Distance between province and tooltip in px. Default 10. */
  tooltipOffset?: number;
  /** Minimum gap between tooltip and viewport edge in px. Default 8. */
  tooltipViewportPadding?: number;
  /** Follow the mouse instead of anchoring to the province's bounding box. Default false. */
  tooltipFollowCursor?: boolean;
  /** Show the small arrow. Default true. */
  tooltipArrow?: boolean;
  tooltipClassName?: string;
  tooltipStyle?: CSSProperties;
  /** Element the tooltip is portaled into. Default document.body. */
  tooltipContainer?: HTMLElement | null;

  /* ---------- labels ---------- */
  /** Draw each province's name on the map. Default false. */
  showLabels?: boolean;
  /**
   * Custom label text. Return a string, an array of strings (one per line), or null for no label.
   * Default: the name in `locale`; Persian names containing " و " are split over two lines.
   */
  renderLabel?: (province: Province, state: ProvinceState) => string | string[] | null;
  /** Largest label font size in viewBox units (the map is 1158 units wide). Default 16. */
  labelFontSize?: number;
  /** Shrink labels in small provinces so they fit. Default true. */
  labelAutoSize?: boolean;
  /** Style for the <text> elements, e.g. fontFamily or fontWeight. */
  labelStyle?: CSSProperties;
  /** Move individual labels, in viewBox units. */
  labelPositions?: Partial<Record<ProvinceId, { x: number; y: number }>>;

  /* ---------- colors / styling ---------- */
  colors?: Partial<ProvinceColors>;
  /** Per-province style override, e.g. for choropleth maps. */
  getProvinceStyle?: (province: Province, state: ProvinceState) => ProvinceStyle | undefined;
  /** Hover / color transition in ms. Default 150. */
  transitionDuration?: number;

  /* ---------- layout ---------- */
  /** Label language used for aria-labels and the default tooltip. Default "fa". */
  locale?: "fa" | "en";
  className?: string;
  style?: CSSProperties;
  /** Extra props for the <svg> element. */
  svgProps?: Omit<SVGProps<SVGSVGElement>, "ref" | "viewBox">;
}
