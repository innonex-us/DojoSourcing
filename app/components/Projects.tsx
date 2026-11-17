"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { heroCards } from "./data";

const STAGE_WORDS = ["PRACTICE", "BUILD", "SHIP"] as const;

export function Projects() {
  return (
    <section
      id="work"
      className="showcase-section relative overflow-hidden bg-background"
      aria-label="Design Lab Showcase"
    >
      {/* Desktop: Pinned Radial Collage Stage | Mobile: Clean editorial grid */}
      <div className="showcase-stage relative hidden h-svh min-h-[680px] w-full items-center justify-center overflow-hidden md:flex">
        {/* Subtle radial vignette */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,var(--background)_88%)]"
        />

        {/* Central Cycling Display Words */}
        <div className="relative z-10 flex flex-col items-center text-center pointer-events-none select-none">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-brand">
            • Design Lab Archive
          </p>
          <div className="relative h-[1.05em] w-[90vw] max-w-[1100px] text-7xl font-bold uppercase leading-none tracking-[0.04em] text-chrome lg:text-[8rem]">
            {STAGE_WORDS.map((word, idx) => (
              <span
                key={word}
                className="stage-word absolute inset-x-0 top-0 block"
                style={{ opacity: idx === 0 ? 1 : 0 }}
              >
                {word}
              </span>
            ))}
          </div>
          <p className="mt-5 max-w-md text-xs font-medium uppercase tracking-[0.22em] text-muted">
            Scroll to explore systems, launches &amp; visual craft
          </p>
        </div>

        {/* Radial Collage Cards */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {heroCards.map((card, i) => {
            const style = {
              left: card.x,
              top: card.y,
              width: card.w,
              zIndex: card.z,
            } as CSSProperties;

            if (card.kind === "photo") {
              return (
                <a
                  key={`stage-photo-${i}`}
                  href="#contact"
                  className="showcase-card group pointer-events-auto absolute aspect-[3/4] origin-center overflow-hidden bg-surface-deep shadow-[0_24px_50px_rgba(0,0,0,0.55)]"
                  style={style}
                  data-rotate={card.rotate}
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="220px"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/90 via-brand/25 to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
                  <span className="absolute inset-x-3 bottom-3 translate-y-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {card.alt}
                  </span>
                </a>
              );
            }

            return (
              <a
                key={`stage-graphic-${i}`}
                href="#contact"
                className="showcase-card group pointer-events-auto absolute aspect-[3/4] origin-center overflow-hidden bg-brand p-4 text-white shadow-[0_24px_50px_rgba(254,65,1,0.3)]"
                style={style}
                data-rotate={card.rotate}
              >
                <div className="flex h-full w-full flex-col justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/80">
                    {card.sub ?? "DOJO"}
                  </span>
                  <span className="text-xl font-extrabold uppercase leading-none tracking-wide lg:text-2xl">
                    {card.label}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </a>
            );
          })}
        </div>
      </div>

      {/* Mobile Fallback Grid */}
      <div className="px-5 py-20 md:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
          • Design Lab Archive
        </p>
        <h2 className="mt-3 text-4xl font-bold uppercase tracking-wide text-chrome">
          Practice · Build · Ship
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4">
          {heroCards
            .filter((c) => c.kind === "photo")
            .slice(0, 6)
            .map((card, i) =>
              card.kind === "photo" ? (
                <a
                  key={`mob-${i}`}
                  href="#contact"
                  className="group relative aspect-[3/4] overflow-hidden bg-surface-deep"
                >
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/85 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </a>
              ) : null,
            )}
        </div>
      </div>
    </section>
  );
}
