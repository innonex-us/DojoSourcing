"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

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
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1.5 shadow-sm ring-1 ring-black/10">
            <Image
              src="/dojo-crane-mark.png"
              alt="Dojo Design & Sourcing logo"
              width={24}
              height={24}
              className="h-6 w-6 shrink-0 object-contain"
              priority
            />
          </span>
          <span className="flex flex-col text-[11px] font-extrabold uppercase leading-tight tracking-[0.14em] text-chrome sm:flex-row sm:gap-[0.4em] sm:text-sm md:text-base lg:text-lg">
            <span>Dojo Design</span>
            <span className="text-brand">&amp; Sourcing</span>
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
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-deep/85 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-chrome transition-colors hover:border-brand/60 hover:text-brand md:px-5 md:text-[11px]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              <span>3D Pipeline</span>
            </Link>
          ) : (
            <Link
              href="/showcase"
              data-cursor="magnet"
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-deep/85 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-chrome transition-colors hover:border-brand/60 hover:text-brand md:px-5 md:text-[11px]"
            >
              <span>Showcase</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          )}
        </div>

        <Link
          href="/#contact"
          onClick={(e) => handleNav(e, "#contact")}
          data-cursor="magnet"
          className="focus-ring site-cta group inline-flex items-center gap-1.5 rounded-full border border-brand/45 bg-brand/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand transition-colors hover:bg-brand hover:text-white md:text-sm"
        >
          <span>Let&apos;s Talk</span>
          <ArrowUpRight
            aria-hidden
            className="cta-arrow h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </Link>
      </div>
    </header>
  );
}
