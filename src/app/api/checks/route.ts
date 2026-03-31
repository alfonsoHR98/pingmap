import { query } from "@/lib/db";
import { NextResponse } from "next/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const monitorId = searchParams.get("monitorId");

  if (!monitorId || !UUID_REGEX.test(monitorId)) {
    return NextResponse.json({ error: "monitorId inválido" }, { status: 400 });
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
