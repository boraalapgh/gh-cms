/**
 * Entities Schema
 *
 * Core table for all content entities (activities, lessons, courses, assessments).
 * Uses a unified entity model with type discrimination for flexibility.
 */

import { pgTable, uuid, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";

// Entity type enum - discriminator for different content types
export const entityTypeEnum = pgEnum("entity_type", [
  "activity",
  "lesson",
  "course",
  "assessment",
  "certificate_template"
]);

// Entity status enum - workflow states
export const entityStatusEnum = pgEnum("entity_status", [
  "draft",
  "published"
]);

// Activity type enum - specific activity formats
export const activityTypeEnum = pgEnum("activity_type", [
  "video",
  "daily_dilemma",
  "quick_dive",
  "in_practice",
  "quiz"
]);

// Main entities table
export const entities = pgTable("entities", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: entityTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: entityStatusEnum("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  settings: jsonb("settings").default({}),
  content: jsonb("content"), // Generic content storage (e.g., certificate templates)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Entity versions for version control
export const entityVersions = pgTable("entity_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }),
  versionNumber: integer("version_number").notNull(),
  content: jsonb("content").notNull(), // Full block tree snapshot
  createdAt: timestamp("created_at").notNull().defaultNow(),
  publishedAt: timestamp("published_at"),
});
