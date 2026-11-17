"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDown, Clock, Layers, Plane, Ship, Shirt } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const GARMENTS = [
  { id: "tee", label: "Heavyweight Tee", sampleDays: 7, prodBase: 14 },
  { id: "hoodie", label: "Pullover Hoodie", sampleDays: 10, prodBase: 20 },
  { id: "jacket", label: "Technical Outerwear", sampleDays: 14, prodBase: 28 },
] as const;

const QUANTITIES = [150, 500, 1500, 5000] as const;

const FREIGHT = [
  { id: "sea", label: "Ocean Ship (FCL / LCL)", transitDays: 24 },
  { id: "air", label: "Air Cargo Express", transitDays: 6 },
] as const;

export type EstimatePayload = {
  summary: string;
  interests: string[];
};

export function Estimator({
  selectedColorway = "Off-White (420 GSM Heavy Jersey)",
  onLockEstimate,
}: {
  selectedColorway?: string;
  onLockEstimate?: (payload: EstimatePayload) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const sampleRef = useRef<HTMLSpanElement>(null);
  const prodRef = useRef<HTMLSpanElement>(null);
  const transitRef = useRef<HTMLSpanElement>(null);
  const totalRef = useRef<HTMLSpanElement>(null);

  const [garmentIdx, setGarmentIdx] = useState(0);
  const [qty, setQty] = useState<number>(500);
  const [freightIdx, setFreightIdx] = useState(0);

  const metrics = useMemo(() => {
    const g = GARMENTS[garmentIdx];
    const f = FREIGHT[freightIdx];
    const scaleFactor = qty >= 5000 ? 12 : qty >= 1500 ? 7 : qty >= 500 ? 3 : 0;
    const sampling = g.sampleDays;
    const production = g.prodBase + scaleFactor;
    const transit = f.transitDays;
    return {
      sampling,
      production,
      transit,
      total: sampling + production + transit,
      garmentLabel: g.label,
      freightLabel: f.label,
    };
  }, [garmentIdx, qty, freightIdx]);

  // Animate GSAP number counters whenever estimator selection changes
  useGSAP(
    () => {
      const proxy = {
        s: Number(sampleRef.current?.textContent ?? metrics.sampling),
        p: Number(prodRef.current?.textContent ?? metrics.production),
        t: Number(transitRef.current?.textContent ?? metrics.transit),
        tot: Number(totalRef.current?.textContent ?? metrics.total),
      };

      gsap.to(proxy, {
        s: metrics.sampling,
        p: metrics.production,
        t: metrics.transit,
        tot: metrics.total,
        duration: 0.65,
        ease: "power2.out",
        onUpdate: () => {
          if (sampleRef.current) sampleRef.current.textContent = String(Math.round(proxy.s));
          if (prodRef.current) prodRef.current.textContent = String(Math.round(proxy.p));
          if (transitRef.current) transitRef.current.textContent = String(Math.round(proxy.t));
          if (totalRef.current) totalRef.current.textContent = String(Math.round(proxy.tot));
        },
      });
    },
    { scope: sectionRef, dependencies: [metrics] },
  );

  function handleApply() {
    const summary = `Run Estimate — ${metrics.garmentLabel} (${selectedColorway}), ${qty.toLocaleString()} pcs, ${metrics.freightLabel}. Estimated door-to-door: ~${metrics.total} days (${metrics.sampling}d sample + ${metrics.production}d factory + ${metrics.transit}d freight).`;
    onLockEstimate?.({
      summary,
      interests: [
        "COMPLETE END-TO-END",
        "FACTORY PRODUCTION",
        "CARGO & GLOBAL FREIGHT",
      ],
    });
  }

  return (
    <section
      id="estimator"
      ref={sectionRef}
      className="estimator grid-bg relative border-t border-border px-5 py-24 md:px-8 md:py-28"
      aria-label="Production & Freight Estimator"
    >
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
              • Run Planner
            </p>
            <h2 className="mt-3 text-3xl font-bold uppercase tracking-wide text-chrome md:text-5xl">
              Estimate Your Production Run
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Configure garment type, batch quantity, and freight mode to preview
            your end-to-end timeline from tech pack to warehouse arrival.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Controls */}
          <div className="space-y-8 border border-border bg-surface-deep/75 p-7 backdrop-blur-sm lg:col-span-7 md:p-10">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                <Shirt className="h-3.5 w-3.5 text-brand" aria-hidden />
                <span>01 · Garment Silhouette (Active 3D Color: {selectedColorway})</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {GARMENTS.map((g, i) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGarmentIdx(i)}
                    data-cursor="magnet"
                    className={`focus-ring rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                      i === garmentIdx
                        ? "border-brand bg-brand text-white"
                        : "border-border text-muted hover:border-chrome/40 hover:text-chrome"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                <Layers className="h-3.5 w-3.5 text-brand" aria-hidden />
                <span>02 · Batch Quantity (Pieces)</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {QUANTITIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQty(q)}
                    data-cursor="magnet"
                    className={`focus-ring rounded-full border px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                      qty === q
                        ? "border-brand bg-brand text-white"
                        : "border-border text-muted hover:border-chrome/40 hover:text-chrome"
                    }`}
                  >
                    {q.toLocaleString()} PCS
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                <Ship className="h-3.5 w-3.5 text-brand" aria-hidden />
                <span>03 · Logistics &amp; Shipment Mode</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {FREIGHT.map((f, i) => {
                  const Icon = f.id === "sea" ? Ship : Plane;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFreightIdx(i)}
                      data-cursor="magnet"
                      className={`focus-ring inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors ${
                        i === freightIdx
                          ? "border-brand bg-brand text-white"
                          : "border-border text-muted hover:border-chrome/40 hover:text-chrome"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live GSAP Timeline Readout */}
          <div className="flex flex-col justify-between border border-border bg-surface-deep/85 p-7 backdrop-blur-sm lg:col-span-5 md:p-10">
            <div>
              <p className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-brand">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                <span>Estimated Door-To-Door Timeline</span>
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <span
                  ref={totalRef}
                  className="font-mono text-6xl font-extrabold text-chrome md:text-7xl"
                >
                  {metrics.total}
                </span>
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-muted">
                  Days Total
                </span>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 border-y border-border py-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    Sampling
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-chrome">
                    <span ref={sampleRef}>{metrics.sampling}</span>d
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    Factory
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-chrome">
                    <span ref={prodRef}>{metrics.production}</span>d
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
                    Truck + Ship
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-chrome">
                    <span ref={transitRef}>{metrics.transit}</span>d
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApply}
              data-cursor="magnet"
              className="focus-ring mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-brand px-7 py-4 text-xs font-bold uppercase tracking-[0.22em] text-white shadow-[0_12px_28px_rgba(220,38,38,0.3)] transition-transform hover:scale-[1.02]"
            >
              <span>Lock Estimate &amp; Start Quote</span>
              <ArrowDown className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
