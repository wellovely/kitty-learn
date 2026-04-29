import Link from "next/link"
import { notFound } from "next/navigation"
import { requireParentOfChild } from "@/lib/auth/session"
import { GameButton } from "@workspace/ui/components/game-button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { updateChild, deleteChild } from "./actions"

const inputCls =
  "h-12 rounded-2xl border-[2px] border-neutral-200 bg-white text-base focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"

export default async function ChildSettings({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params
  let child
  try {
    child = await requireParentOfChild(childId)
  } catch {
    notFound()
  }

  const update = updateChild.bind(null, childId)
  const del = deleteChild.bind(null, childId)

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <Link
        href={`/children/${childId}`}
        className="text-sm font-bold text-game-cyan-edge underline-offset-4 hover:underline"
      >
        ← Back
      </Link>

      <div className="rounded-3xl border-[3px] border-game-cyan-edge bg-white p-6 shadow-[0_6px_0_0_var(--game-cyan-edge)] dark:bg-neutral-950">
        <h2 className="mb-4 text-xl font-bold">Edit {child.name}</h2>
        <form action={update} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="font-bold">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={child.name}
              required
              maxLength={50}
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="age" className="font-bold">
              Age
            </Label>
            <Input
              id="age"
              name="age"
              type="number"
              min={3}
              max={10}
              defaultValue={child.age}
              required
              className={inputCls}
            />
          </div>
          <GameButton type="submit" color="lime" size="md">
            Save
          </GameButton>
        </form>
      </div>

      <div className="rounded-3xl border-[3px] border-game-red-edge bg-game-red-soft p-6 shadow-[0_6px_0_0_var(--game-red-edge)]">
        <h2 className="mb-4 text-xl font-bold text-game-red-edge">⚠️ Danger zone</h2>
        <form action={del} className="flex flex-col gap-2">
          <GameButton type="submit" color="red" size="md">
            Delete child
          </GameButton>
          <p className="text-xs font-semibold text-game-red-edge">
            Removes this child and all their progress.
          </p>
        </form>
      </div>
    </div>
  )
}
