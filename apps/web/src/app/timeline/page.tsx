"use client";
import React, { useState, useEffect } from "react";

type Event = { id: string; timestamp: string; eventType: string; actor: string };
const GQL = "http://localhost:4000";
const QUERY = `query { getTimeline { id timestamp eventType actor } }`;
const ADD_MUTATION = `mutation A($type:String!,$actor:String!) { addTimelineEvent(eventType:$type,actor:$actor) { id timestamp eventType actor } }`;

const eventColors: Record<string, string> = {
  LOGIN: "text-blue-400",
  FILE_DOWNLOAD: "text-orange-400",
  LOGOUT: "text-gray-400",
  PRIVILEGE_ESCALATION: "text-red-400",
  SCAN: "text-yellow-400",
};

export default function TimelinePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newType, setNewType] = useState("LOGIN");
  const [newActor, setNewActor] = useState("");

  const refresh = async () => {
    try {
      const { data } = await fetch(GQL, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({query:QUERY}) }).then(r=>r.json());
      if (data?.getTimeline) setEvents(data.getTimeline);
    } catch {}
  };

  useEffect(() => { refresh(); const t = setInterval(refresh, 3000); return ()=>clearInterval(t); }, []);

  const addEvent = async () => {
    if (!newActor.trim()) return;
    await fetch(GQL, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({query:ADD_MUTATION, variables:{type:newType.toUpperCase(),actor:newActor}}) });
    setNewActor("");
    refresh();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Attack Timeline</h1>
        <p className="text-sm text-gray-500 mt-1">Chronological replay of all security events across monitored infrastructure.</p>
      </div>

      {/* Add event */}
      <div className="panel p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Inject Event (Simulation)</h2>
        <div className="flex gap-2">
          <select value={newType} onChange={e=>setNewType(e.target.value)}
            className="bg-white/3 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500/60">
            {["LOGIN","LOGOUT","FILE_DOWNLOAD","PRIVILEGE_ESCALATION","SCAN"].map(t=><option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" value={newActor} onChange={e=>setNewActor(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEvent()}
            placeholder="Actor / username (e.g. admin, root, service-acc)"
            className="flex-1 bg-white/3 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60"/>
          <button onClick={addEvent} disabled={!newActor.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-all">
            Inject
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="panel p-5">
        <h2 className="text-sm font-semibold text-white mb-4">{events.length} Recorded Events</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/8"/>
          <div className="space-y-3 pl-10">
            {[...events].reverse().map((evt, i) => (
              <div key={evt.id} className="relative fade-in">
                <div className={`absolute -left-6 top-3 w-2 h-2 rounded-full border ${i===0?"bg-blue-500 border-blue-400":"bg-gray-700 border-gray-600"}`}/>
                <div className="panel p-3 hover:bg-white/5 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold font-mono ${eventColors[evt.eventType]||"text-gray-400"}`}>{evt.eventType}</span>
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
