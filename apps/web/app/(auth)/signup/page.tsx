import Link from "next/link"
import { SignupForm } from "./signup-form"

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Create parent account</h1>
        <p className="text-muted-foreground text-sm">
          You&apos;ll add your children after signing in.
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground">
        Already have one?{" "}
        <Link className="underline" href="/login">
          Log in
        </Link>
      </p>
    </div>
  )
}
