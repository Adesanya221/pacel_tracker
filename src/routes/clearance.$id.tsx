import { createFileRoute, Link } from "@tanstack/react-router";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Clock,
  FileText,
  Scale,
  CreditCard,
  Package2,
  MapPin,
  Calendar,
  Hash,
  CheckCircle2,
  Info,
  Phone,
  Mail,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchShipment, isValidTrackingNumber } from "@/lib/tracking";
import { getCustomsHold, type CustomsHold } from "@/lib/customs";

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

  const customsHold = valid ? getCustomsHold(id) : null;

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

        {isLoading ? (
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

  const deadlineDate = new Date(
    new Date(hold.holdDate).getTime() + 48 * 60 * 60 * 1000
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
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
              Customs Clearance Required
            </h1>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Your shipment has been intercepted and placed on hold by the customs
              authority at the port of entry. A mandatory clearance fee must be settled
              before the package can be released for final delivery.
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

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/5 border border-destructive/20 p-3">
          <Clock className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-destructive">Payment Deadline:</span>{" "}
            {deadlineDate}. Failure to remit payment within the specified timeframe may
            result in the shipment being returned to the sender or held indefinitely at
            the customs facility, subject to additional storage charges.
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
          Under applicable international trade regulations and customs enforcement
          protocols, all inbound parcels are subject to random or targeted inspection.
          When a shipment is flagged, it must undergo a formal clearance process before
          it can proceed to its final destination. The associated fees cover the cost of
          inspection, documentation review, regulatory compliance verification, and
          administrative processing by the relevant customs authority.
        </p>
      </section>

      {/* ── Legal Framework ───────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold">Regulatory & Legal Basis</h2>
        </div>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            This customs clearance fee is imposed in accordance with the following
            regulatory frameworks and international trade agreements:
          </p>
          <ul className="space-y-3 list-none">
            <LegalItem
              title="World Customs Organization (WCO) Guidelines"
              text="Under the Revised Kyoto Convention on the Simplification and Harmonization of Customs Procedures, customs authorities are authorized to collect processing fees for inspections conducted on imported goods. These fees ensure compliance with national security, public health, and trade standards."
            />
            <LegalItem
              title="International Trade Administration (ITA) Regulations"
              text="Shipments crossing international borders are subject to duties, taxes, and administrative charges as determined by the importing country's tariff schedule and customs regulations. The recipient is responsible for all applicable fees."
            />
            <LegalItem
              title="Customs Tariff Act — Import Clearance"
              text="All goods entering the country are subject to assessment by the customs authority. Where a shipment is selected for detailed examination, the associated inspection and handling fees are the responsibility of the consignee or their appointed agent."
            />
            <LegalItem
              title="Consumer Protection Notice"
              text="This fee is a standard regulatory charge applied uniformly to all flagged shipments. It is not a penalty. Non-payment within the stipulated period may result in the package being returned to the origin country at the sender's expense, or being held in a bonded warehouse subject to escalating daily storage fees."
            />
          </ul>
        </div>
      </section>

      {/* ── Payment Instructions ──────────────────────── */}
      <section className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            How to Pay
          </h2>
        </div>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {hold.paymentInstructions}
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <CreditCard className="mx-auto h-6 w-6 text-primary mb-2" />
            <p className="text-xs font-semibold">Credit / Debit Card</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Visa, Mastercard, Amex</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <Package2 className="mx-auto h-6 w-6 text-primary mb-2" />
            <p className="text-xs font-semibold">Bank Transfer</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Wire or ACH transfer</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-center">
            <CheckCircle2 className="mx-auto h-6 w-6 text-primary mb-2" />
            <p className="text-xs font-semibold">Digital Payment</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">PayPal, Apple Pay, etc.</p>
          </div>
        </div>
      </section>

      {/* ── What Happens Next ─────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-4">
          <Info className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold">What Happens After Payment?</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StepCard
            step="1"
            title="Payment Confirmation"
            desc="Once your payment is received and verified, you will receive an email confirmation with a clearance receipt and updated tracking information."
          />
          <StepCard
            step="2"
            title="Customs Release"
            desc="Your package will be released from the customs facility within 24–48 business hours after payment verification is complete."
          />
          <StepCard
            step="3"
            title="Final Delivery"
            desc="The shipment will resume its transit and be delivered to the destination address. Updated ETA will be reflected on your tracking page."
          />
        </div>
      </section>

      {/* ── Contact / Support ─────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2 mb-3">
          <Phone className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-semibold">Need Assistance?</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you have questions about this customs hold or require clarification regarding
          the clearance fee, our support team is available to assist you.
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-3">
          <a
            href="mailto:customs@parceltrace.com"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:border-primary transition-colors"
          >
            <Mail className="h-4 w-4" /> customs@parceltrace.com
          </a>
          <a
            href="tel:+18005551234"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:border-primary transition-colors"
          >
            <Phone className="h-4 w-4" /> +1 (800) 555-1234
          </a>
        </div>
      </section>

      {/* ── Disclaimer ────────────────────────────────── */}
      <footer className="rounded-2xl bg-muted/40 border border-border p-4 sm:p-5">
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold">Disclaimer:</span> ParcelTrace acts as an
          intermediary logistics and tracking platform. Customs clearance fees are
          determined and imposed by the relevant government customs authority at the port
          of entry. ParcelTrace facilitates the collection of these fees on behalf of the
          customs agency to expedite the clearance and delivery process. All fees collected
          are remitted directly to the applicable government authority. This notice is
          issued pursuant to applicable customs regulations and international trade law.
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

function LegalItem({ title, text }: { title: string; text: string }) {
  return (
    <li className="pl-4 border-l-2 border-primary/30">
      <p className="font-semibold text-foreground text-sm">{title}</p>
      <p className="mt-1">{text}</p>
    </li>
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
