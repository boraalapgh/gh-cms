/**
 * Block Type Definitions
 *
 * Core types for the block-based content system.
 * These types define the structure of all content blocks used in the editor.
 */

import { CSSProperties } from "react";

// All supported block types
export type BlockType =
  | "text"
  | "heading"
  | "image"
  | "video"
  | "card"
  | "card_group"
  | "slide"
  | "slide_deck"
  | "quiz_question"
  | "option"
  | "section"
  | "divider"
  | "two_column"
  | "callout"
  | "list"
  | "transcript";

// Block settings for styling and configuration
export interface BlockSettings {
  style?: CSSProperties;
  className?: string;
  [key: string]: unknown;
}

// Base block structure
export interface Block {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  settings: BlockSettings;
  children?: Block[];
  parentId?: string | null;
  order: number;
}

// Text block content
export interface TextBlockContent {
  text: string;
  format?: "plain" | "markdown" | "html";
}

// Heading block content
export interface HeadingBlockContent {
  text: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

// Image block content
export interface ImageBlockContent {
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

// Video block content
export interface VideoBlockContent {
  url: string;
  thumbnailUrl?: string;
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
}

// Quiz question block content
export interface QuizQuestionBlockContent {
  question: string;
  questionImage?: string;
  points?: number;
  explanation?: string;
}

// Option block content (for quiz questions or daily dilemma)
export interface OptionBlockContent {
  label: string;
  isCorrect?: boolean;
  isBestAnswer?: boolean;
  feedback?: string;
}

// Card block content
export interface CardBlockContent {
  title?: string;
  backgroundColor?: string;
}

// Callout block content
export interface CalloutBlockContent {
  text: string;
  variant?: "info" | "warning" | "success" | "error";
}

// List block content
export interface ListBlockContent {
  items: string[];
  ordered?: boolean;
}

// Two column block content
export interface TwoColumnBlockContent {
  leftTitle?: string;
  rightTitle?: string;
  splitRatio?: number; // 0.5 = 50/50, 0.3 = 30/70
}

// Transcript block content
export interface TranscriptBlockContent {
  text: string;
  timestamps?: TranscriptTimestamp[];
  source?: "manual" | "ai_generated";
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

// Timestamp for transcript segments
export interface TranscriptTimestamp {
  start: number; // seconds
  end: number; // seconds
  text: string;
}

// Device preview types
export type DeviceType = "desktop" | "tablet" | "mobile";

// Device preview dimensions
export const DEVICE_DIMENSIONS: Record<DeviceType, { width: number; height: number }> = {
  desktop: { width: 1280, height: 800 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};
