import { query } from "./db";

export async function pingMonitor(monitorId: string, url: string) {
  const start = Date.now();
  let ok = false;
  let status = 0;

  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    });
    status = res.status;
    ok = res.ok;
  } catch {
    ok = false;
    status = 0;
  }

  const latency = Date.now() - start;

  // Obtener estado anterior
  const { rows: prev } = await query(
    `SELECT last_ok, webhook_url FROM monitors WHERE id = $1`,
    [monitorId],
  );

  await query(
    `INSERT INTO checks (monitor_id, status, latency, ok) VALUES ($1, $2, $3, $4)`,
    [monitorId, status, latency, ok],
  );

  // Actualizar last_ok
  await query(`UPDATE monitors SET last_ok = $1 WHERE id = $2`, [
    ok,
    monitorId,
  ]);

  // Disparar webhook si cambió el estado
  const prevOk = prev[0]?.last_ok;
  const webhookUrl = prev[0]?.webhook_url;

  if (webhookUrl && prevOk !== null && prevOk !== ok) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monitor_id: monitorId,
          url,
          status: ok ? "ONLINE" : "OFFLINE",
          latency,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log(
        `[webhook] Disparado para ${url} → ${ok ? "ONLINE" : "OFFLINE"}`,
      );
    } catch {
      console.error(`[webhook] Error disparando webhook para ${url}`);
    }
  }

  return { ok, status, latency };
}

export async function pingAllMonitors() {
  const { rows } = await query(
    `SELECT id, url FROM monitors WHERE active = true`,
  );
  await Promise.allSettled(rows.map((m) => pingMonitor(m.id, m.url)));
}
