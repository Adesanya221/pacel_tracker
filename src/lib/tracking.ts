import { supabase } from "@/integrations/supabase/client";

export type StageKey = "processing" | "picked_up" | "in_transit" | "out_for_delivery" | "delivered";
export type StageStatus = "complete" | "current" | "pending";

export interface TimelineStage {
  key: StageKey;
  label: string;
  description: string;
  location: string;
  timestamp: string;
  status: StageStatus;
}

export interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  recipient_name: string;
  recipient_email: string;
  origin_address: string;
  destination_address: string;
  package_description: string | null;
  shipment_date: string;
  estimated_delivery_date: string;
  processing_done: boolean;
  processing_at: string | null;
  processing_location: string | null;
  picked_up_done: boolean;
  picked_up_at: string | null;
  picked_up_location: string | null;
  in_transit_done: boolean;
  in_transit_at: string | null;
  in_transit_location: string | null;
  out_for_delivery_done: boolean;
  out_for_delivery_at: string | null;
  out_for_delivery_location: string | null;
  delivered_done: boolean;
  delivered_at: string | null;
  delivered_location: string | null;
  created_at: string;
  updated_at: string;
}

export const STAGE_DEFS: { key: StageKey; label: string; description: string }[] = [
  { key: "processing", label: "Order Received / Processing", description: "Shipment information received and logged at origin facility." },
  { key: "picked_up", label: "Picked Up", description: "Package picked up by courier and scanned at local depot." },
  { key: "in_transit", label: "In Transit", description: "Package is in transit through the national sorting network." },
  { key: "out_for_delivery", label: "Out for Delivery", description: "Package loaded onto delivery vehicle — arriving today." },
  { key: "delivered", label: "Delivered", description: "Package successfully delivered and signed for at destination." },
];

export function isValidTrackingNumber(v: string): boolean {
  return /^\d{16}$/.test(v.trim());
}

export function generateTrackingNumber(): string {
  let n = "";
  for (let i = 0; i < 16; i++) n += Math.floor(Math.random() * 10).toString();
  return n;
}

export function getCurrentStatus(s: Shipment): { label: string; key: StageKey | "pending" } {
  const order: StageKey[] = ["processing", "picked_up", "in_transit", "out_for_delivery", "delivered"];
  let last: StageKey | "pending" = "pending";
  let label = "Pending";
  for (const k of order) {
    if (s[`${k}_done` as const]) {
      last = k;
      label = STAGE_DEFS.find((d) => d.key === k)!.label;
    }
  }
  return { label, key: last };
}

export function getProgress(s: Shipment): number {
  const order: StageKey[] = ["processing", "picked_up", "in_transit", "out_for_delivery", "delivered"];
  let count = 0;
  for (const k of order) if (s[`${k}_done` as const]) count++;
  return count / order.length;
}

export function buildTimeline(s: Shipment): TimelineStage[] {
  const order: StageKey[] = ["processing", "picked_up", "in_transit", "out_for_delivery", "delivered"];
  const lastDone = [...order].reverse().find((k) => s[`${k}_done` as const]);
  return STAGE_DEFS.map((def) => {
    const done = s[`${def.key}_done` as const];
    const at = s[`${def.key}_at` as const] as string | null;
    const loc = s[`${def.key}_location` as const] as string | null;
    const isCurrent = done && def.key === lastDone;
    return {
      key: def.key,
      label: def.label,
      description: def.description,
      location: loc || (def.key === "processing" || def.key === "picked_up" ? s.origin_address : def.key === "delivered" || def.key === "out_for_delivery" ? s.destination_address : "National Distribution Center, Memphis, TN"),
      timestamp: at ? new Date(at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Pending",
      status: done ? (isCurrent ? "current" : "complete") : "pending",
    };
  });
}

const HARDCODED_SHIPMENTS: Record<string, Shipment> = {
  "3614262843782321": {
    id: "hardcoded-3614262843782321",
    tracking_number: "3614262843782321",
    sender_name: "Charité – Universitätsmedizin Berlin",
    recipient_name: "John Doe",
    recipient_email: "john.doe@example.com",
    origin_address: "Charité – Universitätsmedizin Berlin, Charitéplatz 1, 10117 Berlin, Germany",
    destination_address: "1425 Market St, San Francisco, CA 94103",
    package_description: "Medical Supplies / Research Materials",
    shipment_date: "2026-05-20T06:00:00Z",
    estimated_delivery_date: "2026-05-30T06:00:00Z",
    processing_done: true,
    processing_at: "2026-05-20T08:00:00Z",
    processing_location: "Charité – Universitätsmedizin Berlin, Charitéplatz 1, 10117 Berlin, Germany",
    picked_up_done: true,
    picked_up_at: "2026-05-21T06:00:00Z",
    picked_up_location: "Berlin Central Sorting Facility, Berlin, Germany",
    in_transit_done: true,
    in_transit_at: "2026-05-23T06:00:00Z",
    in_transit_location: "National Distribution Center, Memphis, TN",
    out_for_delivery_done: false,
    out_for_delivery_at: null,
    out_for_delivery_location: null,
    delivered_done: false,
    delivered_at: null,
    delivered_location: null,
    created_at: "2026-05-20T06:00:00Z",
    updated_at: "2026-06-09T06:00:00Z",
  },
};

export async function fetchShipment(trackingNumber: string): Promise<Shipment | null> {
  const hardcoded = HARDCODED_SHIPMENTS[trackingNumber.trim()];
  if (hardcoded) return hardcoded;

  const { data, error } = await supabase
    .from("shipments")
    .select("*")
    .eq("tracking_number", trackingNumber.trim())
    .maybeSingle();
  if (error) throw error;
  return data as Shipment | null;
}

export function addBusinessDays(start: Date, days: number): Date {
  const d = new Date(start);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}
