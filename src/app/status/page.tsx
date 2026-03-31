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
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Ping<span className="text-green-400">Map</span>
          </h1>
          <p className="text-zinc-500 text-sm">
            Estado de los servicios en tiempo real
          </p>
        </div>

        {/* Status global */}
        {!loading && (
          <div
            className={`rounded-xl p-5 mb-8 flex items-center gap-4 ${
              allOnline
                ? "bg-green-500/10 border border-green-500/20"
                : someOffline
                  ? "bg-red-500/10 border border-red-500/20"
                  : "bg-zinc-800 border border-zinc-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex-shrink-0 ${
                allOnline
                  ? "bg-green-400"
                  : someOffline
                    ? "bg-red-500"
                    : "bg-zinc-500"
              }`}
              style={allOnline ? { boxShadow: "0 0 12px #4ade80" } : {}}
            />
            <div>
              <p
                className={`font-bold text-lg ${
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
                    : "Verificando sistemas..."}
              </p>
              <p className="text-zinc-500 text-xs mt-0.5">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Lista de servicios */}
        <div className="space-y-2">
          {loading && (
            <div className="text-zinc-500 text-sm text-center py-12">
              Cargando...
            </div>
          )}
          {monitors.map((m) => (
            <div
              key={m.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    m.last_status === null
                      ? "bg-zinc-600"
                      : m.last_status
                        ? "bg-green-400"
                        : "bg-red-500"
                  }`}
                  style={m.last_status ? { boxShadow: "0 0 6px #4ade80" } : {}}
                />
                <div>
                  <p className="text-white text-sm font-medium">{m.name}</p>
                  <p className="text-zinc-600 text-xs">{m.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <div className="text-right">
                  <p className="text-zinc-500">Uptime</p>
                  <p className="text-white font-bold">{uptime(m)}</p>
                </div>
                <div className="text-right">
                  <p className="text-zinc-500">Latencia</p>
                  <p className="text-white font-bold">
                    {m.avg_latency ? Math.round(m.avg_latency) + "ms" : "—"}
                  </p>
                </div>
                <span
                  className={`font-bold px-3 py-1 rounded-full text-xs ${
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
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-zinc-600 text-xs">
          Powered by{" "}
          <a href="/" className="text-green-600 hover:text-green-400">
            PingMap
          </a>{" "}
          · Desplegado en{" "}
          <a
            href="https://cubepath.com"
            target="_blank"
            className="text-green-600 hover:text-green-400"
          >
            CubePath
          </a>
        </div>
      </div>
    </div>
  );
}
