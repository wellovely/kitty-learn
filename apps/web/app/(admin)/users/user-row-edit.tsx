"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GameButton } from "@workspace/ui/components/game-button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { updateUserProfile } from "./actions"

type Role = "parent" | "admin"

const inputCls =
  "h-11 rounded-2xl border-[2px] border-neutral-200 bg-white focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"

function normalizeName(v: string | null): string {
  return (v ?? "").trim()
}

export function UserRowEdit({
  userId,
  initialRole,
  initialFullName,
  isSelf,
}: {
  userId: string
  initialRole: Role
  initialFullName: string | null
  isSelf: boolean
}) {
  const router = useRouter()
  const [role, setRole] = useState<Role>(initialRole)
  const [fullName, setFullName] = useState<string>(initialFullName ?? "")
  const [pending, startTransition] = useTransition()

  const dirty = useMemo(() => {
    const nameChanged =
      normalizeName(fullName) !== normalizeName(initialFullName)
    const roleChanged = role !== initialRole
    return nameChanged || roleChanged
  }, [fullName, role, initialRole, initialFullName])

  const roleChanged = role !== initialRole

  function reset() {
    setRole(initialRole)
    setFullName(initialFullName ?? "")
  }

  function save() {
    if (!dirty || pending) return
    const fd = new FormData()
    fd.set("userId", userId)
    fd.set("role", role)
    fd.set("fullName", fullName)
    startTransition(async () => {
      try {
        await updateUserProfile(fd)
        toast.success(
          roleChanged
            ? `Role updated: ${initialRole} → ${role}`
            : "Profile saved"
        )
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Save failed")
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`role-${userId}`} className="text-xs font-bold">
          Role
        </Label>
        <RoleSegment
          id={`role-${userId}`}
          value={role}
          onChange={setRole}
          disabled={isSelf || pending}
          changed={roleChanged}
        />
        {isSelf ? (
          <span className="text-xs font-semibold text-muted-foreground">
            You can&apos;t change your own role.
          </span>
        ) : roleChanged ? (
          <span className="text-xs font-bold text-game-amber-edge">
            Pending: {initialRole} → {role}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`fn-${userId}`} className="text-xs font-bold">
          Full name
        </Label>
        <Input
          id={`fn-${userId}`}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={pending}
          className={inputCls}
          maxLength={200}
          autoComplete="off"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <GameButton
          type="button"
          color={dirty ? "lime" : "neutral"}
          size="sm"
          disabled={!dirty || pending}
          onClick={save}
        >
          {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </GameButton>
        {dirty && !pending ? (
          <button
            type="button"
            onClick={reset}
            className="rounded-full border-[2px] border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            Reset
          </button>
        ) : null}
        {dirty ? (
          <span className="ml-1 inline-flex items-center gap-1 rounded-full border-[2px] border-game-amber-edge bg-game-amber-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-game-amber-edge">
            Unsaved
          </span>
        ) : null}
      </div>
    </div>
  )
}

function RoleSegment({
  id,
  value,
  onChange,
  disabled,
  changed,
}: {
  id: string
  value: Role
  onChange: (r: Role) => void
  disabled: boolean
  changed: boolean
}) {
  const baseCell =
    "flex-1 rounded-xl px-3 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Role"
      className={`flex gap-1 rounded-2xl border-[2px] p-1 ${
        changed
          ? "border-game-amber-edge bg-game-amber-soft/40"
          : "border-neutral-200 bg-white dark:bg-neutral-950"
      }`}
    >
      {(["parent", "admin"] as const).map((r) => {
        const selected = value === r
        return (
          <button
            key={r}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(r)}
            className={`${baseCell} ${
              selected
                ? r === "admin"
                  ? "bg-game-purple text-white"
                  : "bg-game-cyan text-white"
                : "text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-900"
            }`}
          >
            {r === "admin" ? "Admin" : "Parent"}
          </button>
        )
      })}
    </div>
  )
}
