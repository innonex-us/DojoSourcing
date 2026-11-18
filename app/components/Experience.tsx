"use client";

import Image from "next/image";

const BRAND_LOGOS = [
  { name: "NORTHERN LOOM", mark: "loom", bg: "#0f2347", fg: "#ffffff", accent: "#dc2626" },
  { name: "APEX APPAREL", mark: "apex", bg: "#1e3a8a", fg: "#ffffff", accent: "#fca5a5" },
  { name: "VERMONT KNIT", mark: "knit", bg: "#dc2626", fg: "#ffffff", accent: "#ffffff" },
  { name: "PACIFIC DENIM", mark: "wave", bg: "#111d38", fg: "#e6ecf5", accent: "#3b82f6" },
  { name: "EUROLINE STUDIO", mark: "ring", bg: "#ffffff", fg: "#0f2347", accent: "#dc2626" },
  { name: "METRO OUTERWEAR", mark: "grid", bg: "#172554", fg: "#ffffff", accent: "#ef4444" },
  { name: "ATLANTIC FREIGHT", mark: "compass", bg: "#b91c1c", fg: "#ffffff", accent: "#ffffff" },
  { name: "CRESTLINE RETAIL", mark: "crest", bg: "#0d162c", fg: "#e6ecf5", accent: "#2563eb" },
] as const;

export function Experience() {
  const rowOne = [...BRAND_LOGOS, ...BRAND_LOGOS];
  const rowTwo = [...BRAND_LOGOS.slice().reverse(), ...BRAND_LOGOS.slice().reverse()];

  return (
    <section
      id="experience"
      className="experience relative overflow-hidden border-y border-border py-20 md:py-28"
    >
      <div className="mx-auto max-w-[900px] px-5 text-center md:px-8">
        <div className="mx-auto mb-5 inline-flex items-center gap-2.5 rounded-full border border-border bg-white px-3.5 py-1.5 shadow-sm">
          <Image
            src="/dojo-crane-mark.png"
            alt="Dojo Design & Sourcing mark"
            width={22}
            height={22}
            className="h-5 w-5 object-contain"
          />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#0f2347]">
            Dojo Design & Sourcing Network
          </span>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
          • Global Partner Brands
        </p>
        <h2 className="mt-4 text-3xl font-semibold uppercase leading-tight tracking-wide text-chrome md:text-5xl">
          Trusted By Apparel Brands Worldwide
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-foreground/80 md:text-base">
          From emerging streetwear labels to international retail chains, Dojo
          Sourcing connects design studios, vetted garment mills, and ocean
          freight ports into one accountable pipeline.
        </p>
      </div>

      {/* Velocity-Reactive Dual Brand-Logo Marquee */}
      <div className="marquee-wrapper relative mt-14 space-y-4 overflow-hidden">
        <div className="marquee-row-left flex w-max gap-4 px-2 will-change-transform">
          {rowOne.map((brand, idx) => (
            <BrandTile key={`r1-${brand.name}-${idx}`} {...brand} />
          ))}
        </div>

        <div className="marquee-row-right flex w-max gap-4 px-2 will-change-transform">
          {rowTwo.map((brand, idx) => (
            <BrandTile key={`r2-${brand.name}-${idx}`} {...brand} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandTile({
  name,
  mark,
  bg,
  fg,
  accent,
}: (typeof BRAND_LOGOS)[number]) {
  return (
    <div
      className="flex h-32 w-44 shrink-0 flex-col items-center justify-center gap-3 border border-border/50 px-4 text-center transition-transform duration-300 hover:scale-[1.04] md:h-40 md:w-48"
      style={{ backgroundColor: bg, color: fg }}
    >
      <BrandMark kind={mark} color={fg} accent={accent} />
      <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] md:text-[11px]">
        {name}
      </span>
    </div>
  );
}

function BrandMark({
  kind,
  color,
  accent,
}: {
  kind: (typeof BRAND_LOGOS)[number]["mark"];
  color: string;
  accent: string;
}) {
  switch (kind) {
    case "apex":
      return (
        <svg width="34" height="28" viewBox="0 0 34 28" fill="none" aria-hidden>
          <path d="M17 2L31 26H3L17 2Z" stroke={color} strokeWidth="2.4" />
          <path d="M17 11L23 22H11L17 11Z" fill={accent} />
        </svg>
      );
    case "loom":
      return (
        <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
          <rect x="3" y="4" width="26" height="20" stroke={color} strokeWidth="2.2" />
          <line x1="10" y1="4" x2="10" y2="24" stroke={accent} strokeWidth="2.2" />
          <line x1="22" y1="4" x2="22" y2="24" stroke={accent} strokeWidth="2.2" />
          <line x1="3" y1="14" x2="29" y2="14" stroke={color} strokeWidth="2" />
        </svg>
      );
    case "knit":
      return (
        <svg width="32" height="28" viewBox="0 0 32 28" fill="none" aria-hidden>
          <path d="M4 6L16 22L28 6" stroke={color} strokeWidth="2.6" />
          <path d="M9 6L16 15L23 6" stroke={accent} strokeWidth="2.2" />
        </svg>
      );
    case "wave":
      return (
        <svg width="36" height="26" viewBox="0 0 36 26" fill="none" aria-hidden>
          <path d="M2 10C7 4 13 4 18 10C23 16 29 16 34 10" stroke={color} strokeWidth="2.5" />
          <path d="M2 18C7 12 13 12 18 18C23 24 29 24 34 18" stroke={accent} strokeWidth="2.5" />
        </svg>
      );
    case "ring":
      return (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
          <circle cx="15" cy="15" r="11" stroke={color} strokeWidth="2.5" />
          <circle cx="15" cy="15" r="4.5" fill={accent} />
        </svg>
      );
    case "grid":
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
          <rect x="3" y="3" width="9" height="9" fill={color} />
          <rect x="16" y="3" width="9" height="9" fill={accent} />
          <rect x="3" y="16" width="9" height="9" fill={accent} />
          <rect x="16" y="16" width="9" height="9" fill={color} />
        </svg>
      );
    case "compass":
      return (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
          <circle cx="15" cy="15" r="11" stroke={color} strokeWidth="2" />
          <path d="M15 6L18.5 15L15 24L11.5 15L15 6Z" fill={accent} />
        </svg>
      );
    case "crest":
      return (
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden>
          <path d="M6 4H24V15C24 21 15 26 15 26C15 26 6 21 6 15V4Z" stroke={color} strokeWidth="2.3" />
          <line x1="15" y1="8" x2="15" y2="20" stroke={accent} strokeWidth="2.4" />
        </svg>
      );
  }
}
