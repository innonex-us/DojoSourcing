"use client";

export function Header() {
  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 h-20 transition-colors duration-300">
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 md:px-8">
        <a
          href="#top"
          className="focus-ring site-logo text-xl font-extrabold uppercase tracking-[0.2em] text-brand md:text-2xl"
        >
          DOJO
        </a>

        <a
          href="#work"
          className="focus-ring site-pill hidden rounded-full border border-border bg-surface-deep/80 px-6 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-chrome backdrop-blur-md transition-colors hover:border-brand/60 hover:text-brand md:inline-flex"
        >
          Design Lab
        </a>

        <a
          href="#contact"
          className="focus-ring site-cta group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-brand transition-opacity hover:opacity-85 md:text-base"
        >
          Lets Talk
          <span
            aria-hidden
            className="cta-arrow inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            ↗
          </span>
        </a>
      </div>
    </header>
  );
}
