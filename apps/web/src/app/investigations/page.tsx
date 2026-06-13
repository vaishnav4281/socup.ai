"use client";
import React, { useState, useEffect, useCallback } from "react";
import type { Alert, Stats, ConnectionState } from "@/lib/graphql";
import { fetchAlerts, analyzeThreat } from "@/lib/graphql";
import ConnectionStatus from "@/components/ConnectionStatus";
import EmptyState from "@/components/EmptyState";
import { AlertSkeleton } from "@/components/Skeleton";

const MOCK_ALERTS: Alert[] = [
  { id: "1", severity: "CRITICAL", message: "Suspicious login from known C2 infrastructure IP 185.xxx.xxx.50" },
  { id: "2", severity: "HIGH", message: "Data exfiltration via DNS tunneling detected on subnet 10.0.0.0/24" },
  { id: "3", severity: "MEDIUM", message: "Port scan detected from 203.0.113.0 — 24 ports in 3s" },
  { id: "4", severity: "LOW", message: "Failed SSH attempts on bastion host — 12 attempts/min" },
];

export default function Investigations() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [stats, setStats] = useState<Stats>({ evaluated: 8400000, actions: 1043, score: 78 });
  const [conn, setConn] = useState<ConnectionState>("offline");
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>(["[ready] Investigation workspace online."]);
  const [analyzing, setAnalyzing] = useState(false);

  const refresh = useCallback(async () => {
    const { alerts: a, stats: s, state } = await fetchAlerts();
    setAlerts(a);
    setStats(s);
    setConn(state);
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, 5000);
    Promise.resolve().then(() => { refresh(); setLoading(false); });
    return () => clearInterval(t);
  }, []);

  const investigate = async () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    setInput("");
    setAnalyzing(true);
    setOutput(prev => [...prev, `> ${cmd}`, "[agent] Escalating to threat analyst...", "[rag] Retrieving baseline vectors..."]);

    const { alert, state } = await analyzeThreat(cmd);
    setConn(state);
    if (alert) {
      setOutput(prev => [...prev, `[verdict] Severity: ${alert.severity}`, `[detail] ${alert.message}`, "[complete] Investigation logged."]);
      refresh();
    } else {
      setOutput(prev => [...prev, "[error] Connection failed — gateway unreachable."]);
    }
    setAnalyzing(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Investigation Workspace</h1>
          <p className="text-sm text-gray-500 mt-1">Deep-dive threat analysis powered by the SOCup AI RAG engine.</p>
        </div>
        <ConnectionStatus state={conn} />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {loading ? (
          <>
            <div className="panel p-4 space-y-3"><div className="animate-pulse h-3 w-16 mx-auto bg-white/5 rounded"/><div className="animate-pulse h-7 w-10 mx-auto bg-white/5 rounded"/></div>
            <div className="panel p-4 space-y-3"><div className="animate-pulse h-3 w-16 mx-auto bg-white/5 rounded"/><div className="animate-pulse h-7 w-10 mx-auto bg-white/5 rounded"/></div>
            <div className="panel p-4 space-y-3"><div className="animate-pulse h-3 w-16 mx-auto bg-white/5 rounded"/><div className="animate-pulse h-7 w-10 mx-auto bg-white/5 rounded"/></div>
          </>
        ) : (
          [
            ["Open Cases", alerts.length, "text-red-400"],
            ["Agent Actions", stats.actions, "text-blue-400"],
            ["Risk Score", `${stats.score}/100`, stats.score > 80 ? "text-red-400" : "text-green-400"],
          ].map(([l, v, c]) => (
            <div key={String(l)} className="panel p-4">
              <p className="text-xs text-gray-500">{l}</p>
              <p className={`text-2xl font-bold mt-1 ${c}`}>{v}</p>
            </div>
          ))
        )}
      </div>

      <div className="panel p-5">
        <h2 className="text-sm font-semibold text-white mb-3">
          Open Alerts
          {conn === "offline" && <span className="ml-2 text-xs text-gray-600 font-normal">(demo data)</span>}
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => <AlertSkeleton key={i} />)}
          </div>
        ) : alerts.length === 0 ? (
          <EmptyState icon="inbox" title="No Open Alerts" description="All clear. No alerts require investigation right now. New alerts will appear here in real time." />
        ) : (
          <div className="space-y-2">
            {alerts.map(a => (
              <button key={a.id} onClick={() => setInput(`Investigate alert ${a.id}: ${a.message}`)}
                className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 hover:border-blue-500/30 transition-all group">
                <span className={`shrink-0 w-2 h-2 rounded-full ${a.severity === "CRITICAL" ? "bg-red-500" : a.severity === "HIGH" ? "bg-orange-400" : "bg-yellow-400"}`}/>
                <span className="text-xs text-gray-300 flex-1 line-clamp-1">{a.message}</span>
                <span className={`text-xs font-semibold ${a.severity === "CRITICAL" ? "text-red-400" : a.severity === "HIGH" ? "text-orange-400" : "text-yellow-400"}`}>{a.severity}</span>
                <span className="text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0">→ Investigate</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel p-5 border-t-2 border-t-blue-500/60">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span className="text-blue-400">✦</span> AI Investigation Agent
        </h2>
        <div className="bg-black border border-white/8 rounded-lg p-4 h-52 overflow-y-auto font-mono text-xs space-y-0.5 mb-3">
          {output.map((l, i) => {
            const cls = l.startsWith(">") ? "text-blue-300" : l.startsWith("[verdict]") || l.startsWith("[detail]") ? "text-orange-300" : l.startsWith("[error]") ? "text-red-400" : l.startsWith("[complete]") ? "text-green-400" : "text-gray-500";
            return <p key={i} className={cls}>{l}</p>;
          })}
          {analyzing && <p className="text-blue-400 animate-pulse">[agent] Processing...</p>}
        </div>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && investigate()}
            placeholder="Investigate an alert or describe threat context..."
            className="flex-1 bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors"/>
          <button onClick={investigate} disabled={!input.trim() || analyzing}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all">
            Investigate
          </button>
        </div>
      </div>
    </div>
  );
}
