"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronDown } from "lucide-react";

export function Hero({
  onEnterDojo,
}: {
  onEnterDojo?: () => void;
}) {
  return (
    <section
      id="top"
      className="hero relative flex h-svh min-h-[680px] items-center justify-center overflow-hidden bg-[#091122] px-5 pt-20 md:px-8"
      aria-label="Hero"
    >
      {/* Atmospheric Video Backdrop (vividly visible) */}
      <video
        className="hero-video absolute inset-0 h-full w-full object-cover opacity-85"
        src="/DEZININ-WEB-HERO.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Light Edge Vignette for Text Legibility Without Dimming Video */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/45"
      />
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 opacity-25"
      />

      {/* DrawSVG Architectural Corner Frame */}
      <svg
        aria-hidden
        viewBox="0 0 1200 640"
        fill="none"
        className="pointer-events-none absolute inset-0 m-auto h-[78%] w-[92%] max-w-[1280px] opacity-55"
        preserveAspectRatio="none"
      >
        <path
          className="hero-draw-path"
          d="M 48 16 L 16 16 L 16 48"
          stroke="#dc2626"
          strokeWidth="2"
        />
        <path
          className="hero-draw-path"
          d="M 1152 16 L 1184 16 L 1184 48"
          stroke="#2563eb"
          strokeWidth="2"
        />
        <path
          className="hero-draw-path"
          d="M 48 624 L 16 624 L 16 592"
          stroke="#2563eb"
          strokeWidth="2"
        />
        <path
          className="hero-draw-path"
          d="M 1152 624 L 1184 624 L 1184 592"
          stroke="#dc2626"
          strokeWidth="2"
        />
        <circle
          className="hero-draw-path"
          cx="600"
          cy="320"
          r="260"
          stroke="rgba(228,226,223,0.12)"
          strokeWidth="1"
        />
      </svg>

      {/* Center Kinetic Typography */}
      <div className="relative z-10 flex max-w-[1100px] flex-col items-center text-center">
        <p className="hero-scramble mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.34em] text-brand md:text-xs">
          DESIGN // FACTORY // READY // TRUCK // SHIP
        </p>

        <h1 className="hero-title text-5xl font-extrabold uppercase leading-[0.95] tracking-[0.04em] text-white drop-shadow-[0_6px_28px_rgba(0,0,0,0.85)] sm:text-7xl md:text-8xl lg:text-[7.2rem]">
          Design. Produce. Ship.
        </h1>

        <p className="hero-sub mt-7 max-w-xl text-sm leading-relaxed text-white/90 drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] md:text-base">
          Dojo Sourcing is your complete apparel sourcing partner — from garment
          design &amp; tech packs through factory production, cargo trucking,
          and global ocean shipment.
        </p>

        <div className="hero-actions mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onEnterDojo}
            data-cursor="magnet"
            className="focus-ring inline-flex items-center gap-2.5 rounded-full bg-brand px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-[0_12px_32px_rgba(220,38,38,0.35)] transition-transform hover:scale-[1.03]"
          >
            <span>Start The Journey</span>
            <ArrowDown className="h-4 w-4" aria-hidden />
          </button>
          <Link
            href="/showcase"
            data-cursor="magnet"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-colors hover:border-brand hover:text-brand"
          >
            <span>Product Showcase</span>
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
        <a
          href="#journey"
          className="focus-ring hero-scroll inline-flex flex-col items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/75 transition-colors hover:text-brand"
        >
          <span>Scroll</span>
          <ChevronDown className="h-4 w-4 animate-bounce opacity-75" aria-hidden />
        </a>
      </div>
    </section>
  );
}
