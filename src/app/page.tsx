"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  total_monitors: number;
  total_checks: number;
  uptime_percent: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-12 p-8 bg-zinc-950">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-green-400 text-xs font-semibold mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          LIVE — Monitoreando en tiempo real
        </div>
        <h1 className="text-6xl font-bold text-white mb-4">
          Ping<span className="text-green-400">Map</span>
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mx-auto">
          Monitorea tus servicios en tiempo real y visualízalos en un mapa
          mundial
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {stats.total_monitors}
            </p>
            <p className="text-zinc-500 text-xs mt-1">Monitores activos</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">
              {stats.total_checks}
            </p>
            <p className="text-zinc-500 text-xs mt-1">Checks realizados</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {stats.uptime_percent ?? 100}%
            </p>
            <p className="text-zinc-500 text-xs mt-1">Uptime global</p>
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          href="/dashboard"
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-lg transition-colors"
        >
          Ir al Dashboard
        </Link>
        <Link
          href="/map"
          className="border border-zinc-700 hover:border-zinc-500 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Ver Mapa
        </Link>
        <Link
          href="/status"
          className="border border-zinc-700 hover:border-green-500/50 text-zinc-400 hover:text-green-400 px-6 py-3 rounded-lg transition-colors text-sm"
        >
          Ver Status →
        </Link>
      </div>

      <p className="text-zinc-600 text-sm">
        Desplegado en{" "}
        <a
          href="https://cubepath.com"
          target="_blank"
          className="text-green-600 hover:text-green-400"
        >
          CubePath
        </a>
      </p>
    </main>
  );
}
