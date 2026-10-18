# province-selection-package

An interactive map of Iran's provinces for React and Next.js.

- A tooltip opens when you hover a province. You choose the side: `top`, `bottom`, `left` or `right`.
- If the tooltip does not fit on its side (for example, it would cause horizontal scrolling), it opens on another side. It is then shifted so it stays inside the screen.
- Large tooltips are fine: any JSX can go inside.
- The background, fill, hover and selected colors are all configurable, and each province can have its own color.
- Every province has an `onClick`.
- Several provinces can be selected (`multiple`). The `single` and `none` modes are also available.
- Keyboard (Tab / Enter / Space) and touch are supported.
- Includes `"use client"`, so it can be used directly in Next.js App Router.

## Installation

```bash
npm install province-selection-package
```

Requires `react` and `react-dom` version 18 or later.

## Basic usage

```tsx
"use client";
import { useState } from "react";
import { IranMap, type ProvinceId } from "province-selection-package";

export default function Page() {
  const [selected, setSelected] = useState<ProvinceId[]>([]);

  return (
    <IranMap
      selected={selected}
      onSelectionChange={(ids) => setSelected(ids)}
      onProvinceClick={(province) => console.log(province.id, province.nameFa)}
      tooltipPlacement="right"
      colors={{
        background: "#f8fafc",
        fill: "#e2e8f0",
        hoverFill: "#fcd34d",
        selectedFill: "#16a34a",
      }}
    />
  );
}
```

## Province names on the map

```tsx
<IranMap showLabels />
```

- Each name is placed near the province's visual center, at the point farthest from its border.
- In small provinces the font shrinks automatically (`labelAutoSize`).
- Long names such as "Chaharmahal and Bakhtiari" or "West Azerbaijan" wrap onto two lines when needed.
- Label colors come from `colors.label`, `colors.hoverLabel`, `colors.selectedLabel` and `colors.disabledLabel`.

```tsx
<IranMap
  showLabels
  labelFontSize={18}
  labelStyle={{ fontFamily: "Vazirmatn", fontWeight: 600 }}
  colors={{ label: "#1e293b", selectedLabel: "#fff" }}
  // custom text: a string, an array of lines, or null (no label)
  renderLabel={(p) => (p.id === "tehran" ? ["تهران", "پایتخت"] : p.nameFa)}
  // move a label manually (in viewBox units)
  labelPositions={{ alborz: { x: 410, y: 292 } }}
/>
```

## Custom (large) tooltip

```tsx
<IranMap
  tooltipPlacement="left"
  renderTooltip={(province, state) => (
    <div dir="rtl" style={{ width: 300 }}>
      <strong>{province.nameFa}</strong>
      <p>Any content: a chart, a table, an image…</p>
      {state.selected && <span>✔ Selected</span>}
    </div>
  )}
  tooltipStyle={{ background: "#fff", color: "#111", border: "1px solid #ddd" }}
/>
```

Returning `null` from `renderTooltip` shows no tooltip for that province.

## Coloring each province (choropleth)

