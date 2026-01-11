/**
 * Courses Schema
 *
 * Courses organize lessons into modules with optional ordering and placement tests.
 * Links to the main entities table via entity_id.
 */

import { pgTable, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { entities } from "./entities";

// Courses table - course-specific data
export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }).unique(),
  isOrdered: boolean("is_ordered").notNull().default(true),
  // Module structure as JSON array:
  // [{ id, title, description, lessonIds: [], order, isRequired, skipThreshold }]
  modules: jsonb("modules").notNull().default([]),
  // Optional placement test (links to assessment entity_id)
  placementTestId: uuid("placement_test_id"),
  // Course-specific settings
  config: jsonb("config").default({}),
});
