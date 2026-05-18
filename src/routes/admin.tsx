import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Copy, Mail, Trash2, ExternalLink, Loader2, CheckCircle2, Package } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import {
  generateTrackingNumber,
  addBusinessDays,
  STAGE_DEFS,
  getCurrentStatus,
  type Shipment,
  type StageKey,
} from "@/lib/tracking";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — ParcelTrace" },
      { name: "description", content: "Create and manage shipments." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-10">
        <header>
          <h1 className="text-3xl font-bold">Admin Control Panel</h1>
          <p className="text-muted-foreground mt-1">Create shipments and update delivery milestones.</p>
        </header>
        <CreateShipmentForm />
        <ShipmentsList />
      </main>
    </div>
  );
}

function CreateShipmentForm() {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    sender_name: "",
    recipient_name: "",
    recipient_email: "",
    origin_address: "",
    destination_address: "",
    package_description: "",
    shipment_date: today,
    eta_days: 3,
  });
  const [created, setCreated] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: async () => {
      const tracking = generateTrackingNumber();
      const eta = addBusinessDays(new Date(form.shipment_date), form.eta_days)
        .toISOString().slice(0, 10);
      const { data, error } = await supabase.from("shipments").insert({
        tracking_number: tracking,
        sender_name: form.sender_name,
        recipient_name: form.recipient_name,
        recipient_email: form.recipient_email,
        origin_address: form.origin_address,
        destination_address: form.destination_address,
        package_description: form.package_description || null,
        shipment_date: form.shipment_date,
        estimated_delivery_date: eta,
        processing_done: true,
        processing_at: new Date().toISOString(),
        processing_location: form.origin_address,
      }).select().single();
      if (error) throw error;
      return data as Shipment;
    },
    onSuccess: (data) => {
      setCreated(data.tracking_number);
      qc.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Shipment created");
      setForm({ ...form, sender_name: "", recipient_name: "", recipient_email: "", origin_address: "", destination_address: "", package_description: "" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <Plus className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold">Create New Shipment</h2>
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); mut.mutate(); }}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Field label="Sender name" required value={form.sender_name} onChange={(v) => setForm({ ...form, sender_name: v })} />
        <Field label="Recipient name" required value={form.recipient_name} onChange={(v) => setForm({ ...form, recipient_name: v })} />
        <Field label="Recipient email" type="email" required value={form.recipient_email} onChange={(v) => setForm({ ...form, recipient_email: v })} />
        <Field label="Package description" value={form.package_description} onChange={(v) => setForm({ ...form, package_description: v })} />
        <Field label="Origin / pickup address" required value={form.origin_address} onChange={(v) => setForm({ ...form, origin_address: v })} />
        <Field label="Destination / delivery address" required value={form.destination_address} onChange={(v) => setForm({ ...form, destination_address: v })} />
        <Field label="Shipment date" type="date" required value={form.shipment_date} onChange={(v) => setForm({ ...form, shipment_date: v })} />
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
            Estimated delivery
          </label>
          <select
            value={form.eta_days}
            onChange={(e) => setForm({ ...form, eta_days: Number(e.target.value) })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value={3}>3 business days</option>
            <option value={6}>6 business days</option>
            <option value={9}>9 business days</option>
          </select>
        </div>
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={mut.isPending}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold text-primary-foreground disabled:opacity-50"
            style={{ background: "var(--gradient-primary)" }}
          >
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Create shipment
          </button>
        </div>
      </form>

      {created && (
        <div className="mt-6 rounded-xl border-2 border-success/30 bg-success/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Shipment created. Share this tracking number with the customer:</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2 font-mono text-base font-bold">
                  {created}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(created); toast.success("Copied"); }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary"
                >
                  <Copy className="h-4 w-4" /> Copy
                </button>
                <button onClick={() => setCreated(null)} className="text-sm text-muted-foreground hover:text-foreground px-2">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label, value, onChange, type = "text", required,
}: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function ShipmentsList() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("shipments").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Shipment[];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("shipments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["shipments"] }); toast.success("Deleted"); },
  });

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Manage Shipments</h2>
      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading…</div>
      ) : !data?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-muted-foreground">No shipments yet. Create one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((s) => <ShipmentCard key={s.id} shipment={s} onDelete={() => del.mutate(s.id)} />)}
        </div>
      )}
    </section>
  );
}

function ShipmentCard({ shipment, onDelete }: { shipment: Shipment; onDelete: () => void }) {
  const qc = useQueryClient();
  const [emailOpen, setEmailOpen] = useState(false);
  const status = getCurrentStatus(shipment);

  const toggle = useMutation({
    mutationFn: async ({ key, checked }: { key: StageKey; checked: boolean }) => {
      const update: Partial<Shipment> = {
        [`${key}_done`]: checked,
        [`${key}_at`]: checked ? new Date().toISOString() : null,
      } as Partial<Shipment>;
      if (checked && !shipment[`${key}_location` as const]) {
        const loc = key === "processing" || key === "picked_up"
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
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-bold">{shipment.tracking_number}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {shipment.sender_name} → {shipment.recipient_name} ({shipment.recipient_email})
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {shipment.origin_address} → {shipment.destination_address}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
            {status.label}
          </span>
          <Link
            to="/track/$id"
            params={{ id: shipment.tracking_number }}
            target="_blank"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs hover:border-primary"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-5">
        {STAGE_DEFS.map((def) => {
          const checked = shipment[`${def.key}_done` as const];
          return (
            <label
              key={def.key}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs cursor-pointer transition-colors ${
                checked ? "border-success/40 bg-success/5" : "border-border hover:border-primary/40"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={toggle.isPending}
                onChange={(e) => toggle.mutate({ key: def.key, checked: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              <span className={checked ? "font-medium" : "text-muted-foreground"}>{def.label}</span>
            </label>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setEmailOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:border-primary"
        >
          <Mail className="h-4 w-4" /> Send Update Email
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-destructive hover:border-destructive"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>

      {emailOpen && <EmailComposer shipment={shipment} status={status.label} onClose={() => setEmailOpen(false)} />}
    </div>
  );
}

function EmailComposer({
  shipment, status, onClose,
}: { shipment: Shipment; status: string; onClose: () => void }) {
  const trackUrl = typeof window !== "undefined"
    ? `${window.location.origin}/track/${shipment.tracking_number}`
    : `/track/${shipment.tracking_number}`;
  const eta = new Date(shipment.estimated_delivery_date).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
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
    <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">To</label>
        <input value={shipment.recipient_email} readOnly className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border border-border px-3 py-1.5 text-sm">Cancel</button>
        <button
          onClick={send}
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Mail className="h-4 w-4" /> Open in email client
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Opens your default email app with the message pre-filled. The recipient address, subject, and body are all editable above.
      </p>
    </div>
  );
}
