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
  const [webhook, setWebhook] = useState("");
  const [adding, setAdding] = useState(false);
  const [stats, setStats] = useState<{
    total_monitors: number;
    total_checks: number;
    uptime_percent: number;
  } | null>(null);

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
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }

  async function addMonitor() {
    if (!name || !url) return;
    setAdding(true);
    await fetch("/api/monitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url, webhook_url: webhook }),
    });
    setName("");
    setUrl("");
    setWebhook("");
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
    <div className="min-h-screen bg-zinc-950 px-12 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <a
            href="/"
            className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
          >
            ← inicio
          </a>
          <h1 className="text-2xl font-bold text-white mt-1">
            Ping<span className="text-green-400">Map</span>
            <span className="text-zinc-600 text-sm font-normal ml-3">
              dashboard
            </span>
          </h1>
        </div>
        <a
          href="/map"
          className="text-zinc-500 hover:text-white text-sm transition-colors"
        >
          mapa →
        </a>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex gap-12 mb-12 pb-8 border-b border-zinc-900">
          <div>
            <p className="text-3xl font-bold text-white">
              {stats.total_monitors}
            </p>
            <p className="text-zinc-600 text-xs mt-1">monitores</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">
              {stats.total_checks}
            </p>
            <p className="text-zinc-600 text-xs mt-1">checks</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-400">
              {stats.uptime_percent}%
            </p>
            <p className="text-zinc-600 text-xs mt-1">uptime global</p>
          </div>
        </div>
      )}

      {/* Form agregar */}
      <div className="mb-10 pb-8 border-b border-zinc-900">
        <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4">
          Agregar monitor
        </p>
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent border-b border-zinc-800 focus:border-green-500 px-0 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none w-40 transition-colors"
          />
          <input
            type="text"
            placeholder="https://tuservicio.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="bg-transparent border-b border-zinc-800 focus:border-green-500 px-0 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none flex-1 transition-colors"
          />
          <button
            onClick={addMonitor}
            disabled={adding}
            className="text-green-400 hover:text-green-300 disabled:opacity-50 font-bold text-sm transition-colors"
          >
            {adding ? "..." : "+ agregar"}
          </button>
        </div>
        <input
          type="text"
          placeholder="Webhook URL (opcional)"
          value={webhook}
          onChange={(e) => setWebhook(e.target.value)}
          className="bg-transparent border-b border-zinc-800 focus:border-green-500 px-0 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none w-full transition-colors"
        />
      </div>

      {/* Lista monitores */}
      <div>
        {loading && <p className="text-zinc-600 text-sm">Cargando...</p>}
        {!loading && monitors.length === 0 && (
          <p className="text-zinc-700 text-sm">
            Sin monitores. Agrega uno arriba.
          </p>
        )}
        {monitors.map((m, i) => (
          <div
            key={m.id}
            onClick={() => (window.location.href = `/monitors/${m.id}`)}
            className={`py-5 cursor-pointer hover:bg-zinc-900/30 px-2 -mx-2 rounded transition-colors ${i > 0 ? "border-t border-zinc-900" : ""}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    m.last_status === null
                      ? "bg-zinc-600"
                      : m.last_status
                        ? "bg-green-400"
                        : "bg-red-500"
                  }`}
                  style={m.last_status ? { boxShadow: "0 0 6px #4ade80" } : {}}
                />
                <span className="text-white text-sm font-medium">{m.name}</span>
                <span className="text-zinc-600 text-xs">{m.url}</span>
              </div>
              <div className="flex items-center gap-8 text-xs">
                <span className="text-zinc-500">{uptime(m)}</span>
                <span className="text-zinc-500">
                  {m.avg_latency ? Math.round(m.avg_latency) + "ms" : "—"}
                </span>
                <span
                  className={`font-bold ${
                    m.last_status === null
                      ? "text-zinc-600"
                      : m.last_status
                        ? "text-green-400"
                        : "text-red-400"
                  }`}
                >
                  {m.last_status === null
                    ? "pendiente"
                    : m.last_status
                      ? "online"
                      : "offline"}
                </span>
              </div>
            </div>
            <UptimeBar checks={checks[m.id] ?? []} />
          </div>
        ))}
      </div>
    </div>
  );
}
