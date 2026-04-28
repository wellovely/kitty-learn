import Link from "next/link"
import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Log in to continue your child&apos;s learning journey.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link className="underline" href="/signup">
          Create a parent account
        </Link>
      </p>
    </div>
  )
}
