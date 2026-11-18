"use client";

import { FormEvent, useRef, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  FileCheck2,
  Globe,
  Mail,
  Trash2,
  UploadCloud,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { interestChips } from "./data";
import type { EstimatePayload } from "./Estimator";

gsap.registerPlugin(useGSAP);

type QuoteReceipt = {
  referenceId: string;
  company: string;
  techPackName: string | null;
};

type SocialIconProps = { className?: string };

function LinkedInIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.99 2.25H8.08l4.253 5.622L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "LinkedIn", Icon: LinkedInIcon },
  { label: "X", Icon: XIcon },
  { label: "Instagram", Icon: InstagramIcon },
] as const;

export function Contact({
  estimatePrefill,
}: {
  estimatePrefill?: EstimatePayload | null;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<string[]>(
    () => estimatePrefill?.interests ?? ["COMPLETE END-TO-END"],
  );
  const [message, setMessage] = useState(
    () => estimatePrefill?.summary ?? "",
  );
  const [techPack, setTechPack] = useState<{ name: string; size: number } | null>(
    null,
  );
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<QuoteReceipt | null>(null);

  const { contextSafe } = useGSAP({ scope: sectionRef });

  const handleMagneticMove = contextSafe(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.28;
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
      gsap.to(btn, { x: dx, y: dy, duration: 0.35, ease: "power3.out" });
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

  function acceptFile(file: File | undefined) {
    if (!file) return;
    setTechPack({ name: file.name, size: file.size });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      company: String(formData.get("company") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      interests: selected,
      message,
      techPackName: techPack?.name,
      techPackSize: techPack?.size,
    };

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        referenceId?: string;
        summary?: { company: string; techPackName: string | null };
      };

      if (!res.ok || !json.ok || !json.referenceId) {
        setError(json.error ?? "Unable to submit quote request.");
      } else {
        setReceipt({
          referenceId: json.referenceId,
          company: json.summary?.company ?? "Your Brand",
          techPackName: json.summary?.techPackName ?? null,
        });
      }
    } catch {
      setError("Network error while sending quote request.");
    } finally {
      setSubmitting(false);
    }
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
              Turn your vision into shipped apparel.
            </h2>

            <div className="my-8 h-px w-full bg-border" />

            <div className="space-y-4">
              <a
                href="mailto:sourcing@dojosourcing.com"
                className="focus-ring group flex items-center gap-4 text-sm text-foreground/85 transition-colors hover:text-brand"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-brand transition-colors group-hover:border-brand">
                  <Mail className="h-4 w-4" aria-hidden />
                </span>
                <span>sourcing@dojosourcing.com</span>
              </a>
              <div className="flex items-center gap-4 text-sm text-foreground/85">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-brand">
                  <Globe className="h-4 w-4" aria-hidden />
                </span>
                <span>Design · Factory · Truck · Global Freight</span>
              </div>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-3">
            {SOCIAL_LINKS.map(({ label, Icon }) => (
              <a
                key={label}
                href="#contact"
                aria-label={label}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-brand hover:text-brand"
              >
                <Icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>
        </div>

        {/* Right Column: Quote Form + Tech-Pack Upload */}
        <div className="lg:col-span-7">
          <p className="text-2xl font-bold uppercase tracking-wide text-brand md:text-4xl">
            Let&apos;s Discuss.
          </p>

          {receipt ? (
            <div
              role="status"
              className="mt-10 border border-brand/45 bg-brand/10 p-8 text-chrome"
            >
              <p className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.25em] text-brand">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                <span>Quote Reference · {receipt.referenceId}</span>
              </p>
              <p className="mt-2 text-xl font-bold uppercase tracking-wide">
                Production brief received for {receipt.company}.
              </p>
              <p className="mt-3 text-sm text-foreground/80">
                {receipt.techPackName
                  ? `Attached tech pack: ${receipt.techPackName}. `
                  : ""}
                Our sourcing and merchandising leads will respond within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setReceipt(null)}
                className="focus-ring mt-6 rounded-full border border-border px-5 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-chrome transition-colors hover:border-brand hover:text-brand"
              >
                Submit Another Brief
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-10 space-y-8" noValidate>
              <div className="grid gap-8 md:grid-cols-2">
                <Field label="Full Name *" name="name" autoComplete="name" required />
                <Field label="Brand / Company" name="company" autoComplete="organization" />
                <Field label="Email *" name="email" type="email" autoComplete="email" required />
                <Field label="Phone / WhatsApp" name="phone" type="tel" autoComplete="tel" />
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

              {/* Tech Pack / Sketch Drag-and-Drop Upload */}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted">
                  Attach Tech Pack or Sketch (Optional)
                </p>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(true);
                  }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    acceptFile(e.dataTransfer.files?.[0]);
                  }}
                  className={`flex items-center justify-between gap-4 border border-dashed px-5 py-4 transition-colors ${
                    isDraggingFile
                      ? "border-brand bg-brand/10"
                      : "border-border bg-surface-deep/40 hover:border-brand/60"
                  }`}
                >
                  <input
                    id="techpack-file"
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.ai,.zip"
                    className="sr-only"
                    onChange={(e) => acceptFile(e.target.files?.[0])}
                  />
                  <label
                    htmlFor="techpack-file"
                    className="focus-ring flex flex-1 cursor-pointer items-center justify-between gap-4 text-xs text-foreground/80"
                  >
                    {techPack ? (
                      <span className="inline-flex items-center gap-2 font-mono font-bold text-brand">
                        <FileCheck2 className="h-4 w-4" aria-hidden />
                        <span>
                          {techPack.name} ({Math.max(1, Math.round(techPack.size / 1024))} KB)
                        </span>
                      </span>
                    ) : (
                      <span>
                        Drop <span className="font-semibold text-chrome">PDF, PNG, AI, or ZIP</span> here or click to browse
                      </span>
                    )}
                    {!techPack ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-brand">
                        <UploadCloud className="h-3.5 w-3.5" aria-hidden />
                        <span>Upload</span>
                      </span>
                    ) : null}
                  </label>
                  {techPack ? (
                    <button
                      type="button"
                      onClick={() => setTechPack(null)}
                      aria-label="Remove attached file"
                      className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted hover:text-brand"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      <span>Remove</span>
                    </button>
                  ) : null}
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-[11px] font-bold uppercase tracking-[0.22em] text-muted"
                >
                  Project Details *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="focus-ring w-full resize-y border-b border-border bg-transparent py-3 text-sm text-chrome placeholder:text-muted/60 outline-none transition-colors focus:border-brand"
                  placeholder="Tell us garment type, target quantity, and destination port…"
                />
              </div>

              {error ? (
                <p role="alert" className="text-xs font-semibold text-brand">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
                data-cursor="magnet"
                className="focus-ring inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-opacity hover:opacity-95 disabled:opacity-60"
              >
                <span>{submitting ? "Sending..." : "Send Quote Brief"}</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden />
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
  autoComplete,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
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
        autoComplete={autoComplete}
        required={required}
        className="focus-ring w-full border-b border-border bg-transparent py-2.5 text-sm text-chrome placeholder:text-muted/60 outline-none transition-colors focus:border-brand"
      />
    </div>
  );
}
