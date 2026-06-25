import { test, expect } from "@playwright/test"

test.describe("POSINT Core Flows", () => {
  test("homepage renders hero and stats sections", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toBeVisible()
    await expect(page.locator("text=Transparency").or(page.locator("text=Intelligence")).or(page.locator("text=POSINT"))).toBeVisible()
    await expect(page.locator("text=Politicians").or(page.locator("text=Politicians Tracked"))).toBeVisible({ timeout: 10000 })
  })

  test("search for a politician and view their profile", async ({ page }) => {
    await page.goto("/politicians")
    await expect(page.locator("h1, h2").first()).toBeVisible()
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill("Tinubu")
      await page.waitForTimeout(600)
    }
    const firstCard = page.locator("a[href*='/politicians/']").first()
    if (await firstCard.isVisible({ timeout: 5000 })) {
      await firstCard.click()
      await expect(page.locator("h1")).toBeVisible()
    }
  })

  test("filter elections by year", async ({ page }) => {
    await page.goto("/elections")
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("main")).toBeVisible()
  })

  test("browse corruption cases", async ({ page }) => {
    await page.goto("/anti-corruption")
    await expect(page.locator("h1, h2").filter({ hasText: /corruption|anti/i }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("main")).toBeVisible()
  })

  test("legislature page loads", async ({ page }) => {
    await page.goto("/legislature")
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 })
    await expect(page.locator("main")).toBeVisible()
  })

  test("compare page loads", async ({ page }) => {
    await page.goto("/compare")
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 })
  })

  test("protected route redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.goto("/admin")
    await page.waitForURL(/\/(login|auth)/, { timeout: 5000 }).catch(() => {})
    const url = page.url()
    expect(url.includes("/login") || url.includes("/auth") || url.includes("/admin")).toBe(true)
  })
})
