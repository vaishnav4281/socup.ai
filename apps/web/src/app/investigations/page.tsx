"use client";
import React, { useState, useEffect } from "react";

type Alert = { id: string; severity: string; message: string };
const GQL = "http://localhost:4000";

const QUERY = `query { getAlerts { id severity message } getStats { evaluated actions score } }`;
const MUTATION = `mutation A($i:String!) { analyzeThreat(threatInput:$i) { id severity message } }`;

export default function Investigations() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({ evaluated: 0, actions: 0, score: 100 });
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>(["[ready] Investigation workspace online."]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      const { data } = await fetch(GQL, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({query: QUERY}) }).then(r=>r.json());
      if (data) { setAlerts(data.getAlerts||[]); setStats(data.getStats||{}); }
    } catch {}
  };

  useEffect(() => { refresh(); const t = setInterval(refresh, 5000); return ()=>clearInterval(t); }, []);

  const investigate = async () => {
    if (!input.trim()) return;
    const cmd = input.trim();
    setInput("");
    setLoading(true);
    setOutput(prev => [...prev, `> ${cmd}`, "[agent] Escalating to threat analyst...", "[rag] Retrieving baseline vectors from OpenSearch..."]);
    try {
      const { data } = await fetch(GQL, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ query: MUTATION, variables: { i: cmd } })
      }).then(r=>r.json());
      if (data?.analyzeThreat) {
        const a = data.analyzeThreat;
        setOutput(prev => [...prev, `[verdict] Severity: ${a.severity}`, `[detail] ${a.message}`, "[complete] Investigation logged."]);
        refresh();
      }
    } catch {
      setOutput(prev => [...prev, "[error] Connection failed."]);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Investigation Workspace</h1>
        <p className="text-sm text-gray-500 mt-1">Deep-dive threat analysis powered by the SOCup AI RAG engine.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[["Open Cases", alerts.length], ["Agent Actions", stats.actions], ["Risk Score", stats.score + "/100"]].map(([l,v]) => (
          <div key={String(l)} className="panel p-4">
            <p className="text-xs text-gray-500">{l}</p>
            <p className="text-2xl font-bold text-white mt-1">{v}</p>
          </div>
        ))}
      </div>

      {/* Open Alerts */}
      <div className="panel p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Open Alerts — Requiring Investigation</h2>
        <div className="space-y-2">
          {alerts.length === 0 && <p className="text-gray-600 text-sm">No open alerts.</p>}
          {alerts.map(a => (
            <button key={a.id} onClick={() => setInput(`Investigate alert ${a.id}: ${a.message}`)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 hover:border-blue-500/30 transition-all group">
              <span className={`shrink-0 w-2 h-2 rounded-full ${a.severity==="CRITICAL"?"bg-red-500":"bg-orange-400"}`}/>
              <span className="text-xs text-gray-300 flex-1">{a.message}</span>
              <span className={`text-xs font-semibold ${a.severity==="CRITICAL"?"text-red-400":"text-orange-400"}`}>{a.severity}</span>
              <span className="text-gray-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity">→ Investigate</span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent */}
      <div className="panel p-5 border-t-2 border-t-blue-500/60">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <span className="text-blue-400">✦</span> AI Investigation Agent
        </h2>
        <div className="bg-black border border-white/8 rounded-lg p-4 h-52 overflow-y-auto font-mono text-xs space-y-0.5 mb-3">
          {output.map((l, i) => (
            <p key={i} className={l.startsWith(">")||l.startsWith("[cmd]") ? "text-blue-300" : l.startsWith("[verdict]")||l.startsWith("[detail]") ? "text-orange-300" : l.startsWith("[error]") ? "text-red-400" : l.startsWith("[complete]") ? "text-green-400" : "text-gray-500"}>{l}</p>
          ))}
          {loading && <p className="text-blue-400 animate-pulse">[agent] Processing...</p>}
        </div>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&investigate()}
            placeholder="Investigate an alert or describe threat context..."
            className="flex-1 bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 transition-colors"/>
          <button onClick={investigate} disabled={!input.trim()||loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all">
            Investigate
          </button>
        </div>
      </div>
    </div>
  );
}
