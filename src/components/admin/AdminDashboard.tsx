import { useQuery } from "@tanstack/react-query";
import { Package, Truck, CheckCircle2, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type Shipment, getCurrentStatus } from "@/lib/tracking";
import type { AdminView } from "./AdminLayout";

export function AdminDashboard({ onNavigate }: { onNavigate: (view: AdminView) => void }) {
  const { data: shipments, isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Shipment[];
    },
  });

  const total = shipments?.length ?? 0;
  const delivered = shipments?.filter((s) => s.delivered_done).length ?? 0;
  const inTransit = shipments?.filter((s) => s.in_transit_done && !s.delivered_done).length ?? 0;
  const pending = shipments?.filter((s) => !s.processing_done).length ?? 0;
  const outForDelivery = shipments?.filter((s) => s.out_for_delivery_done && !s.delivered_done).length ?? 0;

  const stats = [
    { label: "Total Shipments", value: total, icon: Package, color: "from-violet-600 to-indigo-600" },
    { label: "Delivered", value: delivered, icon: CheckCircle2, color: "from-emerald-500 to-green-600" },
    { label: "In Transit", value: inTransit, icon: Truck, color: "from-blue-500 to-cyan-500" },
    { label: "Out for Delivery", value: outForDelivery, icon: TrendingUp, color: "from-amber-500 to-orange-500" },
    { label: "Pending", value: pending, icon: Clock, color: "from-rose-500 to-pink-500" },
  ];

  const recent = shipments?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Overview of all shipment activity.
        </p>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-4 sm:p-5 animate-pulse">
              <div className="h-8 w-8 rounded-lg bg-muted mb-3" />
              <div className="h-7 w-12 bg-muted rounded mb-1" />
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-card)] hover:border-primary/30 transition-colors"
            >
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                <stat.icon className="h-4.5 w-4.5" />
              </div>
              <p className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <button
          onClick={() => onNavigate("create")}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-card)] hover:border-primary/40 transition-colors text-left"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Package className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base">Create New Shipment</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Add a new package to track</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </button>

        <button
          onClick={() => onNavigate("shipments")}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-[var(--shadow-card)] hover:border-primary/40 transition-colors text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <Truck className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm sm:text-base">Manage Shipments</p>
            <p className="text-xs sm:text-sm text-muted-foreground">View and update all packages</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
        </button>
      </div>

      {/* Recent Shipments */}
      <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-base sm:text-lg">Recent Shipments</h2>
          <button
            onClick={() => onNavigate("shipments")}
            className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No shipments yet. Create one to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((s) => {
              const status = getCurrentStatus(s);
              return (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 sm:px-6 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs sm:text-sm font-semibold truncate">{s.tracking_number}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {s.sender_name} → {s.recipient_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold text-primary-foreground whitespace-nowrap"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      {status.label}
                    </span>
                    <span className="text-[11px] sm:text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(s.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
