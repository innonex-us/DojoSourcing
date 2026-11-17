"use client";

import { partnerTiles } from "./data";

export function Experience() {
  const repeatedTiles = [...partnerTiles, ...partnerTiles];

  return (
    <section
      id="experience"
      className="experience relative overflow-hidden border-y border-border py-20 md:py-28"
    >
      <div className="mx-auto max-w-[900px] px-5 text-center md:px-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
          • Global Experience
        </p>
        <h2 className="mt-4 text-3xl font-semibold uppercase leading-tight tracking-wide text-chrome md:text-5xl">
          Global Experience
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
          From early-stage launches to platform redesigns, Dojo partners with
          founders, design leads, and engineering orgs who want a studio that
          can move from thesis to shipping surface without losing craft.
        </p>
      </div>

      {/* Continuous GSAP Marquee */}
      <div className="marquee-wrapper relative mt-14 w-full overflow-hidden">
        <div className="marquee-track flex w-max gap-4 px-2">
          {repeatedTiles.map((tile, idx) => (
            <div
              key={`${tile.name}-${idx}`}
              className="flex h-36 w-36 shrink-0 items-center justify-center border border-border/50 text-sm font-extrabold uppercase tracking-[0.2em] transition-transform duration-300 hover:scale-[1.03] md:h-44 md:w-44 md:text-base"
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
