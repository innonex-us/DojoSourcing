"use client";

import Link from "next/link";
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

const BUILD_SPECS = [
  { moq: "150 pcs", gsm: "420 GSM", qc: "AQL 2.5", freight: "Air / FCL" },
  { moq: "100 pcs", gsm: "3D Fit", qc: "Virtual + Gold", freight: "Global Express" },
  { moq: "300 pcs", gsm: "380 GSM", qc: "Inline + Final", freight: "Port Drayage" },
  { moq: "200 pcs", gsm: "Export Kraft", qc: "Barcode + Seal", freight: "Euro Pallet" },
  { moq: "1–40HC", gsm: "GPS Sealed", qc: "Gate Verified", freight: "Factory → Port" },
  { moq: "FCL / LCL", gsm: "40ft High Cube", qc: "Customs Cleared", freight: "Ocean Vessel" },
] as const;

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const flipStateRef = useRef<Flip.FlipState | null>(null);
  const [mode, setMode] = useState<LabMode>("deck");
  const [activeBuild, setActiveBuild] = useState<number | null>(null);

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

  useGSAP(
    () => {
      if (activeBuild === null) return;
      gsap.from(".spec-modal-card", {
        autoAlpha: 0,
        y: 24,
        scale: 0.96,
        duration: 0.35,
        ease: "power3.out",
      });
    },
    { scope: sectionRef, dependencies: [activeBuild] },
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
              • The Sample Room
            </p>
            <h2 className="mt-3 text-3xl font-bold uppercase tracking-wide text-chrome md:text-5xl">
              Selected Builds
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {mode === "deck"
                ? "Drag horizontally to browse production builds, or click any card to inspect specifications."
                : "Compare all apparel, factory, and logistics builds at a glance. Click any card for specifications."}
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
              <button
                type="button"
                onClick={() => setActiveBuild(idx)}
                className="focus-ring block w-full text-left"
              >
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
              </button>
            </article>
          ))}
        </div>
      </div>

      {/* Spec Inspection Modal */}
      {activeBuild !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={projects[activeBuild].title}
          onClick={() => setActiveBuild(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-5 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="spec-modal-card w-full max-w-xl border border-border bg-surface-deep p-7 md:p-9"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-brand">
                  BUILD SPEC 0{activeBuild + 1} · {projects[activeBuild].meta}
                </p>
                <h3 className="mt-2 text-2xl font-extrabold uppercase tracking-wide text-chrome md:text-3xl">
                  {projects[activeBuild].title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveBuild(null)}
                aria-label="Close spec modal"
                className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-border text-sm text-muted hover:border-brand hover:text-brand"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-5 font-mono text-xs">
              <div>
                <p className="text-[10px] uppercase text-muted">MOQ</p>
                <p className="mt-1 font-bold text-chrome">
                  {BUILD_SPECS[activeBuild].moq}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted">Material / Spec</p>
                <p className="mt-1 font-bold text-chrome">
                  {BUILD_SPECS[activeBuild].gsm}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted">Quality Standard</p>
                <p className="mt-1 font-bold text-chrome">
                  {BUILD_SPECS[activeBuild].qc}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted">Logistics</p>
                <p className="mt-1 font-bold text-chrome">
                  {BUILD_SPECS[activeBuild].freight}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#estimator"
                onClick={() => setActiveBuild(null)}
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
              >
                <span>Estimate Run</span>
                <span aria-hidden>↗</span>
              </Link>
              <a
                href="#contact"
                onClick={() => setActiveBuild(null)}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-chrome hover:border-brand hover:text-brand"
              >
                <span>Request Sample</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
