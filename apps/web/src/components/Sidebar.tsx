"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/",             label: "Dashboard",       icon: "▦" },
  { href: "/investigations", label: "Investigations",  icon: "⚡" },
  { href: "/timeline",     label: "Attack Timeline",  icon: "≡" },
  { href: "/threat-intel", label: "Threat Intel",     icon: "◎" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-white/10 bg-[#0a0a0a] flex flex-col">
      <div className="p-5 border-b border-white/10 flex items-center gap-2.5">
        <span className="w-5 h-5 bg-blue-500 rounded" style={{boxShadow:"0 0 12px #3b82f6"}}/>
        <span className="text-white font-semibold text-base tracking-tight">SOCup AI</span>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => {
          const active = path === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${active ? "bg-white/8 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"}`}>
              <span className={`text-base w-5 text-center ${active ? "text-blue-400" : ""}`}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"/>
          <span className="text-xs text-gray-500">SOCup AI v2 · Active</span>
        </div>
      </div>
    </aside>
  );
}
