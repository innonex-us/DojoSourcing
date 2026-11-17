"use client";

import { partnerTiles } from "./data";

export function Experience() {
  const rowOne = [...partnerTiles, ...partnerTiles];
  const rowTwo = [...partnerTiles.slice().reverse(), ...partnerTiles.slice().reverse()];

  return (
    <section
      id="experience"
      className="experience relative overflow-hidden border-y border-border py-20 md:py-28"
    >
      <div className="mx-auto max-w-[900px] px-5 text-center md:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
          • The Arena
        </p>
        <h2 className="mt-4 text-3xl font-semibold uppercase leading-tight tracking-wide text-chrome md:text-5xl">
          Global Experience
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
          From emerging streetwear labels to global retail collections, Dojo
          connects patternmakers, vetted garment mills, and ocean freight
          terminals into one accountable pipeline.
        </p>
      </div>

      {/* Velocity-Reactive Dual Counter-Scrolling Marquee */}
      <div className="marquee-wrapper relative mt-14 space-y-4 overflow-hidden">
        <div className="marquee-row-left flex w-max gap-4 px-2 will-change-transform">
          {rowOne.map((tile, idx) => (
            <div
              key={`r1-${tile.name}-${idx}`}
              className="flex h-32 w-36 shrink-0 items-center justify-center border border-border/50 text-xs font-extrabold uppercase tracking-[0.2em] transition-transform duration-300 hover:scale-[1.04] md:h-40 md:w-44 md:text-sm"
              style={{ backgroundColor: tile.bg, color: tile.fg }}
            >
              {tile.name}
            </div>
          ))}
        </div>

        <div className="marquee-row-right flex w-max gap-4 px-2 will-change-transform">
          {rowTwo.map((tile, idx) => (
            <div
              key={`r2-${tile.name}-${idx}`}
              className="flex h-32 w-36 shrink-0 items-center justify-center border border-border/50 text-xs font-extrabold uppercase tracking-[0.2em] transition-transform duration-300 hover:scale-[1.04] md:h-40 md:w-44 md:text-sm"
              style={{ backgroundColor: tile.bg, color: tile.fg }}
            >
              {tile.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
