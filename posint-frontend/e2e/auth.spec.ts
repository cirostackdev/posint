import { test, expect } from "@playwright/test"

test.describe("Authentication Flows", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login")
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/login")
    await page.fill('input[type="email"], input[name="email"]', "wrong@test.com")
    await page.fill('input[type="password"], input[name="password"]', "WrongPass123!")
    await page.click('button[type="submit"]')
    await expect(
      page.locator("text=Invalid").or(page.locator("text=incorrect")).or(page.locator('[role="alert"]')).or(page.locator("text=error"))
    ).toBeVisible({ timeout: 8000 })
  })

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup")
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
  })
})
