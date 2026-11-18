"use client";

import { ClipboardList, Layers, Presentation, Ruler, ScanLine, type LucideIcon } from "lucide-react";
import {
  BOM_ROWS,
  COLORWAYS,
  DESIGN_SERVICES,
  POM_ROWS,
  SAMPLING_STATS,
  TECHPACK_SPECS,
  type DesignMode,
} from "./designStudioData";

const SERVICE_ICONS: Record<DesignMode, LucideIcon> = {
  techpack: ClipboardList,
  bom: Layers,
  sampling: ScanLine,
  development: Ruler,
  presentation: Presentation,
};

export const STUDIO_AUTOPLAY_MS = 7000;

/**
 * Stage 01 left-hand panel: the five product-design services as tabs, each with its
 * own data view (spec sheet, BOM, sampling stats, points of measure, colourways).
 */
export function DesignStudioPanel({
  mode,
  autoplay,
  onSelectMode,
  hoveredBom,
  onHoverBom,
  selectedColor,
  onSelectColor,
}: {
  mode: DesignMode;
  autoplay: boolean;
  onSelectMode: (mode: DesignMode) => void;
  hoveredBom: number | null;
  onHoverBom: (no: number | null) => void;
  selectedColor: number;
  onSelectColor: (idx: number) => void;
}) {
  const service = DESIGN_SERVICES.find((s) => s.mode === mode) ?? DESIGN_SERVICES[0];

  return (
    <div className="pointer-events-auto mt-3 sm:mt-5">
      <div
        role="tablist"
        aria-label="Design and innovation services"
        className="-mx-1 flex snap-x gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {DESIGN_SERVICES.map((s) => {
          const Icon = SERVICE_ICONS[s.mode];
          const on = s.mode === mode;
          return (
            <button
              key={s.mode}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onSelectMode(s.mode)}
              data-cursor="magnet"
              className={`focus-ring relative flex min-w-[78px] shrink-0 snap-start flex-col items-center gap-1 overflow-hidden rounded-lg border px-1 pb-2 pt-2 text-[9px] sm:min-w-0 font-bold uppercase tracking-[0.12em] transition-colors ${
                on
                  ? "border-brand bg-brand/15 text-chrome"
                  : "border-border bg-surface-deep/75 text-muted hover:border-chrome/40 hover:text-chrome"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              <span className="leading-tight">{s.label}</span>
              {on ? (
                <span
                  key={`${s.mode}-${autoplay}`}
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-brand"
                  style={
                    autoplay
                      ? { animation: `studio-progress ${STUDIO_AUTOPLAY_MS}ms linear forwards` }
                      : undefined
                  }
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" className="mt-3 max-h-[22svh] overflow-y-auto sm:mt-4 sm:h-[212px] sm:max-h-none sm:overflow-visible">
        <p className="text-[13px] leading-relaxed text-foreground/85 sm:text-sm">{service.blurb}</p>

        {mode === "techpack" ? (
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border pt-3">
            {TECHPACK_SPECS.map(([k, v]) => (
              <div key={k}>
                <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted">{k}</dt>
                <dd className="text-xs font-semibold text-chrome">{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {mode === "bom" ? (
          <table className="mt-2.5 w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                <th className="py-1 pr-2 font-bold">No.</th>
                <th className="py-1 pr-2 font-bold">Component</th>
                <th className="hidden py-1 pr-2 font-bold sm:table-cell">Material / Spec</th>
                <th className="py-1 pr-2 font-bold">Color</th>
                <th className="py-1 text-right font-bold">Qty</th>
              </tr>
            </thead>
            <tbody onMouseLeave={() => onHoverBom(null)}>
              {BOM_ROWS.map((row) => (
                <tr
                  key={row.no}
                  tabIndex={0}
                  onMouseEnter={() => onHoverBom(row.no)}
                  onFocus={() => onHoverBom(row.no)}
                  onBlur={() => onHoverBom(null)}
                  className={`cursor-default border-t border-border/70 outline-none transition-colors ${
                    hoveredBom === row.no ? "bg-brand/15 text-chrome" : "text-foreground/85"
                  }`}
                >
                  <td className="py-1 pr-2 font-mono text-brand">{row.no}</td>
                  <td className="py-1 pr-2 font-semibold">{row.component}</td>
                  <td className="hidden py-1 pr-2 sm:table-cell">{row.spec}</td>
                  <td className="py-1 pr-2">
                    <span
                      className="inline-block h-2.5 w-6 rounded-sm border border-white/20 align-middle"
                      style={{ backgroundColor: row.no === 1 ? COLORWAYS[selectedColor].hex : row.color }}
                    />
                  </td>
                  <td className="py-1 text-right font-mono">{row.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {mode === "sampling" ? (
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3">
            {SAMPLING_STATS.map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-surface-deep/70 px-2.5 py-2">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted">{k}</p>
                <p className="mt-0.5 text-sm font-bold text-chrome">{v}</p>
              </div>
            ))}
          </div>
        ) : null}

        {mode === "development" ? (
          <table className="mt-2.5 w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                <th className="py-1 pr-2 font-bold">Point of Measure</th>
                <th className="py-1 pr-2 text-right font-bold">Spec (cm)</th>
                <th className="py-1 text-right font-bold">Tol</th>
              </tr>
            </thead>
            <tbody>
              {POM_ROWS.map((row) => (
                <tr key={row.point} className="border-t border-border/70 text-foreground/85">
                  <td className="py-1 pr-2 font-semibold">
                    {row.anchor ? <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-brand align-middle" /> : null}
                    {row.point}
                  </td>
                  <td className="py-1 pr-2 text-right font-mono text-chrome">{row.spec}</td>
                  <td className="py-1 text-right font-mono">{row.tol}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {mode === "presentation" ? (
          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
              Live 3D Colorway · {COLORWAYS[selectedColor].spec}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {COLORWAYS.map((c, ci) => {
                const on = ci === selectedColor;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => onSelectColor(ci)}
                    data-cursor="magnet"
                    className={`focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                      on
                        ? "border-brand bg-brand/15 text-chrome"
                        : "border-border bg-surface-deep/75 text-muted hover:border-chrome/40 hover:text-chrome"
                    }`}
                  >
                    <span aria-hidden className="h-3 w-3 rounded-full border border-white/25" style={{ backgroundColor: c.hex }} />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
