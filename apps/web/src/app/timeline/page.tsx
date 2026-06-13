"use client";
import React, { useState, useEffect, useCallback } from "react";
import type { TimelineEvent, ConnectionState } from "@/lib/graphql";
import { fetchTimeline, addTimelineEvent } from "@/lib/graphql";
import ConnectionStatus from "@/components/ConnectionStatus";

const EVENT_COLORS: Record<string, string> = {
  LOGIN:                "text-blue-400",
  FILE_DOWNLOAD:        "text-orange-400",
  LOGOUT:               "text-gray-400",
  PRIVILEGE_ESCALATION: "text-red-400",
  SCAN:                 "text-yellow-400",
};

const EVENT_TYPES = ["LOGIN", "LOGOUT", "FILE_DOWNLOAD", "PRIVILEGE_ESCALATION", "SCAN"];

const MOCK_EVENTS: TimelineEvent[] = [
  { id: "101", timestamp: new Date(Date.now() - 120000).toISOString(), eventType: "LOGIN", actor: "admin" },
  { id: "102", timestamp: new Date(Date.now() - 90000).toISOString(), eventType: "FILE_DOWNLOAD", actor: "admin" },
  { id: "103", timestamp: new Date(Date.now() - 60000).toISOString(), eventType: "PRIVILEGE_ESCALATION", actor: "svc_anomaly" },
  { id: "104", timestamp: new Date(Date.now() - 30000).toISOString(), eventType: "SCAN", actor: "unknown@203.0.113.0" },
  { id: "105", timestamp: new Date(Date.now() - 15000).toISOString(), eventType: "LOGOUT", actor: "admin" },
];

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>(MOCK_EVENTS);
  const [conn, setConn] = useState<ConnectionState>("offline");
  const [newType, setNewType] = useState("LOGIN");
  const [newActor, setNewActor] = useState("");

  const refresh = useCallback(async () => {
    const { events: e, state } = await fetchTimeline();
    setEvents(e);
    setConn(state);
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, 3000);
    return () => clearInterval(t);
  }, [refresh]);

  const inject = async () => {
    if (!newActor.trim()) return;
    const actor = newActor.trim();
    setNewActor("");
    const { state } = await addTimelineEvent(newType, actor);
    setConn(state);
    refresh();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Attack Timeline</h1>
          <p className="text-sm text-gray-500 mt-1">Chronological replay of all security events across monitored infrastructure.</p>
        </div>
        <ConnectionStatus state={conn} />
      </div>

      <div className="panel p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Inject Event</h2>
        <div className="flex gap-2">
          <select value={newType} onChange={e => setNewType(e.target.value)}
            className="bg-white/3 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/60">
            {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" value={newActor} onChange={e => setNewActor(e.target.value)} onKeyDown={e => e.key === "Enter" && inject()}
            placeholder="Actor / username"
            className="flex-1 bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60"/>
          <button onClick={inject} disabled={!newActor.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all">
            Inject
          </button>
        </div>
      </div>

      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">{events.length} Recorded Events</h2>
          <span className="text-xs text-gray-600 font-mono">{conn === "offline" ? "demo data" : conn === "degraded" ? "live + cached" : "live"}</span>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/8"/>
          <div className="space-y-3 pl-10">
            {events.length === 0 && <p className="text-gray-600 text-sm pl-4">No events recorded.</p>}
            {[...events].reverse().map((evt, i) => (
              <div key={evt.id} className="relative fade-in">
                <div className={`absolute -left-6 top-3 w-2 h-2 rounded-full border ${i === 0 ? "bg-blue-500 border-blue-400" : "bg-gray-700 border-gray-600"}`}/>
                <div className="panel p-3 hover:bg-white/5 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold font-mono ${EVENT_COLORS[evt.eventType] || "text-gray-400"}`}>{evt.eventType}</span>
                    <span className="text-xs text-gray-600 tabular-nums">{new Date(evt.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Actor: <span className="text-gray-300">{evt.actor}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
