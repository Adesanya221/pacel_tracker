import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Copy, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  generateTrackingNumber,
  addBusinessDays,
  type Shipment,
} from "@/lib/tracking";
import type { AdminView } from "./AdminLayout";

export function AdminCreateShipment({ onNavigate }: { onNavigate: (view: AdminView) => void }) {
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
        .toISOString()
        .slice(0, 10);
      const { data, error } = await supabase
        .from("shipments")
        .insert({
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
        })
        .select()
        .single();
      if (error) throw error;
      return data as Shipment;
    },
    onSuccess: (data) => {
      setCreated(data.tracking_number);
      qc.invalidateQueries({ queryKey: ["shipments"] });
      toast.success("Shipment created successfully");
      setForm({
        ...form,
        sender_name: "",
        recipient_name: "",
        recipient_email: "",
        origin_address: "",
        destination_address: "",
        package_description: "",
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Create Shipment</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Add a new package to the tracking system.
        </p>
      </div>

      {/* Success Banner */}
      {created && (
        <div className="rounded-2xl border-2 border-success/30 bg-success/5 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Shipment created! Share this tracking number:
              </p>
              <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2 font-mono text-sm sm:text-base font-bold truncate">
                  {created}
                </code>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(created);
                      toast.success("Copied");
                    }}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-primary transition-colors flex-1 sm:flex-none"
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </button>
                  <button
                    onClick={() => {
                      setCreated(null);
                      onNavigate("shipments");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground px-2 whitespace-nowrap"
                  >
                    View all
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Plus className="h-5 w-5" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">Shipment Details</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Sender name"
              placeholder="John Anderson"
              required
              value={form.sender_name}
              onChange={(v) => setForm({ ...form, sender_name: v })}
            />
            <FormField
              label="Recipient name"
              placeholder="Michael Thompson"
              required
              value={form.recipient_name}
              onChange={(v) => setForm({ ...form, recipient_name: v })}
            />
            <FormField
              label="Recipient email"
              type="email"
              placeholder="recipient@email.com"
              required
              value={form.recipient_email}
              onChange={(v) => setForm({ ...form, recipient_email: v })}
            />
            <FormField
              label="Package description"
              placeholder="Electronics, documents, apparel, etc."
              value={form.package_description}
              onChange={(v) => setForm({ ...form, package_description: v })}
            />
            <FormField
              label="Origin / pickup address"
              placeholder="1425 Market St, San Francisco, CA 94103"
              required
              value={form.origin_address}
              onChange={(v) => setForm({ ...form, origin_address: v })}
            />
            <FormField
              label="Destination / delivery address"
              placeholder="742 Evergreen Terrace, Springfield, IL 62704"
              required
              value={form.destination_address}
              onChange={(v) => setForm({ ...form, destination_address: v })}
            />
            <FormField
              label="Shipment date"
              type="date"
              required
              value={form.shipment_date}
              onChange={(v) => setForm({ ...form, shipment_date: v })}
            />
            <div>
              <label className="block text-[11px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                Estimated delivery
              </label>
              <select
                value={form.eta_days}
                onChange={(e) => setForm({ ...form, eta_days: Number(e.target.value) })}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              >
                <option value={3}>3 business days</option>
                <option value={6}>6 business days</option>
                <option value={9}>9 business days</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end pt-2">
            <button
              type="submit"
              disabled={mut.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-sm sm:text-base font-semibold text-primary-foreground disabled:opacity-50 w-full sm:w-auto"
              style={{ background: "var(--gradient-primary)" }}
            >
              {mut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Shipment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
