"use client";

import { FormEvent, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { interestChips } from "./data";

gsap.registerPlugin(useGSAP);

export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<string[]>(["PRODUCT LAUNCH"]);
  const [sent, setSent] = useState(false);

  const { contextSafe } = useGSAP({ scope: sectionRef });

  const handleMagneticMove = contextSafe(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.28;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
      gsap.to(btn, {
        x: dx,
        y: dy,
        duration: 0.35,
        ease: "power3.out",
      });
    },
  );

  const handleMagneticLeave = contextSafe(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      gsap.to(e.currentTarget, {
        x: 0,
        y: 0,
        duration: 0.55,
        ease: "elastic.out(1, 0.4)",
      });
    },
  );

  function toggleChip(chip: string) {
    setSelected((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="contact relative border-t border-border px-5 py-24 md:px-8 md:py-32"
    >
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Studio Positioning & Direct Contact */}
        <div className="flex flex-col justify-between lg:col-span-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
              • Connect With Us!
            </p>
            <h2 className="mt-4 text-3xl font-bold uppercase leading-[1.08] tracking-wide text-chrome md:text-5xl">
              Turn your vision into an experience.
            </h2>

            <div className="my-8 h-px w-full bg-border" />

            <div className="space-y-4">
              <a
                href="mailto:hello@dojo.dev"
                className="focus-ring group flex items-center gap-4 text-sm text-foreground/85 transition-colors hover:text-brand"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-brand transition-colors group-hover:border-brand">
                  @
                </span>
                <span>hello@dojo.dev</span>
              </a>
              <div className="flex items-center gap-4 text-sm text-foreground/85">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-brand">
                  ↗
                </span>
                <span>Remote · Global Studio</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3">
            {[
              { label: "LinkedIn", short: "IN" },
              { label: "X", short: "X" },
              { label: "GitHub", short: "GH" },
            ].map((social) => (
              <a
                key={social.label}
                href="#contact"
                aria-label={social.label}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-border text-[10px] font-bold tracking-wider text-muted transition-colors hover:border-brand hover:text-brand"
              >
                {social.short}
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Minimalist Underline Form */}
        <div className="lg:col-span-7">
          <p className="text-2xl font-bold uppercase tracking-wide text-brand md:text-4xl">
            Let&apos;s Talk.
          </p>

          {sent ? (
            <div
              role="status"
              className="mt-10 border border-brand/40 bg-brand/10 p-8 text-chrome"
            >
              <p className="text-lg font-bold uppercase tracking-wide">
                Message staged.
              </p>
              <p className="mt-2 text-sm text-foreground/80">
                Thanks — this demo form doesn&apos;t send yet. Reach us at
                hello@dojo.dev.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-10 space-y-8" noValidate>
              <div className="grid gap-8 md:grid-cols-2">
                <Field label="Full Name" name="name" required />
                <Field label="Company Name" name="company" />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" />
              </div>

              <fieldset>
                <legend className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                  I&apos;m Interested In
                </legend>
                <div className="flex flex-wrap gap-2.5">
                  {interestChips.map((chip) => {
                    const on = selected.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => toggleChip(chip)}
                        aria-pressed={on}
                        className={`focus-ring rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
                          on
                            ? "border-brand bg-brand text-white"
                            : "border-border text-muted hover:border-chrome/40 hover:text-chrome"
                        }`}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-muted"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  required
                  className="focus-ring w-full resize-y border-b border-border bg-transparent py-3 text-sm text-chrome placeholder:text-muted/60 outline-none transition-colors focus:border-brand"
                  placeholder="Tell us what you’re building…"
                />
              </div>

              <button
                type="submit"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                data-cursor="magnet"
                className="focus-ring inline-flex items-center gap-3 rounded-full bg-brand px-8 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-95"
              >
                Send Message
                <span aria-hidden>↗</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.22em] text-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="focus-ring w-full border-b border-border bg-transparent py-2.5 text-sm text-chrome placeholder:text-muted/60 outline-none transition-colors focus:border-brand"
      />
    </div>
  );
}
