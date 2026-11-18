"use client";

import { ClipboardList, Palette, Presentation, Ruler, ScanLine, type LucideIcon } from "lucide-react";
import { DESIGN_SERVICES, type DesignMode } from "./designStudioData";

const SERVICE_ICONS: Record<DesignMode, LucideIcon> = {
  techpack: ClipboardList,
  bom: Palette,
  sampling: ScanLine,
  development: Ruler,
  presentation: Presentation,
};

export const STUDIO_AUTOPLAY_MS = 7000;

const MODE_DESCRIPTIONS: Partial<Record<DesignMode, string>> = {
  techpack:
    "DOJO develops garment concepts from your brief, defining silhouettes, colorways, and functional details. We create CAD flats showing the front, back, and interior of each garment, along with detailed construction drawings for pockets, seams, closures, and other key features. Once the design is approved, we prepare a production-ready tech pack that includes measurement specifications, tolerances, a bill of materials (BOM), and construction instructions to guide factory costing, sampling, fit reviews, and bulk production.",
  bom: "Develop placement prints, all-over repeat patterns, and garment graphics, along with branding artwork for labels, trims, and embellishments.",
  sampling:
    "DOJO turns your CAD flats and garment specifications into realistic 3D samples that show silhouette, proportions, fabric drape, and construction details. View the garment from the front, back, and side, and compare colorways, fabric textures, print placements, and trims on the same design. We create presentation-ready renders for collection reviews, buyer meetings, and factory communication, helping you refine design details before physical sampling.",
  development:
    "DOJO takes your apparel design from concept to an approved pre-production sample. We source fabrics and trims to meet your performance, cost, and lead-time requirements, then work with factories to develop prototypes and fit samples. At each sample round, we review fit, measurements, garment construction, and workmanship, document corrections, and update the tech pack and bill of materials (BOM). The approved sample and final specifications give the factory a clear reference for bulk production.",
  presentation:
    "DOJO creates line sheets, colorway boards, and buyer-ready decks that make it easy to review your collection and compare styles. We combine garment visuals with style numbers, fabric details, available colorways, and key design features. From a single product to a full seasonal range, we tailor each presentation to your brand and the needs of buyer meetings, range reviews, or sales appointments.",
};

/**
 * Stage 01 left-hand panel: the five design services as tabs.
 * Active modes with copy show a description beneath the tabs.
 */
export function DesignStudioPanel({
  mode,
  autoplay,
  onSelectMode,
}: {
  mode: DesignMode;
  autoplay: boolean;
  onSelectMode: (mode: DesignMode) => void;
}) {
  const description = MODE_DESCRIPTIONS[mode];

  return (
    <div className="pointer-events-auto mt-3 sm:mt-5">
      <div
        role="tablist"
        aria-label="Design and innovation services"
        className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
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
              className={`focus-ring group relative flex min-w-[128px] shrink-0 snap-start flex-col items-center gap-1.5 overflow-hidden rounded-xl border px-3 pb-2.5 pt-2.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-[color,background-color,border-color,box-shadow,transform] duration-200 sm:min-w-[118px] sm:flex-1 ${
                on
                  ? "border-brand/80 bg-brand text-white shadow-[0_10px_24px_rgba(220,38,38,0.28)]"
                  : "border-border/90 bg-surface-deep/70 text-muted backdrop-blur-sm hover:-translate-y-0.5 hover:border-chrome/35 hover:bg-surface-deep hover:text-chrome"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-200 ${
                  on
                    ? "border-white/35 bg-white/15 text-white"
                    : "border-border bg-background/50 text-muted group-hover:border-chrome/30 group-hover:text-chrome"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="whitespace-nowrap leading-tight">{s.label}</span>
              {on && autoplay ? (
                <span
                  key={`${s.mode}-timer`}
                  aria-hidden
                  className="studio-progress-bar pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-white"
                  style={{ animationDuration: `${STUDIO_AUTOPLAY_MS}ms` }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:mt-4 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
