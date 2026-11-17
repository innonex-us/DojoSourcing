"use client";

import { useState } from "react";
import { faqs } from "./data";

export function Accordion() {
  const [open, setOpen] = useState(0);

  return (
    <section
      id="friction"
      className="accordion-section grid-bg relative px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto max-w-[1100px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
          • Friction Points
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
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="focus-ring flex w-full items-center gap-4 py-6 text-left md:gap-8 md:py-8"
                >
                  <span className="shrink-0 text-sm font-bold tracking-[0.2em] text-brand">
                    {item.num}
                  </span>
                  <span className="flex-1 text-lg font-bold uppercase tracking-wide text-chrome md:text-2xl">
                    {item.title}
                  </span>
                  <span
                    aria-hidden
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-base font-medium transition-colors duration-300 ${
                      isOpen
                        ? "border-brand text-brand"
                        : "border-border text-muted hover:border-chrome/40 hover:text-chrome"
                    }`}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div
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
