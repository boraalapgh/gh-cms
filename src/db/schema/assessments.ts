/**
 * Assessments Schema
 *
 * Assessments are extended quizzes with sections, scoring, and certificate support.
 * Links to the main entities table via entity_id.
 */

import { pgTable, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { entities } from "./entities";
import { certificates } from "./certificates";

// Assessments table - assessment-specific data
export const assessments = pgTable("assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }).unique(),
  passingScore: integer("passing_score").notNull().default(70), // Percentage
  // Optional certificate template
  certificateTemplateId: uuid("certificate_template_id").references(() => certificates.id, { onDelete: "set null" }),
  // Assessment-specific settings
  // { attemptsAllowed, timeLimit, proctoringSettings, sections: [] }
  config: jsonb("config").default({}),
});
