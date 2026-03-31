"use client";

import { useEffect, useState } from "react";

interface Monitor {
  id: string;
  name: string;
  url: string;
  last_status: boolean | null;
  avg_latency: number;
  total_checks: number;
  successful_checks: number;
}

export default function StatusPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  async function fetchMonitors() {
    const res = await fetch("/api/monitors");
    const data = await res.json();
    setMonitors(data);
    setLoading(false);
    setLastUpdate(new Date());
  }

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30000);
    return () => clearInterval(interval);
  }, []);

  const allOnline =
    monitors.length > 0 && monitors.every((m) => m.last_status === true);
  const someOffline = monitors.some((m) => m.last_status === false);

  const uptime = (m: Monitor) => {
    if (!m.total_checks || m.total_checks === 0) return "—";
    return ((m.successful_checks / m.total_checks) * 100).toFixed(2) + "%";
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-12 py-10 max-w-2xl mx-auto">
      <div className="mb-12">
        <a
          href="/"
          className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
        >
          ← inicio
        </a>
        <h1 className="text-2xl font-bold text-white mt-1">
          Ping<span className="text-green-400">Map</span>
          <span className="text-zinc-600 text-sm font-normal ml-3">status</span>
        </h1>
      </div>

      {!loading && (
        <div className="mb-12">
          <p
            className={`text-4xl font-bold mb-2 ${
              allOnline
                ? "text-green-400"
                : someOffline
                  ? "text-red-400"
                  : "text-zinc-400"
            }`}
          >
            {allOnline
              ? "Todos los sistemas operativos"
              : someOffline
                ? "Algunos sistemas con problemas"
                : "Verificando..."}
          </p>
          <p className="text-zinc-600 text-xs">
            Actualizado {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      )}

      <div>
        {monitors.map((m, i) => (
          <div
            key={m.id}
            className={`py-4 flex items-center justify-between ${i > 0 ? "border-t border-zinc-900" : ""}`}
          >
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
              <div>
                <p className="text-white text-sm">{m.name}</p>
                <p className="text-zinc-600 text-xs">{m.url}</p>
              </div>
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
        ))}
      </div>

      <p className="mt-16 text-zinc-700 text-xs">
        Powered by{" "}
        <a href="/" className="hover:text-green-400 transition-colors">
          PingMap
        </a>{" "}
        ·{" "}
        <a
          href="https://cubepath.com"
          target="_blank"
          className="hover:text-green-400 transition-colors"
        >
          CubePath
        </a>
      </p>
    </div>
  );
}
