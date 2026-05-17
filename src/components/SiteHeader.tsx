import { Link } from "@tanstack/react-router";
import { Package2 } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Package2 className="h-5 w-5" />
          </div>
          <span>
            Parcel<span className="text-secondary">Trace</span>
          </span>
        </Link>
        <nav className="text-sm text-muted-foreground hidden sm:block">
          <span className="font-mono">Demo Tracking Portal</span>
        </nav>
      </div>
    </header>
  );
}