import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SOCup AI | Enterprise SOC Platform",
  description: "AI-powered Security Operations Center — real-time threat detection and autonomous investigation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-gray-300`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Header */}
            <header className="h-14 shrink-0 border-b border-white/10 flex items-center justify-between px-6 bg-black/60 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">SOC Cluster:</span>
                <span className="px-2 py-0.5 text-xs bg-white/5 border border-white/10 rounded text-gray-300 font-mono">PROD-US-EAST-1</span>
                <span className="relative flex h-2 w-2 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"/>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"/>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 font-mono" id="clock">--:--:--</span>
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm cursor-pointer hover:bg-white/10 transition-all">
                  👤
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            function tick() {
              const el = document.getElementById('clock');
              if (el) el.textContent = new Date().toLocaleTimeString('en-US', {hour12: false});
            }
            tick(); setInterval(tick, 1000);
          })();
        `}} />
      </body>
    </html>
  );
}
