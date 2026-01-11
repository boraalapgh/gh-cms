/**
 * E2E Test Utilities
 *
 * Shared helpers for E2E tests.
 */

import { Page, expect } from "@playwright/test";

/**
 * Wait for the page to be fully loaded
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
}

/**
 * Create a new entity from the dashboard
 */
export async function createEntity(
  page: Page,
  type: "Activity" | "Lesson" | "Course" | "Assessment" | "Certificate Template"
) {
  await page.click('button:has-text("Create New")');
  await page.click(`[role="menuitem"]:has-text("${type}")`);
  await waitForPageLoad(page);
}

/**
 * Navigate to dashboard
 */
export async function goToDashboard(page: Page) {
  await page.goto("/");
  await waitForPageLoad(page);
}

/**
 * Add a block to the editor
 */
export async function addBlock(page: Page, blockType: string) {
  await page.click(`button:has-text("${blockType}")`);
}

/**
 * Verify no console errors
 */
export function setupConsoleErrorCheck(page: Page) {
  const errors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Ignore hydration warnings from browser extensions
      if (!text.includes("data-np-")) {
        errors.push(text);
      }
    }
  });

  return () => errors;
}

/**
 * Check that editor loaded without errors
 */
export async function verifyEditorLoaded(page: Page) {
  // Verify Tools section exists
  await expect(page.locator('button:has-text("Tools")')).toBeVisible();

  // Verify Layers section exists
  await expect(page.locator('button:has-text("Layers")')).toBeVisible();

  // Verify right panel tabs exist
  await expect(page.locator('[role="tab"]:has-text("Element")')).toBeVisible();
  await expect(page.locator('[role="tab"]:has-text("Settings")')).toBeVisible();
  await expect(page.locator('[role="tab"]:has-text("Versions")')).toBeVisible();
}
