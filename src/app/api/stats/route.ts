import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { rows } = await query(`
    SELECT
      COUNT(DISTINCT m.id) as total_monitors,
      COUNT(c.id) as total_checks,
      ROUND(
        SUM(CASE WHEN c.ok THEN 1 ELSE 0 END)::numeric /
        NULLIF(COUNT(c.id), 0) * 100, 1
      ) as uptime_percent
    FROM monitors m
    LEFT JOIN checks c ON c.monitor_id = m.id
    WHERE m.active = true
  `);
  return NextResponse.json(rows[0]);
}
