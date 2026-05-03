import { GameButton } from "@workspace/ui/components/game-button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { requireRole } from "@/lib/auth/session"
import { pickTone } from "@/lib/game-palette"
import { DeleteUserButton } from "./delete-user-button"
import { loadAdminUsers, updateUserProfile } from "./actions"

const inputCls =
  "h-11 rounded-2xl border-[2px] border-neutral-200 bg-white focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"

const selectCls = `${inputCls} w-full min-w-[7rem] cursor-pointer bg-white py-0 pr-8 dark:bg-neutral-950`

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    })
  } catch {
    return iso
  }
}

export default async function UsersAdminPage() {
  const me = await requireRole("admin")
  const users = await loadAdminUsers()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-sm text-muted-foreground">
        Change roles and names, or remove accounts. You cannot delete yourself or remove the last
        admin.
      </p>

      <div className="overflow-x-auto rounded-3xl border-[3px] border-game-purple-edge bg-white shadow-[0_6px_0_0_var(--game-purple-edge)] dark:bg-neutral-950">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-game-purple-edge/40 bg-game-purple-soft/50">
              <th className="px-3 py-3 font-bold text-game-purple-edge">User</th>
              <th className="px-3 py-3 font-bold text-game-purple-edge">Email</th>
              <th className="px-3 py-3 font-bold text-game-purple-edge">Joined</th>
              <th className="px-3 py-3 font-bold text-game-purple-edge">Edit</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const tone = pickTone(idx)
              const isSelf = u.id === me.id
              const displayName = u.full_name?.trim() || u.email || u.id.slice(0, 8)
              return (
                <tr
                  key={u.id}
                  className="border-b border-neutral-200 last:border-0 odd:bg-neutral-50/80 dark:border-neutral-800 dark:odd:bg-neutral-900/40"
                >
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      <span className={`font-semibold ${tone.edgeText}`}>
                        {u.full_name?.trim() || "—"}
                        {isSelf && (
                          <span className="ml-2 rounded-full border border-game-cyan-edge bg-game-cyan/15 px-2 py-0.5 text-xs font-bold text-game-cyan-edge">
                            You
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{u.id}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="px-3 py-3 align-top text-muted-foreground whitespace-nowrap">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <form action={updateUserProfile} className="flex flex-col gap-3">
                      <input type="hidden" name="userId" value={u.id} />
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`role-${u.id}`} className="text-xs font-bold">
                          Role
                        </Label>
                        <select
                          id={`role-${u.id}`}
                          name="role"
                          defaultValue={u.role}
                          className={selectCls}
                          aria-label="Role"
                        >
                          <option value="parent">parent</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label htmlFor={`fn-${u.id}`} className="text-xs font-bold">
                          Full name
                        </Label>
                        <Input
                          id={`fn-${u.id}`}
                          name="fullName"
                          defaultValue={u.full_name ?? ""}
                          className={inputCls}
                          maxLength={200}
                          autoComplete="off"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <GameButton type="submit" color="lime" size="sm">
                          Save
                        </GameButton>
                        {!isSelf && (
                          <DeleteUserButton userId={u.id} displayName={displayName} />
                        )}
                      </div>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">No users found.</p>
        )}
      </div>
    </div>
  )
}
