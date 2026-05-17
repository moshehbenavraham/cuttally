import { useEffect, useState, useCallback } from "react";

/**
 * Hand-rolled theme hook for CommCalc (no next-themes; TanStack Start + SSR).
 *
 * Modes:
 *   - "light"  → forces light palette
 *   - "dark"   → forces dark palette
 *   - "system" → follows prefers-color-scheme, with a live listener
 *
 * Persistence: localStorage key STORAGE_KEY ('commcalc-theme').
 * Side effects: toggles `.dark` on <html> and sets documentElement.style.colorScheme
 * so native scrollbars and form controls track the theme.
 *
 * The inline anti-FOUC bootstrap script (`themeBootstrapScript`, exported below)
 * is shipped in <head> via __root.tsx — it runs synchronously before paint,
 * reading localStorage→matchMedia→light, and resolves to the SAME initial
 * theme this hook does, so there's no hydration mismatch flash.
 */

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const STORAGE_KEY = "commcalc-theme";

function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark" || v === "system";
}

/**
 * Inline bootstrap source — embed via:
 *   <script>{themeBootstrapScript}</script>
 *
 * Kept here (not in __root.tsx) so the hook and the bootstrap share a single
 * source of truth for theme resolution. If you change the localStorage key
 * or the resolver behavior, this script and useTheme stay in lock-step.
 */
export const themeBootstrapScript = `(function(){try{var k='${STORAGE_KEY}';var s=localStorage.getItem(k);var t=(s==='light'||s==='dark'||s==='system')?s:'system';var d=t==='dark'||(t==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d){r.classList.add('dark');r.style.colorScheme='dark';}else{r.classList.remove('dark');r.style.colorScheme='light';}}catch(e){}})();`;

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return systemPrefersDark() ? "dark" : "light";
  return theme;
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(v) ? v : "system";
  } catch {
    return "system";
  }
}

export interface UseThemeReturn {
  /** User's selected mode: "light" | "dark" | "system". */
  theme: Theme;
  /** Resolved effective palette: "light" | "dark". */
  resolvedTheme: ResolvedTheme;
  /** Update the active mode and persist it. */
  setTheme: (next: Theme) => void;
  /** Convenience: rotate light → dark → system → light. */
  cycleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  // Initial values match the bootstrap script's resolution so SSR/CSR agree.
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(readStoredTheme()),
  );

  // Apply theme to <html> and persist whenever it changes.
  useEffect(() => {
    const next = resolveTheme(theme);
    setResolvedTheme(next);
    applyResolvedTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable (private mode, etc.) — best effort only.
    }
  }, [theme]);

  // In "system" mode, subscribe to OS-level theme changes so the page tracks
  // a runtime toggle (e.g. macOS switching to dark at sundown).
  useEffect(() => {
    if (theme !== "system") return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const next: ResolvedTheme = mql.matches ? "dark" : "light";
      setResolvedTheme(next);
      applyResolvedTheme(next);
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  // Cross-tab sync — if another tab updates the stored theme, follow it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next = isTheme(e.newValue) ? e.newValue : "system";
      setThemeState(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    setThemeState((curr) =>
      curr === "light" ? "dark" : curr === "dark" ? "system" : "light",
    );
  }, []);

  return { theme, resolvedTheme, setTheme, cycleTheme };
}
