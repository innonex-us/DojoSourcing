"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { projects } from "./data";

gsap.registerPlugin(useGSAP, Flip, Draggable, InertiaPlugin);

type LabMode = "deck" | "grid";

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const [mode, setMode] = useState<LabMode>("deck");

  function switchMode(next: LabMode) {
    if (next === mode) return;
    flipStateRef.current = Flip.getState(".lab-card", {
      props: "borderRadius",
    });
    setMode(next);
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (flipStateRef.current) {
          Flip.from(flipStateRef.current, {
            duration: 0.72,
            ease: "power3.inOut",
            stagger: 0.04,
            absolute: true,
            scale: true,
            onComplete: () => {
              flipStateRef.current = null;
            },
          });
        }

        if (mode === "deck") {
          const track = sectionRef.current?.querySelector(".deck-track");
          const viewport = sectionRef.current?.querySelector(".deck-viewport");
          if (track && viewport) {
            Draggable.create(track, {
              type: "x",
              bounds: viewport,
              inertia: true,
              edgeResistance: 0.75,
              dragClickables: true,
              cursor: "grab",
              activeCursor: "grabbing",
            });
          }
        } else {
          gsap.set(".deck-track", { x: 0 });
        }
      });

      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [mode] },
  );

  return (
    <section
      id="work"
      ref={sectionRef}
      className="showcase-section relative overflow-hidden border-t border-border bg-background py-24 md:py-32"
      aria-label="Dojo Lab Projects"
    >
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        {/* Section Header + Flip Mode Toggle */}
        <div className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
              • The Dojo Lab
            </p>
            <h2 className="mt-3 text-3xl font-bold uppercase tracking-wide text-chrome md:text-5xl">
              Selected Builds
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {mode === "deck"
                ? "Grab & flick the deck horizontally with GSAP Draggable + Inertia, or morph into Studio Grid."
                : "Morphed via GSAP Flip. Switch back to Drag Deck anytime."}
            </p>
          </div>

          <div
            role="group"
            aria-label="Layout mode"
            className="inline-flex w-fit items-center rounded-full border border-border bg-surface-deep/80 p-1"
          >
            <button
              type="button"
              onClick={() => switchMode("deck")}
              data-cursor="magnet"
              className={`focus-ring rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                mode === "deck"
                  ? "bg-brand text-white"
                  : "text-muted hover:text-chrome"
              }`}
            >
              Drag Deck
            </button>
            <button
              type="button"
              onClick={() => switchMode("grid")}
              data-cursor="magnet"
              className={`focus-ring rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                mode === "grid"
                  ? "bg-brand text-white"
                  : "text-muted hover:text-chrome"
              }`}
            >
              Studio Grid
            </button>
          </div>
        </div>
      </div>

      {/* Deck / Grid Container */}
      <div
        className={`deck-viewport relative mx-auto max-w-[1400px] px-5 md:px-8 ${
          mode === "deck" ? "overflow-hidden" : ""
        }`}
      >
        <div
          className={`deck-track ${
            mode === "deck"
              ? "flex w-max gap-6 pb-4 select-none"
              : "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {projects.map((project, idx) => (
            <article
              key={project.title}
              data-flip-id={`lab-card-${idx}`}
              className={`lab-card group relative overflow-hidden border border-border bg-surface-deep ${
                mode === "deck"
                  ? "w-[78vw] shrink-0 sm:w-[420px] md:w-[440px]"
                  : "w-full"
              }`}
            >
              <a href="#contact" className="focus-ring block">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="(max-width: 768px) 80vw, 440px"
                    draggable={false}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand/85 via-brand/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="absolute top-4 left-4 bg-background/80 px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.2em] text-brand backdrop-blur-sm">
                    0{idx + 1}
                  </span>
                </div>
                <div className="flex items-baseline justify-between gap-4 p-5">
                  <h3 className="text-base font-bold uppercase tracking-wide text-chrome md:text-lg">
                    {project.title}
                  </h3>
                  <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                    {project.meta}
                  </span>
                </div>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
