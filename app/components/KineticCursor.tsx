"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * Desktop dual-ring kinetic cursor that reacts to `[data-cursor="magnet"]` targets.
 */
export function KineticCursor() {
  const scopeRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const dot = dotRef.current;
          const ring = ringRef.current;
          if (!dot || !ring) return;

          const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3.out" });
          const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3.out" });
          const ringX = gsap.quickTo(ring, "x", { duration: 0.28, ease: "power3.out" });
          const ringY = gsap.quickTo(ring, "y", { duration: 0.28, ease: "power3.out" });

          const onPointerMove = (e: PointerEvent) => {
            dotX(e.clientX - 4);
            dotY(e.clientY - 4);
            ringX(e.clientX - 18);
            ringY(e.clientY - 18);
          };

          const onPointerOver = (e: Event) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('[data-cursor="magnet"]')) {
              gsap.to(ring, {
                scale: 1.65,
                borderColor: "#fe4101",
                duration: 0.25,
              });
            }
          };

          const onPointerOut = (e: Event) => {
            const target = e.target as HTMLElement | null;
            if (target?.closest('[data-cursor="magnet"]')) {
              gsap.to(ring, {
                scale: 1,
                borderColor: "rgba(254, 65, 1, 0.55)",
                duration: 0.25,
              });
            }
          };

          window.addEventListener("pointermove", onPointerMove, { passive: true });
          document.addEventListener("pointerover", onPointerOver);
          document.addEventListener("pointerout", onPointerOut);

          return () => {
            window.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerover", onPointerOver);
            document.removeEventListener("pointerout", onPointerOut);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: scopeRef },
  );

  return (
    <div ref={scopeRef} aria-hidden className="pointer-events-none">
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden h-2 w-2 rounded-full bg-brand md:block"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden h-9 w-9 rounded-full border border-brand/55 md:block"
      />
    </div>
  );
}
