import Link from "next/link"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-20 items-center justify-center rounded-full border-[3px] border-game-cyan-edge bg-game-cyan-soft text-4xl shadow-[0_4px_0_0_var(--game-cyan-edge)]">
          🐱
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Log in to continue your child&apos;s learning journey.
          </p>
        </div>
      </div>
      <LoginForm />
      <p className="text-center text-sm font-semibold">
        <span className="text-muted-foreground">New here? </span>
        <Link
          className="text-game-cyan-edge underline-offset-4 hover:underline"
          href="/signup"
        >
          Create a parent account
        </Link>
      </p>
    </div>
  )
}
