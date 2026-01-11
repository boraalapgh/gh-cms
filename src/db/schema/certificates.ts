/**
 * Certificates Schema
 *
 * Certificate templates for assessments. Canvas-based design stored as JSON.
 * Supports variable placeholders ({{name}}, {{date}}, {{course}}, {{score}}).
 */

import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";

// Certificates table - certificate template definitions
export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  // Canvas data for the certificate design (Fabric.js/Konva format)
  template: jsonb("template").notNull().default({}),
  // Configurable settings
  // { showLogo, showScore, showDescription, showSignature, pageSize, orientation }
  settings: jsonb("settings").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
