/**
 * Assessment Type Definitions
 *
 * Configuration types for assessments in the CMS.
 * Assessments are extended quizzes with sections, scoring, and certificate support.
 */

import { BlockType } from "./blocks";

// Assessment section structure
export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questionIds: string[]; // Block IDs of quiz_question blocks
  points: number; // Total points for this section
  timeLimit?: number; // Optional time limit in minutes for this section
  order: number;
}

// Assessment configuration
export interface AssessmentConfig {
  type: "assessment";
  passingScore: number; // Percentage (0-100)
  attemptsAllowed?: number; // Number of attempts, undefined = unlimited
  timeLimit?: number; // Total time limit in minutes
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeSections: boolean;
  showSectionScores: boolean;
  certificateEnabled: boolean;
  certificateTemplateId?: string;
  proctoringEnabled: boolean;
  sections: AssessmentSection[];
}

// Default assessment configuration
export const defaultAssessmentConfig: AssessmentConfig = {
  type: "assessment",
  passingScore: 70,
  attemptsAllowed: undefined,
  timeLimit: undefined,
  showCorrectAnswers: true,
  randomizeQuestions: false,
  randomizeSections: false,
  showSectionScores: true,
  certificateEnabled: false,
  certificateTemplateId: undefined,
  proctoringEnabled: false,
  sections: [],
};

// Block types available for assessments
export const assessmentBlockPalette: BlockType[] = [
  "quiz_question",
  "option",
  "text",
  "heading",
  "image",
  "callout",
  "divider",
];

// Assessment type display information
export const assessmentTypeInfo = {
  label: "Assessment",
  description: "Extended quiz with sections, scoring, and certificate support",
  icon: "ClipboardCheck",
};

// Create an empty section
export const createEmptySection = (): AssessmentSection => ({
  id: crypto.randomUUID(),
  title: "New Section",
  description: "",
  questionIds: [],
  points: 0,
  timeLimit: undefined,
  order: 0,
});
