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
    <main className="min-h-screen bg-zinc-950 flex flex-col justify-center px-12 max-w-3xl mx-auto">
      <div className="mb-16">
        <div className="flex items-center gap-2 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs tracking-widest uppercase">
            Live
          </span>
        </div>
        <h1 className="text-7xl font-bold text-white mb-4">
          Ping<span className="text-green-400">Map</span>
        </h1>
        <p className="text-zinc-500 text-xl max-w-md">
          Monitorea tus servicios en tiempo real y visualízalos en un mapa
          mundial
        </p>
      </div>

      {stats && (
        <div className="flex gap-16 mb-16">
          <div>
            <p className="text-4xl font-bold text-white">
              {stats.total_monitors}
            </p>
            <p className="text-zinc-600 text-sm mt-1">monitores activos</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">
              {stats.total_checks}
            </p>
            <p className="text-zinc-600 text-sm mt-1">checks realizados</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-green-400">
              {stats.uptime_percent}%
            </p>
            <p className="text-zinc-600 text-sm mt-1">uptime global</p>
          </div>
        </div>
      )}

      <div className="flex gap-6 items-center">
        <Link
          href="/dashboard"
          className="bg-green-500 hover:bg-green-400 text-black font-bold px-6 py-3 rounded-lg transition-colors text-sm"
        >
          Dashboard
        </Link>
        <Link
          href="/map"
          className="text-zinc-400 hover:text-white transition-colors text-sm"
        >
          Ver Mapa →
        </Link>
        <Link
          href="/status"
          className="text-zinc-400 hover:text-white transition-colors text-sm"
        >
          Status →
        </Link>
      </div>

      <p className="mt-16 text-zinc-700 text-xs">
        Desplegado en{" "}
        <a
          href="https://cubepath.com"
          target="_blank"
          className="text-zinc-500 hover:text-green-400 transition-colors"
        >
          CubePath
        </a>
      </p>
    </main>
  );
}
