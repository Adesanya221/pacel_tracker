import { createFileRoute, Link } from "@tanstack/react-router";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Clock,
  FileText,
  CreditCard,
  Package2,
  MapPin,
  Calendar,
  Hash,
  Mail,
  MessageCircle,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchShipment, isValidTrackingNumber } from "@/lib/tracking";
import { fetchCustomsHold, type CustomsHold } from "@/lib/customs";

export const Route = createFileRoute("/clearance/$id")({
  component: ClearancePage,
});

function ClearancePage() {
  const { id } = Route.useParams();
  useDocumentTitle(`Customs Clearance — ${id} — ParcelTrace`);
  const valid = isValidTrackingNumber(id);

  const { data, isLoading } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => fetchShipment(id),
    enabled: valid,
  });

  const { data: customsHold, isLoading: holdLoading } = useQuery({
    queryKey: ["customs-hold", id],
    queryFn: () => fetchCustomsHold(id),
    enabled: valid,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <Link
          to="/track/$id"
          params={{ id }}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to tracking
        </Link>

        {isLoading || holdLoading ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            Loading clearance details…
          </div>
        ) : !data || !customsHold ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <AlertTriangle className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold">No Clearance Hold Found</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This shipment does not currently have a customs hold or the hold has been resolved.
            </p>
            <Link
              to="/track/$id"
              params={{ id }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Return to Tracking
            </Link>
          </div>
        ) : (
          <ClearanceView shipment={data} hold={customsHold} />
        )}
      </main>
    </div>
  );
}

function ClearanceView({
  shipment,
  hold,
}: {
  shipment: import("@/lib/tracking").Shipment;
  hold: CustomsHold;
}) {
  const feeFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: hold.feeCurrency,
  }).format(hold.feeAmount);

  const holdDate = new Date(hold.holdDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* ── Urgent Alert Banner ────────────────────────── */}
      <section className="rounded-2xl border-2 border-destructive/50 bg-destructive/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 shrink-0">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-destructive">
              Customs Hold — Action Required
            </h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Your shipment has been intercepted and placed on hold by the customs
              authority at the port of entry. Please contact our support team by email
              to resolve this issue and arrange clearance for your package.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact Support CTA ───────────────────────── */}
      <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 shrink-0">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Contact Support to Resolve
            </h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Our customs clearance team will guide you through the process and provide
              all necessary instructions. Please email us with your tracking number and
              we will respond with next steps within 24 hours.
            </p>
            <a
              href={`mailto:support@parceltrace.com?subject=Customs Hold — ${shipment.tracking_number}&body=Hello,%0A%0AMy shipment (${shipment.tracking_number}) has been placed on customs hold.%0ACustoms Reference: ${hold.referenceNumber}%0A%0APlease advise on how to resolve this.%0A%0AThank you.`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Mail className="h-4 w-4" />
              Email Support Team
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              support@parceltrace.com — We typically respond within 12–24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ── Shipment Reference Info ───────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <Package2 className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold">Shipment Information</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoRow icon={Hash} label="Tracking Number" value={shipment.tracking_number} mono />
          <InfoRow icon={Hash} label="Customs Reference" value={hold.referenceNumber} mono />
          <InfoRow icon={MapPin} label="Origin" value={shipment.origin_address} />
          <InfoRow icon={MapPin} label="Destination" value={shipment.destination_address} />
          <InfoRow icon={Calendar} label="Shipment Date" value={new Date(shipment.shipment_date).toLocaleDateString()} />
          <InfoRow icon={Calendar} label="Hold Date" value={holdDate} />
          {shipment.package_description && (
            <div className="sm:col-span-2">
              <InfoRow icon={Package2} label="Package Contents" value={shipment.package_description} />
            </div>
          )}
        </div>
      </section>

      {/* ── Fee Breakdown ─────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold">Clearance Fee Summary</h2>
        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-foreground">Customs Inspection Fee</td>
                <td className="px-4 py-3 text-right font-medium">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: hold.feeCurrency }).format(hold.feeAmount * 0.6)}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-foreground">Regulatory Processing Fee</td>
                <td className="px-4 py-3 text-right font-medium">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: hold.feeCurrency }).format(hold.feeAmount * 0.25)}
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="px-4 py-3 text-muted-foreground">Documentation & Handling</td>
                <td className="px-4 py-3 text-right font-medium">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: hold.feeCurrency }).format(hold.feeAmount * 0.15)}
                </td>
              </tr>
              <tr className="bg-muted/30">
                <td className="px-4 py-3 font-semibold text-foreground">Total Amount Due</td>
                <td className="px-4 py-3 text-right font-bold text-lg text-foreground">
                  {feeFormatted}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/20 p-3">
          <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            To arrange payment and complete clearance, please <span className="font-semibold text-foreground">contact our support team by email</span>. We will provide payment instructions and guide you through the process.
          </p>
        </div>
      </section>

      {/* ── Reason & Hold Details ─────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold">Reason for Hold</h2>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{hold.reason}</p>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          Under applicable international trade regulations, all inbound parcels are
          subject to random or targeted inspection. When a shipment is flagged, it must
          undergo a formal clearance process before it can proceed to its final
          destination.
        </p>
      </section>

      {/* ── Deadline Warning ──────────────────────────── */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <h2 className="text-base font-semibold text-destructive">Time-Sensitive</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Please contact us as soon as possible. If this matter is not resolved
              within a reasonable timeframe, the shipment may be returned to the sender
              or held at the customs facility subject to additional storage charges.
            </p>
          </div>
        </div>
      </section>

      {/* ── What Happens Next ─────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold">What Happens Next?</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StepCard
            step="1"
            title="Email Us"
            desc="Send an email to our support team with your tracking number. We'll review your case and respond with clear instructions."
          />
          <StepCard
            step="2"
            title="Support Follow-Up"
            desc="Our customs team will guide you through the resolution process and keep you updated at every step."
          />
          <StepCard
            step="3"
            title="Package Released"
            desc="Once the issue is resolved, your package will be released from customs and delivered to your address."
          />
        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────── */}
      <footer className="rounded-2xl bg-muted/40 border border-border p-4 sm:p-5">
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold">Disclaimer:</span> ParcelTrace acts as an
          intermediary logistics and tracking platform. Customs holds are determined
          by the relevant government customs authority at the port of entry. Our support
          team will work with you to resolve the issue as quickly as possible.
          Reference Number:{" "}
          <span className="font-mono font-medium">{hold.referenceNumber}</span>.
        </p>
      </footer>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={`mt-1 text-sm font-medium text-foreground break-words ${mono ? "font-mono" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          {step}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
