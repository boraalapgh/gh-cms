/**
 * Activity Editor E2E Tests
 *
 * Tests for activity editor functionality including block operations.
 */

import { test, expect } from "@playwright/test";
import {
  goToDashboard,
  createEntity,
  addBlock,
  verifyEditorLoaded,
  setupConsoleErrorCheck,
} from "./helpers/test-utils";

test.describe("Activity Editor", () => {
  test("should create activity and load editor without errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Activity");

    // Verify editor loaded
    await verifyEditorLoaded(page);

    // Verify breadcrumb shows activity
    await expect(page.locator("text=New Activity")).toBeVisible();

    // No console errors
    expect(getErrors()).toHaveLength(0);
  });

  test("should add text block without errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Activity");

    // Add text block
    await addBlock(page, "Text");

    // Wait for block to render
    await page.waitForTimeout(500);

    // Verify block appears in layers - look for the text block in layers list
    await expect(page.getByTestId("layer-item").first()).toBeVisible();

    // Click on the block to select it
    await page.getByTestId("layer-item").first().click();

    // Verify right panel shows block properties
    await expect(page.locator("text=Block Type")).toBeVisible();

    // No console errors (especially no infinite loop)
    expect(getErrors()).toHaveLength(0);
  });

  test("should add heading block without errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Activity");

    await addBlock(page, "Heading");

    // Verify heading appears
    await expect(page.locator("text=Heading Text")).toBeVisible();

    expect(getErrors()).toHaveLength(0);
  });

  test("should add card block without infinite loop", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Activity");

    await addBlock(page, "Card");

    // Wait for any potential re-renders
    await page.waitForTimeout(1000);

    // Verify card rendered (no infinite loop crash)
    await expect(page.locator("text=Empty card")).toBeVisible();

    expect(getErrors()).toHaveLength(0);
  });

  test("should add card group block without infinite loop", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Activity");

    await addBlock(page, "Card Group");

    // Wait for any potential re-renders
    await page.waitForTimeout(1000);

    // Verify card group rendered (no infinite loop crash)
    await expect(page.locator("text=Empty card group")).toBeVisible();

    expect(getErrors()).toHaveLength(0);
  });

  test("should add two column block without infinite loop", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Activity");

    await addBlock(page, "Two Column");

    // Wait for any potential re-renders
    await page.waitForTimeout(1000);

    // Verify two column rendered - use more specific selectors
    await expect(page.getByRole("heading", { name: "Left Column" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Right Column" })).toBeVisible();

    expect(getErrors()).toHaveLength(0);
  });

  test("should select and deselect blocks", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Activity");

    // Add a block
    await addBlock(page, "Heading");

    // Wait for block to render
    await page.waitForTimeout(500);

    // Click on the block in the layers panel to select it
    await page.getByTestId("layer-item").first().click();

    // Verify it's selected (right panel shows properties)
    await expect(page.locator("text=Block Type")).toBeVisible();

    // Press Escape to deselect
    await page.keyboard.press("Escape");

    // Verify deselected
    await expect(page.locator("text=No block selected")).toBeVisible();
  });

  test("should show activity-specific blocks", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Activity");

    // Verify activity blocks are available
    await expect(page.locator('button:has-text("Text")')).toBeVisible();
    await expect(page.locator('button:has-text("Heading")')).toBeVisible();
    await expect(page.locator('button:has-text("Image")')).toBeVisible();
    await expect(page.locator('button:has-text("Video")')).toBeVisible();
  });
});
