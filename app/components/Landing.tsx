"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Projects } from "./Projects";
import { Experience } from "./Experience";
import { Expertise } from "./Expertise";
import { Accordion } from "./Accordion";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { Fabs } from "./Fabs";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useGSAP(
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
          const stageWords = gsap.utils.toArray<HTMLElement>(".stage-word");
          const stageCards = gsap.utils.toArray<HTMLElement>(".showcase-card");

          if (!motion) {
            gsap.set(
              [
                ".site-logo",
                ".site-pill",
                ".site-cta",
                ".hero-scroll",
                ".showcase-card",
                ".experience",
                ".expertise-row",
                ".faq-item",
                ".contact",
              ],
              { clearProps: "all", autoAlpha: 1 },
            );
            stageWords.forEach((el, i) => {
              gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, y: 0 });
            });
            return;
          }

          // 1. Header & Hero Intro
          const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
          intro
            .from(".site-logo", { autoAlpha: 0, y: -12, duration: 0.45 })
            .from(".site-pill", { autoAlpha: 0, y: -10, duration: 0.4 }, "-=0.25")
            .from(".site-cta", { autoAlpha: 0, y: -10, duration: 0.4 }, "-=0.3")
            .from(".hero-scroll", { autoAlpha: 0, y: 12, duration: 0.45 }, "-=0.2");

          // Subtle Hero Video Scrub on Scroll
          gsap.to(".hero-video", {
            scale: 1.08,
            opacity: 0.45,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });

          // 2. Desktop Interactive Cursor Glow (60fps quickTo)
          let onPointerMove: ((e: PointerEvent) => void) | null = null;
          if (desktop && glowRef.current) {
            const xTo = gsap.quickTo(glowRef.current, "x", {
              duration: 0.35,
              ease: "power3.out",
            });
            const yTo = gsap.quickTo(glowRef.current, "y", {
              duration: 0.35,
              ease: "power3.out",
            });
            onPointerMove = (e: PointerEvent) => {
              xTo(e.clientX - 150);
              yTo(e.clientY - 150);
            };
            window.addEventListener("pointermove", onPointerMove, {
              passive: true,
            });
          }

          // 3. Pinned Radial Showcase Stage (Desktop)
          if (desktop && stageCards.length > 0) {
            stageCards.forEach((card, i) => {
              const baseRot = Number(card.dataset.rotate ?? 0);
              const angle = (i / stageCards.length) * Math.PI * 2;
              const startDist = 140 + (i % 3) * 60;
              gsap.set(card, {
                rotation: baseRot * 1.35,
                scale: 0.72,
                autoAlpha: 0.2,
                x: Math.cos(angle) * -startDist * 0.45,
                y: Math.sin(angle) * -startDist * 0.45,
              });
            });

            gsap.set(stageWords, { autoAlpha: 0, y: 28 });
            if (stageWords[0]) {
              gsap.set(stageWords[0], { autoAlpha: 1, y: 0 });
            }

            const stageTl = gsap.timeline({
              scrollTrigger: {
                trigger: ".showcase-stage",
                start: "top top",
                end: "+=2600",
                pin: true,
                scrub: 1,
                anticipatePin: 1,
              },
            });

            // Phase 1: Cards bloom outward & settle into their editorial collage
            stageCards.forEach((card, i) => {
              const baseRot = Number(card.dataset.rotate ?? 0);
              const drift = (i % 2 === 0 ? 1 : -1) * (18 + (i % 4) * 10);
              stageTl.to(
                card,
                {
                  x: drift,
                  y: -drift * 0.7,
                  rotation: baseRot,
                  scale: 1,
                  autoAlpha: 1,
                  duration: 1,
                  ease: "power2.out",
                },
                0.03 * (i % 5),
              );
            });

            // Phase 2: Cycle central typography PRACTICE -> BUILD -> SHIP
            if (stageWords.length >= 3) {
              stageTl
                .to(
                  stageWords[0],
                  { autoAlpha: 0, y: -32, duration: 0.35, ease: "power2.in" },
                  0.45,
                )
                .fromTo(
                  stageWords[1],
                  { autoAlpha: 0, y: 32 },
                  { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
                  0.65,
                )
                .to(
                  stageWords[1],
                  { autoAlpha: 0, y: -32, duration: 0.35, ease: "power2.in" },
                  1.25,
                )
                .fromTo(
                  stageWords[2],
                  { autoAlpha: 0, y: 32 },
                  { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" },
                  1.45,
                );
            }

            // Phase 3: Subtle parallax drift at end of pinned runway
            stageCards.forEach((card, i) => {
              const baseRot = Number(card.dataset.rotate ?? 0);
              const outDir = i % 2 === 0 ? 1 : -1;
              stageTl.to(
                card,
                {
                  y: outDir * (45 + (i % 3) * 20),
                  rotation: baseRot + outDir * 6,
                  duration: 0.8,
                  ease: "none",
                },
                1.2,
              );
            });
          }

          // 4. Global Experience Infinite Marquee
          const marqueeTrack = document.querySelector<HTMLElement>(".marquee-track");
          const marqueeWrapper =
            document.querySelector<HTMLElement>(".marquee-wrapper");
          let marqueeTween: gsap.core.Tween | null = null;
          let onMarqueeEnter: (() => void) | null = null;
          let onMarqueeLeave: (() => void) | null = null;

          if (marqueeTrack) {
            marqueeTween = gsap.to(marqueeTrack, {
              xPercent: -50,
              duration: 28,
              ease: "none",
              repeat: -1,
            });

            if (marqueeWrapper) {
              onMarqueeEnter = () => {
                gsap.to(marqueeTween, { timeScale: 0.25, duration: 0.4 });
              };
              onMarqueeLeave = () => {
                gsap.to(marqueeTween, { timeScale: 1, duration: 0.4 });
              };
              marqueeWrapper.addEventListener("mouseenter", onMarqueeEnter);
              marqueeWrapper.addEventListener("mouseleave", onMarqueeLeave);
            }
          }

          gsap.from(".experience > div:first-child > *", {
            autoAlpha: 0,
            y: 28,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".experience",
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          // 5. Areas of Expertise Staggered Row Reveals
          gsap.utils.toArray<HTMLElement>(".expertise-row").forEach((row) => {
            gsap.from(row.children, {
              autoAlpha: 0,
              y: 36,
              duration: 0.65,
              stagger: 0.14,
              ease: "power3.out",
              scrollTrigger: {
                trigger: row,
                start: "top 80%",
                toggleActions: "play none none reverse",
              },
            });
          });

          // 6. Accordion Rows
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

          // 7. Contact Columns
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
            if (onPointerMove) {
              window.removeEventListener("pointermove", onPointerMove);
            }
            if (marqueeWrapper && onMarqueeEnter && onMarqueeLeave) {
              marqueeWrapper.removeEventListener("mouseenter", onMarqueeEnter);
              marqueeWrapper.removeEventListener("mouseleave", onMarqueeLeave);
            }
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

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
      {/* Interactive Cursor Glow (desktop) */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-40 hidden h-[300px] w-[300px] rounded-full md:block"
        style={{
          background:
            "radial-gradient(circle, rgba(254, 65, 1, 0.16) 0%, rgba(254, 65, 1, 0) 70%)",
        }}
      />

      <Header />
      <main>
        <Hero />
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
