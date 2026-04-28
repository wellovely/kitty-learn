import Link from "next/link"
import { notFound } from "next/navigation"
import { requireParentOfChild } from "@/lib/auth/session"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { updateChild, deleteChild } from "./actions"

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
      <Link href={`/children/${childId}`} className="text-muted-foreground text-sm underline">
        ← Back
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Edit {child.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={update} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={child.name} required maxLength={50} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={3}
                max={10}
                defaultValue={child.age}
                required
              />
            </div>
            <Button type="submit">Save</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={del}>
            <Button type="submit" variant="destructive">
              Delete child
            </Button>
            <p className="text-muted-foreground mt-2 text-xs">
              Removes this child and all their progress.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
