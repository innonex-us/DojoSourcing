"use client";

import { useRef, useState } from "react";
import { Minus, Plus, ShieldCheck } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { faqs } from "./data";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

export function Accordion() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(0);

  const { contextSafe } = useGSAP({ scope: sectionRef });

  const handleToggle = contextSafe(
    (e: React.MouseEvent<HTMLButtonElement>, index: number, title: string) => {
      const next = open === index ? -1 : index;
      setOpen(next);
      if (next !== -1) {
        const target = e.currentTarget.querySelector(
          `[data-faq-title="${index}"]`,
        );
        if (target) {
          gsap.to(target, {
            duration: 0.45,
            scrambleText: {
              text: title,
              chars: "XO/\\01",
              speed: 0.6,
            },
          });
        }
      }
    },
  );

  return (
    <section
      id="friction"
      ref={sectionRef}
      className="accordion-section grid-bg relative px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1100px]">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
          <ShieldCheck className="h-4 w-4" aria-hidden />
          <span>Friction Points</span>
        </p>
        <h2 className="mt-4 max-w-4xl text-3xl font-semibold uppercase leading-[1.1] tracking-wide text-chrome md:text-5xl">
          What&apos;s holding your product back from where it should be?
        </h2>

        <ul className="mt-14 divide-y divide-border border-y border-border">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.num} className="faq-item">
                <button
                  type="button"
                  id={`faq-question-${item.num}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.num}`}
                  onClick={(e) => handleToggle(e, i, item.title)}
                  data-cursor="magnet"
                  className="focus-ring flex w-full items-center gap-4 py-6 text-left md:gap-8 md:py-8"
                >
                  <span className="shrink-0 font-mono text-sm font-bold tracking-[0.2em] text-brand">
                    {item.num}
                  </span>
                  <span
                    data-faq-title={i}
                    className="flex-1 text-lg font-bold uppercase tracking-wide text-chrome md:text-2xl"
                  >
                    {item.title}
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${
                      isOpen
                        ? "border-brand text-brand"
                        : "border-border text-muted hover:border-chrome/40 hover:text-chrome"
                    }`}
                  >
                    {isOpen ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </span>
                </button>
                <div
                  id={`faq-answer-${item.num}`}
                  role="region"
                  aria-labelledby={`faq-question-${item.num}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-8 pl-9 pr-12 text-sm leading-relaxed text-foreground/80 md:pl-14 md:text-base">
                      {item.body}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
