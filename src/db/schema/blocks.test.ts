/**
 * Blocks Schema Tests
 *
 * Validates the blocks schema structure and types.
 */

import { describe, it, expect } from "vitest";
import { blocks, blockTypeEnum } from "./blocks";
import { getTableName } from "drizzle-orm";

describe("Blocks Schema", () => {
  describe("blocks table", () => {
    it("should have correct table name", () => {
      expect(getTableName(blocks)).toBe("blocks");
    });

    it("should have all required columns", () => {
      const columns = Object.keys(blocks);
      expect(columns).toContain("id");
      expect(columns).toContain("entityId");
      expect(columns).toContain("versionId");
      expect(columns).toContain("parentId");
      expect(columns).toContain("type");
      expect(columns).toContain("content");
      expect(columns).toContain("order");
      expect(columns).toContain("settings");
      expect(columns).toContain("createdAt");
      expect(columns).toContain("updatedAt");
    });
  });

  describe("blockTypeEnum", () => {
    it("should have all block types", () => {
      const values = blockTypeEnum.enumValues;
      expect(values).toContain("text");
      expect(values).toContain("heading");
      expect(values).toContain("image");
      expect(values).toContain("video");
      expect(values).toContain("card");
      expect(values).toContain("card_group");
      expect(values).toContain("slide");
      expect(values).toContain("slide_deck");
      expect(values).toContain("quiz_question");
      expect(values).toContain("option");
      expect(values).toContain("section");
      expect(values).toContain("divider");
      expect(values).toContain("two_column");
      expect(values).toContain("callout");
      expect(values).toContain("list");
      expect(values.length).toBe(15);
    });
  });
});
