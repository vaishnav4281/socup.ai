"use client";
import React, { useState, useEffect, useCallback } from "react";
import type { Alert, TimelineEvent, Stats, ConnectionState } from "@/lib/graphql";
import { fetchDashboard, analyzeThreat } from "@/lib/graphql";
import ConnectionStatus from "@/components/ConnectionStatus";
import EmptyState from "@/components/EmptyState";
import { KpiSkeleton, AlertSkeleton, TimelineSkeleton } from "@/components/Skeleton";

const MOCK_ALERTS: Alert[] = [
  { id: "1", severity: "CRITICAL", message: "Suspicious login from known C2 infrastructure IP 185.xxx.xxx.50" },
  { id: "2", severity: "HIGH", message: "Data exfiltration via DNS tunneling detected on subnet 10.0.0.0/24" },
  { id: "3", severity: "MEDIUM", message: "Port scan detected from 203.0.113.0 — 24 ports in 3s" },
];

const MOCK_TIMELINE: TimelineEvent[] = [
  { id: "101", timestamp: new Date(Date.now() - 120000).toISOString(), eventType: "LOGIN", actor: "admin" },
  { id: "102", timestamp: new Date(Date.now() - 90000).toISOString(), eventType: "FILE_DOWNLOAD", actor: "admin" },
  { id: "103", timestamp: new Date(Date.now() - 60000).toISOString(), eventType: "PRIVILEGE_ESCALATION", actor: "svc_anomaly" },
  { id: "104", timestamp: new Date(Date.now() - 30000).toISOString(), eventType: "SCAN", actor: "unknown@203.0.113.0" },
];

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(MOCK_TIMELINE);
  const [stats, setStats] = useState<Stats>({ evaluated: 8400000, actions: 1043, score: 78 });
  const [conn, setConn] = useState<ConnectionState>("offline");
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "[init] SOCup AI Agent — boot sequence started...",
    "[init] Loading RAG knowledge base...",
    "[ready] Agent online. Awaiting directives.",
  ]);

  const refresh = useCallback(async () => {
    const { alerts: a, timeline: t, stats: s, state } = await fetchDashboard();
    setAlerts(a);
    setTimeline(t);
    setStats(s);
    setConn(state);
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, 5000);
    Promise.resolve().then(() => { refresh(); setLoading(false); });
    return () => clearInterval(t);
  }, []);

  const runAnalysis = async () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    setInput("");
    setLogs(prev => [...prev, `[cmd] > ${cmd}`, "[agent] Routing to threat analysis pipeline..."]);
    const { alert, state } = await analyzeThreat(cmd);
    setConn(state);
    if (alert) {
      setLogs(prev => [...prev, `[verdict] ${alert.severity}: ${alert.message}`, "[complete] Investigation logged."]);
      refresh();
    } else {
      setLogs(prev => [...prev, "[error] Analysis failed — gateway unreachable."]);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  const highCount = alerts.filter(a => a.severity === "HIGH").length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time threat surface monitoring · AI-assisted triage</p>
        </div>
        <ConnectionStatus state={conn} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <>
            <KpiSkeleton /><KpiSkeleton /><KpiSkeleton /><KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard label="Active Threats" value={alerts.length} sub={`${criticalCount} CRITICAL · ${highCount} HIGH`} danger={alerts.length > 0} />
            <KpiCard label="Events Analyzed" value={`${(stats.evaluated / 1_000_000).toFixed(1)}M`} sub="~12k events/sec" />
            <KpiCard label="Agent Actions" value={stats.actions} sub="Autonomous executions" />
            <KpiCard label="Risk Score" value={`${stats.score}/100`} sub={stats.score > 80 ? "Elevated — review required" : "Within threshold"} warn={stats.score > 80} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Attack Timeline</h2>
            <span className="text-xs text-gray-600 font-mono">{loading ? "..." : `${timeline.length} events`}</span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <TimelineSkeleton key={i} />)}
            </div>
          ) : timeline.length === 0 ? (
            <EmptyState icon="timeline" title="No Events Recorded" description="Security events will appear here once monitoring begins or when the timeline service connects." />
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-72">
              {[...timeline].reverse().map(evt => (
                <div key={evt.id} className="flex items-center gap-4 p-2.5 rounded-lg bg-white/3 hover:bg-white/6 transition-all border border-white/5 text-xs group">
                  <span className="text-blue-400 font-mono font-semibold w-28 shrink-0">{evt.eventType}</span>
                  <span className="text-gray-400 flex-1">{evt.actor}</span>
                  <span className="text-gray-600 tabular-nums">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Live Anomalies</h2>
            <div className={`relative flex h-2.5 w-2.5 ${alerts.length === 0 || loading ? "opacity-0" : ""}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"/>
            </div>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <AlertSkeleton key={i} />)}
            </div>
          ) : alerts.length === 0 ? (
            <EmptyState icon="shield" title="All Clear" description="No anomalies detected. Your infrastructure looks healthy." />
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-72">
              {alerts.map(a => (
                <div key={a.id} className={`p-3 rounded-lg text-xs border ${a.severity === "CRITICAL" ? "border-red-500/20 bg-red-500/6 glow-red" : a.severity === "HIGH" ? "border-orange-500/20 bg-orange-500/6" : "border-white/5 bg-white/3"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${a.severity === "CRITICAL" ? "text-red-400" : a.severity === "HIGH" ? "text-orange-400" : "text-gray-400"}`}>{a.severity}</span>
                    <span className="text-gray-600 tabular-nums">{new Date().toLocaleTimeString()}</span>
                  </div>
                  <p className="text-gray-300">{a.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel p-5 border-t-2 border-t-blue-500/60 glow-blue">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-400 text-base">✦</span>
          <h2 className="text-sm font-semibold text-white">SOCup AI Agent Console</h2>
          <span className="ml-auto text-xs text-gray-600 font-mono">SOCup AI · RAG v2</span>
        </div>

        <div className="bg-black rounded-lg border border-white/8 p-4 h-36 overflow-y-auto font-mono text-xs text-gray-500 space-y-0.5 mb-3">
          {logs.map((l, i) => {
            const cls = l.startsWith("[error]") ? "text-red-400" : l.startsWith("[verdict]") ? "text-orange-400" : l.startsWith("[ready]") ? "text-green-400" : l.startsWith("[cmd]") ? "text-blue-400" : "text-gray-500";
            return <p key={i} className={cls}>{l}</p>;
          })}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAnalysis()}
            placeholder="Analyze threat or describe anomaly..."
            className="flex-1 bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
          <button
            onClick={runAnalysis}
            disabled={!input.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all"
            style={{boxShadow: input.trim() ? "0 0 20px rgba(59,130,246,0.4)" : "none"}}
          >
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub, danger, warn }: { label: string; value: string | number; sub: string; danger?: boolean; warn?: boolean }) {
  return (
    <div className={`panel p-5 ${danger ? "border-t-2 border-t-red-500 glow-red" : warn ? "border-t-2 border-t-orange-400" : ""}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight tabular-nums">{value}</p>
      <p className={`text-xs mt-1.5 ${danger ? "text-red-400" : warn ? "text-orange-400" : "text-gray-600"}`}>{sub}</p>
    </div>
  );
}
