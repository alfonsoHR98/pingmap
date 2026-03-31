"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Monitor {
  id: string;
  name: string;
  url: string;
  last_status: boolean | null;
  avg_latency: number;
}

// Coordenadas simuladas por dominio para la demo
function getCoords(url: string): [number, number] {
  const coords: Record<string, [number, number]> = {
    "google.com": [37.4, -122.0],
    "github.com": [37.7, -122.4],
    "cloudflare.com": [48.8, 2.3],
    "vercel.com": [40.7, -74.0],
    "cubepath.com": [40.4, -3.7],
  };
  for (const [key, val] of Object.entries(coords)) {
    if (url.includes(key)) return val;
  }
  // Coordenadas random pero consistentes basadas en la URL
  const hash = url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return [(hash % 140) - 70, (hash % 340) - 170];
}

export default function MapView({ monitors }: { monitors: Monitor[] }) {
  useEffect(() => {
    // Fix leaflet icon en Next.js
    // @ts-expect-error leaflet types
    delete window.L?.Icon?.Default?.prototype?._getIconUrl;
  }, []);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", minHeight: "80vh", background: "#09090b" }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {monitors.map((m) => {
        const pos = getCoords(m.url);
        const online = m.last_status;
        return (
          <CircleMarker
            key={m.id}
            center={pos}
            radius={online ? 10 : 8}
            pathOptions={{
              color: online ? "#4ade80" : "#ef4444",
              fillColor: online ? "#4ade80" : "#ef4444",
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup className="dark-popup">
              <div
                style={{
                  background: "#18181b",
                  color: "#fff",
                  padding: "8px",
                  borderRadius: "8px",
                  minWidth: "160px",
                }}
              >
                <p style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  {m.name}
                </p>
                <p
                  style={{
                    color: "#71717a",
                    fontSize: "12px",
                    marginBottom: "8px",
                  }}
                >
                  {m.url}
                </p>
                <p
                  style={{
                    color: online ? "#4ade80" : "#ef4444",
                    fontWeight: "bold",
                  }}
                >
                  {online === null
                    ? "Pendiente"
                    : online
                      ? "● ONLINE"
                      : "● OFFLINE"}
                </p>
                {m.avg_latency && (
                  <p style={{ color: "#a1a1aa", fontSize: "12px" }}>
                    {Math.round(m.avg_latency)}ms promedio
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
