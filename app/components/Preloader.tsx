"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

gsap.registerPlugin(useGSAP, DrawSVGPlugin, ScrambleTextPlugin);

/**
 * GSAP-choreographed Dojo Design & Sourcing loading screen with DrawSVG orbital rings and percentage counter.
 */
export function Preloader() {
  const curtainRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(true);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motion } = ctx.conditions!;
          if (!motion) {
            setVisible(false);
            return;
          }

          const counter = { val: 0 };
          const tl = gsap.timeline({
            onComplete: () => setVisible(false),
          });

          tl.fromTo(
            ".preloader-ring-red",
            { drawSVG: "0%" },
            { drawSVG: "100%", duration: 0.75, ease: "power2.inOut" },
            0,
          )
            .fromTo(
              ".preloader-ring-blue",
              { drawSVG: "0%" },
              { drawSVG: "100%", duration: 0.75, ease: "power2.inOut" },
              0.12,
            )
            .to(
              ".preloader-title",
              {
                duration: 0.7,
                scrambleText: {
                  text: "DOJO DESIGN & SOURCING",
                  chars: "XO/\\01",
                  speed: 0.55,
                },
              },
              0.08,
            )
            .to(
              ".preloader-bar-fill",
              { scaleX: 1, duration: 0.95, ease: "power2.inOut" },
              0.05,
            )
            .to(
              counter,
              {
                val: 100,
                duration: 0.95,
                ease: "power2.inOut",
                onUpdate: () => {
                  if (countRef.current) {
                    countRef.current.textContent = `${String(Math.round(counter.val)).padStart(2, "0")}%`;
                  }
                },
              },
              0.05,
            )
            .to(
              curtainRef.current,
              {
                yPercent: -100,
                duration: 0.65,
                ease: "power4.inOut",
              },
              1.08,
            );
        },
      );

      return () => mm.revert();
    },
    { scope: curtainRef },
  );

  if (!visible) return null;

  return (
    <div
      ref={curtainRef}
      aria-live="polite"
      aria-label="Loading Dojo Design & Sourcing"
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#091122] px-6 text-white"
    >
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-45" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Dual DrawSVG Rings + Dojo Crane Emblem */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <svg
            viewBox="0 0 120 120"
            fill="none"
            className="absolute inset-0 h-full w-full -rotate-90"
            aria-hidden
          >
            <circle
              cx="60"
              cy="60"
              r="54"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
            />
            <circle
              className="preloader-ring-red"
              cx="60"
              cy="60"
              r="54"
              stroke="#dc2626"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle
              className="preloader-ring-blue"
              cx="60"
              cy="60"
              r="45"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white p-2.5 shadow-lg">
            <Image
              src="/dojo-crane-mark.png"
              alt="Dojo Design & Sourcing emblem"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </span>
        </div>

        <p className="preloader-title mt-7 text-center text-base font-extrabold uppercase tracking-[0.18em] text-white sm:text-2xl sm:tracking-[0.28em]">
          DOJO DESIGN &amp; SOURCING
        </p>
        <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.26em] text-[#8fa3c7]">
          DESIGN · SOURCING · FACTORY · QA · READY · SHIP
        </p>

        {/* Progress Bar & Counter */}
        <div className="mt-7 w-64">
          <div className="h-[2px] w-full overflow-hidden bg-white/15">
            <div className="preloader-bar-fill h-full w-full origin-left scale-x-0 bg-gradient-to-r from-[#2563eb] to-[#dc2626]" />
          </div>
          <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8fa3c7]">
            <span>Initializing 3D Pipeline</span>
            <span ref={countRef} className="text-white">
              00%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
