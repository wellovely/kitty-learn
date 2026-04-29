import Link from "next/link"
import { SignupForm } from "./signup-form"

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-20 items-center justify-center rounded-full border-[3px] border-game-purple-edge bg-game-purple-soft text-4xl shadow-[0_4px_0_0_var(--game-purple-edge)]">
          🐾
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Create parent account</h1>
          <p className="text-muted-foreground text-sm">
            You&apos;ll add your children after signing in.
          </p>
        </div>
      </div>
      <SignupForm />
      <p className="text-center text-sm font-semibold">
        <span className="text-muted-foreground">Already have one? </span>
        <Link
          className="text-game-cyan-edge underline-offset-4 hover:underline"
          href="/login"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
