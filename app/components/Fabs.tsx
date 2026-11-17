"use client";

type FabsProps = {
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export function Fabs({ theme, onToggleTheme }: FabsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        className="focus-ring fixed bottom-6 right-20 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-chrome shadow-lg transition-colors hover:border-brand hover:text-brand"
      >
        {theme === "dark" ? (
          <SunIcon />
        ) : (
          <MoonIcon />
        )}
      </button>

      <a
        href="#contact"
        aria-label="Chat with Dojo"
        className="focus-ring chat-fab-pulse fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border-2 border-fab-chat bg-surface text-chrome shadow-lg transition-transform hover:scale-105"
      >
        <ChatIcon />
      </a>
    </>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
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
