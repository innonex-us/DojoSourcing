"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import {
  Factory,
  PackageCheck,
  PenTool,
  Plus,
  Ship,
  Truck,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { expertise, expertiseMedia } from "./data";

gsap.registerPlugin(useGSAP, Flip, ScrollToPlugin);

const EXPERTISE_ICONS = [PenTool, Factory, PackageCheck, Truck, Ship] as const;

export function Expertise() {
  const sectionRef = useRef<HTMLElement>(null);
  const tabFlipRef = useRef<Flip.FlipState | null>(null);
  const [active, setActive] = useState(0);

  function handleTabClick(index: number, id: string) {
    if (index !== active) {
      tabFlipRef.current = Flip.getState(".expertise-tab-indicator");
      setActive(index);
    }
    const el = document.getElementById(`expertise-${id}`);
    if (el) {
      gsap.to(window, {
        scrollTo: { y: el, offsetY: 110 },
        duration: 0.85,
        ease: "power3.inOut",
      });
    }
  }

  useGSAP(
    () => {
      if (tabFlipRef.current) {
        Flip.from(tabFlipRef.current, {
          duration: 0.4,
          ease: "power3.out",
          onComplete: () => {
            tabFlipRef.current = null;
          },
        });
      }
    },
    { scope: sectionRef, dependencies: [active] },
  );

  return (
    <section
      id="expertise"
      ref={sectionRef}
      className="expertise grid-bg relative px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
              • The Craft
            </p>
            <h2 className="mt-3 text-3xl font-semibold uppercase tracking-wide text-chrome md:text-5xl">
              Areas of Expertise
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Five integrated stages taking your clothing brand from tech pack to
            warehouse arrival.
          </p>
        </div>

        {/* Flip-Animated Horizontal Navigation Bar */}
        <nav
          aria-label="Areas of expertise"
          className="mt-12 flex gap-6 overflow-x-auto border-b border-border pb-0"
        >
          {expertise.map((item, i) => {
            const isActive = i === active;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? "step" : undefined}
                onClick={() => handleTabClick(i, item.id)}
                data-cursor="magnet"
                className={`focus-ring relative shrink-0 pb-4 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                  isActive ? "text-chrome" : "text-muted hover:text-chrome"
                }`}
              >
                <span className="mr-2 font-mono text-brand">0{i + 1}</span>
                {item.label}
                {isActive ? (
                  <span
                    data-flip-id="expertise-tab-indicator"
                    aria-hidden
                    className="expertise-tab-indicator absolute inset-x-0 bottom-0 h-[2px] bg-brand"
                  />
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Alternating 2-Column Asymmetric Split Blocks */}
        <div className="mt-16 space-y-24 md:space-y-32">
          {expertise.map((item, i) => {
            const reversed = i % 2 === 1;
            const mediaSrc = expertiseMedia[i] ?? "/images/project-atelier.jpg";
            return (
              <article
                key={item.id}
                id={`expertise-${item.id}`}
                data-expertise-index={i}
                className="expertise-row grid items-center gap-10 md:grid-cols-12 md:gap-14"
              >
                <div
                  className={`md:col-span-6 ${
                    reversed ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <div className="group relative aspect-[4/3] overflow-hidden border border-border bg-surface-deep">
                    <Image
                      src={mediaSrc}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 bg-background/80 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand backdrop-blur-sm">
                      0{i + 1} · {item.label}
                    </span>
                  </div>
                </div>

                <div
                  className={`md:col-span-6 ${
                    reversed ? "md:order-1" : "md:order-2"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 font-mono text-sm font-bold tracking-[0.22em] text-brand">
                    {(() => {
                      const CapIcon = EXPERTISE_ICONS[i] ?? PenTool;
                      return <CapIcon className="h-4 w-4" aria-hidden />;
                    })()}
                    <span>0{i + 1}</span>
                  </span>
                  <h3 className="expertise-title mt-3 text-3xl font-bold uppercase leading-[1.05] tracking-wide text-chrome md:text-5xl lg:text-[3.75rem]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.22em] text-brand">
                    {item.bullet}
                  </p>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-foreground/80">
                    {item.body}
                  </p>
                  <a
                    href="#contact"
                    data-cursor="magnet"
                    className="focus-ring group mt-8 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-chrome transition-colors hover:text-brand"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                      <Plus className="h-4 w-4" aria-hidden />
                    </span>
                    <span>Details</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
