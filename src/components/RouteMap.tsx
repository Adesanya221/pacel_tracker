import { MapPin, Plane } from "lucide-react";
import type { TrackingData } from "@/lib/tracking";

export function RouteMap({ data }: { data: TrackingData }) {
  const W = 800;
  const H = 360;
  const project = (lat: number, lng: number) => {
    const x = ((lng + 130) / 70) * W;
    const y = ((50 - lat) / 30) * H;
    return { x: Math.max(20, Math.min(W - 20, x)), y: Math.max(20, Math.min(H - 20, y)) };
  };

  const o = project(data.origin.lat, data.origin.lng);
  const d = project(data.destination.lat, data.destination.lng);
  const midX = (o.x + d.x) / 2;
  const midY = Math.min(o.y, d.y) - 60;
  const pathD = `M ${o.x} ${o.y} Q ${midX} ${midY} ${d.x} ${d.y}`;

  const t = data.progress;
  const planeX = (1 - t) * (1 - t) * o.x + 2 * (1 - t) * t * midX + t * t * d.x;
  const planeY = (1 - t) * (1 - t) * o.y + 2 * (1 - t) * t * midY + t * t * d.y;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.91 0.01 270)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.97 0.01 270)" />
            <stop offset="100%" stopColor="oklch(0.93 0.02 280)" />
          </linearGradient>
          <linearGradient id="routeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.32 0.18 295)" />
            <stop offset="100%" stopColor="oklch(0.65 0.22 35)" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#mapBg)" />
        <rect width={W} height={H} fill="url(#grid)" />
        <g fill="oklch(0.88 0.02 270)" opacity="0.7">
          <ellipse cx="200" cy="180" rx="180" ry="100" />
          <ellipse cx="550" cy="200" rx="200" ry="110" />
          <ellipse cx="700" cy="120" rx="80" ry="50" />
        </g>
        <path d={pathD} fill="none" stroke="oklch(0.91 0.01 270)" strokeWidth="3" strokeDasharray="6 6" />
        <path d={pathD} fill="none" stroke="url(#routeGrad)" strokeWidth="3" strokeDasharray={`${1000 * t} 1000`} />
        <Marker x={o.x} y={o.y} color="oklch(0.6 0.16 145)" label={data.origin.city} />
        <Marker x={d.x} y={d.y} color="oklch(0.65 0.22 35)" label={data.destination.city} />
        {t > 0 && t < 1 && (
          <g transform={`translate(${planeX}, ${planeY})`}>
            <circle r="14" fill="oklch(0.32 0.18 295)" opacity="0.2">
              <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="8" fill="oklch(0.32 0.18 295)" />
            <circle r="3" fill="white" />
          </g>
        )}
      </svg>
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background/90 backdrop-blur px-3 py-2 text-xs border border-border">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-success" />
          <span className="font-medium">{data.origin.city}</span>
        </div>
        <div className="flex items-center gap-1.5 text-primary">
          <Plane className="h-3.5 w-3.5" />
          <span className="font-medium">{data.current.city}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-secondary" />
          <span className="font-medium">{data.destination.city}</span>
        </div>
      </div>
    </div>
  );
}

function Marker({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="10" fill={color} opacity="0.25" />
      <circle cx={x} cy={y} r="5" fill={color} />
      <text x={x} y={y - 14} textAnchor="middle" fontSize="11" fontWeight="600" fill="oklch(0.18 0.01 270)">
        {label}
      </text>
    </g>
  );
}