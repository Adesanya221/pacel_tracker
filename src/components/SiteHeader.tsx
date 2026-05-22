import { Link } from "@tanstack/react-router";
import { Package2, Settings, Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type Theme } from "@/lib/theme";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();

  function cycleTheme() {
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  }

  const ThemeIcon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 h-14 sm:h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-base sm:text-lg">
          <div
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Package2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <span>
            Parcel<span className="text-secondary">Trace</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link
            to="/"
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
          >
            Track
          </Link>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Admin</span>
          </Link>
          <button
            onClick={cycleTheme}
            className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
            aria-label={`Theme: ${theme}`}
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
