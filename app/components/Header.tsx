"use client";

import Image from "next/image";
import Link from "next/link";

export function Header({
  activeSection = "01 // DESIGN",
  mode = "home",
  onNavigate,
}: {
  activeSection?: string;
  mode?: "home" | "showcase";
  onNavigate?: (selector: string) => void;
}) {
  function handleNav(e: React.MouseEvent<HTMLAnchorElement>, selector: string) {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(selector);
    }
  }

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50 h-20 border-b border-border/50 bg-background/85 backdrop-blur-md">
      {/* Scroll Progress Rail */}
      <div
        aria-hidden
        className="scroll-progress-bar fixed inset-x-0 top-0 z-50 h-[2px] origin-left scale-x-0 bg-brand"
      />

      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-3 px-5 md:px-8">
        <Link
          href="/"
          data-cursor="magnet"
          className="focus-ring site-logo flex items-center gap-3"
        >
          <span className="flex h-9 items-center justify-center rounded-full bg-white px-2.5 shadow-sm">
            <Image
              src="/dojo-sourcing-logo.png"
              alt="Dojo Sourcing logo"
              width={60}
              height={20}
              className="h-5 w-[60px] object-contain"
              priority
            />
          </span>
          <span className="text-sm font-extrabold uppercase tracking-[0.16em] text-chrome sm:text-base md:text-lg">
            Dojo <span className="text-brand">Sourcing</span>
          </span>
        </Link>

        <div className="site-pill flex items-center gap-2">
          <span className="hidden items-center gap-2 rounded-full border border-border bg-surface-deep/85 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted md:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
            <span>{activeSection}</span>
          </span>

          {mode === "showcase" ? (
            <Link
              href="/#journey"
              data-cursor="magnet"
              className="focus-ring rounded-full border border-border bg-surface-deep/85 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-chrome transition-colors hover:border-brand/60 hover:text-brand md:px-5 md:text-[11px]"
            >
              ← 3D Pipeline
            </Link>
          ) : (
            <Link
              href="/showcase"
              data-cursor="magnet"
              className="focus-ring rounded-full border border-border bg-surface-deep/85 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-chrome transition-colors hover:border-brand/60 hover:text-brand md:px-5 md:text-[11px]"
            >
              Showcase ↗
            </Link>
          )}
        </div>

        <Link
          href="/#contact"
          onClick={(e) => handleNav(e, "#contact")}
          data-cursor="magnet"
          className="focus-ring site-cta group inline-flex items-center gap-2 rounded-full border border-brand/45 bg-brand/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand transition-colors hover:bg-brand hover:text-white md:text-sm"
        >
          <span>Let&apos;s Talk</span>
          <span
            aria-hidden
            className="cta-arrow inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            ↗
          </span>
        </Link>
      </div>
    </header>
  );
}
