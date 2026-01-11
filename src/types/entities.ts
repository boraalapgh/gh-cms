/**
 * Entity Type Definitions
 *
 * Types for all entity types in the CMS.
 */

export type EntityType = "activity" | "lesson" | "course" | "assessment";
export type EntityStatus = "draft" | "published";
export type ActivityType = "video" | "daily_dilemma" | "quick_dive" | "in_practice" | "quiz";

// Base entity structure
export interface Entity {
  id: string;
  type: EntityType;
  title: string;
  description: string | null;
  status: EntityStatus;
  version: number;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Entity version for version control
export interface EntityVersion {
  id: string;
  entityId: string;
  versionNumber: number;
  content: {
    blocks: unknown[];
    settings?: Record<string, unknown>;
  };
  createdAt: string;
  publishedAt: string | null;
}
