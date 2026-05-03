import { NextResponse, type NextRequest } from "next/server"
import { getUser } from "@/lib/auth/session"
import { getUnitWithSortedLessons } from "@/lib/services/lessons"

function isPostgrestNoRows(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "PGRST116"
  )
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ unitId: string }> }
) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  const { unitId } = await ctx.params
  try {
    const unit = await getUnitWithSortedLessons(unitId)
    return NextResponse.json(unit)
  } catch (err) {
    if (isPostgrestNoRows(err)) {
      return NextResponse.json({ error: "not_found" }, { status: 404 })
    }
    console.error("GET /api/curriculum/units/[unitId]", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
