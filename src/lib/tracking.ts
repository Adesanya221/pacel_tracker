// Deterministic fake tracking data generator based on tracking number
export type StageStatus = "complete" | "current" | "pending";

export interface TimelineStage {
  key: string;
  label: string;
  description: string;
  location: string;
  timestamp: string;
  status: StageStatus;
}

export interface TrackingData {
  trackingNumber: string;
  service: string;
  weight: string;
  status: string;
  statusDetail: string;
  estimatedDelivery: string;
  origin: { city: string; region: string; lat: number; lng: number };
  destination: { city: string; region: string; lat: number; lng: number };
  current: { city: string; region: string; lat: number; lng: number };
  progress: number; // 0..1
  stages: TimelineStage[];
}

const CITIES = [
  { city: "Memphis", region: "TN, USA", lat: 35.1495, lng: -90.049 },
  { city: "Los Angeles", region: "CA, USA", lat: 34.0522, lng: -118.2437 },
  { city: "Chicago", region: "IL, USA", lat: 41.8781, lng: -87.6298 },
  { city: "New York", region: "NY, USA", lat: 40.7128, lng: -74.006 },
  { city: "Dallas", region: "TX, USA", lat: 32.7767, lng: -96.797 },
  { city: "Atlanta", region: "GA, USA", lat: 33.749, lng: -84.388 },
  { city: "Seattle", region: "WA, USA", lat: 47.6062, lng: -122.3321 },
  { city: "Miami", region: "FL, USA", lat: 25.7617, lng: -80.1918 },
  { city: "Denver", region: "CO, USA", lat: 39.7392, lng: -104.9903 },
  { city: "Boston", region: "MA, USA", lat: 42.3601, lng: -71.0589 },
];

const SERVICES = ["Express Saver", "Priority Overnight", "Ground", "International Priority", "2Day"];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function seeded(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(d: Date): string {
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function generateTracking(rawNumber: string): TrackingData {
  const trackingNumber = rawNumber.trim().toUpperCase();
  const seed = hash(trackingNumber);
  const rng = seeded(seed);

  let origin = pick(CITIES, rng);
  let destination = pick(CITIES, rng);
  while (destination.city === origin.city) destination = pick(CITIES, rng);
  const transitHub = pick(CITIES.filter((c) => c.city !== origin.city && c.city !== destination.city), rng);

  // Progress 0..4 corresponds to stage index
  const stageIndex = Math.floor(rng() * 5); // 0..4
  const progress = stageIndex / 4;

  const now = new Date();
  const pickupDate = new Date(now.getTime() - (3 + rng() * 2) * 86400000);
  const inTransitDate = new Date(pickupDate.getTime() + 12 * 3600000);
  const hubDate = new Date(pickupDate.getTime() + 36 * 3600000);
  const outForDeliveryDate = new Date(pickupDate.getTime() + 60 * 3600000);
  const deliveredDate = new Date(pickupDate.getTime() + 66 * 3600000);
  const eta = new Date(pickupDate.getTime() + 66 * 3600000);

  const stageDefs = [
    {
      key: "label",
      label: "Label Created",
      description: "Shipping label has been created. Package awaiting pickup.",
      location: `${origin.city}, ${origin.region}`,
      date: pickupDate,
    },
    {
      key: "pickup",
      label: "Picked Up",
      description: "Package picked up by courier.",
      location: `${origin.city}, ${origin.region}`,
      date: new Date(pickupDate.getTime() + 2 * 3600000),
    },
    {
      key: "transit",
      label: "In Transit",
      description: `Arrived at sorting facility in ${transitHub.city}.`,
      location: `${transitHub.city}, ${transitHub.region}`,
      date: hubDate,
    },
    {
      key: "out",
      label: "Out for Delivery",
      description: "On vehicle for delivery.",
      location: `${destination.city}, ${destination.region}`,
      date: outForDeliveryDate,
    },
    {
      key: "delivered",
      label: "Delivered",
      description: "Package delivered. Signed by recipient.",
      location: `${destination.city}, ${destination.region}`,
      date: deliveredDate,
    },
  ];

  const stages: TimelineStage[] = stageDefs.map((s, i) => ({
    key: s.key,
    label: s.label,
    description: s.description,
    location: s.location,
    timestamp: i <= stageIndex ? formatDateTime(s.date) : "Pending",
    status: i < stageIndex ? "complete" : i === stageIndex ? "current" : "pending",
  }));

  // Current location based on progress
  let current = origin;
  if (stageIndex === 0 || stageIndex === 1) current = origin;
  else if (stageIndex === 2) current = transitHub;
  else current = destination;

  const statusMap: Record<number, { status: string; detail: string }> = {
    0: { status: "Label Created", detail: "Awaiting pickup from sender" },
    1: { status: "Picked Up", detail: "On the way to sorting facility" },
    2: { status: "In Transit", detail: `Moving through ${transitHub.city} hub` },
    3: { status: "Out for Delivery", detail: "Arriving today" },
    4: { status: "Delivered", detail: "Package handed to recipient" },
  };

  const weight = (1 + rng() * 25).toFixed(1) + " lbs";

  return {
    trackingNumber,
    service: pick(SERVICES, rng),
    weight,
    status: statusMap[stageIndex].status,
    statusDetail: statusMap[stageIndex].detail,
    estimatedDelivery: formatDate(eta),
    origin: { city: origin.city, region: origin.region, lat: origin.lat, lng: origin.lng },
    destination: { city: destination.city, region: destination.region, lat: destination.lat, lng: destination.lng },
    current: { city: current.city, region: current.region, lat: current.lat, lng: current.lng },
    progress,
    stages,
  };
}