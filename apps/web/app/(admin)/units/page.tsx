import Link from "next/link"
import { createClient } from "@/lib/db/server"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { createUnit, createLesson, deleteUnit } from "./actions"

export default async function UnitsAdmin() {
  const supabase = await createClient()
  const { data: units } = await supabase
    .from("units")
    .select("id, title, order_index, min_age, lessons(id, title, order_index)")
    .order("order_index")

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Units &amp; lessons</h1>

      <Card>
        <CardHeader>
          <CardTitle>New unit</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUnit} className="grid gap-3 md:grid-cols-4 md:items-end">
            <div className="flex flex-col gap-1 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="orderIndex">Order</Label>
              <Input
                id="orderIndex"
                name="orderIndex"
                type="number"
                min={0}
                required
                defaultValue={0}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="minAge">Min age</Label>
              <Input
                id="minAge"
                name="minAge"
                type="number"
                min={3}
                max={10}
                defaultValue={3}
              />
            </div>
            <Button type="submit" className="md:col-span-4 md:w-max">
              Add unit
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {(units ?? []).map((u) => {
          const lessons = [...(u.lessons ?? [])].sort(
            (a, b) => a.order_index - b.order_index
          )
          const del = deleteUnit.bind(null, u.id)
          return (
            <Card key={u.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {u.order_index}. {u.title}
                  </span>
                  <form action={del}>
                    <Button variant="ghost" size="sm" type="submit">
                      Delete
                    </Button>
                  </form>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="flex flex-col gap-1 text-sm">
                  {lessons.length === 0 && (
                    <li className="text-muted-foreground">No lessons yet.</li>
                  )}
                  {lessons.map((l) => (
                    <li key={l.id}>
                      <Link className="underline" href={`/lessons/${l.id}`}>
                        {l.order_index}. {l.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <form
                  action={createLesson}
                  className="grid items-end gap-2 md:grid-cols-4"
                >
                  <input type="hidden" name="unitId" value={u.id} />
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <Label htmlFor={`lt-${u.id}`}>New lesson</Label>
                    <Input id={`lt-${u.id}`} name="title" required />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={`lo-${u.id}`}>Order</Label>
                    <Input
                      id={`lo-${u.id}`}
                      name="orderIndex"
                      type="number"
                      min={0}
                      defaultValue={lessons.length + 1}
                    />
                  </div>
                  <Button type="submit" size="sm">
                    Add lesson
                  </Button>
                </form>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
