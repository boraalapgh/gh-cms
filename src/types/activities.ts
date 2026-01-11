/**
 * Activity Type Definitions
 *
 * Configuration types for each activity type in the CMS.
 * Activities are specialized entity configurations that determine
 * available blocks, settings, and AI capabilities.
 */

import { BlockType } from "./blocks";
import { ActivityType } from "./entities";

// Re-export ActivityType for convenience
export type { ActivityType };

// Video activity configuration
export interface VideoActivityConfig {
  type: "video";
  videoUrl: string;
  thumbnailUrl?: string;
  autoplay: boolean;
  controls: boolean;
  loop: boolean;
  muted: boolean;
  transcriptEnabled: boolean;
  transcript?: string;
  transcriptSource?: "manual" | "ai_generated";
}

// Daily Dilemma activity configuration
export interface DailyDilemmaConfig {
  type: "daily_dilemma";
  feedbackMode: "immediate" | "after_selection";
}

// Quick Dive activity configuration
export interface QuickDiveConfig {
  type: "quick_dive";
  estimatedReadingTime?: number; // in minutes, auto-calculated
}

// In Practice activity configuration
export interface InPracticeConfig {
  type: "in_practice";
  layoutMode: "side_by_side" | "stacked";
}

// Quiz activity configuration
export interface QuizConfig {
  type: "quiz";
  passingScore: number; // percentage
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  timeLimit?: number; // in minutes
  attemptsAllowed?: number;
}

// Union type for all activity configs
export type ActivityConfig =
  | VideoActivityConfig
  | DailyDilemmaConfig
  | QuickDiveConfig
  | InPracticeConfig
  | QuizConfig;

// Default configurations for each activity type
export const defaultActivityConfigs: Record<ActivityType, ActivityConfig> = {
  video: {
    type: "video",
    videoUrl: "",
    autoplay: false,
    controls: true,
    loop: false,
    muted: false,
    transcriptEnabled: false,
  },
  daily_dilemma: {
    type: "daily_dilemma",
    feedbackMode: "immediate",
  },
  quick_dive: {
    type: "quick_dive",
    estimatedReadingTime: undefined,
  },
  in_practice: {
    type: "in_practice",
    layoutMode: "side_by_side",
  },
  quiz: {
    type: "quiz",
    passingScore: 70,
    showCorrectAnswers: true,
    randomizeQuestions: false,
    timeLimit: undefined,
    attemptsAllowed: undefined,
  },
};

// Block types available for each activity type
export const activityBlockPalette: Record<ActivityType, BlockType[]> = {
  video: ["video", "text", "heading", "callout", "divider"],
  daily_dilemma: ["slide_deck", "slide", "text", "heading", "image", "card", "option", "divider"],
  quick_dive: ["text", "heading", "image", "video", "callout", "list", "divider", "section"],
  in_practice: ["slide_deck", "slide", "two_column", "text", "heading", "image", "callout", "list", "divider"],
  quiz: ["quiz_question", "option", "text", "heading", "image", "divider"],
};

// Activity type display information
export const activityTypeInfo: Record<ActivityType, { label: string; description: string; icon: string }> = {
  video: {
    label: "Video",
    description: "Video content with optional transcript",
    icon: "Play",
  },
  daily_dilemma: {
    label: "Daily Dilemma",
    description: "Interactive scenario with decision options",
    icon: "HelpCircle",
  },
  quick_dive: {
    label: "Quick Dive",
    description: "Rich content article with reading time",
    icon: "BookOpen",
  },
  in_practice: {
    label: "In Practice",
    description: "Two-column layout for application examples",
    icon: "Columns",
  },
  quiz: {
    label: "Quiz",
    description: "Scored assessment with questions",
    icon: "CheckSquare",
  },
};
