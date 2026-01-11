/**
 * Lessons Schema
 *
 * Lessons compose multiple activities with intro/outro content.
 * Links to the main entities table via entity_id.
 */

import { pgTable, uuid, text, jsonb } from "drizzle-orm/pg-core";
import { entities } from "./entities";

// Lessons table - lesson-specific data
export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }).unique(),
  introText: text("intro_text"),
  outroText: text("outro_text"),
  // Ordered array of activity entity IDs
  activityIds: jsonb("activity_ids").notNull().default([]),
  // Lesson-specific settings
  // { estimatedDuration, learningObjectives: [], prerequisites: [] }
  config: jsonb("config").default({}),
});
