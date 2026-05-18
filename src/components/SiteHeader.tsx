import { Link } from "@tanstack/react-router";
import { Package2, Settings } from "lucide-react";

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
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Track</Link>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-4 w-4" /> Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
