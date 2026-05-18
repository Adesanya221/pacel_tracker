import { Check, Package, Truck, MapPin, Home, Boxes } from "lucide-react";
import type { TimelineStage } from "@/lib/tracking";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  processing: Boxes,
  picked_up: Package,
  in_transit: Truck,
  out_for_delivery: MapPin,
  delivered: Home,
};

export function Timeline({ stages }: { stages: TimelineStage[] }) {
  return (
    <ol className="relative">
      {stages.map((stage, i) => {
        const Icon = ICONS[stage.key] ?? Package;
        const isComplete = stage.status === "complete";
        const isCurrent = stage.status === "current";
        const isLast = i === stages.length - 1;
        return (
          <li key={stage.key} className="relative flex gap-4 pb-8 last:pb-0">
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                  stage.status !== "pending" ? "bg-success" : "bg-border"
                }`}
              />
            )}
            <div className="relative z-10 shrink-0">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                  isComplete
                    ? "bg-success border-success text-success-foreground"
                    : isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              {isCurrent && (
                <span className="absolute inset-0 rounded-full border-2 border-primary opacity-60 animate-ping" />
              )}
            </div>
            <div className={`flex-1 pt-1.5 ${stage.status === "pending" ? "opacity-50" : ""}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className={`font-semibold ${isCurrent ? "text-primary" : "text-foreground"}`}>
                  {stage.label}
                </h3>
                <span className="text-xs font-mono text-muted-foreground">{stage.timestamp}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{stage.description}</p>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {stage.location}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
