"use client";

import { useEffect, useState } from "react";
import UptimeBar from "@/components/UptimeBar";

interface Check {
  ok: boolean;
  checked_at: string;
}

interface Monitor {
  id: string;
  name: string;
  url: string;
  active: boolean;
  total_checks: number;
  successful_checks: number;
  avg_latency: number;
  last_status: boolean;
}

export default function Dashboard() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [checks, setChecks] = useState<Record<string, Check[]>>({});
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [adding, setAdding] = useState(false);

  async function fetchMonitors() {
    const res = await fetch("/api/monitors");
    const data = await res.json();
    setMonitors(data);
    setLoading(false);
    data.forEach(async (m: Monitor) => {
      try {
        const r = await fetch(`/api/checks?monitorId=${m.id}`);
        if (r.ok) {
          const c = await r.json();
          setChecks((prev) => ({ ...prev, [m.id]: c }));
        }
      } catch {}
    });
  }

  async function addMonitor() {
    if (!name || !url) return;
    setAdding(true);
    await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url }),
    });
    setName("");
    setUrl("");
    setAdding(false);
    fetchMonitors();
  }

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, []);

  const uptime = (m: Monitor) => {
    if (!m.total_checks || m.total_checks === 0) return "—";
    return ((m.successful_checks / m.total_checks) * 100).toFixed(1) + "%";
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            Ping<span className="text-green-400">Map</span>
            <span className="text-zinc-500 text-sm font-normal ml-3">
              Dashboard
            </span>
          </h1>
          <a
            href="/map"
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Ver Mapa →
          </a>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Agregar Monitor
          </h2>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 w-48"
            />
            <input
              type="text"
              placeholder="https://tuservicio.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500 flex-1"
            />
            <button
              onClick={addMonitor}
              disabled={adding}
              className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-bold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {adding ? "..." : "+ Agregar"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {loading && (
            <div className="text-zinc-500 text-sm text-center py-12">
              Cargando monitores...
            </div>
          )}
          {!loading && monitors.length === 0 && (
            <div className="text-zinc-600 text-sm text-center py-12">
              No hay monitores. Agrega uno arriba ↑
            </div>
          )}
          {monitors.map((m) => (
            <div
              key={m.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      m.last_status === null
                        ? "bg-zinc-600"
                        : m.last_status
                          ? "bg-green-400"
                          : "bg-red-500"
                    }`}
                    style={
                      m.last_status ? { boxShadow: "0 0 8px #4ade80" } : {}
                    }
                  />
                  <div>
                    <p className="font-semibold text-white text-sm">{m.name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{m.url}</p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-sm">
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs">Uptime</p>
                    <p className="font-bold text-white">{uptime(m)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-500 text-xs">Latencia</p>
                    <p className="font-bold text-white">
                      {m.avg_latency ? Math.round(m.avg_latency) + "ms" : "—"}
                    </p>
                  </div>
                  <div
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      m.last_status === null
                        ? "bg-zinc-800 text-zinc-500"
                        : m.last_status
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {m.last_status === null
                      ? "PENDIENTE"
                      : m.last_status
                        ? "ONLINE"
                        : "OFFLINE"}
                  </div>
                </div>
              </div>
              {/* Barra de historial */}
              <div className="flex items-center gap-3">
                <div className="flex-1 overflow-hidden">
                  <UptimeBar checks={checks[m.id] ?? []} />
                </div>
                <span className="text-zinc-600 text-xs whitespace-nowrap">
                  últimos 90 checks
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
