"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { z } from "zod"

import { GameButton } from "@workspace/ui/components/game-button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { createClient } from "@/lib/db/browser"

const Schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
})
type FormValues = z.infer<typeof Schema>

export function LoginForm() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(Schema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setPending(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(values)
    setPending(false)
    if (error) {
      toast.error(error.message)
      return
    }
    router.replace("/")
    router.refresh()
  }

  return (
    <div className="rounded-3xl border-[3px] border-game-cyan-edge bg-white p-6 shadow-[0_6px_0_0_var(--game-cyan-edge)] dark:bg-neutral-950">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="font-bold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="h-12 rounded-2xl border-[2px] border-neutral-200 bg-white text-base focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"
            {...register("email")}
          />
          {errors.email && (
            <p className="rounded-xl border-[2px] border-game-red-edge bg-game-red-soft px-2.5 py-1 text-xs font-semibold text-game-red-edge">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="font-bold">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            className="h-12 rounded-2xl border-[2px] border-neutral-200 bg-white text-base focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"
            {...register("password")}
          />
          {errors.password && (
            <p className="rounded-xl border-[2px] border-game-red-edge bg-game-red-soft px-2.5 py-1 text-xs font-semibold text-game-red-edge">
              {errors.password.message}
            </p>
          )}
        </div>
        <GameButton
          type="submit"
          color="lime"
          size="lg"
          disabled={pending}
          className="mt-2"
        >
          {pending ? "Logging in..." : "Log in"}
        </GameButton>
      </form>
    </div>
  )
}
