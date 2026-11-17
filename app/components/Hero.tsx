"use client";

export function Hero() {
  return (
    <section
      id="top"
      className="hero relative flex h-svh min-h-[640px] items-end justify-center overflow-hidden bg-background"
      aria-label="Hero"
    >
      <video
        className="hero-video absolute inset-0 h-full w-full object-cover"
        src="/DEZININ-WEB-HERO.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* Editorial bottom-to-top vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
      />

      {/* Minimal scroll indicator */}
      <div className="relative z-10 pb-8">
        <a
          href="#work"
          className="focus-ring hero-scroll inline-flex flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/75 transition-colors hover:text-brand"
        >
          <span>Scroll</span>
          <span aria-hidden className="block h-5 w-px bg-current opacity-60" />
        </a>
      </div>
    </section>
  );
}
