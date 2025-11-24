import { test, expect } from "@playwright/test";

test.describe("Christmas Gift List App", () => {
  test("should display the home page with Christmas theme", async ({
    page,
  }) => {
    await page.goto("/");

    // Check for Christmas title
    await expect(page.locator("h1")).toContainText("Christmas Gift List");

    // Check for snowflakes
    await expect(page.locator(".snowflake").first()).toBeVisible();
  });
});
