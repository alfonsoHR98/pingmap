import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { rows } = await query(
    `
    SELECT
      m.*,
      COUNT(c.id) as total_checks,
      SUM(CASE WHEN c.ok THEN 1 ELSE 0 END) as successful_checks,
      AVG(c.latency) as avg_latency,
      (SELECT ok FROM checks WHERE monitor_id = m.id ORDER BY checked_at DESC LIMIT 1) as last_status
    FROM monitors m
    LEFT JOIN checks c ON c.monitor_id = m.id
    WHERE m.id = $1
    GROUP BY m.id
  `,
    [id],
  );

  if (!rows[0])
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
