/**
 * Entities Schema Tests
 *
 * Validates the entities schema structure and types.
 */

import { describe, it, expect } from "vitest";
import { entities, entityVersions, entityTypeEnum, entityStatusEnum } from "./entities";
import { getTableName } from "drizzle-orm";

describe("Entities Schema", () => {
  describe("entities table", () => {
    it("should have correct table name", () => {
      expect(getTableName(entities)).toBe("entities");
    });

    it("should have all required columns", () => {
      const columns = Object.keys(entities);
      expect(columns).toContain("id");
      expect(columns).toContain("type");
      expect(columns).toContain("title");
      expect(columns).toContain("description");
      expect(columns).toContain("status");
      expect(columns).toContain("version");
      expect(columns).toContain("settings");
      expect(columns).toContain("content");
      expect(columns).toContain("createdAt");
      expect(columns).toContain("updatedAt");
    });
  });

  describe("entityVersions table", () => {
    it("should have correct table name", () => {
      expect(getTableName(entityVersions)).toBe("entity_versions");
    });

    it("should have all required columns", () => {
      const columns = Object.keys(entityVersions);
      expect(columns).toContain("id");
      expect(columns).toContain("entityId");
      expect(columns).toContain("versionNumber");
      expect(columns).toContain("content");
      expect(columns).toContain("createdAt");
      expect(columns).toContain("publishedAt");
    });
  });

  describe("entityTypeEnum", () => {
    it("should have all entity types", () => {
      const values = entityTypeEnum.enumValues;
      expect(values).toContain("activity");
      expect(values).toContain("lesson");
      expect(values).toContain("course");
      expect(values).toContain("assessment");
      expect(values).toContain("certificate_template");
      expect(values.length).toBe(5);
    });
  });

  describe("entityStatusEnum", () => {
    it("should have all status types", () => {
      const values = entityStatusEnum.enumValues;
      expect(values).toContain("draft");
      expect(values).toContain("published");
      expect(values.length).toBe(2);
    });
  });
});
