"use client";

export function Hero({
  onEnterDojo,
}: {
  onEnterDojo?: () => void;
}) {
  return (
    <section
      id="top"
      className="hero relative flex h-svh min-h-[680px] items-center justify-center overflow-hidden bg-background px-5 pt-20 md:px-8"
      aria-label="Hero"
    >
      {/* Atmospheric Video Backdrop */}
      <video
        className="hero-video absolute inset-0 h-full w-full object-cover opacity-55"
        src="/DEZININ-WEB-HERO.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Editorial Vignette & Architectural Grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,15,14,0.35)_0%,var(--background)_85%)]"
      />
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 opacity-60"
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
          stroke="#fe4101"
          strokeWidth="2"
        />
        <path
          className="hero-draw-path"
          d="M 1152 16 L 1184 16 L 1184 48"
          stroke="#fe4101"
          strokeWidth="2"
        />
        <path
          className="hero-draw-path"
          d="M 48 624 L 16 624 L 16 592"
          stroke="#fe4101"
          strokeWidth="2"
        />
        <path
          className="hero-draw-path"
          d="M 1152 624 L 1184 624 L 1184 592"
          stroke="#fe4101"
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
          SYSTEMS // MOTION // PRODUCT // CODE
        </p>

        <h1 className="hero-title text-5xl font-extrabold uppercase leading-[0.95] tracking-[0.04em] text-chrome sm:text-7xl md:text-8xl lg:text-[7.5rem]">
          Practice. Build. Ship.
        </h1>

        <p className="hero-sub mt-7 max-w-xl text-sm leading-relaxed text-foreground/85 md:text-base">
          DOJO is a kinetic product &amp; motion studio. We turn ambitious
          product theses into tactile, high-velocity web experiences.
        </p>

        <div className="hero-actions mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onEnterDojo}
            data-cursor="magnet"
            className="focus-ring inline-flex items-center gap-3 rounded-full bg-brand px-7 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-[0_12px_32px_rgba(254,65,1,0.35)] transition-transform hover:scale-[1.03]"
          >
            <span>Enter The Dojo</span>
            <span aria-hidden>↓</span>
          </button>
          <a
            href="#expertise"
            data-cursor="magnet"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-surface-deep/75 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-chrome backdrop-blur-md transition-colors hover:border-brand hover:text-brand"
          >
            Capabilities
          </a>
        </div>
      </div>

      {/* Bottom Scroll Cue */}
      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2">
        <a
          href="#work"
          className="focus-ring hero-scroll inline-flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/70 transition-colors hover:text-brand"
        >
          <span>Scroll</span>
          <span aria-hidden className="block h-5 w-px bg-current opacity-60" />
        </a>
      </div>
    </section>
  );
}
