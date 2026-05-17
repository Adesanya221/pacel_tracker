import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, Package } from "lucide-react";

export function TrackingForm({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    navigate({ to: "/track/$id", params: { id: v } });
  }

  const samples = ["1Z999AA10123456784", "FX284763991", "TRK20260517DEMO"];

  return (
    <form onSubmit={submit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-2 rounded-2xl bg-card p-2 shadow-[var(--shadow-card)] border border-border">
        <div className="flex items-center gap-3 flex-1 px-4">
          <Package className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter tracking number"
            className="w-full bg-transparent py-3 outline-none text-foreground placeholder:text-muted-foreground"
            aria-label="Tracking number"
          />
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
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>Try:</span>
        {samples.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue(s)}
            className="rounded-full border border-border bg-card px-3 py-1 font-mono hover:border-primary hover:text-primary transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  );
}