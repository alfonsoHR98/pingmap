"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Monitor {
  id: string;
  name: string;
  url: string;
  last_status: boolean | null;
  avg_latency: number;
  total_checks: number;
  successful_checks: number;
}

interface Check {
  id: string;
  ok: boolean;
  latency: number;
  status: number;
  checked_at: string;
}

export default function MonitorDetail() {
  const { id } = useParams();
  const [monitor, setMonitor] = useState<Monitor | null>(null);
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [m, c] = await Promise.all([
        fetch(`/api/monitors/${id}`).then((r) => r.json()),
        fetch(`/api/checks?monitorId=${id}`).then((r) => r.json()),
      ]);
      setMonitor(m);
      setChecks(c);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Cargando...</p>
      </div>
    );

  if (!monitor)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Monitor no encontrado</p>
      </div>
    );

  const uptime =
    monitor.total_checks > 0
      ? ((monitor.successful_checks / monitor.total_checks) * 100).toFixed(2)
      : "—";

  const chartData = [...checks].reverse().map((c, i) => ({
    index: i + 1,
    latency: c.ok ? c.latency : null,
    time: new Date(c.checked_at).toLocaleTimeString(),
  }));

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <a
              href="/dashboard"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              ← Dashboard
            </a>
            <div
              className={`w-3 h-3 rounded-full ${
                monitor.last_status === null
                  ? "bg-zinc-600"
                  : monitor.last_status
                    ? "bg-green-400"
                    : "bg-red-500"
              }`}
              style={
                monitor.last_status ? { boxShadow: "0 0 10px #4ade80" } : {}
              }
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{monitor.name}</h1>
              <p className="text-zinc-500 text-sm">{monitor.url}</p>
            </div>
          </div>
          <span
            className={`text-sm font-bold px-4 py-2 rounded-full ${
              monitor.last_status === null
                ? "bg-zinc-800 text-zinc-500"
                : monitor.last_status
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
            }`}
          >
            {monitor.last_status === null
              ? "PENDIENTE"
              : monitor.last_status
                ? "ONLINE"
                : "OFFLINE"}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-400">{uptime}%</p>
            <p className="text-zinc-500 text-xs mt-1">Uptime</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">
              {monitor.avg_latency
                ? Math.round(monitor.avg_latency) + "ms"
                : "—"}
            </p>
            <p className="text-zinc-500 text-xs mt-1">Latencia promedio</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-white">
              {monitor.total_checks}
            </p>
            <p className="text-zinc-500 text-xs mt-1">Total checks</p>
          </div>
        </div>

        {/* Gráfica de latencia */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">
            Latencia — últimos 90 checks
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#52525b", fontSize: 10 }}
                interval={10}
              />
              <YAxis tick={{ fill: "#52525b", fontSize: 10 }} unit="ms" />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(val: number) => [`${val}ms`, "Latencia"]}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#4ade80"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Historial de checks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Historial reciente
          </h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {checks.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      c.ok
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {c.ok ? "OK" : "FAIL"}
                  </span>
                  <span className="text-zinc-500 text-xs">
                    {new Date(c.checked_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span>HTTP {c.status || "—"}</span>
                  <span className="font-mono">{c.latency}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
