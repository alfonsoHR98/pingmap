import { query } from './db'

export async function pingMonitor(monitorId: string, url: string) {
  const start = Date.now()
  let ok = false
  let status = 0

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(10000),
    })
    status = res.status
    ok = res.ok
  } catch {
    ok = false
    status = 0
  }

  const latency = Date.now() - start

  await query(
    `INSERT INTO checks (monitor_id, status, latency, ok) VALUES ($1, $2, $3, $4)`,
    [monitorId, status, latency, ok]
  )

  return { ok, status, latency }
}

export async function pingAllMonitors() {
  const { rows } = await query(
    `SELECT id, url FROM monitors WHERE active = true`
  )

  await Promise.allSettled(
    rows.map((m) => pingMonitor(m.id, m.url))
  )
}