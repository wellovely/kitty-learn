"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import type { Emotion } from "@/lib/ai/schemas"

const SRC: Record<Emotion, string> = {
  idle: "/characters/kitten-idle.svg",
  happy: "/characters/kitten-happy.svg",
  sad: "/characters/kitten-sad.svg",
  thinking: "/characters/kitten-thinking.svg",
  excited: "/characters/kitten-excited.svg",
  confused: "/characters/kitten-confused.svg",
}

const ANIM: Record<Emotion, { y?: number[]; scale?: number[]; rotate?: number[]; duration: number }> = {
  idle:     { y: [0, -3, 0], duration: 2.4 },
  happy:    { y: [0, -6, 0], scale: [1, 1.04, 1], duration: 1.2 },
  sad:      { y: [0, 2, 0], duration: 3 },
  thinking: { rotate: [0, -2, 2, 0], duration: 2 },
  excited:  { y: [0, -10, 0], scale: [1, 1.07, 1], duration: 0.6 },
  confused: { rotate: [-3, 3, -3], duration: 1.6 },
}

export function KittenCharacter({
  emotion,
  speaking = false,
}: {
  emotion: Emotion
  speaking?: boolean
}) {
  const a = ANIM[emotion]
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      <motion.div
        className="absolute inset-0 rounded-full bg-amber-300/30 blur-xl"
        animate={{ scale: speaking ? [1, 1.2, 1] : 1, opacity: speaking ? [0.4, 0.8, 0.4] : 0 }}
        transition={{ duration: 0.6, repeat: speaking ? Infinity : 0 }}
      />
      <AnimatePresence initial={false}>
        <motion.div
          key={emotion}
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{
            opacity: 1,
            scale: a.scale ?? 1,
            y: a.y ?? 0,
            rotate: a.rotate ?? 0,
          }}
          exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.22 } }}
          transition={{
            opacity: { duration: 0.22 },
            scale: { duration: a.duration, repeat: Infinity, ease: "easeInOut" },
            y: { duration: a.duration, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: a.duration, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-0 drop-shadow-lg"
        >
          <Image
            src={SRC[emotion]}
            alt={`Kitten ${emotion}`}
            fill
            priority
            sizes="160px"
            className="object-contain"
          />
        </motion.div>
      </AnimatePresence>
      {speaking && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute -right-3 top-2 rounded-full bg-white px-2 py-1 text-xs shadow-md ring-1 ring-amber-200 dark:bg-neutral-900 dark:ring-amber-700"
          aria-hidden="true"
        >
          <span className="inline-flex gap-0.5">
            <motion.span
              className="block h-1 w-1 rounded-full bg-amber-500"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="block h-1 w-1 rounded-full bg-amber-500"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
            />
            <motion.span
              className="block h-1 w-1 rounded-full bg-amber-500"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
            />
          </span>
        </motion.div>
      )}
    </div>
  )
}
