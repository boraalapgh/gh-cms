/**
 * Blocks Schema
 *
 * Content blocks that compose entities. Supports hierarchical nesting
 * for complex layouts (cards containing text, slides containing images, etc.).
 */

import { pgTable, uuid, text, integer, jsonb, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { entities, entityVersions } from "./entities";

// Block type enum - all supported block types
export const blockTypeEnum = pgEnum("block_type", [
  "text",
  "heading",
  "image",
  "video",
  "card",
  "card_group",
  "slide",
  "slide_deck",
  "quiz_question",
  "option",
  "section",
  "divider",
  "two_column",
  "callout",
  "list"
]);

// Blocks table - core content building blocks
export const blocks = pgTable("blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }),
  versionId: uuid("version_id").references(() => entityVersions.id, { onDelete: "set null" }),
  parentId: uuid("parent_id"), // Self-reference for nesting (cards can contain text, etc.)
  type: blockTypeEnum("type").notNull(),
  content: jsonb("content").notNull().default({}), // Block-specific data
  order: integer("order").notNull().default(0),
  settings: jsonb("settings").default({}), // Styling and configuration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
