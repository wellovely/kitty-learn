import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth/session"
import { listUnitsWithLessons } from "@/lib/services/lessons"

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const units = await listUnitsWithLessons()
    return NextResponse.json(units)
  } catch (err) {
    console.error("GET /api/curriculum/units", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
