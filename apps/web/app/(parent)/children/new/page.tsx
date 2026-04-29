import Link from "next/link"
import {
  GameButton,
  gameButtonVariants,
} from "@workspace/ui/components/game-button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { createChild } from "./actions"

const inputCls =
  "h-12 rounded-2xl border-[2px] border-neutral-200 bg-white text-base focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"

export default function NewChildPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border-[3px] border-game-orange-edge bg-white p-6 shadow-[0_6px_0_0_var(--game-orange-edge)] dark:bg-neutral-950">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full border-[3px] border-game-orange-edge bg-game-orange text-xl">
            🧒
          </div>
          <h2 className="text-xl font-bold">Add a child</h2>
        </div>
        <form action={createChild} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="font-bold">
              Name
            </Label>
            <Input
              id="name"
              name="name"
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
              required
              defaultValue={5}
              className={inputCls}
            />
          </div>
          <div className="flex gap-2">
            <GameButton type="submit" color="lime" size="md">
              Add child
            </GameButton>
            <Link
              href="/dashboard"
              className={gameButtonVariants({ color: "neutral", size: "md" })}
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
