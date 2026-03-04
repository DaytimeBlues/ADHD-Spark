import { test, expect } from "@playwright/test";

test.describe("Basic Smoke", () => {
  test("app shell loads without fatal errors", async ({ page }) => {
    const pageErrors: string[] = [];

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto("/", { timeout: 30000 });

    // Wait for network to be idle (all assets loaded)
    await page.waitForLoadState("networkidle", { timeout: 30000 });

    // Check page loaded - verify body exists
    const body = page.locator("body");
    await expect(body).toBeVisible({ timeout: 10000 });

    // Check not 404
    await expect(page).not.toHaveURL(/404/);

    // Filter out known non-critical errors
    const fatal = pageErrors.filter(
      (msg) =>
        !msg.includes("ResizeObserver loop limit exceeded") &&
        !msg.includes("Missing required parameter `platform`"),
    );
    expect(fatal).toHaveLength(0);
  });

  test("critical static assets are reachable", async ({ page }) => {
    const responses: number[] = [];

    page.on("response", (response) => {
      const url = response.url();
      if (url.endsWith(".js") || url.endsWith(".css")) {
        responses.push(response.status());
      }
    });

    await page.goto("/", { timeout: 30000 });
    await page.waitForLoadState("networkidle", { timeout: 30000 });

    if (responses.length > 0) {
      expect(responses.some((status) => status >= 400)).toBeFalsy();
    }
  });
});
