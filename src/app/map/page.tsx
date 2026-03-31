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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-8 py-4 border-b border-zinc-900">
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
            <span className="text-zinc-500">online</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            <span className="text-zinc-500">offline</span>
          </span>
          <a
            href="/dashboard"
            className="text-zinc-500 hover:text-white transition-colors"
          >
            ← dashboard
          </a>
        </div>
      </div>
      <div className="flex-1">
        <MapView monitors={monitors} />
      </div>
    </div>
  );
}
