/**
 * Lesson Type Definitions
 *
 * Configuration types for lessons in the CMS.
 * Lessons compose multiple activities with intro/outro content.
 */

import { BlockType } from "./blocks";

// Lesson configuration stored in the lessons table
export interface LessonConfig {
  type: "lesson";
  estimatedDuration?: number; // in minutes, auto-calculated from activities
  learningObjectives: string[];
  prerequisites: string[];
}

// Activity reference in a lesson
export interface LessonActivityRef {
  id: string; // Activity entity ID
  entityId: string;
  title: string;
  type: string; // Activity type (video, quiz, etc.)
  duration?: number; // Estimated duration in minutes
  order: number;
}

// Default lesson configuration
export const defaultLessonConfig: LessonConfig = {
  type: "lesson",
  estimatedDuration: undefined,
  learningObjectives: [],
  prerequisites: [],
};

// Block types available for lesson intro/outro sections
export const lessonBlockPalette: BlockType[] = [
  "text",
  "heading",
  "image",
  "video",
  "callout",
  "list",
  "divider",
  "section",
  "card",
];

// Lesson type display information
export const lessonTypeInfo = {
  label: "Lesson",
  description: "Composed of multiple activities with intro and outro sections",
  icon: "GraduationCap",
};
