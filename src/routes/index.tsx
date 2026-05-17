import { createFileRoute } from "@tanstack/react-router";
import { TrackingForm } from "@/components/TrackingForm";
import { SiteHeader } from "@/components/SiteHeader";
import { Truck, Clock, ShieldCheck, Globe2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ParcelTrace — Track Any Package in Real Time" },
      {
        name: "description",
        content:
          "Enter any tracking number to see a live shipment journey with timeline, map, and delivery ETA.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const features = [
    { icon: Clock, title: "Live ETA", desc: "Estimated delivery updates as your parcel moves." },
    { icon: Globe2, title: "Global Route", desc: "Origin to destination with every stop visualized." },
    { icon: Truck, title: "Stage Timeline", desc: "Pickup, transit, out for delivery, delivered." },
    { icon: ShieldCheck, title: "Secure Lookup", desc: "Tracking numbers stay private to your session." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.08]"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Tracking service online
            </span>
            <h1 className="mt-6 text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
              Where is my{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                package
              </span>
              ?
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Enter any tracking number to see the full journey — from pickup to your door — with a live timeline and map.
            </p>
            <div className="mt-10">
              <TrackingForm />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] hover:border-primary/40 transition-colors"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        ParcelTrace · Demo project · Tracking data is generated for illustration only.
      </footer>
    </div>
  );
}
