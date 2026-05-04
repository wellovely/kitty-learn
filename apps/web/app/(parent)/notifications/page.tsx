import { createClient } from "@/lib/db/server"
import { requireUser } from "@/lib/auth/session"
import { Card, CardContent } from "@workspace/ui/components/card"
import { GameButton } from "@workspace/ui/components/game-button"
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "./actions"

const TYPE_TONE: Record<
  string,
  { label: string; edge: string; soft: string; text: string }
> = {
  achievement: {
    label: "Achievement",
    edge: "border-game-amber-edge",
    soft: "bg-game-amber-soft",
    text: "text-game-amber-edge",
  },
  streak_risk: {
    label: "Streak at risk",
    edge: "border-game-red-edge",
    soft: "bg-game-red-soft",
    text: "text-game-red-edge",
  },
  weekly_summary: {
    label: "Weekly summary",
    edge: "border-game-purple-edge",
    soft: "bg-game-purple-soft",
    text: "text-game-purple-edge",
  },
}

function formatWhen(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default async function NotificationsPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: items } = await supabase
    .from("notifications")
    .select("id, type, title, body, payload, created_at, read_at")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  const unread = (items ?? []).filter((n) => !n.read_at)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm font-semibold text-muted-foreground">
            {unread.length} unread
          </p>
        </div>
        {unread.length > 0 ? (
          <form action={markAllNotificationsRead}>
            <GameButton type="submit" color="neutral" size="sm">
              Mark all read
            </GameButton>
          </form>
        ) : null}
      </header>

      {(!items || items.length === 0) ? (
        <Card className="border-[3px] border-dashed border-game-cyan-edge bg-game-cyan-soft/40">
          <CardContent className="py-10 text-center font-semibold text-game-cyan-edge">
            No notifications yet.
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((n) => {
            const tone = TYPE_TONE[n.type] ?? TYPE_TONE.achievement!
            const isUnread = !n.read_at
            return (
              <li
                key={n.id}
                className={`rounded-2xl border-[3px] ${tone.edge} ${
                  isUnread ? tone.soft : "bg-white dark:bg-neutral-950"
                } p-4`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border-[2px] ${tone.edge} bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone.text}`}
                      >
                        {tone.label}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {formatWhen(n.created_at)}
                      </span>
                      {isUnread ? (
                        <span className="size-2 rounded-full bg-game-red-edge" />
                      ) : null}
                    </div>
                    <span className="font-bold">{n.title}</span>
                    {n.body ? (
                      <span className="text-sm text-muted-foreground">
                        {n.body}
                      </span>
                    ) : null}
                  </div>
                  {isUnread ? (
                    <form
                      action={async () => {
                        "use server"
                        await markNotificationRead(n.id)
                      }}
                    >
                      <GameButton type="submit" color="neutral" size="sm">
                        Mark read
                      </GameButton>
                    </form>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
