"use client";

export function Header({
  activeSection = "01 // HERO",
  onNavigate,
}: {
  activeSection?: string;
  onNavigate?: (selector: string) => void;
}) {
  function handleNav(e: React.MouseEvent<HTMLAnchorElement>, selector: string) {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(selector);
    }
  }

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 h-20 bg-gradient-to-b from-background/85 via-background/40 to-transparent backdrop-blur-[2px]">
      {/* Scroll Progress Rail */}
      <div
        aria-hidden
        className="scroll-progress-bar fixed inset-x-0 top-0 z-50 h-[2px] origin-left scale-x-0 bg-brand"
      />

      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 md:px-8">
        <a
          href="#top"
          onClick={(e) => handleNav(e, "#top")}
          data-cursor="magnet"
          className="focus-ring site-logo flex items-center gap-2.5 text-xl font-extrabold uppercase tracking-[0.2em] text-brand md:text-2xl"
        >
          <span
            aria-hidden
            className="inline-block h-2.5 w-2.5 rotate-45 border-2 border-brand"
          />
          <span>DOJO</span>
        </a>

        <a
          href="#work"
          onClick={(e) => handleNav(e, "#work")}
          data-cursor="magnet"
          className="focus-ring site-pill hidden items-center gap-2.5 rounded-full border border-border bg-surface-deep/85 px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-chrome backdrop-blur-md transition-colors hover:border-brand/60 hover:text-brand md:inline-flex"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
          <span className="header-telemetry font-mono">{activeSection}</span>
        </a>

        <a
          href="#contact"
          onClick={(e) => handleNav(e, "#contact")}
          data-cursor="magnet"
          className="focus-ring site-cta group inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand transition-colors hover:bg-brand hover:text-white md:text-sm"
        >
          <span>Lets Talk</span>
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
