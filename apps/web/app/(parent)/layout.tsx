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
    <div className="min-h-svh bg-gradient-to-b from-game-cyan-soft/40 to-transparent">
      <header className="border-b-[3px] border-game-cyan-edge bg-white dark:bg-neutral-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/dashboard"
              className="rounded-full border-[2px] border-game-cyan-edge bg-game-cyan-soft px-3 py-1 font-bold text-game-cyan-edge"
            >
              🐾 Kitty Learn
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full px-3 py-1 font-semibold text-muted-foreground hover:bg-game-cyan-soft hover:text-game-cyan-edge"
            >
              Dashboard
            </Link>
            <Link
              href="/children"
              className="rounded-full px-3 py-1 font-semibold text-muted-foreground hover:bg-game-orange-soft hover:text-game-orange-edge"
            >
              Children
            </Link>
            <Link
              href="/analytics"
              className="rounded-full px-3 py-1 font-semibold text-muted-foreground hover:bg-game-purple-soft hover:text-game-purple-edge"
            >
              Analytics
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground hidden font-semibold sm:inline">
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
