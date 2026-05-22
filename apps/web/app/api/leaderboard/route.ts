import { NextRequest, NextResponse } from "next/server"
import { getProfile, getUser } from "@/lib/auth/session"
import { getGlobalLeaderboard } from "@/lib/services/leaderboard"

export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const profile = await getProfile()
  if (!profile || (profile.role !== "parent" && profile.role !== "admin")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 })
  }

  const rawLimit = req.nextUrl.searchParams.get("limit")
  const parsedLimit = rawLimit ? Number.parseInt(rawLimit, 10) : 50
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 50

  try {
    const entries = await getGlobalLeaderboard({
      parentId: user.id,
      limit,
    })
    return NextResponse.json({ entries })
  } catch (err) {
    console.error("leaderboard error", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
