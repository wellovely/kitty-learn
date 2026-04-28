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
    <div className="min-h-svh">
      <header className="border-b bg-muted/30">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/units" className="font-semibold">
              Kitty Admin
            </Link>
            <Link href="/units" className="text-muted-foreground hover:text-foreground">
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
