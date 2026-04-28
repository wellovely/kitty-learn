import { test, expect } from "@playwright/test"

/**
 * End-to-end happy path. Assumes:
 * - Local Supabase is running
 * - `supabase/seed/sample.sql` has been applied
 * - A parent account exists (create via signup if not)
 * - OPENAI_API_KEY is set for AI evaluation, or
 *   the answer triggers the deterministic exact-match path
 *
 * Run with: BASE_URL=http://localhost:3000 bun run test:e2e
 */

const email = process.env.E2E_EMAIL ?? "e2e@example.com"
const password = process.env.E2E_PASSWORD ?? "password123"
const childName = "Testy"

test("parent can sign up, add child, and complete a lesson", async ({ page }) => {
  // 1. Signup (idempotent — if already exists, fall back to login)
  await page.goto("/signup")
  await page.fill('input[name="fullName"]', "E2E Parent")
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')

  // If email already in use, the app toasts and stays on /signup — fall back to login
  if (page.url().includes("/signup")) {
    await page.goto("/login")
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
  }

  await page.waitForURL(/\/dashboard/)

  // 2. Add child if none
  const hasChild = await page.getByText(childName).first().isVisible().catch(() => false)
  if (!hasChild) {
    await page.getByRole("link", { name: /add child/i }).click()
    await page.fill('input[name="name"]', childName)
    await page.fill('input[name="age"]', "5")
    await page.getByRole("button", { name: /add child/i }).click()
    await page.waitForURL(/\/dashboard/)
  }

  // 3. Open child mode → home
  await page.getByRole("link", { name: /play/i }).first().click()
  await expect(page.getByRole("heading", { name: new RegExp(`Hi, ${childName}`, "i") })).toBeVisible()

  // 4. Enter the seeded Alphabet Basics unit → Letter A lesson
  await page.getByText(/Alphabet Basics/i).click()
  await page.getByText(/Letter A/i).click()

  // 5. Answer the 3 seeded exercises with the exact-match answers
  const answers = ["A", "Apple", "Ant"]
  for (const a of answers) {
    await page.waitForSelector('input[placeholder*="Type"]', { timeout: 10_000 })
    await page.fill('input[placeholder*="Type"]', a)
    await page.getByRole("button", { name: /submit/i }).click()
    await page.waitForTimeout(1100)
  }

  await expect(page.getByRole("heading", { name: /lesson complete/i })).toBeVisible({ timeout: 15_000 })
})
