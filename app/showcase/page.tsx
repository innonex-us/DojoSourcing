"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { Header } from "../components/Header";
import { Projects } from "../components/Projects";
import { Experience } from "../components/Experience";
import { Expertise } from "../components/Expertise";
import { Accordion } from "../components/Accordion";
import { Contact } from "../components/Contact";
import { Footer } from "../components/Footer";
import { Fabs } from "../components/Fabs";

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollToPlugin, SplitText);

export default function ShowcasePage() {
  const root = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

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

        // Velocity-Reactive Dual Marquee
        const rowLeft = document.querySelector<HTMLElement>(".marquee-row-left");
        const rowRight = document.querySelector<HTMLElement>(".marquee-row-right");
        if (rowLeft && rowRight) {
          const tweenLeft = gsap.to(rowLeft, {
            xPercent: -50,
            duration: 28,
            ease: "none",
            repeat: -1,
          });
          gsap.set(rowRight, { xPercent: -50 });
          const tweenRight = gsap.to(rowRight, {
            xPercent: 0,
            duration: 32,
            ease: "none",
            repeat: -1,
          });
          const clampSkew = gsap.utils.clamp(-6, 6);
          const resetVelocity = gsap.delayedCall(0.18, () => {
            gsap.to([tweenLeft, tweenRight], { timeScale: 1, duration: 0.5 });
            gsap.to([rowLeft, rowRight], { skewX: 0, duration: 0.5 });
          }).pause();

          ScrollTrigger.create({
            trigger: ".experience",
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const vel = self.getVelocity();
              const boost = 1 + Math.min(Math.abs(vel) / 500, 3.2);
              const skew = clampSkew(vel / -450);
              tweenLeft.timeScale(boost);
              tweenRight.timeScale(boost);
              gsap.to(rowLeft, { skewX: skew, duration: 0.2, overwrite: "auto" });
              gsap.to(rowRight, { skewX: -skew, duration: 0.2, overwrite: "auto" });
              resetVelocity.restart(true);
            },
          });
        }

        // Expertise SplitText reveals
        gsap.utils.toArray<HTMLElement>(".expertise-row").forEach((row) => {
          const title = row.querySelector<HTMLElement>(".expertise-title");
          const titleSplit = title
            ? SplitText.create(title, { type: "lines", mask: "lines" })
            : null;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: row,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });
          tl.from(row, { autoAlpha: 0, y: 32, duration: 0.55, ease: "power3.out" });
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

  function toggleTheme() {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      if (next === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      return next;
    });
  }

  return (
    <div ref={root} className="relative min-h-svh bg-background text-foreground">
      <Header activeSection="PRODUCT SHOWCASE" onNavigate={navigateTo} />

      <main className="pt-28">
        <section className="mx-auto max-w-[1400px] px-5 pb-10 md:px-8">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
            • Product Showcase &amp; Capabilities
          </p>
          <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="max-w-3xl text-4xl font-extrabold uppercase leading-[1.02] tracking-wide text-chrome md:text-6xl">
              Garments, Factories &amp; Global Freight.
            </h1>
            <Link
              href="/#journey"
              className="focus-ring inline-flex w-fit items-center gap-2 rounded-full border border-border px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-chrome transition-colors hover:border-brand hover:text-brand"
            >
              ← Back To 3D Journey
            </Link>
          </div>
        </section>

        <Projects />
        <Experience />
        <Expertise />
        <Accordion />
        <Contact />
      </main>

      <Footer />
      <Fabs theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}
