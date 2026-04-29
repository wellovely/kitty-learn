import Link from "next/link"
import { requireRole } from "@/lib/auth/session"
import { SignOutButton } from "@/components/auth/sign-out-button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole("admin")
  return (
    <div className="min-h-svh bg-gradient-to-b from-game-purple-soft/40 to-transparent">
      <header className="border-b-[3px] border-game-purple-edge bg-white dark:bg-neutral-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/units"
              className="rounded-full border-[2px] border-game-purple-edge bg-game-purple-soft px-3 py-1 font-bold text-game-purple-edge"
            >
              🛠 Kitty Admin
            </Link>
            <Link
              href="/units"
              className="rounded-full px-3 py-1 font-semibold text-muted-foreground hover:bg-game-purple-soft hover:text-game-purple-edge"
            >
              Units &amp; lessons
            </Link>
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
