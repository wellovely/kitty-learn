import { Suspense } from "react"
import Link from "next/link"
import { BellIcon } from "lucide-react"
import { KittyNavigationLoader } from "@/components/navigation/kitty-navigation-loader"
import { requireRole } from "@/lib/auth/session"
import { createClient } from "@/lib/db/server"
import { SignOutButton } from "@/components/auth/sign-out-button"
import { ParentNotificationListener } from "@/components/parent/parent-notification-listener"

const NAV = [
  { href: "/dashboard", label: "Dashboard", hover: "hover:bg-game-cyan-soft hover:text-game-cyan-edge" },
  { href: "/children", label: "Children", hover: "hover:bg-game-orange-soft hover:text-game-orange-edge" },
  { href: "/analytics", label: "Analytics", hover: "hover:bg-game-purple-soft hover:text-game-purple-edge" },
] as const

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await requireRole("parent")
  const supabase = await createClient()
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", profile.id)
    .is("read_at", null)
  const unread = unreadCount ?? 0

  return (
    <div className="min-h-svh bg-gradient-to-b from-game-cyan-soft/40 to-transparent">
      <Suspense fallback={null}>
        <KittyNavigationLoader variant="parent" />
      </Suspense>
      <ParentNotificationListener parentId={profile.id} />
      <header className="border-b-[3px] border-game-cyan-edge bg-white dark:bg-neutral-950">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-1.5 rounded-full border-[2px] border-game-cyan-edge bg-game-cyan-soft px-3 py-1 text-sm font-bold text-game-cyan-edge"
            aria-label="Kitty Learn home"
          >
            <span className="hidden sm:inline">Kitty Learn</span>
          </Link>

          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-sm">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-3 py-1 font-semibold whitespace-nowrap text-muted-foreground ${n.hover}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/notifications"
            aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
            className="relative flex size-9 shrink-0 items-center justify-center rounded-full border-[2px] border-game-amber-edge bg-game-amber-soft text-game-amber-edge transition-transform hover:-translate-y-0.5"
          >
            <BellIcon className="size-4" aria-hidden="true" />
            {unread > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full border-[2px] border-game-red-edge bg-game-red-soft px-1 text-[10px] font-bold text-game-red-edge">
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </Link>

          <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-muted-foreground md:inline">
            {profile.full_name ?? profile.id.slice(0, 8)}
          </span>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
