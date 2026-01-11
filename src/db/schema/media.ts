/**
 * Media Schema
 *
 * Media library for uploaded/external/AI-generated images and videos.
 */

import { pgTable, uuid, text, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Media type enum
export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

// Media source enum
export const mediaSourceEnum = pgEnum("media_source", ["upload", "external", "ai_generated"]);

// Media table - media library entries
export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: mediaTypeEnum("type").notNull(),
  url: text("url").notNull(),
  source: mediaSourceEnum("source").notNull().default("upload"),
  // Metadata: { filename, mimeType, size, width, height, duration, alt, caption }
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
