import { NextRequest, NextResponse } from "next/server"
import { SubmitProgressBody } from "@/lib/validation/schemas"
import { submitProgress } from "@/lib/services/submit-progress"

export async function POST(req: NextRequest) {
  const parsed = SubmitProgressBody.safeParse(
    await req.json().catch(() => null)
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  try {
    const result = await submitProgress(parsed.data)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof Response) return err
    console.error("submit progress error", err)
    return NextResponse.json({ error: "internal" }, { status: 500 })
  }
}
