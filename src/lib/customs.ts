/**
 * Customs Hold / Clearance Fee utility.
 *
 * Stores customs‐hold data per tracking number in localStorage so no DB
 * migration is required. Admin sets the hold + fee; the tracking page reads it.
 */

export interface CustomsHold {
  enabled: boolean;
  feeAmount: number;
  feeCurrency: string;
  reason: string;
  holdDate: string;
  referenceNumber: string;
  paymentInstructions: string;
}

const STORAGE_KEY = "parceltrace_customs_holds";

function getAll(): Record<string, CustomsHold> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, CustomsHold>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCustomsHold(trackingNumber: string): CustomsHold | null {
  const all = getAll();
  const hold = all[trackingNumber];
  if (!hold || !hold.enabled) return null;
  return hold;
}

export function setCustomsHold(trackingNumber: string, hold: CustomsHold) {
  const all = getAll();
  all[trackingNumber] = hold;
  saveAll(all);
}

export function clearCustomsHold(trackingNumber: string) {
  const all = getAll();
  delete all[trackingNumber];
  saveAll(all);
}

export function generateReferenceNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "CBP-";
  for (let i = 0; i < 10; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}
