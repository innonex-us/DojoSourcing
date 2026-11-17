"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Journey } from "./Journey";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { Fabs } from "./Fabs";

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  ScrollToPlugin,
  SplitText,
  ScrambleTextPlugin,
  DrawSVGPlugin,
);

const SECTION_LABELS: Array<{ selector: string; label: string }> = [
  { selector: "#top", label: "01 // DESIGN" },
  { selector: "#journey", label: "02 // 3D PIPELINE" },
  { selector: "#contact", label: "03 // CONTACT" },
];

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeSection, setActiveSection] = useState("01 // DESIGN");

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { motion, desktop } = ctx.conditions!;

          if (!motion) {
            gsap.set(
              [
                ".site-logo",
                ".site-pill",
                ".site-cta",
                ".hero-title",
                ".hero-sub",
                ".hero-actions",
                ".hero-scroll",
                ".contact",
              ],
              { clearProps: "all", autoAlpha: 1 },
            );
            return;
          }

          // 1. Global Scroll Progress Bar
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

          // 2. Live Section Telemetry in Header Pill
          SECTION_LABELS.forEach(({ selector, label }) => {
            const el = document.querySelector(selector);
            if (!el) return;
            ScrollTrigger.create({
              trigger: el,
              start: "top 45%",
              end: "bottom 45%",
              onEnter: () => setActiveSection(label),
              onEnterBack: () => setActiveSection(label),
            });
          });

          // 3. Hero DrawSVG + SplitText + ScrambleText Intro
          const heroSplit = SplitText.create(".hero-title", {
            type: "words,chars",
            mask: "chars",
          });

          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .from(".site-logo", { autoAlpha: 0, y: -12, duration: 0.4 })
            .from(".site-pill", { autoAlpha: 0, y: -10, duration: 0.35 }, "-=0.2")
            .from(".site-cta", { autoAlpha: 0, y: -10, duration: 0.35 }, "-=0.25")
            .from(
              ".hero-draw-path",
              {
                drawSVG: 0,
                duration: 0.9,
                stagger: 0.08,
                ease: "power2.inOut",
              },
              "-=0.25",
            )
            .to(
              ".hero-scramble",
              {
                duration: 0.8,
                scrambleText: {
                  text: "DESIGN // FACTORY // READY // TRUCK // SHIP",
                  chars: "01/\\XO",
                  speed: 0.5,
                },
              },
              "-=0.7",
            )
            .from(
              heroSplit.chars,
              {
                yPercent: 110,
                autoAlpha: 0,
                duration: 0.7,
                stagger: 0.024,
                ease: "power4.out",
              },
              "-=0.6",
            )
            .from(
              ".hero-sub",
              { autoAlpha: 0, y: 18, duration: 0.5 },
              "-=0.35",
            )
            .from(
              ".hero-actions",
              { autoAlpha: 0, y: 16, duration: 0.45 },
              "-=0.3",
            )
            .from(
              ".hero-scroll",
              { autoAlpha: 0, y: 10, duration: 0.35 },
              "-=0.2",
            );

          // Hero Video Scroll Scrub
          gsap.to(".hero-video", {
            scale: 1.1,
            opacity: 0.25,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });

          // 4. Desktop Dual-Ring Kinetic Cursor
          let onPointerMove: ((e: PointerEvent) => void) | null = null;
          let onPointerOver: ((e: Event) => void) | null = null;
          let onPointerOut: ((e: Event) => void) | null = null;

          if (desktop && cursorDotRef.current && cursorRingRef.current) {
            const dotX = gsap.quickTo(cursorDotRef.current, "x", {
              duration: 0.08,
              ease: "power3.out",
            });
            const dotY = gsap.quickTo(cursorDotRef.current, "y", {
              duration: 0.08,
              ease: "power3.out",
            });
            const ringX = gsap.quickTo(cursorRingRef.current, "x", {
              duration: 0.28,
              ease: "power3.out",
            });
            const ringY = gsap.quickTo(cursorRingRef.current, "y", {
              duration: 0.28,
              ease: "power3.out",
            });

            onPointerMove = (e: PointerEvent) => {
              dotX(e.clientX - 4);
              dotY(e.clientY - 4);
              ringX(e.clientX - 18);
              ringY(e.clientY - 18);
            };

            onPointerOver = (e: Event) => {
              const target = e.target as HTMLElement | null;
              if (target?.closest('[data-cursor="magnet"]')) {
                gsap.to(cursorRingRef.current, {
                  scale: 1.65,
                  borderColor: "#fe4101",
                  duration: 0.25,
                });
              }
            };

            onPointerOut = (e: Event) => {
              const target = e.target as HTMLElement | null;
              if (target?.closest('[data-cursor="magnet"]')) {
                gsap.to(cursorRingRef.current, {
                  scale: 1,
                  borderColor: "rgba(254, 65, 1, 0.55)",
                  duration: 0.25,
                });
              }
            };

            window.addEventListener("pointermove", onPointerMove, { passive: true });
            document.addEventListener("pointerover", onPointerOver);
            document.addEventListener("pointerout", onPointerOut);
          }

          // 5. Contact ScrollTrigger Stagger
          gsap.from(".contact > div > *", {
            autoAlpha: 0,
            y: 30,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".contact",
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          return () => {
            if (onPointerMove) window.removeEventListener("pointermove", onPointerMove);
            if (onPointerOver) document.removeEventListener("pointerover", onPointerOver);
            if (onPointerOut) document.removeEventListener("pointerout", onPointerOut);
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  const navigateTo = contextSafe((selector: string) => {
    gsap.to(window, {
      scrollTo: { y: selector, offsetY: 40 },
      duration: 0.9,
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
      {/* Desktop Dual-Ring Kinetic Cursor */}
      <div
        ref={cursorDotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-50 hidden h-2 w-2 rounded-full bg-brand md:block"
      />
      <div
        ref={cursorRingRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-50 hidden h-9 w-9 rounded-full border border-brand/55 md:block"
      />

      <Header activeSection={activeSection} onNavigate={navigateTo} />
      <main>
        <Hero onEnterDojo={() => navigateTo("#journey")} />
        <Journey />
        <Contact />
      </main>
      <Footer />
      <Fabs theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}
