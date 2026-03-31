import { query } from "@/lib/db";
import { NextResponse } from "next/server";
import { getCoords } from "@/lib/geo";

export async function GET() {
  const { rows } = await query(`
    SELECT
      monitors.id, monitors.name, monitors.url,
      (SELECT ok FROM checks WHERE monitor_id = monitors.id ORDER BY checked_at DESC LIMIT 1) as last_status,
      AVG(c.latency) as avg_latency
    FROM monitors
    LEFT JOIN checks c ON c.monitor_id = monitors.id
    WHERE monitors.active = true
    GROUP BY monitors.id
  `);

  const withCoords = await Promise.all(
    rows.map(async (m) => {
      const coords = await getCoords(m.url);
      return { ...m, coords };
    }),
  );

  return NextResponse.json(withCoords.filter((m) => m.coords !== null));
}
