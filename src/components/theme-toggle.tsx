import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const NEXT_LABEL: Record<Theme, string> = {
  light: "Switch to dark theme",
  dark: "Switch to system theme",
  system: "Switch to light theme",
};

interface ThemeToggleProps {
  className?: string;
  /** When true, render only the icon (no label). Defaults to true. */
  iconOnly?: boolean;
}

/**
 * Three-state theme toggle: light → dark → system → light.
 *
 * The icon reflects the *currently active* mode (Sun for light, Moon for dark,
 * Monitor for system) and the aria-label describes the *next* state, so screen
 * readers announce the action.
 */
export function ThemeToggle({ className, iconOnly = true }: ThemeToggleProps) {
  const { theme, cycleTheme } = useTheme();

  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label = theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={NEXT_LABEL[theme]}
      title={NEXT_LABEL[theme]}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md border border-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        iconOnly
          ? "h-9 w-9 sm:h-8 sm:w-8 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"
          : "h-9 px-3 text-sm",
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {!iconOnly && <span>{label}</span>}
    </button>
  );
}
