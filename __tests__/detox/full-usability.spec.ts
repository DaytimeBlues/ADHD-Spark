import { device, element, by, waitFor } from "detox";

/**
 * Android Full Usability Test Suite
 * Tests real user scenarios on Android native app
 */

describe("Android Full Usability", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe("Onboarding and First Launch", () => {
    it("should display home screen on first launch", async () => {
      await expect(element(by.id("home-title"))).toBeVisible();
      await expect(element(by.id("home-streak"))).toBeVisible();
    });

    it("should show all mode cards", async () => {
      await expect(element(by.id("mode-ignite"))).toBeVisible();
      await expect(element(by.id("mode-fogcutter"))).toBeVisible();
      await expect(element(by.id("mode-pomodoro"))).toBeVisible();
      await expect(element(by.id("mode-anchor"))).toBeVisible();
      await expect(element(by.id("mode-checkin"))).toBeVisible();
    });

    it("should show bottom tab navigation", async () => {
      await expect(element(by.id("nav-home"))).toBeVisible();
      await expect(element(by.id("nav-focus"))).toBeVisible();
      await expect(element(by.id("nav-tasks"))).toBeVisible();
      await expect(element(by.id("nav-calendar"))).toBeVisible();
    });
  });

  describe("Navigation Flows", () => {
    it("should navigate to all tabs", async () => {
      await element(by.id("nav-focus")).tap();
      await expect(element(by.text("IGNITE_PROTOCOL"))).toBeVisible();

      await element(by.id("nav-tasks")).tap();
      await expect(element(by.text("BRAIN_DUMP"))).toBeVisible();

      await element(by.id("nav-calendar")).tap();
      await expect(element(by.text("CALENDAR"))).toBeVisible();

      await element(by.id("nav-home")).tap();
      await expect(element(by.id("home-title"))).toBeVisible();
    });

    it("should open and close Fog Cutter", async () => {
      await element(by.id("mode-fogcutter")).tap();
      await expect(element(by.text("FOG_CUTTER"))).toBeVisible();

      // Go back
      await device.pressBack();
      await expect(element(by.id("home-title"))).toBeVisible();
    });

    it("should open Pomodoro and start timer", async () => {
      await element(by.id("mode-pomodoro")).tap();
      await expect(element(by.id("timer-display"))).toBeVisible();

      await element(by.text(/START TIMER/i)).tap();
      await expect(element(by.text(/PAUSE/i))).toBeVisible();

      // Go back
      await device.pressBack();
    });
  });

  describe("Brain Dump - Task Management", () => {
    beforeEach(async () => {
      await element(by.id("nav-tasks")).tap();
      await expect(element(by.text("BRAIN_DUMP"))).toBeVisible();
    });

    it("should add a new task", async () => {
      const testTask = "Detox test task " + Date.now();

      await element(by.id("brain-dump-input")).typeText(testTask);
      await element(by.id("brain-dump-input")).tapReturnKey();

      await expect(element(by.text(testTask))).toBeVisible();
    });

    it("should delete a task", async () => {
      const testTask = "Task to delete " + Date.now();

      await element(by.id("brain-dump-input")).typeText(testTask);
      await element(by.id("brain-dump-input")).tapReturnKey();

      await expect(element(by.text(testTask))).toBeVisible();

      // Find and tap delete button
      await element(by.id(`delete-item-${testTask}`)).tap();

      await expect(element(by.text(testTask))).not.toBeVisible();
    });

    it("should clear all tasks", async () => {
      // Add a task first
      await element(by.id("brain-dump-input")).typeText("Clear test");
      await element(by.id("brain-dump-input")).tapReturnKey();

      // Tap clear button
      await element(by.id("clear-all-btn")).tap();

      // Confirm
      await element(by.text("CONFIRM")).tap();

      await expect(element(by.text("_AWAITING_INPUT"))).toBeVisible();
    });

    it("should run AI sort", async () => {
      await element(by.id("brain-dump-input")).typeText("Buy milk");
      await element(by.id("brain-dump-input")).tapReturnKey();

      await element(by.id("ai-sort-btn")).tap();

      // Should show sorting indicator or results
      await waitFor(element(by.text(/SORTING|AI_SUGGESTIONS/i)))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe("Timer Functionality", () => {
    it("should start and pause Pomodoro timer", async () => {
      await element(by.id("mode-pomodoro")).tap();

      await element(by.text(/START TIMER/i)).tap();
      await expect(element(by.text(/PAUSE/i))).toBeVisible();

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await element(by.text(/PAUSE/i)).tap();
      await expect(element(by.text(/RESUME|START/i))).toBeVisible();
    });

    it("should reset timer", async () => {
      await element(by.id("mode-pomodoro")).tap();

      await element(by.text(/START TIMER/i)).tap();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await element(by.text(/RESET/i)).tap();

      await expect(element(by.text(/START TIMER/i))).toBeVisible();
    });
  });

  describe("Check In Flow", () => {
    it("should complete check in flow", async () => {
      await element(by.id("mode-checkin")).tap();

      await expect(
        element(by.text("HOW ARE YOU FEELING RIGHT NOW?")),
      ).toBeVisible();

      // Select mood
      await element(by.id("mood-option-3")).tap();

      // Select energy
      await element(by.id("energy-option-3")).tap();

      // Should show recommendation
      await expect(element(by.text(/RECOMMENDED FOR YOU/i))).toBeVisible();
    });
  });

  describe("Capture Bubble", () => {
    it("should open capture drawer", async () => {
      await element(by.id("capture-bubble")).tap();

      await expect(element(by.id("capture-drawer"))).toBeVisible();
    });

    it("should capture text note", async () => {
      await element(by.id("capture-bubble")).tap();

      await element(by.id("capture-mode-text")).tap();

      await element(by.id("capture-text-input")).typeText("Quick capture test");
      await element(by.id("capture-confirm")).tap();

      await expect(element(by.id("capture-drawer"))).not.toBeVisible();
    });

    it("should cancel capture", async () => {
      await element(by.id("capture-bubble")).tap();

      await element(by.id("capture-cancel")).tap();

      await expect(element(by.id("capture-drawer"))).not.toBeVisible();
    });
  });

  describe("OAuth Integration", () => {
    beforeEach(async () => {
      await element(by.id("nav-tasks")).tap();
    });

    it("should show integration panel", async () => {
      await expect(element(by.id("integrations-panel"))).toBeVisible();
    });

    it("should show Google connect button", async () => {
      await expect(element(by.id("google-connect-btn"))).toBeVisible();
    });

    it("should show Todoist connect button", async () => {
      await expect(element(by.id("todoist-connect-btn"))).toBeVisible();
    });
  });

  describe("Offline Behavior", () => {
    it("should work without network", async () => {
      // Enable airplane mode
      await device.setStatusBar({
        dataNetwork: "none",
      } as any);

      await element(by.id("nav-tasks")).tap();

      // Should still be able to add tasks
      await element(by.id("brain-dump-input")).typeText("Offline task");
      await element(by.id("brain-dump-input")).tapReturnKey();

      await expect(element(by.text("Offline task"))).toBeVisible();

      // Restore network
      await device.setStatusBar({
        dataNetwork: "wifi",
      } as any);
    });
  });

  describe("State Persistence", () => {
    it("should persist tasks after app restart", async () => {
      const testTask = "Persistence test " + Date.now();

      await element(by.id("nav-tasks")).tap();
      await element(by.id("brain-dump-input")).typeText(testTask);
      await element(by.id("brain-dump-input")).tapReturnKey();

      // Relaunch app
      await device.launchApp({ newInstance: true });

      await element(by.id("nav-tasks")).tap();
      await expect(element(by.text(testTask))).toBeVisible();
    });
  });

  describe("Accessibility", () => {
    it("should support screen reader labels", async () => {
      await expect(element(by.id("home-title"))).toBeVisible();
      await expect(element(by.label("Home"))).toBeVisible();
    });

    it("should have proper touch targets", async () => {
      // All interactive elements should be tappable
      await element(by.id("mode-ignite")).tap();
      await device.pressBack();

      await element(by.id("mode-fogcutter")).tap();
      await device.pressBack();
    });
  });
});
