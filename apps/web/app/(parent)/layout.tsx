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
        <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 md:flex md:justify-between">
          <Link
            href="/dashboard"
            className="min-w-0 truncate rounded-full border-[2px] border-game-cyan-edge bg-game-cyan-soft px-3 py-1 font-bold text-game-cyan-edge"
          >
            🐾 Kitty Learn
          </Link>
          <nav
            aria-label="Parent navigation"
            className="col-span-2 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 text-sm [scrollbar-width:none] md:order-2 md:col-auto md:mx-0 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden"
          >
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full px-3 py-1 font-semibold text-muted-foreground hover:bg-game-cyan-soft hover:text-game-cyan-edge"
            >
              Dashboard
            </Link>
            <Link
              href="/children"
              className="shrink-0 rounded-full px-3 py-1 font-semibold text-muted-foreground hover:bg-game-orange-soft hover:text-game-orange-edge"
            >
              Children
            </Link>
            <Link
              href="/analytics"
              className="shrink-0 rounded-full px-3 py-1 font-semibold text-muted-foreground hover:bg-game-purple-soft hover:text-game-purple-edge"
            >
              Analytics
            </Link>
          </nav>
          <div className="flex items-center gap-2 justify-self-end text-sm md:order-3 md:gap-3">
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
