import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Plus,
  Menu,
  X,
  Package2,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useTheme, type Theme } from "@/lib/theme";

// ============================================================
// ADMIN PASSWORD — Change this value to update the login password
// ============================================================
const ADMIN_PASSWORD = "Adetito17$";
// ============================================================

export type AdminView = "dashboard" | "shipments" | "create";

const NAV_ITEMS: { key: AdminView; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "shipments", label: "Shipments", icon: Package },
  { key: "create", label: "New Shipment", icon: Plus },
];

export function AdminLayout({
  activeView,
  onNavigate,
  children,
}: {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("admin_auth") === "true";
  });

  function handleLogin() {
    sessionStorage.setItem("admin_auth", "true");
    setAuthenticated(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <AdminLoginGate onSuccess={handleLogin} />;
  }

  function handleNav(view: AdminView) {
    onNavigate(view);
    setMobileOpen(false);
  }

  return (
    <>
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card z-30">
        <SidebarContent activeView={activeView} onNavigate={handleNav} />
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 backdrop-blur px-4 h-14 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg border border-border p-2 hover:bg-accent/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-base">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Package2 className="h-4 w-4" />
            </div>
            <span>Admin Panel</span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Mobile Sheet Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent activeView={activeView} onNavigate={handleNav} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
    </>
  );
}

function AdminLoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);

    // Small delay to feel natural
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        toast.success("Access granted");
        onSuccess();
      } else {
        setError(true);
        toast.error("Incorrect password");
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-[var(--shadow-card)]">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Lock className="h-7 w-7" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter the admin password to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(false);
                  }}
                  placeholder="Enter admin password"
                  autoFocus
                  className={`w-full rounded-xl border bg-background pl-3 pr-10 py-2.5 text-sm outline-none transition-colors ${
                    error ? "border-destructive" : "border-border focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <p className="text-xs text-destructive mt-1.5">Incorrect password. Please try again.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50 transition-opacity"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {loading ? "Verifying…" : "Unlock Admin"}
            </button>
          </form>

          {/* Back link */}
          <div className="mt-5 text-center">
            <a
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to main site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({
  activeView,
  onNavigate,
}: {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-border shrink-0">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Package2 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">
            Parcel<span className="text-secondary">Trace</span>
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight">Admin Panel</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              }`}
              style={active ? { background: "var(--gradient-primary)" } : undefined}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border shrink-0 space-y-1">
        <ThemeToggle showLabel />
        <Link
          to="/"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Site
        </Link>
        <button
          onClick={() => {
            sessionStorage.removeItem("admin_auth");
            window.location.reload();
          }}
          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}

function ThemeToggle({ showLabel }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme();

  function cycleTheme() {
    const order: Theme[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  }

  const ThemeIcon = theme === "dark" ? Moon : theme === "system" ? Monitor : Sun;
  const label = theme === "dark" ? "Dark" : theme === "system" ? "System" : "Light";

  if (showLabel) {
    return (
      <button
        onClick={cycleTheme}
        className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
        aria-label={`Theme: ${theme}`}
      >
        <ThemeIcon className="h-4 w-4" />
        {label} Mode
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className="inline-flex items-center justify-center rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors"
      aria-label={`Theme: ${theme}`}
      title={`Theme: ${theme}`}
    >
      <ThemeIcon className="h-4 w-4" />
    </button>
  );
}
