/**
 * Media Schema Tests
 *
 * Validates the media schema structure and types.
 */

import { describe, it, expect } from "vitest";
import { media, mediaTypeEnum, mediaSourceEnum } from "./media";
import { getTableName } from "drizzle-orm";

describe("Media Schema", () => {
  describe("media table", () => {
    it("should have correct table name", () => {
      expect(getTableName(media)).toBe("media");
    });

    it("should have all required columns", () => {
      const columns = Object.keys(media);
      expect(columns).toContain("id");
      expect(columns).toContain("type");
      expect(columns).toContain("url");
      expect(columns).toContain("source");
      expect(columns).toContain("metadata");
      expect(columns).toContain("createdAt");
    });
  });

  describe("mediaTypeEnum", () => {
    it("should have all media types", () => {
      const values = mediaTypeEnum.enumValues;
      expect(values).toContain("image");
      expect(values).toContain("video");
      expect(values.length).toBe(2);
    });
  });

  describe("mediaSourceEnum", () => {
    it("should have all source types", () => {
      const values = mediaSourceEnum.enumValues;
      expect(values).toContain("upload");
      expect(values).toContain("external");
      expect(values).toContain("ai_generated");
      expect(values.length).toBe(3);
    });
  });
});
