/**
 * Dashboard E2E Tests
 *
 * Tests for the main dashboard functionality.
 */

import { test, expect } from "@playwright/test";
import { goToDashboard, createEntity, setupConsoleErrorCheck } from "./helpers/test-utils";

test.describe("Dashboard", () => {
  test("should load dashboard without errors", async ({ page }) => {
    const getErrors = setupConsoleErrorCheck(page);

    await goToDashboard(page);

    // Verify title
    await expect(page.locator("h1:has-text('E-Learning CMS')")).toBeVisible();

    // Verify search exists
    await expect(page.locator('input[placeholder="Search entities..."]')).toBeVisible();

    // Verify Create New button exists
    await expect(page.locator('button:has-text("Create New")')).toBeVisible();

    // Check no console errors
    expect(getErrors()).toHaveLength(0);
  });

  test("should show Create New dropdown with all entity types", async ({ page }) => {
    await goToDashboard(page);

    await page.click('button:has-text("Create New")');

    // Verify all entity types in dropdown
    await expect(page.locator('[role="menuitem"]:has-text("Activity")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Lesson")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Course")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Assessment")')).toBeVisible();
    await expect(page.locator('[role="menuitem"]:has-text("Certificate Template")')).toBeVisible();
  });

  test("should filter entities by type", async ({ page }) => {
    await goToDashboard(page);

    // Click on type filter trigger
    await page.locator('button:has-text("All Types")').click();

    // Wait for dropdown to open
    await page.waitForTimeout(300);

    // Click on Activities option
    await page.locator('[role="option"]:has-text("Activities")').click();

    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Verify the filter is now set to Activities
    await expect(page.locator('button:has-text("Activities")')).toBeVisible();
  });

  test("should search entities", async ({ page }) => {
    await goToDashboard(page);

    // Type in search
    await page.fill('input[placeholder="Search entities..."]', "Test");

    // Wait for results
    await page.waitForTimeout(500);

    // Results should filter (specific assertions depend on test data)
  });
});
