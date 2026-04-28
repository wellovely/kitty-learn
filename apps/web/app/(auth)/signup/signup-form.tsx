"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent } from "@workspace/ui/components/card"
import { createClient } from "@/lib/db/browser"

const Schema = z.object({
  fullName: z.string().min(1, "Your name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
})
type FormValues = z.infer<typeof Schema>

export function SignupForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { fullName: "", email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName } },
    })
    setPending(false)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success("Account created")
    router.replace("/")
    router.refresh()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fullName">Your name</Label>
            <Input
              id="fullName"
              aria-invalid={!!errors.fullName}
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-destructive text-xs">
                {errors.fullName.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-destructive text-xs">{errors.email.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Creating..." : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
