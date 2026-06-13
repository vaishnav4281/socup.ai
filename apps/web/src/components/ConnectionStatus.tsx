"use client";
import type { ConnectionState } from "@/lib/graphql";

const config: Record<ConnectionState, { label: string; dot: string; ring: string; bg: string }> = {
  connected:  { label: "Gateway Connected", dot: "bg-green-500", ring: "bg-green-400", bg: "border-green-500/30 text-green-400 bg-green-500/10" },
  degraded:   { label: "Degraded — using cache", dot: "bg-yellow-400", ring: "bg-yellow-400", bg: "border-yellow-500/30 text-yellow-400 bg-yellow-500/10" },
  offline:    { label: "Offline — showing demo data", dot: "bg-gray-500", ring: "bg-gray-400", bg: "border-gray-500/30 text-gray-400 bg-gray-500/10" },
};

export default function ConnectionStatus({ state }: { state: ConnectionState }) {
  const c = config[state];
  return (
    <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${c.bg}`}>
      <span className="relative flex h-2 w-2">
        {state !== "offline" && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.ring} opacity-75`} />}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${c.dot}`} />
      </span>
      {c.label}
    </div>
  );
}
