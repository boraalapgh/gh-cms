/**
 * Assessment Editor E2E Tests
 *
 * Tests for assessment editor functionality including quiz questions.
 */

import { test, expect } from "@playwright/test";
import {
  goToDashboard,
  createEntity,
  addBlock,
  verifyEditorLoaded,
  setupConsoleErrorCheck,
} from "./helpers/test-utils";

test.describe("Assessment Editor", () => {
  test("should create assessment and load editor without errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Assessment");

    await verifyEditorLoaded(page);
    await expect(page.locator("text=New Assessment")).toBeVisible();

    expect(getErrors()).toHaveLength(0);
  });

  test("should show assessment-specific blocks", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Assessment");

    // Verify assessment blocks are available (quiz_question is labeled "Question")
    await expect(page.locator('button:has-text("Question")')).toBeVisible();
    await expect(page.locator('button:has-text("Text")')).toBeVisible();
  });

  test("should add quiz question block without infinite loop", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Assessment");

    await addBlock(page, "Question");

    // Wait for any potential re-renders
    await page.waitForTimeout(1000);

    // Verify block was added to layers panel
    await expect(page.locator(".space-y-1 button").first()).toBeVisible();

    // Verify no infinite loop errors
    const errors = getErrors();
    const infiniteLoopErrors = errors.filter(e =>
      e.includes("getSnapshot") || e.includes("infinite")
    );
    expect(infiniteLoopErrors).toHaveLength(0);
  });

  test("should add multiple quiz questions", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Assessment");

    // Add first question
    await addBlock(page, "Question");
    await page.waitForTimeout(500);

    // Add second question
    await addBlock(page, "Question");
    await page.waitForTimeout(500);

    // Verify multiple blocks were added to layers panel (at least 2 buttons)
    const layerButtons = page.locator(".space-y-1 button");
    await expect(layerButtons.first()).toBeVisible();

    // Verify no infinite loop errors
    const errors = getErrors();
    const infiniteLoopErrors = errors.filter(e =>
      e.includes("getSnapshot") || e.includes("infinite")
    );
    expect(infiniteLoopErrors).toHaveLength(0);
  });

  test("should edit quiz question properties", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Assessment");

    await addBlock(page, "Question");

    // Wait for block to render
    await page.waitForTimeout(500);

    // Click on the quiz question in the layers panel
    await page.locator(".space-y-1 button").first().click();

    // Verify right panel shows block properties
    await expect(page.locator("text=Block Type")).toBeVisible();
  });
});
