import { createFileRoute, Link } from "@tanstack/react-router";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Package, Calendar, User, Mail, AlertCircle, ShieldAlert, ExternalLink, Clock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { TrackingForm } from "@/components/TrackingForm";
import { Timeline } from "@/components/Timeline";
import { fetchShipment, buildTimeline, getCurrentStatus, getProgress, isValidTrackingNumber } from "@/lib/tracking";
import { fetchCustomsHold } from "@/lib/customs";

export const Route = createFileRoute("/track/$id")({
  component: TrackPage,
});

function TrackPage() {
  const { id } = Route.useParams();
  useDocumentTitle(`Tracking ${id} — ParcelTrace`);
  const valid = isValidTrackingNumber(id);

  const { data, isLoading, error } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => fetchShipment(id),
    enabled: valid,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to tracking
        </Link>

        {!valid ? (
          <EmptyState
            title="Invalid tracking number"
            message="Tracking numbers must be exactly 16 digits."
          />
        ) : isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground">
            Loading shipment details…
          </div>
        ) : error ? (
          <EmptyState title="Something went wrong" message={(error as Error).message} />
        ) : !data ? (
          <EmptyState
            title="No results found"
            message={`We couldn't find a shipment for ${id}. Double-check the number and try again.`}
          />
        ) : (
          <ShipmentView data={data} />
        )}
      </main>
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <AlertCircle className="h-7 w-7 text-muted-foreground" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{message}</p>
      <div className="mt-6">
        <TrackingForm />
      </div>
    </div>
  );
}

function ShipmentView({ data }: { data: import("@/lib/tracking").Shipment }) {
  const status = getCurrentStatus(data);
  const progress = getProgress(data);
  const stages = buildTimeline(data);
  const eta = new Date(data.estimated_delivery_date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const { data: customsHold } = useQuery({
    queryKey: ["customs-hold", data.tracking_number],
    queryFn: () => fetchCustomsHold(data.tracking_number),
  });

  return (
    <div className="space-y-6">
      {/* Customs / Clearance Hold Warning */}
      {customsHold && (
        <section className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-destructive text-base">Shipment Held — Customs Action Required</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Your package has been placed on hold by customs. A clearance fee of{" "}
                <span className="font-bold text-foreground">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: customsHold.feeCurrency }).format(customsHold.feeAmount)}
                </span>{" "}
                is required. Please contact our support team by email to resolve this issue.
              </p>
              {customsHold.deadlineDate && (
                <p className="mt-2 text-sm text-destructive flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0" />
                  <strong>Action Required:</strong> Goods must be cleared by{" "}
                  {new Date(customsHold.deadlineDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}.
                  After this date, the package will be permanently held by customs and will not be delivered.
                </p>
              )}
              <a
                href={`/clearance/${data.tracking_number}`}
                className="mt-3 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                <ExternalLink className="h-4 w-4" />
                View Details & Contact Support
              </a>
            </div>
          </div>
        </section>
      )}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Tracking Number</p>
            <p className="font-mono text-lg font-semibold">{data.tracking_number}</p>
          </div>
          <span
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            {status.label}
          </span>
        </div>
        <div className="mt-6">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">Estimated delivery</span>
            <span className="font-semibold">{eta}</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress * 100}%`, background: "var(--gradient-primary)" }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <InfoCard icon={MapPin} label="Origin" value={data.origin_address} accent="success" />
        <InfoCard icon={MapPin} label="Destination" value={data.destination_address} accent="secondary" />
        <InfoCard icon={User} label="Sender" value={data.sender_name} />
        <InfoCard icon={User} label="Recipient" value={data.recipient_name} />
        <InfoCard icon={Mail} label="Recipient Email" value={data.recipient_email} />
        <InfoCard icon={Calendar} label="Shipped" value={new Date(data.shipment_date).toLocaleDateString()} />
        {data.package_description && (
          <div className="sm:col-span-2">
            <InfoCard icon={Package} label="Package" value={data.package_description} />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-lg font-semibold mb-6">Tracking History</h2>
        <Timeline stages={stages} />
      </section>
    </div>
  );
}

function InfoCard({
  icon: Icon, label, value, accent,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent?: "success" | "secondary" }) {
  const color = accent === "success" ? "text-success" : accent === "secondary" ? "text-secondary" : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${color}`} /> {label}
      </div>
      <p className="mt-1.5 text-sm font-medium text-foreground break-words">{value}</p>
    </div>
  );
}
