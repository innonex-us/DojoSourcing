"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";

gsap.registerPlugin(useGSAP, ScrollTrigger, DrawSVGPlugin);

const STAGES = [
  {
    num: "01",
    tag: "DESIGN",
    title: "Start Designing Your Product",
    subtitle: "Concept, Tech Pack & 3D Fit",
    body: "Every collection begins with silhouette architecture, fabric selection, graded measurements, and factory-ready tech packs.",
  },
  {
    num: "02",
    tag: "FACTORY",
    title: "To The Factory Floor",
    subtitle: "Cutting, Sewing & Craftsmanship",
    body: "Approved patterns enter vetted garment lines — precision cutting, stitching, washing, and inline quality checks at every step.",
  },
  {
    num: "03",
    tag: "READY",
    title: "Packed & Ready To Ship",
    subtitle: "AQL Inspection & Cartonization",
    body: "Finished garments are steamed, polybagged, hang-tagged, barcode-labeled, and sealed into export cartons after passing AQL 2.5.",
  },
  {
    num: "04",
    tag: "TRUCK",
    title: "Cargo Truck Dispatch",
    subtitle: "Factory Gate To Export Port",
    body: "Sealed cargo trucks haul your finished inventory from the factory floor through export clearance straight to the container terminal.",
  },
  {
    num: "05",
    tag: "SHIP",
    title: "Ocean Ship Journey",
    subtitle: "Global Freight To Your Warehouse",
    body: "Loaded onto ocean vessels for FCL or LCL transit — tracked across the sea until final-mile delivery at your brand's doorstep.",
  },
] as const;

