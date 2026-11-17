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
import { Projects } from "./Projects";
import { Experience } from "./Experience";
import { Expertise } from "./Expertise";
import { Accordion } from "./Accordion";
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
  { selector: "#top", label: "01 // HERO" },
  { selector: "#work", label: "02 // LAB" },
  { selector: "#experience", label: "03 // ARENA" },
  { selector: "#expertise", label: "04 // CRAFT" },
  { selector: "#friction", label: "05 // FRICTION" },
  { selector: "#contact", label: "06 // CONTACT" },
];

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeSection, setActiveSection] = useState("01 // HERO");

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
                ".experience",
                ".expertise-row",
                ".faq-item",
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
                  text: "SYSTEMS // MOTION // PRODUCT // CODE",
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

          // 5. Velocity-Reactive Dual Marquee
          const rowLeft = document.querySelector<HTMLElement>(".marquee-row-left");
          const rowRight = document.querySelector<HTMLElement>(".marquee-row-right");
          let tweenLeft: gsap.core.Tween | null = null;
          let tweenRight: gsap.core.Tween | null = null;

          if (rowLeft && rowRight) {
            tweenLeft = gsap.to(rowLeft, {
              xPercent: -50,
              duration: 28,
              ease: "none",
              repeat: -1,
            });

            gsap.set(rowRight, { xPercent: -50 });
            tweenRight = gsap.to(rowRight, {
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
                if (tweenLeft) tweenLeft.timeScale(boost);
                if (tweenRight) tweenRight.timeScale(boost);
                gsap.to(rowLeft, { skewX: skew, duration: 0.2, overwrite: "auto" });
                gsap.to(rowRight, { skewX: -skew, duration: 0.2, overwrite: "auto" });
                resetVelocity.restart(true);
              },
            });
          }

          // 6. Expertise SplitText + Row Reveals
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

            tl.from(row, {
              autoAlpha: 0,
              y: 36,
              duration: 0.6,
              ease: "power3.out",
            });

            if (titleSplit) {
              tl.from(
                titleSplit.lines,
                {
                  yPercent: 100,
                  autoAlpha: 0,
                  duration: 0.55,
                  stagger: 0.08,
                  ease: "power3.out",
                },
                "-=0.4",
              );
            }
          });

          // 7. Accordion & Contact ScrollTrigger Staggers
          gsap.from(".faq-item", {
            autoAlpha: 0,
            y: 24,
            duration: 0.5,
            stagger: 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".accordion-section",
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

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
        <Hero onEnterDojo={() => navigateTo("#work")} />
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
