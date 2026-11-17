"use client";

import { useState } from "react";
import { Moon, Palette, SlidersHorizontal, Sun, X } from "lucide-react";
import type { AccentMode, ThemeMode } from "./useTheme";

type FabsProps = {
  theme: ThemeMode;
  accent: AccentMode;
  onSetTheme: (theme: ThemeMode) => void;
  onSetAccent: (accent: AccentMode) => void;
};

export function Fabs({ theme, accent, onSetTheme, onSetAccent }: FabsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Theme Control Panel */}
      {open ? (
        <div
          role="dialog"
          aria-label="Theme control"
          className="fixed bottom-20 right-6 z-50 w-72 border border-border bg-surface p-5 shadow-2xl backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              <Palette className="h-3.5 w-3.5" aria-hidden />
              <span>Theme Control</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close theme control"
              className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-chrome"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                Surface Mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSetTheme("dark")}
                  className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                    theme === "dark"
                      ? "border-brand bg-brand text-white"
                      : "border-border text-muted hover:text-chrome"
                  }`}
                >
                  <Moon className="h-3 w-3" aria-hidden />
                  <span>Dark Navy</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetTheme("light")}
                  className={`focus-ring inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                    theme === "light"
                      ? "border-brand bg-brand text-white"
                      : "border-border text-muted hover:text-chrome"
                  }`}
                >
                  <Sun className="h-3 w-3" aria-hidden />
                  <span>Light Blue</span>
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                Primary Brand Accent
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onSetAccent("red")}
                  className={`focus-ring flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                    accent === "red"
                      ? "border-[#dc2626] bg-[#dc2626]/15 text-chrome"
                      : "border-border text-muted hover:text-chrome"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
                  <span>Red</span>
                </button>
                <button
                  type="button"
                  onClick={() => onSetAccent("blue")}
                  className={`focus-ring flex items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                    accent === "blue"
                      ? "border-[#2563eb] bg-[#2563eb]/15 text-chrome"
                      : "border-border text-muted hover:text-chrome"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                  <span>Corp Blue</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Theme Control Trigger (Chat Box Removed) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open theme control"
        aria-expanded={open}
        className="focus-ring fixed bottom-6 right-6 z-50 flex h-12 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[11px] font-bold uppercase tracking-[0.16em] text-chrome shadow-lg transition-colors hover:border-brand hover:text-brand"
      >
        <SlidersHorizontal className="h-4 w-4 text-brand" aria-hidden />
        <span className="hidden sm:inline">Theme</span>
      </button>
    </>
  );
}
