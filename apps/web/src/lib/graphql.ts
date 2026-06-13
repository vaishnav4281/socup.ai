const GQL = "http://localhost:4000";

export type Alert = { id: string; severity: string; message: string };
export type TimelineEvent = { id: string; timestamp: string; eventType: string; actor: string };
export type Stats = { evaluated: number; actions: number; score: number };

export type ConnectionState = "connected" | "degraded" | "offline";

const MOCK_ALERTS: Alert[] = [
  { id: "1", severity: "CRITICAL", message: "Suspicious login from known C2 infrastructure IP 185.xxx.xxx.50" },
  { id: "2", severity: "HIGH", message: "Data exfiltration via DNS tunneling detected on subnet 10.0.0.0/24" },
  { id: "3", severity: "MEDIUM", message: "Port scan detected from 203.0.113.0 — 24 ports in 3s" },
  { id: "4", severity: "LOW", message: "Failed SSH attempts on bastion host — 12 attempts/min" },
];

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: "101", timestamp: new Date(Date.now() - 120000).toISOString(), eventType: "LOGIN", actor: "admin" },
  { id: "102", timestamp: new Date(Date.now() - 90000).toISOString(), eventType: "FILE_DOWNLOAD", actor: "admin" },
  { id: "103", timestamp: new Date(Date.now() - 60000).toISOString(), eventType: "PRIVILEGE_ESCALATION", actor: "svc_anomaly" },
  { id: "104", timestamp: new Date(Date.now() - 30000).toISOString(), eventType: "SCAN", actor: "unknown@203.0.113.0" },
  { id: "105", timestamp: new Date(Date.now() - 15000).toISOString(), eventType: "LOGOUT", actor: "admin" },
];

const MOCK_STATS: Stats = { evaluated: 8400000, actions: 1043, score: 78 };

let connectionState: ConnectionState = "offline";
let lastFailTime = 0;

export function getConnectionState(): ConnectionState {
  return connectionState;
}

export async function query<T>(gql: string, vars?: Record<string, unknown>): Promise<{ data: T | null; state: ConnectionState }> {
  try {
    const res = await fetch(GQL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: gql, variables: vars }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
    connectionState = "connected";
    lastFailTime = 0;
    return { data: json.data, state: "connected" };
  } catch {
    const now = Date.now();
    if (connectionState === "connected") lastFailTime = now;
    connectionState = now - lastFailTime > 15000 ? "offline" : "degraded";
    return { data: null, state: connectionState };
  }
}

export async function fetchDashboard(): Promise<{ alerts: Alert[]; timeline: TimelineEvent[]; stats: Stats; state: ConnectionState }> {
  const { data, state } = await query<{
    getAlerts: Alert[];
    getTimeline: TimelineEvent[];
    getStats: Stats;
  }>(`query { getAlerts { id severity message } getTimeline { id timestamp eventType actor } getStats { evaluated actions score } }`);

  return {
    alerts: data?.getAlerts ?? (state === "offline" ? MOCK_ALERTS : []),
    timeline: data?.getTimeline ?? (state === "offline" ? MOCK_TIMELINE : []),
    stats: data?.getStats ?? (state === "offline" ? MOCK_STATS : { evaluated: 0, actions: 0, score: 100 }),
    state,
  };
}

export async function fetchTimeline(): Promise<{ events: TimelineEvent[]; state: ConnectionState }> {
  const { data, state } = await query<{ getTimeline: TimelineEvent[] }>(
    `query { getTimeline { id timestamp eventType actor } }`
  );
  return {
    events: data?.getTimeline ?? (state === "offline" ? MOCK_TIMELINE : []),
    state,
  };
}

export async function fetchAlerts(): Promise<{ alerts: Alert[]; stats: Stats; state: ConnectionState }> {
  const { data, state } = await query<{ getAlerts: Alert[]; getStats: Stats }>(
    `query { getAlerts { id severity message } getStats { evaluated actions score } }`
  );
  return {
    alerts: data?.getAlerts ?? (state === "offline" ? MOCK_ALERTS : []),
    stats: data?.getStats ?? (state === "offline" ? MOCK_STATS : { evaluated: 0, actions: 0, score: 100 }),
    state,
  };
}

export async function analyzeThreat(threatInput: string): Promise<{ alert: Alert | null; state: ConnectionState }> {
  const { data, state } = await query<{ analyzeThreat: Alert }>(
    `mutation A($i:String!) { analyzeThreat(threatInput:$i) { id severity message } }`,
    { i: threatInput }
  );
  if (data?.analyzeThreat) return { alert: data.analyzeThreat, state };
  return {
    alert: state === "offline" ? { id: "mock", severity: "SIMULATED", message: `[Offline] Analyzed: "${threatInput}". Start the gateway for live AI verdicts.` } : null,
    state,
  };
}

export async function addTimelineEvent(eventType: string, actor: string): Promise<{ event: TimelineEvent | null; state: ConnectionState }> {
  const { data, state } = await query<{ addTimelineEvent: TimelineEvent }>(
    `mutation A($type:String!,$actor:String!) { addTimelineEvent(eventType:$type,actor:$actor) { id timestamp eventType actor } }`,
    { type: eventType.toUpperCase(), actor }
  );
  if (data?.addTimelineEvent) return { event: data.addTimelineEvent, state };
  return {
    event: state === "offline"
      ? { id: "mock", timestamp: new Date().toISOString(), eventType: eventType.toUpperCase(), actor }
      : null,
    state,
  };
}
