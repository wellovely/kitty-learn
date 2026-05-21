import { getProfile, requireUser } from "@/lib/auth/session"
import { ParentNotificationListener } from "@/components/parent/parent-notification-listener"

export default async function ChildLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()
  const profile = await getProfile()
  const isParent = profile?.role === "parent"

  return (
    <div className="relative min-h-svh bg-[#fbfaf6] dark:bg-neutral-950">
      {isParent && profile ? (
        <ParentNotificationListener parentId={profile.id} />
      ) : null}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(88,204,2,0.10),transparent),radial-gradient(ellipse_50%_30%_at_50%_100%,rgba(255,150,0,0.08),transparent)]"
      />
      <div className="relative mx-auto w-full max-w-md px-4 pt-4 pb-16">
        {children}
      </div>
    </div>
  )
}
