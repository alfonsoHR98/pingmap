import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const monitorId = searchParams.get("monitorId");

  if (!monitorId) {
    return NextResponse.json({ error: "monitorId requerido" }, { status: 400 });
  }

  const { rows } = await query(
    `SELECT * FROM checks
       WHERE monitor_id = $1
       ORDER BY checked_at DESC
       LIMIT 90`,
    [monitorId],
  );

  return NextResponse.json(rows);
}
