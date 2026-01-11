/**
 * Activities Schema
 *
 * Extended data for activity entities (video, quiz, daily_dilemma, etc.).
 * Links to the main entities table via entity_id.
 */

import { pgTable, uuid, jsonb } from "drizzle-orm/pg-core";
import { entities, activityTypeEnum } from "./entities";

// Activities table - extended activity-specific data
export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityId: uuid("entity_id").notNull().references(() => entities.id, { onDelete: "cascade" }).unique(),
  activityType: activityTypeEnum("activity_type").notNull(),
  // Activity-specific settings stored as JSON
  // Video: { thumbnailUrl, autoplay, controls, loop, transcriptEnabled }
  // Quiz: { passingScore, showCorrectAnswers, randomizeQuestions, timeLimit }
  // DailyDilemma: { feedbackMode }
  // QuickDive: { estimatedReadingTime }
  // InPractice: { layoutMode }
  config: jsonb("config").default({}),
});
