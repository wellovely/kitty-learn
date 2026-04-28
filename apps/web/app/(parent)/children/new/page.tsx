import Link from "next/link"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { createChild } from "./actions"

export default function NewChildPage() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Add a child</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createChild} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required maxLength={50} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={3}
                max={10}
                required
                defaultValue={5}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add child</Button>
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "ghost" })}
              >
                Cancel
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