export function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const scenes = gsap.utils.toArray<HTMLElement>(".journey-scene");
          const texts = gsap.utils.toArray<HTMLElement>(".journey-copy");

          gsap.set(scenes, { autoAlpha: 0, scale: 0.94, y: 24 });
          gsap.set(texts, { autoAlpha: 0, y: 24 });
          if (scenes[0]) gsap.set(scenes[0], { autoAlpha: 1, scale: 1, y: 0 });
          if (texts[0]) gsap.set(texts[0], { autoAlpha: 1, y: 0 });

          // Initial DrawSVG preparation for Scene 1 garment paths
          gsap.set(".garment-draw", { drawSVG: "0%" });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".journey-stage",
              start: "top top",
              end: "+=3600",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              onUpdate: (self) => {
                const idx = Math.min(
                  STAGES.length - 1,
                  Math.floor(self.progress * STAGES.length),
                );
                setActiveStep(idx);
              },
            },
          });

          // Top progress rail fills 0 -> 1 across all 5 stages
          tl.to(
            ".journey-rail-fill",
            { scaleX: 1, ease: "none", duration: 5 },
            0,
          );

          // STAGE 1 (0 -> 1): Draw Garment Blueprint
          tl.to(
            ".garment-draw",
            { drawSVG: "100%", duration: 0.7, stagger: 0.08, ease: "power2.out" },
            0.05,
          );

          // Transition 1 -> 2: Design to Factory
          tl.to([scenes[0], texts[0]], { autoAlpha: 0, y: -24, duration: 0.35 }, 0.9)
            .to([scenes[1], texts[1]], { autoAlpha: 1, scale: 1, y: 0, duration: 0.4 }, 1.1)
            .to(
              ".factory-gear",
              { rotation: 360, transformOrigin: "50% 50%", duration: 0.9, ease: "none" },
              1.1,
            )
            .to(
              ".factory-needle",
              { y: 18, repeat: 3, yoyo: true, duration: 0.2, ease: "power1.inOut" },
              1.15,
            );

          // Transition 2 -> 3: Factory to Ready to Ship
          tl.to([scenes[1], texts[1]], { autoAlpha: 0, y: -24, duration: 0.35 }, 1.9)
            .to([scenes[2], texts[2]], { autoAlpha: 1, scale: 1, y: 0, duration: 0.4 }, 2.1)
            .fromTo(
              ".qc-stamp",
              { scale: 2.2, autoAlpha: 0, rotation: -18 },
              { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.45, ease: "back.out(2)" },
              2.35,
            );

          // Transition 3 -> 4: Ready to Cargo Truck
          tl.to([scenes[2], texts[2]], { autoAlpha: 0, y: -24, duration: 0.35 }, 2.9)
            .to([scenes[3], texts[3]], { autoAlpha: 1, scale: 1, y: 0, duration: 0.4 }, 3.1)
            .fromTo(
              ".cargo-truck-group",
              { x: -160 },
              { x: 140, duration: 0.95, ease: "power1.inOut" },
              3.1,
            )
            .to(
              ".truck-wheel",
              { rotation: 720, transformOrigin: "50% 50%", duration: 0.95, ease: "none" },
              3.1,
            )
            .to(
              ".road-dashes",
              { x: -120, duration: 0.95, ease: "none" },
              3.1,
            );

          // Transition 4 -> 5: Cargo Truck to Ocean Ship
          tl.to([scenes[3], texts[3]], { autoAlpha: 0, y: -24, duration: 0.35 }, 3.9)
            .to([scenes[4], texts[4]], { autoAlpha: 1, scale: 1, y: 0, duration: 0.4 }, 4.1)
            .fromTo(
              ".ocean-ship-group",
              { x: -140, y: 6 },
              { x: 110, y: -6, duration: 0.95, ease: "power1.inOut" },
              4.1,
            )
            .to(
              ".ocean-waves",
              { x: -90, duration: 0.95, ease: "none" },
              4.1,
            );
        },
      );

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="journey"
      ref={sectionRef}
      className="journey-section relative border-t border-border bg-background"
      aria-label="Clothing Production & Shipment Journey"
    >
      {/* Desktop Pinned 5-Stage Pipeline */}
      <div className="journey-stage relative hidden h-svh min-h-[700px] w-full flex-col justify-between overflow-hidden px-8 pt-24 pb-12 md:flex">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-45" />

        {/* Top 5-Step Pipeline HUD */}
        <div className="relative z-10 mx-auto w-full max-w-[1400px]">
          <div className="flex items-center justify-between gap-2">
            {STAGES.map((stage, idx) => {
              const isActive = idx === activeStep;
              const isDone = idx < activeStep;
              return (
                <div
                  key={stage.num}
                  className={`flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.18em] transition-colors ${
                    isActive
                      ? "text-brand"
                      : isDone
                        ? "text-chrome"
                        : "text-muted/60"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[10px] ${
                      isActive
                        ? "border-brand bg-brand text-white"
                        : isDone
                          ? "border-chrome/50 text-chrome"
                          : "border-border text-muted"
                    }`}
                  >
                    {stage.num}
                  </span>
                  <span className="hidden lg:inline">{stage.tag}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 h-[2px] w-full bg-border">
            <div className="journey-rail-fill h-full w-full origin-left scale-x-0 bg-brand" />
          </div>
        </div>

        {/* Center Split: Narrative Copy (Left) + Animated SVG Stage (Right) */}
        <div className="relative z-10 mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-12 items-center gap-12">
          {/* Left Narrative Stack */}
          <div className="relative col-span-5 h-[280px]">
            {STAGES.map((stage, idx) => (
              <div
                key={stage.num}
                className="journey-copy absolute inset-0 flex flex-col justify-center"
                style={{ opacity: idx === 0 ? 1 : 0 }}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-brand">
                  {`STAGE ${stage.num} // ${stage.tag}`}
                </span>
                <h2 className="mt-4 text-4xl font-extrabold uppercase leading-[1.05] tracking-wide text-chrome lg:text-5xl">
                  {stage.title}
                </h2>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-brand/90">
                  {stage.subtitle}
                </p>
                <p className="mt-5 max-w-md text-base leading-relaxed text-foreground/80">
                  {stage.body}
                </p>
              </div>
            ))}
          </div>

          {/* Right Visual Stage */}
          <div className="relative col-span-7 flex h-[420px] items-center justify-center border border-border bg-surface-deep/60 p-8 backdrop-blur-sm">
            {/* Scene 1: Garment Design Blueprint (DrawSVG) */}
            <div className="journey-scene absolute inset-0 flex items-center justify-center p-8">
              <svg viewBox="0 0 520 340" fill="none" className="h-full w-full max-w-[480px]">
                {/* Blueprint Grid Frame */}
                <rect
                  className="garment-draw"
                  x="20"
                  y="20"
                  width="480"
                  height="300"
                  stroke="rgba(228,226,223,0.18)"
                  strokeWidth="1.5"
                />
                {/* Jacket / Hoodie Silhouette */}
                <path
                  className="garment-draw"
                  d="M 190 70 L 230 55 Q 260 72 290 55 L 330 70 L 385 115 L 355 155 L 325 130 L 325 275 L 195 275 L 195 130 L 165 155 L 135 115 Z"
                  stroke="#fe4101"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                {/* Center Seam & Pocket Specs */}
                <line className="garment-draw" x1="260" y1="68" x2="260" y2="275" stroke="#e4e2df" strokeWidth="1.5" strokeDasharray="5 5" />
                <rect className="garment-draw" x="212" y="190" width="36" height="44" stroke="#e4e2df" strokeWidth="1.5" />
                <rect className="garment-draw" x="272" y="190" width="36" height="44" stroke="#e4e2df" strokeWidth="1.5" />
                {/* Dimension Callout */}
                <line className="garment-draw" x1="195" y1="295" x2="325" y2="295" stroke="#fe4101" strokeWidth="1.5" />
                <text x="260" y="312" textAnchor="middle" fill="#8b8988" fontSize="11" fontFamily="monospace">
                  TECH PACK · 420GSM HEAVYWEIGHT
                </text>
              </svg>
            </div>

            {/* Scene 2: Factory Production */}
            <div className="journey-scene absolute inset-0 flex items-center justify-center p-8">
              <svg viewBox="0 0 520 340" fill="none" className="h-full w-full max-w-[480px]">
                {/* Factory Building */}
                <path
                  d="M 60 270 L 60 150 L 150 110 L 150 150 L 240 110 L 240 150 L 330 110 L 330 270 Z"
                  stroke="#e4e2df"
                  strokeWidth="2.5"
                  fill="rgba(42,36,34,0.45)"
                />
                {/* Rotating Gear */}
                <g className="factory-gear">
                  <circle cx="155" cy="205" r="28" stroke="#fe4101" strokeWidth="3" strokeDasharray="10 6" />
                  <circle cx="155" cy="205" r="10" fill="#fe4101" />
                </g>
                {/* Sewing Machine Head & Animated Needle */}
                <rect x="355" y="130" width="110" height="28" rx="4" stroke="#e4e2df" strokeWidth="2" fill="#1a1614" />
                <line className="factory-needle" x1="410" y1="158" x2="410" y2="215" stroke="#fe4101" strokeWidth="3" />
                <path d="M 340 245 L 480 245" stroke="#e4e2df" strokeWidth="3" />
                <text x="260" y="305" textAnchor="middle" fill="#8b8988" fontSize="11" fontFamily="monospace">
                  CUT &amp; SEW LINE · INLINE QC ACTIVE
                </text>
              </svg>
            </div>

            {/* Scene 3: Ready to Ship Carton + QC Stamp */}
            <div className="journey-scene absolute inset-0 flex items-center justify-center p-8">
              <svg viewBox="0 0 520 340" fill="none" className="h-full w-full max-w-[480px]">
                {/* Export Carton Box */}
                <rect x="145" y="105" width="230" height="165" stroke="#e4e2df" strokeWidth="3" fill="rgba(42,36,34,0.6)" />
                <line x1="145" y1="145" x2="375" y2="145" stroke="#e4e2df" strokeWidth="2" />
                <rect x="242" y="105" width="36" height="65" fill="#fe4101" opacity="0.85" />
                {/* Barcode */}
                <g stroke="#e4e2df" strokeWidth="2">
                  <line x1="170" y1="220" x2="170" y2="248" />
                  <line x1="178" y1="220" x2="178" y2="248" />
                  <line x1="184" y1="220" x2="184" y2="248" />
                  <line x1="194" y1="220" x2="194" y2="248" />
                  <line x1="202" y1="220" x2="202" y2="248" />
                </g>
                {/* QC Passed Stamp */}
                <g className="qc-stamp">
                  <rect x="245" y="175" width="115" height="44" rx="4" stroke="#fe4101" strokeWidth="3" fill="rgba(254,65,1,0.14)" />
                  <text x="302" y="202" textAnchor="middle" fill="#fe4101" fontSize="13" fontWeight="bold" fontFamily="monospace">
                    READY TO SHIP
                  </text>
                </g>
                <text x="260" y="305" textAnchor="middle" fill="#8b8988" fontSize="11" fontFamily="monospace">
                  AQL 2.5 PASSED · CARTON SEALED
                </text>
              </svg>
            </div>

            {/* Scene 4: Cargo Truck */}
            <div className="journey-scene absolute inset-0 flex items-center justify-center p-8 overflow-hidden">
              <svg viewBox="0 0 520 340" fill="none" className="h-full w-full max-w-[480px]">
                {/* Highway */}
                <line x1="20" y1="265" x2="500" y2="265" stroke="#e4e2df" strokeWidth="2" />
                <line className="road-dashes" x1="0" y1="282" x2="640" y2="282" stroke="#fe4101" strokeWidth="2" strokeDasharray="24 18" />
                {/* Cargo Truck */}
                <g className="cargo-truck-group">
                  {/* Trailer */}
                  <rect x="110" y="130" width="195" height="110" stroke="#e4e2df" strokeWidth="3" fill="#1a1614" />
                  <text x="207" y="192" textAnchor="middle" fill="#fe4101" fontSize="16" fontWeight="bold" fontFamily="monospace">
                    DOJO CARGO
                  </text>
                  {/* Cab */}
                  <path d="M 310 165 L 365 165 L 385 198 L 385 240 L 310 240 Z" stroke="#fe4101" strokeWidth="3" fill="#2a2422" />
                  <rect x="325" y="177" width="32" height="22" fill="rgba(228,226,223,0.25)" />
                  {/* Wheels */}
                  <g className="truck-wheel">
                    <circle cx="155" cy="245" r="20" stroke="#e4e2df" strokeWidth="3" fill="#120f0e" />
                    <line x1="155" y1="229" x2="155" y2="261" stroke="#fe4101" strokeWidth="2" />
                  </g>
                  <g className="truck-wheel">
                    <circle cx="265" cy="245" r="20" stroke="#e4e2df" strokeWidth="3" fill="#120f0e" />
                    <line x1="265" y1="229" x2="265" y2="261" stroke="#fe4101" strokeWidth="2" />
                  </g>
                  <g className="truck-wheel">
                    <circle cx="350" cy="245" r="20" stroke="#e4e2df" strokeWidth="3" fill="#120f0e" />
                    <line x1="350" y1="229" x2="350" y2="261" stroke="#fe4101" strokeWidth="2" />
                  </g>
                </g>
                <text x="260" y="315" textAnchor="middle" fill="#8b8988" fontSize="11" fontFamily="monospace">
                  INLAND FREIGHT · FACTORY TO PORT TERMINAL
                </text>
              </svg>
            </div>

            {/* Scene 5: Ocean Container Ship */}
            <div className="journey-scene absolute inset-0 flex items-center justify-center p-8 overflow-hidden">
              <svg viewBox="0 0 520 340" fill="none" className="h-full w-full max-w-[480px]">
                {/* Container Ship */}
                <g className="ocean-ship-group">
                  {/* Hull */}
                  <path d="M 95 215 L 420 215 L 395 255 L 120 255 Z" stroke="#e4e2df" strokeWidth="3" fill="#2a2422" />
                  {/* Bridge */}
                  <rect x="135" y="145" width="46" height="70" stroke="#e4e2df" strokeWidth="2.5" fill="#1a1614" />
                  <rect x="148" y="122" width="16" height="23" fill="#fe4101" />
                  {/* Containers */}
                  <rect x="195" y="175" width="55" height="40" stroke="#e4e2df" strokeWidth="2" fill="#fe4101" />
                  <rect x="255" y="175" width="55" height="40" stroke="#e4e2df" strokeWidth="2" fill="#1a1614" />
                  <rect x="315" y="175" width="55" height="40" stroke="#e4e2df" strokeWidth="2" fill="#fe4101" opacity="0.8" />
                  <rect x="225" y="135" width="55" height="40" stroke="#e4e2df" strokeWidth="2" fill="#2a2422" />
                  <rect x="285" y="135" width="55" height="40" stroke="#e4e2df" strokeWidth="2" fill="#fe4101" />
                </g>
                {/* Animated Ocean Waves */}
                <path
                  className="ocean-waves"
                  d="M -40 258 Q 10 245 60 258 T 160 258 T 260 258 T 360 258 T 460 258 T 560 258 T 660 258"
                  stroke="#fe4101"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  className="ocean-waves"
                  d="M -20 276 Q 30 264 80 276 T 180 276 T 280 276 T 380 276 T 480 276 T 580 276"
                  stroke="rgba(228,226,223,0.4)"
                  strokeWidth="2"
                  fill="none"
                />
                <text x="260" y="315" textAnchor="middle" fill="#8b8988" fontSize="11" fontFamily="monospace">
                  OCEAN VOYAGE · GLOBAL BRAND DELIVERY
                </text>
              </svg>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-between text-[11px] font-mono uppercase tracking-[0.22em] text-muted">
          <span>End-To-End Clothing Solution</span>
          <span>Scroll To Advance Stage →</span>
        </div>
      </div>

      {/* Mobile / Reduced-Motion Fallback Vertical Timeline */}
      <div className="px-5 py-20 md:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
          • End-To-End Pipeline
        </p>
        <h2 className="mt-3 text-3xl font-bold uppercase tracking-wide text-chrome">
          Design To Shipment
        </h2>
        <div className="mt-10 space-y-6 border-l border-border pl-6">
          {STAGES.map((stage) => (
            <div key={stage.num} className="relative">
              <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                {stage.num}
              </span>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-brand">
                {stage.tag} · {stage.subtitle}
              </p>
              <h3 className="mt-1 text-xl font-bold uppercase text-chrome">
                {stage.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/80">
                {stage.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
