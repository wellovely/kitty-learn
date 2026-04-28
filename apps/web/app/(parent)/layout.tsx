import Link from "next/link"
import { requireRole } from "@/lib/auth/session"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole("parent")
  return (
    <div className="min-h-svh">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-semibold">
              Kitty Learn
            </Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/children" className="text-muted-foreground hover:text-foreground">
              Children
            </Link>
            <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
              Analytics
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden sm:inline">
              {profile.full_name ?? profile.id.slice(0, 8)}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
