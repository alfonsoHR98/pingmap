interface Check {
  ok: boolean;
  checked_at: string;
}

export default function UptimeBar({ checks }: { checks: Check[] }) {
  const last90 = Array.isArray(checks) ? checks.slice(0, 90).reverse() : [];
  const empty = Array.from({ length: Math.max(0, 30 - last90.length) });

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center gap-0.5">
        {empty.map((_, i) => (
          <div
            key={`e-${i}`}
            className="flex-1 h-6 rounded-sm bg-zinc-800 min-w-0"
          />
        ))}
        {last90.map((c, i) => (
          <div
            key={`c-${i}`}
            title={new Date(c.checked_at).toLocaleString()}
            className={`flex-1 h-6 rounded-sm min-w-0 transition-colors ${
              c.ok ? "bg-green-500" : "bg-red-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
