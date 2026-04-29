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

  const inputCls =
    "h-12 rounded-2xl border-[2px] border-neutral-200 bg-white text-base focus-visible:border-game-cyan focus-visible:ring-0 dark:bg-neutral-950"
  const errCls =
    "rounded-xl border-[2px] border-game-red-edge bg-game-red-soft px-2.5 py-1 text-xs font-semibold text-game-red-edge"

  return (
    <div className="rounded-3xl border-[3px] border-game-cyan-edge bg-white p-6 shadow-[0_6px_0_0_var(--game-cyan-edge)] dark:bg-neutral-950">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName" className="font-bold">
            Your name
          </Label>
          <Input
            id="fullName"
            aria-invalid={!!errors.fullName}
            className={inputCls}
            {...register("fullName")}
          />
          {errors.fullName && <p className={errCls}>{errors.fullName.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="font-bold">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className={inputCls}
            {...register("email")}
          />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className="font-bold">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            className={inputCls}
            {...register("password")}
          />
          {errors.password && <p className={errCls}>{errors.password.message}</p>}
        </div>
        <GameButton
          type="submit"
          color="lime"
          size="lg"
          disabled={pending}
          className="mt-2"
        >
          {pending ? "Creating..." : "Create account"}
        </GameButton>
      </form>
    </div>
  )
}
