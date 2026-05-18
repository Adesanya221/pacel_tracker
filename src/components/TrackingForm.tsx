import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Package } from "lucide-react";
import { isValidTrackingNumber } from "@/lib/tracking";

export function TrackingForm({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!isValidTrackingNumber(v)) {
      setErr("Tracking number must be exactly 16 digits.");
      return;
    }
    setErr(null);
    navigate({ to: "/track/$id", params: { id: v } });
  }

  return (
    <form onSubmit={submit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-card p-2 shadow-[var(--shadow-card)] border border-border">
        <div className="flex items-center gap-3 flex-1 px-4">
          <Package className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            value={value}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
              setValue(digits);
              if (err) setErr(null);
            }}
            placeholder="Enter 16-digit tracking number"
            inputMode="numeric"
            maxLength={16}
            className="w-full bg-transparent py-3 outline-none text-foreground placeholder:text-muted-foreground font-mono tracking-wider"
            aria-label="Tracking number"
          />
          <span className="text-xs text-muted-foreground font-mono shrink-0">{value.length}/16</span>
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Search className="h-4 w-4" />
          Track
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-destructive text-center">{err}</p>}
    </form>
  );
}
