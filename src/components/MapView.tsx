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
  coords: [number, number];
}

export default function MapView({ monitors }: { monitors: Monitor[] }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
    }
  }, []);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      style={{ height: "100%", minHeight: "90vh", background: "#09090b" }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
      />
      {monitors.map((m) => {
        const online = m.last_status;
        return (
          <CircleMarker
            key={m.id}
            center={m.coords}
            radius={12}
            pathOptions={{
              color: online ? "#4ade80" : "#ef4444",
              fillColor: online ? "#4ade80" : "#ef4444",
              fillOpacity: 0.9,
              weight: online ? 3 : 2,
            }}
          >
            <Popup>
              <div
                style={{
                  background: "#09090b",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "8px",
                  minWidth: "180px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: online ? "#4ade80" : "#ef4444",
                      display: "inline-block",
                      boxShadow: online ? "0 0 6px #4ade80" : "none",
                    }}
                  />
                  <strong style={{ fontSize: "13px" }}>{m.name}</strong>
                </div>
                <p
                  style={{
                    color: "#52525b",
                    fontSize: "11px",
                    marginBottom: "8px",
                  }}
                >
                  {m.url}
                </p>
                <p
                  style={{
                    color: online ? "#4ade80" : "#ef4444",
                    fontWeight: "bold",
                    fontSize: "12px",
                  }}
                >
                  {online === null
                    ? "pendiente"
                    : online
                      ? "online"
                      : "offline"}
                </p>
                {m.avg_latency && (
                  <p
                    style={{
                      color: "#52525b",
                      fontSize: "11px",
                      marginTop: "4px",
                    }}
                  >
                    ⚡ {Math.round(m.avg_latency)}ms promedio
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
