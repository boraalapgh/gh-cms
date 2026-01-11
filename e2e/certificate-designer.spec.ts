/**
 * Certificate Designer E2E Tests
 *
 * Tests for certificate template designer functionality.
 * The certificate designer uses a Konva canvas with icon-based toolbox.
 */

import { test, expect } from "@playwright/test";
import {
  goToDashboard,
  createEntity,
  setupConsoleErrorCheck,
} from "./helpers/test-utils";

test.describe("Certificate Designer", () => {
  test("should create certificate and load designer without errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Certificate Template");

    // Wait for certificate designer to load
    await page.waitForTimeout(1000);

    // Verify certificate designer loaded - look for the header
    await expect(page.locator("text=New Certificate")).toBeVisible();

    // Verify no infinite loop errors
    const errors = getErrors();
    const infiniteLoopErrors = errors.filter(e =>
      e.includes("getSnapshot") || e.includes("infinite")
    );
    expect(infiniteLoopErrors).toHaveLength(0);
  });

  test("should show certificate header and actions", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Certificate Template");

    // Wait for designer to load
    await page.waitForTimeout(500);

    // Verify header actions exist
    await expect(page.locator('button:has-text("Save Template")')).toBeVisible();
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
  });

  test("should show template settings panel", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Certificate Template");

    await page.waitForTimeout(500);

    // Verify settings panel exists
    await expect(page.locator("text=Template Settings")).toBeVisible();
    await expect(page.locator("text=Template Name")).toBeVisible();
    await expect(page.locator("text=Orientation")).toBeVisible();
  });

  test("should show zoom controls in toolbox", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Certificate Template");

    await page.waitForTimeout(500);

    // Verify zoom percentage is visible (default is 70%)
    await expect(page.locator("text=70%")).toBeVisible();
  });

  test("should have toolbox buttons", async ({ page }) => {
    await goToDashboard(page);
    await createEntity(page, "Certificate Template");

    await page.waitForTimeout(500);

    // Verify there are toolbar buttons (at least some buttons in the toolbox area)
    const allButtons = page.locator('button');
    const buttonCount = await allButtons.count();
    // Certificate designer should have several buttons (Reset, Export, Save, plus toolbox)
    expect(buttonCount).toBeGreaterThan(5);
  });

  test("should load without infinite loop errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);
    await createEntity(page, "Certificate Template");

    // Wait to see if any infinite loop errors occur
    await page.waitForTimeout(2000);

    // Check for any getSnapshot errors (sign of infinite loop)
    const errors = getErrors();
    const infiniteLoopErrors = errors.filter(e =>
      e.includes("getSnapshot") || e.includes("infinite")
    );

    expect(infiniteLoopErrors).toHaveLength(0);
  });
});