```tsx
const population: Partial<Record<ProvinceId, number>> = { tehran: 13, isfahan: 5.1 };

<IranMap
  selectionMode="none"
  getProvinceStyle={(p, state) =>
    state.hovered ? undefined : { fill: (population[p.id] ?? 0) > 5 ? "#1d4ed8" : "#93c5fd" }
  }
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `selectionMode` | `"multiple" \| "single" \| "none"` | `"multiple"` | Selection mode |
| `selected` | `ProvinceId[]` | – | Selection (controlled) |
| `defaultSelected` | `ProvinceId[]` | `[]` | Initial selection (uncontrolled) |
| `onSelectionChange` | `(ids, provinces) => void` | – | Called when the selection changes |
| `maxSelected` | `number` | – | Maximum number of selected provinces |
| `disabledProvinces` | `ProvinceId[]` | `[]` | Provinces that cannot be clicked or selected |
| `onProvinceClick` | `(province, event) => void` | – | Called on every click. `event.preventDefault()` stops the selection from toggling. |
| `onProvinceHover` | `(province \| null) => void` | – | Called when the hovered province changes |
| `showTooltip` | `boolean` | `true` | Turns tooltips on or off |
| `renderTooltip` | `(province, state) => ReactNode` | Province name | Tooltip content |
| `tooltipPlacement` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Preferred side |
| `tooltipAutoFlip` | `boolean` | `true` | Switch sides when the tooltip does not fit |
| `tooltipOffset` | `number` | `10` | Gap from the province (px) |
| `tooltipViewportPadding` | `number` | `8` | Minimum gap from the screen edge (px) |
| `tooltipFollowCursor` | `boolean` | `false` | Tooltip follows the mouse |
| `tooltipArrow` | `boolean` | `true` | Show the arrow |
| `tooltipClassName` / `tooltipStyle` | | | Tooltip styling |
| `tooltipContainer` | `HTMLElement` | `document.body` | Element the tooltip is portaled into |
| `showLabels` | `boolean` | `false` | Show province names on the map |
| `renderLabel` | `(province, state) => string \| string[] \| null` | Name (wrapped when needed) | Label text |
| `labelFontSize` | `number` | `16` | Largest font size, in viewBox units (map width = 1158) |
| `labelAutoSize` | `boolean` | `true` | Shrink the font in small provinces |
| `labelStyle` | `CSSProperties` | – | Label style (font, weight, …) |
| `labelPositions` | `Partial<Record<ProvinceId, {x, y}>>` | – | Change a label's position |
| `colors` | `Partial<ProvinceColors>` | See below | Colors |
| `getProvinceStyle` | `(province, state) => ProvinceStyle` | – | Style for an individual province |
| `transitionDuration` | `number` | `150` | Color transition duration (ms) |
| `locale` | `"fa" \| "en"` | `"fa"` | Language of the names in the default tooltip and aria-labels |
| `className` / `style` / `svgProps` | | | Container and SVG styling |

### `colors`

```ts
{
  background: "transparent",   // map background
  fill: "#e2e8f0",             // normal province
  hoverFill: "#93c5fd",        // hover
  selectedFill: "#2563eb",     // selected
  selectedHoverFill: "#1d4ed8",// hovering a selected province
  disabledFill: "#f1f5f9",
  stroke: "#ffffff",
  hoverStroke: "#1e3a8a",
  selectedStroke: "#ffffff",
  strokeWidth: 1,
  hoverStrokeWidth: 1.5,
  label: "#334155",            // label text color
  hoverLabel: "#0f172a",
  selectedLabel: "#ffffff",
  disabledLabel: "#94a3b8",
}
```

Each province is rendered as a `<g data-province="tehran">`, and `data-selected`, `data-hovered` and `data-disabled` are set on it, so you can also style it with CSS.

## Other exports

- `PROVINCES`: a list of all 31 provinces (`id`, `nameFa`, `nameEn`, `paths`, `label`)
- `PROVINCE_IDS`, `getProvince(id)`
- `computeTooltipPosition(anchorRect, tipSize, options)`: the positioning logic, for building your own tooltip

### Province ids

`alborz`, `ardabil`, `azerbaijan-east`, `azerbaijan-west`, `bushehr`, `chahar-mahaal-bakhtiari`, `fars`, `gilan`, `golestan`, `hamedan`, `hormozgan`, `ilam`, `isfahan`, `kerman`, `kermanshah`, `khorasan-north`, `khorasan-razavi`, `khorasan-south`, `khuzestan`, `kohgiluyeh-boyer-ahmad`, `kurdistan`, `lorestan`, `markazi`, `mazandaran`, `qazvin`, `qom`, `semnan`, `sistan-baluchestan`, `tehran`, `yazd`, `zanjan`

The Persian Gulf islands are part of Hormozgan, and Kharg is part of Bushehr.

## How the tooltip direction is chosen

1. The tooltip is rendered with `position: fixed` in a portal, so it never makes the page wider.
2. Its size is measured, and the preferred side is tried first.
3. If it does not fit, the opposite side is tried, then the two perpendicular sides.
4. If no side fits completely, the side with the least overflow is used, and the tooltip is shifted inside the screen.
5. It is recalculated on scroll, on resize, and whenever the tooltip content changes size (ResizeObserver).

Note: the tooltip has `pointer-events: none`, so links and buttons inside it cannot be clicked.

## Development

```bash
npm run build      # dist/ (ESM + CJS + d.ts)
node example/serve.mjs   # demo at http://localhost:5178
```
