"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ThemeMode = "dark" | "light";
export type AccentMode = "red" | "blue";

export type ThemePreferences = {
  theme: ThemeMode;
  accent: AccentMode;
};

const STORAGE_THEME = "dojo-sourcing-theme";
const STORAGE_ACCENT = "dojo-sourcing-accent";
const listeners = new Set<() => void>();

let cachedSnapshot: ThemePreferences = { theme: "dark", accent: "red" };

function readSnapshot(): ThemePreferences {
  if (typeof document === "undefined") return cachedSnapshot;

  let theme: ThemeMode =
    document.documentElement.getAttribute("data-theme") === "light"
      ? "light"
      : "dark";
  let accent: AccentMode =
    document.documentElement.getAttribute("data-accent") === "blue"
      ? "blue"
      : "red";

  try {
    const savedTheme = window.localStorage.getItem(STORAGE_THEME);
    if (savedTheme === "light" || savedTheme === "dark") {
      theme = savedTheme;
      if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
    }
    const savedAccent = window.localStorage.getItem(STORAGE_ACCENT);
    if (savedAccent === "blue" || savedAccent === "red") {
      accent = savedAccent;
      if (accent === "blue") {
        document.documentElement.setAttribute("data-accent", "blue");
      } else {
        document.documentElement.removeAttribute("data-accent");
      }
    }
  } catch {
    // ignore storage errors
  }

  if (cachedSnapshot.theme !== theme || cachedSnapshot.accent !== accent) {
    cachedSnapshot = { theme, accent };
  }
  return cachedSnapshot;
}

const SERVER_SNAPSHOT: ThemePreferences = { theme: "dark", accent: "red" };

function getServerSnapshot(): ThemePreferences {
  return SERVER_SNAPSHOT;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function applyPrefs(nextTheme: ThemeMode, nextAccent: AccentMode) {
  if (nextTheme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }

  if (nextAccent === "blue") {
    document.documentElement.setAttribute("data-accent", "blue");
  } else {
    document.documentElement.removeAttribute("data-accent");
  }

  try {
    window.localStorage.setItem(STORAGE_THEME, nextTheme);
    window.localStorage.setItem(STORAGE_ACCENT, nextAccent);
  } catch {
    // ignore storage errors
  }

  cachedSnapshot = { theme: nextTheme, accent: nextAccent };
  listeners.forEach((l) => l());
}

export function useTheme() {
  const prefs = useSyncExternalStore(subscribe, readSnapshot, getServerSnapshot);

  const setTheme = useCallback(
    (nextTheme: ThemeMode) => {
      applyPrefs(nextTheme, readSnapshot().accent);
    },
    [],
  );

  const toggleTheme = useCallback(() => {
    const cur = readSnapshot();
    applyPrefs(cur.theme === "dark" ? "light" : "dark", cur.accent);
  }, []);

  const setAccent = useCallback(
    (nextAccent: AccentMode) => {
      applyPrefs(readSnapshot().theme, nextAccent);
    },
    [],
  );

  return {
    theme: prefs.theme,
    accent: prefs.accent,
    setTheme,
    toggleTheme,
    setAccent,
  };
}
