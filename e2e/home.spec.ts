import { test, expect } from "@playwright/test";
import { enableE2ETestMode } from "./helpers/seed";

/**
 * Basic smoke tests for ADHD-CADDI web app.
 */

test.describe("Home Screen", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await page.goto("/");
    await expect(page.getByTestId("home-title")).toBeVisible();
  });

  test("should load without crash", async ({ page }) => {
    await expect(page.getByTestId("home-title")).toBeVisible();
  });

  test("should display streak summary", async ({ page }) => {
    await expect(page.getByTestId("home-streak")).toBeVisible();
    await expect(page.getByTestId("home-streak")).toHaveText(/STREAK\.\d{3}/);
  });

  test("should display mode cards", async ({ page }) => {
    await expect(page.getByTestId("mode-ignite")).toBeVisible();
    await expect(page.getByTestId("mode-fogcutter")).toBeVisible();
    await expect(page.getByTestId("mode-pomodoro")).toBeVisible();
    await expect(page.getByTestId("mode-anchor")).toBeVisible();
    await expect(page.getByTestId("mode-checkin")).toBeVisible();
    await expect(page.getByTestId("mode-cbtguide")).toBeVisible();
  });

  test("should navigate to Fog Cutter from home card", async ({ page }) => {
    await page.getByTestId("mode-fogcutter").click({ force: true });
    await expect(page.getByText("FOG_CUTTER")).toBeVisible({ timeout: 15000 });
    await expect(
      page.getByPlaceholder("> INPUT_OVERWHELMING_TASK"),
    ).toBeVisible({
      timeout: 15000,
    });
  });

  test("should display bottom tab navigation", async ({ page }) => {
    await expect(page.getByText("HOME", { exact: true })).toBeVisible();
    await expect(page.getByText("FOCUS", { exact: true })).toBeVisible();
    await expect(page.getByText("TASKS", { exact: true })).toBeVisible();
    await expect(page.getByText("CALENDAR", { exact: true })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await enableE2ETestMode(page);
    await page.goto("/");
    await expect(page.getByTestId("home-title")).toBeVisible();
  });

  test("should navigate to Focus tab", async ({ page }) => {
    await page.getByTestId("nav-focus").click({ force: true });
    await expect(page.getByText("IGNITE_PROTOCOL")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should navigate to Tasks tab", async ({ page }) => {
    await page.getByTestId("nav-tasks").click({ force: true });
    await expect(page.getByText("BRAIN_DUMP")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should navigate to Calendar tab", async ({ page }) => {
    await page.getByTestId("nav-calendar").click({ force: true });
    await expect(page.getByText("CALENDAR")).toBeVisible({
      timeout: 15000,
    });
  });

  test("should navigate to Chat tab", async ({ page }) => {
    await page.getByTestId("nav-chat").click({ force: true });
    await expect(page.getByText("CADDI_ASSISTANT")).toBeVisible({
      timeout: 15000,
    });
  });
});
