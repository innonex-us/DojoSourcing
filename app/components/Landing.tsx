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
import { Preloader } from "./Preloader";
import { Hero } from "./Hero";
import { Journey } from "./Journey";
import { Experience } from "./Experience";
import { Estimator, type EstimatePayload } from "./Estimator";
import { Accordion } from "./Accordion";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { Fabs } from "./Fabs";
import { KineticCursor } from "./KineticCursor";
import { useTheme } from "./useTheme";
import { DEFAULT_COLORWAY_LABEL } from "./designStudioData";

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
  { selector: "#experience", label: "03 // BRANDS" },
  { selector: "#estimator", label: "04 // ESTIMATOR" },
  { selector: "#friction", label: "05 // FAQ" },
  { selector: "#contact", label: "06 // QUOTE" },
];

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const { theme, accent, setTheme, setAccent } = useTheme();
  const [activeSection, setActiveSection] = useState("01 // DESIGN");
  const [selectedColorway, setSelectedColorway] = useState(
    DEFAULT_COLORWAY_LABEL,
  );
  const [estimatePrefill, setEstimatePrefill] =
    useState<EstimatePayload | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
                  text: "DOJO DESIGN & SOURCING · BANGLADESH · GLOBAL APPAREL SOLUTION",
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
            scale: 1.08,
            opacity: 0.35,
            ease: "none",
            scrollTrigger: {
              trigger: ".hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });

          // 4. Brands & Global Hubs Velocity-Reactive Dual Marquee
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

          // 6. FAQ Accordion & Contact ScrollTrigger Entrances
          gsap.from(".faq-item", {
            y: 20,
            duration: 0.45,
            stagger: 0.07,
            ease: "power2.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".accordion-section",
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });

          gsap.from(".contact > div > *", {
            y: 26,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: {
              trigger: ".contact",
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
      });

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

  return (
    <div ref={root} className="relative min-h-svh bg-background text-foreground">
      <Preloader />
      <KineticCursor />

      <Header activeSection={activeSection} mode="home" onNavigate={navigateTo} />
      <main>
        <Hero onEnterDojo={() => navigateTo("#journey")} />
        <Journey
          theme={theme}
          accent={accent}
          onColorwayChange={setSelectedColorway}
        />
        <Experience />
        <Estimator
          selectedColorway={selectedColorway}
          onLockEstimate={(payload) => {
            setEstimatePrefill(payload);
            navigateTo("#contact");
          }}
        />
        <Accordion />
        <Contact
          key={estimatePrefill?.summary ?? "default"}
          estimatePrefill={estimatePrefill}
        />
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
