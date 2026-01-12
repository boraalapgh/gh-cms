/**
 * Skillsets Type Definitions
 *
 * Types for the skillsets and subskills taxonomy system.
 * Used for tagging activities, lessons, and courses.
 */

/**
 * Subskill - a specific skill within a skillset
 * Activities are tagged with exactly 1 subskill
 */
export interface Subskill {
  id: string;
  name: string;
  description: string;
}

/**
 * Skillset - a category of related skills
 * Lessons and courses are tagged with exactly 1 skillset
 */
export interface Skillset {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Hex color for visual distinction
  subskills: Subskill[];
}

/**
 * Full taxonomy structure
 */
export interface SkillsetsTaxonomy {
  version: string;
  lastUpdated: string;
  description: string;
  skillsets: Skillset[];
  metadata: {
    totalSkillsets: number;
    totalSubskills: number;
    taggingRules: {
      activity: string;
      lesson: string;
      course: string;
    };
  };
}

/**
 * Skillset IDs - for type safety
 */
export type SkillsetId =
  | "communication"
  | "leadership"
  | "collaboration"
  | "productivity"
  | "problem-solving"
  | "customer-focus"
  | "emotional-intelligence"
  | "strategy"
  | "learning-development";

/**
 * Tagging context - determines what can be selected
 */
export type TaggingContext = "activity" | "lesson" | "course";

/**
 * Tag selection result
 */
export interface SkillsetTag {
  skillsetId: string;
  skillsetName: string;
  subskillId?: string; // Only for activities
  subskillName?: string;
}
