/**
 * Course Type Definitions
 *
 * Configuration types for courses in the CMS.
 * Courses organize lessons into modules with optional ordering and placement tests.
 */

import { BlockType } from "./blocks";

// Course module structure
export interface CourseModule {
  id: string;
  title: string;
  description: string;
  lessonIds: string[]; // Ordered array of lesson entity IDs
  order: number;
  isRequired: boolean;
  skipThreshold?: number; // Percentage score on placement test to skip this module
}

// Course configuration stored in the courses table
export interface CourseConfig {
  type: "course";
  isOrdered: boolean; // Must complete in sequence
  placementTestEnabled: boolean;
  placementTestId?: string; // Assessment entity ID
  certificateEnabled: boolean;
  certificateTemplateId?: string;
  completionCriteria: "all_modules" | "required_modules" | "percentage";
  completionPercentage?: number; // Required if completionCriteria is "percentage"
}

// Lesson reference in a course module
export interface CourseLessonRef {
  id: string; // Lesson entity ID
  entityId: string;
  title: string;
  duration?: number; // Estimated duration in minutes
  activitiesCount: number;
  order: number;
}

// Default course configuration
export const defaultCourseConfig: CourseConfig = {
  type: "course",
  isOrdered: true,
  placementTestEnabled: false,
  placementTestId: undefined,
  certificateEnabled: false,
  certificateTemplateId: undefined,
  completionCriteria: "all_modules",
  completionPercentage: undefined,
};

// Block types available for course overview/landing page
export const courseBlockPalette: BlockType[] = [
  "text",
  "heading",
  "image",
  "video",
  "callout",
  "list",
  "divider",
  "section",
  "card",
  "card_group",
];

// Course type display information
export const courseTypeInfo = {
  label: "Course",
  description: "Organizes lessons into modules with optional placement tests",
  icon: "Library",
};

// Empty module template
export const createEmptyModule = (): CourseModule => ({
  id: crypto.randomUUID(),
  title: "New Module",
  description: "",
  lessonIds: [],
  order: 0,
  isRequired: true,
  skipThreshold: undefined,
});
