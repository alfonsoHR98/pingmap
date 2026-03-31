import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const { rows } = await query(`
      SELECT
        m.*,
        COUNT(c.id) as total_checks,
        SUM(CASE WHEN c.ok THEN 1 ELSE 0 END) as successful_checks,
        AVG(c.latency) as avg_latency,
        (SELECT ok FROM checks WHERE monitor_id = m.id ORDER BY checked_at DESC LIMIT 1) as last_status
      FROM monitors m
      LEFT JOIN checks c ON c.monitor_id = m.id
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { name, url, interval, webhook_url } = await req.json();

  if (!name || !url) {
    return NextResponse.json(
      { error: "name y url son requeridos" },
      { status: 400 },
    );
  }

  const { rows } = await query(
    `INSERT INTO monitors (name, url, interval, webhook_url) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, url, interval ?? 60, webhook_url ?? null],
  );

  return NextResponse.json(rows[0], { status: 201 });
}
