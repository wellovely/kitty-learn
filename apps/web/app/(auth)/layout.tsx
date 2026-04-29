export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-b from-game-cyan-soft via-white to-game-purple-soft p-4 dark:from-game-cyan-soft/40 dark:via-neutral-950 dark:to-game-purple-soft/40">
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
