"use client";
import React, { useState, useEffect, useCallback } from "react";

type Alert = { id: string; severity: string; message: string };
type Event = { id: string; timestamp: string; eventType: string; actor: string };
type Stats = { evaluated: number; actions: number; score: number };

const GQL = "http://localhost:4000";
const post = (q: string, vars?: Record<string, unknown>) =>
  fetch(GQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: q, variables: vars }),
  }).then(r => r.json());

const QUERY = `query { getAlerts { id severity message } getTimeline { id timestamp eventType actor } getStats { evaluated actions score } }`;
const MUTATION = `mutation A($i:String!) { analyzeThreat(threatInput:$i) { id severity message } }`;

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [timeline, setTimeline] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stats>({ evaluated: 0, actions: 0, score: 100 });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[init] SOCup AI Agent boot sequence started...", "[init] Loading RAG knowledge base...", "[ready] Agent online. Awaiting directives."]);

  const refresh = useCallback(async () => {
    try {
      const { data } = await post(QUERY);
      if (data) {
        setAlerts(data.getAlerts || []);
        setTimeline(data.getTimeline || []);
        setStats(data.getStats || { evaluated: 0, actions: 0, score: 100 });
        setConnected(true);
      }
    } catch {
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const runAnalysis = async () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    setInput("");
    setLogs(prev => [...prev, `[cmd] > ${cmd}`, "[agent] Routing to RAG engine...", "[agent] Querying threat intelligence vectors..."]);
    try {
      const { data } = await post(MUTATION, { i: cmd });
      if (data?.analyzeThreat) {
        const a = data.analyzeThreat;
        setLogs(prev => [...prev, `[verdict] ${a.severity}: ${a.message}`, "[agent] Threat logged. Dashboard updated."]);
        refresh();
      }
    } catch {
      setLogs(prev => [...prev, "[error] Gateway unreachable. Check services."]);
    }
  };

  const criticalCount = alerts.filter(a => a.severity === "CRITICAL").length;
  const highCount = alerts.filter(a => a.severity === "HIGH").length;

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"/>
        <p className="text-sm text-gray-500 font-mono">Initializing SOCup AI...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time threat surface monitoring · AI-assisted triage</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${connected ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}/>
            {connected ? "Gateway Connected" : "Gateway Offline"}
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Threats" value={alerts.length} sub={`${criticalCount} CRITICAL · ${highCount} HIGH`} danger={alerts.length > 0} />
        <KpiCard label="Events Analyzed" value={(stats.evaluated / 1_000_000).toFixed(2) + "M"} sub="~12k events/sec" />
        <KpiCard label="Agent Actions" value={stats.actions} sub="Autonomous executions" />
        <KpiCard label="Risk Score" value={`${stats.score}/100`} sub={stats.score > 80 ? "Elevated — review alerts" : "Normal range"} warn={stats.score > 80} />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Timeline — wide col */}
        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Attack Timeline</h2>
            <span className="text-xs text-gray-600 font-mono">{timeline.length} events</span>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-72">
            {timeline.length === 0 && <p className="text-gray-600 text-sm">No events yet.</p>}
            {[...timeline].reverse().map(evt => (
              <div key={evt.id} className="flex items-center gap-4 p-2.5 rounded-lg bg-white/3 hover:bg-white/6 transition-all border border-white/5 text-xs group">
                <span className="text-blue-400 font-mono font-semibold w-28 shrink-0">{evt.eventType}</span>
                <span className="text-gray-400 flex-1">{evt.actor}</span>
                <span className="text-gray-600 tabular-nums">{new Date(evt.timestamp).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Alerts */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Live Anomalies</h2>
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"/>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"/>
            </div>
          </div>
          <div className="space-y-2 overflow-y-auto max-h-72">
            {alerts.length === 0 && <p className="text-gray-600 text-sm">No active alerts.</p>}
            {alerts.map(a => (
              <div key={a.id} className={`p-3 rounded-lg text-xs border ${a.severity === "CRITICAL" ? "border-red-500/20 bg-red-500/6 glow-red" : "border-orange-500/20 bg-orange-500/6"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold ${a.severity === "CRITICAL" ? "text-red-400" : "text-orange-400"}`}>{a.severity}</span>
                  <span className="text-gray-600 tabular-nums">{new Date().toLocaleTimeString()}</span>
                </div>
                <p className="text-gray-300">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Agent Console */}
      <div className="panel p-5 border-t-2 border-t-blue-500/60 glow-blue">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-blue-400 text-base">✦</span>
          <h2 className="text-sm font-semibold text-white">SOCup AI Agent Console</h2>
          <span className="ml-auto text-xs text-gray-600 font-mono">SOCup AI · RAG v2</span>
        </div>

        {/* Terminal output */}
        <div className="bg-black rounded-lg border border-white/8 p-4 h-36 overflow-y-auto font-mono text-xs text-gray-500 space-y-0.5 mb-3">
          {logs.map((l, i) => {
            const color = l.startsWith("[error]") ? "text-red-400" : l.startsWith("[verdict]") ? "text-orange-400" : l.startsWith("[ready]") ? "text-green-400" : l.startsWith("[cmd]") ? "text-blue-400" : "text-gray-500";
            return <p key={i} className={color}>{l}</p>;
          })}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && runAnalysis()}
            placeholder="Analyze threat or describe anomaly (e.g. 'brute force SSH from 192.168.1.10')..."
            className="flex-1 bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
          <button
            onClick={runAnalysis}
            disabled={!input.trim() || !connected}
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
