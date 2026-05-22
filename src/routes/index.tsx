import { createFileRoute } from "@tanstack/react-router";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { TrackingForm } from "@/components/TrackingForm";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Truck,
  Clock,
  ShieldCheck,
  Globe2,
  PackageCheck,
  Headphones,
  Search,
  MapPin,
  Bell,
  Star,
  Package2,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/")({
  component: Index,
});

const FEATURES = [
  {
    icon: Clock,
    title: "Live ETA Updates",
    desc: "Get accurate estimated delivery times that update automatically as your shipment progresses through each milestone.",
  },
  {
    icon: Globe2,
    title: "End-to-End Visibility",
    desc: "Visualize the complete route from origin to destination, including every stop and transfer point along the way.",
  },
  {
    icon: Truck,
    title: "Milestone Timeline",
    desc: "Follow each stage of delivery — from pickup and processing, through transit, to out-for-delivery and final drop-off.",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    desc: "Your tracking data is encrypted in transit and never shared with third parties. Your shipments remain confidential.",
  },
];

const HOW_IT_WORKS = [
  {
    icon: Search,
    step: "01",
    title: "Enter Your Tracking Number",
    desc: "Paste or type your 16-digit tracking number into the search field. It's fast and requires no sign-up.",
  },
  {
    icon: MapPin,
    step: "02",
    title: "View Live Status",
    desc: "Instantly see where your package is, its current status, and the full route it has taken so far.",
  },
  {
    icon: Bell,
    step: "03",
    title: "Stay Updated",
    desc: "Check back anytime for real-time updates on your delivery progress and estimated arrival.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "E-commerce Business Owner",
    quote: "ParcelTrace has transformed how we handle customer inquiries. Our support tickets about delivery status dropped by 60% since we started sharing tracking links.",
    rating: 5,
  },
  {
    name: "James K.",
    role: "Logistics Manager",
    quote: "The milestone timeline is incredibly detailed. I can see exactly where each shipment is and proactively address any delays before customers even notice.",
    rating: 5,
  },
  {
    name: "Amina O.",
    role: "Online Shopper",
    quote: "I love how clean and simple the tracking page is. No clutter, no ads — just clear, real-time information about my delivery. Highly recommended!",
    rating: 5,
  },
  {
    name: "David R.",
    role: "Supply Chain Director",
    quote: "We integrated ParcelTrace across our fulfillment workflow. The admin panel makes it effortless to create shipments and keep customers informed at every step.",
    rating: 5,
  },
  {
    name: "Linda W.",
    role: "Frequent Online Buyer",
    quote: "Finally, a tracking service that actually works on my phone. The mobile experience is seamless — I can check my package status on the go without any hassle.",
    rating: 5,
  },
];

const STATS = [
  { value: "99.9%", label: "Uptime Reliability" },
  { value: "50K+", label: "Packages Tracked" },
  { value: "<2s", label: "Average Lookup Time" },
  { value: "24/7", label: "Service Availability" },
];

function Index() {
  useDocumentTitle("ParcelTrace — Track Any Package in Real Time");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
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
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              Real-Time{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                Package Tracking
              </span>
              <br className="hidden sm:block" />
              You Can Rely On
            </h1>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Enter your tracking number to instantly see the full shipment journey — from
              pickup to your doorstep — with a live milestone timeline and estimated delivery date.
            </p>
            <div className="mt-10">
              <TrackingForm />
            </div>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────────── */}
        <section className="border-y border-border bg-card/50">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
              {STATS.map((s) => (
                <div key={s.label}>
                  <p
                    className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent"
                    style={{ backgroundImage: "var(--gradient-primary)" }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Everything You Need to Track Shipments
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Powerful features designed to give you complete visibility over every package, every step of the way.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
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
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="bg-card/50 border-y border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                How It Works
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                Tracking your package takes just seconds. No account required.
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="text-center sm:text-left">
                  <div className="flex justify-center sm:justify-start mb-4">
                    <div className="relative">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground"
                        style={{ background: "var(--gradient-primary)" }}
                      >
                        <item.icon className="h-6 w-6" />
                      </div>
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold">
                        {item.step}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground text-base sm:text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials Carousel ────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Trusted by Thousands
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              See what our customers have to say about their experience with ParcelTrace.
            </p>
          </div>
          <div className="px-8 sm:px-14">
            <Carousel opts={{ loop: true, align: "start" }} className="w-full">
              <CarouselContent className="-ml-4">
                {TESTIMONIALS.map((t, i) => (
                  <CarouselItem key={i} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <div className="h-full rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)] flex flex-col">
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                        ))}
                      </div>
                      <blockquote className="text-sm text-foreground leading-relaxed flex-1">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
            <div
              className="rounded-3xl p-8 sm:p-12 text-center text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <PackageCheck className="mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-4 opacity-90" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Ready to Track Your Package?
              </h2>
              <p className="mt-3 text-sm sm:text-base opacity-90 max-w-lg mx-auto leading-relaxed">
                Enter your tracking number above or contact our support team if you need assistance.
                We&apos;re here to help 24/7.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
                <a
                  href="#top"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 backdrop-blur px-6 py-3 text-sm font-semibold hover:bg-white/30 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Track a Package
                </a>
                <a
                  href="mailto:support@parceltrace.com"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold hover:bg-white/10 transition-colors"
                >
                  <Headphones className="h-4 w-4" />
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 font-bold text-lg mb-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <Package2 className="h-4 w-4" />
                </div>
                <span>
                  Parcel<span className="text-secondary">Trace</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Professional shipment tracking with real-time updates, milestone timelines, and delivery notifications.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Track a Package</a></li>
                <li><a href="/admin" className="hover:text-foreground transition-colors">Admin Portal</a></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Real-Time Tracking</li>
                <li>Delivery Notifications</li>
                <li>Route Visualization</li>
                <li>ETA Estimates</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:support@parceltrace.com" className="hover:text-foreground transition-colors">support@parceltrace.com</a></li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ParcelTrace. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
