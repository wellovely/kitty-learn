export type Stars = 0 | 1 | 2 | 3

export function calculateStars(correct: number, total: number): Stars {
  if (total <= 0) return 0
  const pct = correct / total
  if (pct >= 0.95) return 3
  if (pct >= 0.75) return 2
  if (pct >= 0.5) return 1
  return 0
}

export function calculateXp(stars: Stars, firstTime: boolean): number {
  const base = stars * 10
  return firstTime ? base + 5 : base
}

export function xpToLevel(totalXp: number): number {
  // 100 xp per level, gentle curve
  return Math.max(1, Math.floor(totalXp / 100) + 1)
}

export function updateStreak(
  lastActive: string | null,
  today: string,
  currentStreak: number
): number {
  if (!lastActive) return 1
  if (lastActive === today) return Math.max(currentStreak, 1)
  const d = new Date(today + "T00:00:00Z")
  d.setUTCDate(d.getUTCDate() - 1)
  const yesterday = d.toISOString().slice(0, 10)
  return lastActive === yesterday ? currentStreak + 1 : 1
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
