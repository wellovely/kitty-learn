import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@workspace/ui/lib/utils"

const gameButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border-[3px] font-bold whitespace-nowrap select-none transition-[transform,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-offset-2 active:translate-y-1 disabled:pointer-events-none disabled:opacity-50 disabled:active:translate-y-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      color: {
        lime:
          "bg-game-lime text-white border-game-lime-edge shadow-[0_6px_0_0_var(--game-lime-edge)] active:shadow-[0_2px_0_0_var(--game-lime-edge)] focus-visible:ring-game-lime/40",
        orange:
          "bg-game-orange text-white border-game-orange-edge shadow-[0_6px_0_0_var(--game-orange-edge)] active:shadow-[0_2px_0_0_var(--game-orange-edge)] focus-visible:ring-game-orange/40",
        cyan:
          "bg-game-cyan text-white border-game-cyan-edge shadow-[0_6px_0_0_var(--game-cyan-edge)] active:shadow-[0_2px_0_0_var(--game-cyan-edge)] focus-visible:ring-game-cyan/40",
        purple:
          "bg-game-purple text-white border-game-purple-edge shadow-[0_6px_0_0_var(--game-purple-edge)] active:shadow-[0_2px_0_0_var(--game-purple-edge)] focus-visible:ring-game-purple/40",
        red:
          "bg-game-red text-white border-game-red-edge shadow-[0_6px_0_0_var(--game-red-edge)] active:shadow-[0_2px_0_0_var(--game-red-edge)] focus-visible:ring-game-red/40",
        amber:
          "bg-game-amber text-white border-game-amber-edge shadow-[0_6px_0_0_var(--game-amber-edge)] active:shadow-[0_2px_0_0_var(--game-amber-edge)] focus-visible:ring-game-amber/40",
        neutral:
          "bg-white text-neutral-700 border-neutral-300 shadow-[0_6px_0_0_var(--color-neutral-300,#d4d4d4)] hover:bg-neutral-50 active:shadow-[0_2px_0_0_var(--color-neutral-300,#d4d4d4)] focus-visible:ring-neutral-300",
      },
      size: {
        sm: "h-10 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
        md: "h-12 px-6 text-base",
        lg: "h-14 px-7 text-lg [&_svg:not([class*='size-'])]:size-6",
        icon: "size-12 rounded-full",
        "icon-lg": "size-14 rounded-full [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      color: "lime",
      size: "md",
    },
  }
)

function GameButton({
  className,
  color,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof gameButtonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="game-button"
      className={cn(gameButtonVariants({ color, size, className }))}
      {...props}
    />
  )
}

export { GameButton, gameButtonVariants }
