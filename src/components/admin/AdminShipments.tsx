import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Copy,
  Mail,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Package,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  generateTrackingNumber,
  addBusinessDays,
  STAGE_DEFS,
  getCurrentStatus,
  type Shipment,
  type StageKey,
} from "@/lib/tracking";
import {
  getCustomsHold,
  setCustomsHold,
  clearCustomsHold,
  generateReferenceNumber,
  type CustomsHold,
} from "@/lib/customs";

export function AdminShipments() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
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

  const filtered = data?.filter(
    (s) =>
      s.tracking_number.includes(search) ||
      s.sender_name.toLowerCase().includes(search.toLowerCase()) ||
      s.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      s.recipient_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Shipments</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          View, update, and manage all shipments.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by tracking number, name, or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground text-sm">
          Loading…
        </div>
      ) : !filtered?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 sm:p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            {search ? "No shipments match your search." : "No shipments yet. Create one to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((s) => (
            <ShipmentCard key={s.id} shipment={s} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const status = getCurrentStatus(shipment);

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("shipments").delete().eq("id", shipment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Shipment deleted");
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ key, checked }: { key: StageKey; checked: boolean }) => {
      const update: Partial<Shipment> = {
        [`${key}_done`]: checked,
        [`${key}_at`]: checked ? new Date().toISOString() : null,
      } as Partial<Shipment>;
      if (checked && !shipment[`${key}_location` as const]) {
        const loc =
          key === "processing" || key === "picked_up"
            ? shipment.origin_address
            : key === "in_transit"
              ? "In transit hub"
              : shipment.destination_address;
        (update as Record<string, unknown>)[`${key}_location`] = loc;
      }
      const { error } = await supabase.from("shipments").update(update).eq("id", shipment.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shipments"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-2xl border border-border bg-card shadow-[var(--shadow-card)] overflow-hidden">
      {/* Header Row */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-sm font-bold">{shipment.tracking_number}</p>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground whitespace-nowrap"
                style={{ background: "var(--gradient-primary)" }}
              >
                {status.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
              {shipment.sender_name} → {shipment.recipient_name}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
              {shipment.origin_address} → {shipment.destination_address}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              to="/track/$id"
              params={{ id: shipment.tracking_number }}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs hover:border-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shipment.tracking_number);
                toast.success("Tracking number copied");
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs hover:border-primary transition-colors"
            >
              <Copy className="h-3.5 w-3.5" /> Copy
            </button>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs hover:border-primary transition-colors"
            >
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {expanded ? "Less" : "More"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-border px-4 sm:px-5 py-4 space-y-4">
          {/* Stage Toggles */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2.5">
              Delivery Milestones
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {STAGE_DEFS.map((def) => {
                const checked = shipment[`${def.key}_done` as const];
                return (
                  <label
                    key={def.key}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-xs cursor-pointer transition-colors ${
                      checked
                        ? "border-success/40 bg-success/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={toggle.isPending}
                      onChange={(e) => toggle.mutate({ key: def.key, checked: e.target.checked })}
                      className="h-4 w-4 accent-primary shrink-0"
                    />
                    <span className={`${checked ? "font-medium" : "text-muted-foreground"} leading-tight`}>
                      {def.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Shipment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <DetailRow label="Recipient Email" value={shipment.recipient_email} />
            <DetailRow label="Shipment Date" value={new Date(shipment.shipment_date).toLocaleDateString()} />
            <DetailRow
              label="Est. Delivery"
              value={new Date(shipment.estimated_delivery_date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            />
            {shipment.package_description && (
              <DetailRow label="Package" value={shipment.package_description} />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setEmailOpen((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm hover:border-primary transition-colors"
            >
              <Mail className="h-4 w-4" /> Send Update Email
            </button>
            <button
              onClick={() => del.mutate()}
              disabled={del.isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs sm:text-sm text-destructive hover:border-destructive transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>

          {emailOpen && (
            <EmailComposer
              shipment={shipment}
              status={status.label}
              onClose={() => setEmailOpen(false)}
            />
          )}

          {/* Customs Hold */}
          <CustomsHoldPanel trackingNumber={shipment.tracking_number} />
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5 break-words">{value}</p>
    </div>
  );
}

function EmailComposer({
  shipment,
  status,
  onClose,
}: {
  shipment: Shipment;
  status: string;
  onClose: () => void;
}) {
  const trackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/track/${shipment.tracking_number}`
      : `/track/${shipment.tracking_number}`;
  const eta = new Date(shipment.estimated_delivery_date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [subject, setSubject] = useState(`Shipment Update — ${shipment.tracking_number}`);
  const [body, setBody] = useState(
    `Hi ${shipment.recipient_name},\n\n` +
      `Here's an update on your shipment ${shipment.tracking_number}.\n\n` +
      `Current status: ${status}\n` +
      `Estimated delivery: ${eta}\n\n` +
      `Track your package live: ${trackUrl}\n\n` +
      `Thanks,\nParcelTrace`
  );

  function send() {
    const url = `mailto:${encodeURIComponent(shipment.recipient_email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
          To
        </label>
        <input
          value={shipment.recipient_email}
          readOnly
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
          Subject
        </label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
          Message
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={send}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Mail className="h-4 w-4" /> Open in email client
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Opens your default email app with the message pre-filled.
      </p>
    </div>
  );
}

function CustomsHoldPanel({ trackingNumber }: { trackingNumber: string }) {
  const existing = getCustomsHold(trackingNumber);
  const [enabled, setEnabled] = useState(existing?.enabled ?? false);
  const [feeAmount, setFeeAmount] = useState(existing?.feeAmount?.toString() ?? "150");
  const [feeCurrency, setFeeCurrency] = useState(existing?.feeCurrency ?? "USD");
  const [reason, setReason] = useState(
    existing?.reason ??
      "Package held at customs for inspection and regulatory compliance verification."
  );
  const [paymentInstructions, setPaymentInstructions] = useState(
    existing?.paymentInstructions ??
      "Payment must be completed within 48 hours to avoid return-to-sender processing. Accepted methods: credit card, debit card, bank transfer."
  );

  function save(active: boolean) {
    if (active) {
      setCustomsHold(trackingNumber, {
        enabled: true,
        feeAmount: parseFloat(feeAmount) || 0,
        feeCurrency,
        reason,
        holdDate: existing?.holdDate ?? new Date().toISOString(),
        referenceNumber: existing?.referenceNumber ?? generateReferenceNumber(),
        paymentInstructions,
      });
      toast.success("Customs hold activated");
    } else {
      clearCustomsHold(trackingNumber);
      toast.success("Customs hold removed");
    }
    setEnabled(active);
  }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Customs / Clearance Hold
          </p>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-muted-foreground">{enabled ? "Active" : "Off"}</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => save(e.target.checked)}
            className="h-4 w-4 accent-destructive"
          />
        </label>
      </div>

      {enabled && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Fee Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={feeAmount}
                  onChange={(e) => setFeeAmount(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <select
                  value={feeCurrency}
                  onChange={(e) => setFeeCurrency(e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Hold Reason
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
              Payment Instructions
            </label>
            <textarea
              value={paymentInstructions}
              onChange={(e) => setPaymentInstructions(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            onClick={() => save(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <DollarSign className="h-4 w-4" /> Update Customs Hold
          </button>
        </div>
      )}
    </div>
  );
}
