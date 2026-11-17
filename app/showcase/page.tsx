"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { Header } from "../components/Header";
import { Projects } from "../components/Projects";
import { Expertise } from "../components/Expertise";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { Fabs } from "../components/Fabs";
import { KineticCursor } from "../components/KineticCursor";
import { useTheme } from "../components/useTheme";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, SplitText);

export default function ShowcasePage() {
  const root = useRef<HTMLDivElement>(null);
  const { theme, accent, setTheme, setAccent } = useTheme();

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".scroll-progress-bar", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.2,
          },
        });

        const heroSplit = SplitText.create(".showcase-hero-title", {
          type: "words,chars",
          mask: "chars",
        });
        gsap.from(heroSplit.chars, {
          yPercent: 105,
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.018,
          ease: "power3.out",
        });

        gsap.utils.toArray<HTMLElement>(".expertise-row").forEach((row) => {
          const title = row.querySelector<HTMLElement>(".expertise-title");
          const titleSplit = title
            ? SplitText.create(title, { type: "lines", mask: "lines" })
            : null;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          });
          tl.from(row, {
            y: 28,
            duration: 0.55,
            ease: "power3.out",
            immediateRender: false,
          });
          if (titleSplit) {
            tl.from(
              titleSplit.lines,
              {
                yPercent: 100,
                autoAlpha: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: "power3.out",
              },
              "-=0.35",
            );
          }
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const navigateTo = contextSafe((selector: string) => {
    gsap.to(window, {
      scrollTo: { y: selector, offsetY: 40 },
      duration: 0.85,
      ease: "power3.inOut",
    });
  });

  return (
    <div ref={root} className="relative min-h-svh bg-background text-foreground">
      <KineticCursor />

      <Header
        activeSection="SAMPLE ROOM"
        mode="showcase"
        onNavigate={navigateTo}
      />

      <main className="pt-28">
        <section className="mx-auto max-w-[1400px] px-5 pb-14 md:px-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
            • Product Showcase &amp; Capabilities
          </p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="showcase-hero-title max-w-3xl text-4xl font-extrabold uppercase leading-[1.02] tracking-wide text-chrome md:text-6xl">
                Garments, Factories &amp; Global Freight.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base">
                Browse finished builds, filter by production stage, and explore
                our five integrated apparel capabilities from tech pack to port
                delivery.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#journey"
                data-cursor="magnet"
                className="focus-ring inline-flex w-fit items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-chrome transition-colors hover:border-brand hover:text-brand"
              >
                ← Back To 3D Journey
              </Link>
              <Link
                href="/#estimator"
                data-cursor="magnet"
                className="focus-ring inline-flex w-fit items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition-transform hover:scale-[1.03]"
              >
                Estimate Run ↗
              </Link>
            </div>
          </div>
        </section>

        <Projects />
        <Expertise />
        <Contact />
      </main>

      <Footer />
      <Fabs
        theme={theme}
        accent={accent}
        onSetTheme={setTheme}
        onSetAccent={setAccent}
      />
    </div>
  );
}
