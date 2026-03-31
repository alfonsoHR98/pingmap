"use client";

import { useEffect, useState } from "react";
import UptimeBar from "@/components/UptimeBar";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  sort_order: number;
}

function SortableMonitor({
  m,
  checks,
  uptime,
  onDelete,
}: {
  m: Monitor;
  checks: Check[];
  uptime: string;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: m.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div
        className={`py-5 px-2 -mx-2 rounded transition-colors border-t border-zinc-900 first:border-0 ${
          isDragging ? "bg-zinc-900/80" : "hover:bg-zinc-900/30"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Handle de arrastre */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-500 transition-colors p-1 -ml-1"
              title="Arrastrar para reordenar"
            >
              <svg
                width="12"
                height="16"
                viewBox="0 0 12 16"
                fill="currentColor"
              >
                <circle cx="4" cy="3" r="1.5" />
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="4" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="4" cy="13" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </div>
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
            <div
              className="cursor-pointer"
              onClick={() => (window.location.href = `/monitors/${m.id}`)}
            >
              <span className="text-white text-sm font-medium hover:text-green-400 transition-colors">
                {m.name}
              </span>
              <p className="text-zinc-600 text-xs">{m.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-xs">
            <div className="text-right">
              <p className="text-zinc-600 text-xs">uptime</p>
              <p className="text-zinc-400 font-bold">{uptime}</p>
            </div>
            <div className="text-right">
              <p className="text-zinc-600 text-xs">latencia</p>
              <p className="text-zinc-400 font-bold">
                {m.avg_latency ? Math.round(m.avg_latency) + "ms" : "—"}
              </p>
            </div>
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
            {/* Botón eliminar */}
            <button
              onClick={() => onDelete(m.id)}
              className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-400 transition-all ml-2"
              title="Eliminar monitor"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        </div>
        <div className="pl-8">
          <UptimeBar checks={checks} />
        </div>
      </div>
    </div>
  );
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

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

  async function deleteMonitor(id: string) {
    if (!confirm("¿Eliminar este monitor?")) return;
    await fetch(`/api/monitors/${id}`, { method: "DELETE" });
    fetchMonitors();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = monitors.findIndex((m) => m.id === active.id);
    const newIndex = monitors.findIndex((m) => m.id === over.id);
    const newOrder = arrayMove(monitors, oldIndex, newIndex);
    setMonitors(newOrder);

    // Guardar orden en DB
    await Promise.all(
      newOrder.map((m, i) =>
        fetch(`/api/monitors/${m.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort_order: i }),
        }),
      ),
    );
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

      <div>
        {loading && <p className="text-zinc-600 text-sm">Cargando...</p>}
        {!loading && monitors.length === 0 && (
          <p className="text-zinc-700 text-sm">
            Sin monitores. Agrega uno arriba.
          </p>
        )}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={monitors.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {monitors.map((m) => (
              <SortableMonitor
                key={m.id}
                m={m}
                checks={checks[m.id] ?? []}
                uptime={uptime(m)}
                onDelete={deleteMonitor}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
