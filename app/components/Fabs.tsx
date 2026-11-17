"use client";

import { useState } from "react";
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
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-brand">
              Theme Control
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close theme control"
              className="focus-ring text-xs font-bold text-muted hover:text-chrome"
            >
              ✕
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
                  className={`focus-ring rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                    theme === "dark"
                      ? "border-brand bg-brand text-white"
                      : "border-border text-muted hover:text-chrome"
                  }`}
                >
                  Dark Navy
                </button>
                <button
                  type="button"
                  onClick={() => onSetTheme("light")}
                  className={`focus-ring rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
                    theme === "light"
                      ? "border-brand bg-brand text-white"
                      : "border-border text-muted hover:text-chrome"
                  }`}
                >
                  Light Blue
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

      {/* Theme Control Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open theme control"
        aria-expanded={open}
        className="focus-ring fixed bottom-6 right-20 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-chrome shadow-lg transition-colors hover:border-brand hover:text-brand"
      >
        <PaletteIcon />
      </button>

      {/* Direct Quote / Chat FAB */}
      <a
        href="#contact"
        aria-label="Contact Dojo Sourcing"
        className="focus-ring chat-fab-pulse fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-fab-chat bg-surface text-chrome shadow-lg transition-transform hover:scale-105"
      >
        <ChatIcon />
      </a>
    </>
  );
}

function PaletteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9.5" cy="9.5" r="1.4" fill="#dc2626" />
      <circle cx="14.5" cy="9.5" r="1.4" fill="#2563eb" />
      <circle cx="12" cy="14.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 18.5 4 22l3.8-1.4A9 9 0 1 0 5 18.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
