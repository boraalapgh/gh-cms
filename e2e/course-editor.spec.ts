/**
 * Course Editor E2E Tests
 *
 * Tests for course editor functionality including module structure.
 */

import { test, expect } from "@playwright/test";
import {
  goToDashboard,
  createEntity,
  addBlock,
  verifyEditorLoaded,
  setupConsoleErrorCheck,
} from "./helpers/test-utils";

test.describe("Course Editor", () => {
  test("should create course and load editor without errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Course");

    await verifyEditorLoaded(page);
    await expect(page.locator("text=New Course")).toBeVisible();

    expect(getErrors()).toHaveLength(0);
  });

  test("should show course-specific blocks", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Course");

    // Verify course blocks are available (courses use section, text, heading, etc.)
    await expect(page.locator('button:has-text("Section")')).toBeVisible();
    await expect(page.locator('button:has-text("Text")')).toBeVisible();
  });

  test("should add section block without infinite loop", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Course");

    await addBlock(page, "Section");

    // Wait for any potential re-renders
    await page.waitForTimeout(1000);

    // Verify section block was added - check layers panel for section block
    await expect(page.locator(".space-y-1 button").first()).toBeVisible();

    // Verify no infinite loop errors
    const errors = getErrors();
    const infiniteLoopErrors = errors.filter(e =>
      e.includes("getSnapshot") || e.includes("infinite")
    );
    expect(infiniteLoopErrors).toHaveLength(0);
  });

  test("should navigate to Settings tab", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Course");

    // Click on Settings tab
    await page.click('[role="tab"]:has-text("Settings")');

    // Verify settings content is visible (use first() to handle multiple matches)
    await expect(page.locator("h3:has-text('Course Settings')")).toBeVisible();
  });

  test("should navigate to Versions tab", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Course");

    // Click on Versions tab
    await page.click('[role="tab"]:has-text("Versions")');

    // Wait for content to load
    await page.waitForTimeout(500);

    // Verify versions tab is selected and content is visible
    await expect(page.locator('[role="tab"][data-state="active"]:has-text("Versions")')).toBeVisible();
  });
});
