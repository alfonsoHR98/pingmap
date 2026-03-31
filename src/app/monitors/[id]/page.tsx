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
        <p className="text-zinc-600 text-sm">Cargando...</p>
      </div>
    );

  if (!monitor)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-600 text-sm">Monitor no encontrado</p>
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
    <div className="min-h-screen bg-zinc-950 px-12 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <a
          href="/dashboard"
          className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors"
        >
          ← dashboard
        </a>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-3">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                monitor.last_status === null
                  ? "bg-zinc-600"
                  : monitor.last_status
                    ? "bg-green-400"
                    : "bg-red-500"
              }`}
              style={
                monitor.last_status ? { boxShadow: "0 0 8px #4ade80" } : {}
              }
            />
            <h1 className="text-2xl font-bold text-white">{monitor.name}</h1>
            <span className="text-zinc-600 text-sm">{monitor.url}</span>
          </div>
          <span
            className={`text-sm font-bold ${
              monitor.last_status === null
                ? "text-zinc-600"
                : monitor.last_status
                  ? "text-green-400"
                  : "text-red-400"
            }`}
          >
            {monitor.last_status === null
              ? "pendiente"
              : monitor.last_status
                ? "online"
                : "offline"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-12 mb-12 pb-8 border-b border-zinc-900">
        <div>
          <p className="text-3xl font-bold text-green-400">{uptime}%</p>
          <p className="text-zinc-600 text-xs mt-1">uptime</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">
            {monitor.avg_latency ? Math.round(monitor.avg_latency) + "ms" : "—"}
          </p>
          <p className="text-zinc-600 text-xs mt-1">latencia promedio</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-white">
            {monitor.total_checks}
          </p>
          <p className="text-zinc-600 text-xs mt-1">total checks</p>
        </div>
      </div>

      {/* Gráfica */}
      <div className="mb-12">
        <p className="text-zinc-600 text-xs uppercase tracking-widest mb-6">
          Latencia — últimos 90 checks
        </p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#18181b" />
            <XAxis
              dataKey="time"
              tick={{ fill: "#3f3f46", fontSize: 10 }}
              interval={10}
            />
            <YAxis tick={{ fill: "#3f3f46", fontSize: 10 }} unit="ms" />
            <Tooltip
              contentStyle={{
                background: "#09090b",
                border: "1px solid #18181b",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
              }}
              formatter={(val: number) => [`${val}ms`, "latencia"]}
            />
            <Line
              type="monotone"
              dataKey="latency"
              stroke="#4ade80"
              strokeWidth={1.5}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Historial */}
      <div>
        <p className="text-zinc-600 text-xs uppercase tracking-widest mb-4">
          Historial reciente
        </p>
        <div className="space-y-0 max-h-80 overflow-y-auto">
          {checks.map((c, i) => (
            <div
              key={c.id}
              className={`flex items-center justify-between py-3 ${i > 0 ? "border-t border-zinc-900" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-bold w-8 ${c.ok ? "text-green-400" : "text-red-400"}`}
                >
                  {c.ok ? "OK" : "FAIL"}
                </span>
                <span className="text-zinc-600 text-xs">
                  {new Date(c.checked_at).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-zinc-500">
                <span>HTTP {c.status || "—"}</span>
                <span className="font-mono">{c.latency}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
