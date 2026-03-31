"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

interface Monitor {
  id: string;
  name: string;
  url: string;
  last_status: boolean | null;
  avg_latency: number;
  coords: [number, number];
}

export default function MapPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);

  async function fetchMonitors() {
    const res = await fetch("/api/geo");
    const data = await res.json();
    setMonitors(data);
  }

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 15000);
    return () => clearInterval(interval);
  }, []);

  const online = monitors.filter((m) => m.last_status === true).length;
  const offline = monitors.filter((m) => m.last_status === false).length;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-900 z-10">
        <h1 className="text-xl font-bold">
          Ping<span className="text-green-400">Map</span>
          <span className="text-zinc-600 text-sm font-normal ml-3">
            mapa mundial
          </span>
        </h1>
        <div className="flex items-center gap-6 text-xs">
          <span className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"
              style={{ boxShadow: "0 0 6px #4ade80" }}
            />
            <span className="text-zinc-400">{online} online</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            <span className="text-zinc-400">{offline} offline</span>
          </span>
          <a
            href="/dashboard"
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ← dashboard
          </a>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 border-r border-zinc-900 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4">
              Servicios
            </p>
            <div className="space-y-0">
              {monitors.map((m, i) => (
                <div
                  key={m.id}
                  onClick={() => (window.location.href = `/monitors/${m.id}`)}
                  className={`py-3 cursor-pointer hover:bg-zinc-900/50 px-2 -mx-2 rounded transition-colors ${i > 0 ? "border-t border-zinc-900" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          m.last_status === null
                            ? "bg-zinc-600"
                            : m.last_status
                              ? "bg-green-400"
                              : "bg-red-500"
                        }`}
                        style={
                          m.last_status ? { boxShadow: "0 0 4px #4ade80" } : {}
                        }
                      />
                      <span className="text-white text-xs font-medium">
                        {m.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        m.last_status === null
                          ? "text-zinc-600"
                          : m.last_status
                            ? "text-green-400"
                            : "text-red-400"
                      }`}
                    >
                      {m.last_status === null
                        ? "—"
                        : m.last_status
                          ? "ok"
                          : "fail"}
                    </span>
                  </div>
                  <p className="text-zinc-600 text-xs pl-3.5">
                    {m.avg_latency ? Math.round(m.avg_latency) + "ms" : "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1">
          <MapView monitors={monitors} />
        </div>
      </div>
    </div>
  );
}
