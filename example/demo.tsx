import { useState } from "react";
import { createRoot } from "react-dom/client";
import { IranMap, type ProvinceId, type SelectionMode, type TooltipPlacement } from "../src";

function Demo() {
  const [selected, setSelected] = useState<ProvinceId[]>(["tehran", "isfahan"]);
  const [placement, setPlacement] = useState<TooltipPlacement>("right");
  const [mode, setMode] = useState<SelectionMode>("multiple");
  const [follow, setFollow] = useState(false);
  const [big, setBig] = useState(true);
  const [labels, setLabels] = useState(true);
  const [fill, setFill] = useState("#e2e8f0");
  const [hoverFill, setHoverFill] = useState("#fcd34d");
  const [selectedFill, setSelectedFill] = useState("#16a34a");
  const [background, setBackground] = useState("#f8fafc");
  const [log, setLog] = useState<string[]>([]);

  return (
    <div style={{ fontFamily: "Vazirmatn, Tahoma, sans-serif", padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20 }}>Iran province map demo</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <label>
          placement{" "}
          <select value={placement} onChange={(e) => setPlacement(e.target.value as TooltipPlacement)}>
            {["top", "bottom", "left", "right"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          mode{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value as SelectionMode)}>
            {["multiple", "single", "none"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} /> follow cursor
        </label>
        <label>
          <input type="checkbox" checked={big} onChange={(e) => setBig(e.target.checked)} /> big tooltip
        </label>
        <label>
          <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} /> labels
        </label>
        <label>fill <input type="color" value={fill} onChange={(e) => setFill(e.target.value)} /></label>
        <label>hover <input type="color" value={hoverFill} onChange={(e) => setHoverFill(e.target.value)} /></label>
        <label>selected <input type="color" value={selectedFill} onChange={(e) => setSelectedFill(e.target.value)} /></label>
        <label>bg <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} /></label>
        <button onClick={() => setSelected([])}>clear</button>
      </div>

      <IranMap
        selectionMode={mode}
        selected={selected}
        onSelectionChange={(ids) => setSelected(ids)}
        onProvinceClick={(p) => setLog((l) => [`click: ${p.nameFa}`, ...l].slice(0, 5))}
        disabledProvinces={["qom"]}
        tooltipPlacement={placement}
        tooltipFollowCursor={follow}
        showLabels={labels}
        colors={{ fill, hoverFill, selectedFill, selectedHoverFill: selectedFill, background }}
        style={{ borderRadius: 12, padding: 8 }}
        renderTooltip={(p, s) =>
          big ? (
            <div dir="rtl" style={{ width: 280 }}>
              <strong style={{ fontSize: 15 }}>{p.nameFa}</strong>
              <div style={{ opacity: 0.7 }}>{p.nameEn}</div>
              <p style={{ margin: "6px 0 0" }}>
                یک تولتیپ بزرگ برای تست چرخش جهت. وقتی جا نباشد، سمت دیگر باز می‌شود.
              </p>
              <div style={{ marginTop: 6 }}>{s.selected ? "✔ انتخاب شده" : "برای انتخاب کلیک کنید"}</div>
            </div>
          ) : (
            p.nameFa
          )
        }
      />

      <p data-testid="selected">selected: {selected.join(", ") || "—"}</p>
      <p data-testid="log">{log.join(" | ")}</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Demo />);
