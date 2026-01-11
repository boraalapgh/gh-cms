/**
 * Lesson Editor E2E Tests
 *
 * Tests for lesson editor functionality.
 */

import { test, expect } from "@playwright/test";
import {
  goToDashboard,
  createEntity,
  addBlock,
  verifyEditorLoaded,
  setupConsoleErrorCheck,
} from "./helpers/test-utils";

test.describe("Lesson Editor", () => {
  test("should create lesson and load editor without errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Lesson");

    await verifyEditorLoaded(page);
    await expect(page.locator("text=New Lesson")).toBeVisible();

    expect(getErrors()).toHaveLength(0);
  });

  test("should show lesson-specific blocks", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Lesson");

    // Verify lesson blocks are available
    await expect(page.locator('button:has-text("Section")')).toBeVisible();
    await expect(page.locator('button:has-text("Text")')).toBeVisible();
    await expect(page.locator('button:has-text("Card")')).toBeVisible();
  });

  test("should add section block without infinite loop", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Lesson");

    await addBlock(page, "Section");

    // Wait for any potential re-renders
    await page.waitForTimeout(1000);

    // Verify section block was added - check layers panel for section block
    await expect(page.locator(".space-y-1 button").first()).toBeVisible();

    // Verify no infinite loop errors (check for getSnapshot or infinite errors)
    const errors = getErrors();
    const infiniteLoopErrors = errors.filter(e =>
      e.includes("getSnapshot") || e.includes("infinite")
    );
    expect(infiniteLoopErrors).toHaveLength(0);
  });
});
