/**
 * Activity Content Validation
 *
 * Pre-publish validation rules for all activity types.
 * Returns structured validation results with errors and warnings.
 */

import type {
  ActivityType,
  VideoActivityConfig,
  DailyDilemmaConfig,
  QuickDiveConfig,
  InPracticeConfig,
  QuizConfig,
  PodcastConfig,
  ActivityConfig,
} from "@/types";
import type { Block } from "@/types/blocks";

export interface ValidationIssue {
  type: "error" | "warning";
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

/**
 * Validate activity content before publishing
 */
export function validateActivity(
  activityType: ActivityType,
  config: ActivityConfig,
  blocks: Block[]
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Common validation
  if (blocks.length === 0) {
    warnings.push({
      type: "warning",
      field: "blocks",
      message: "Activity has no content blocks",
    });
  }

  // Type-specific validation
  switch (activityType) {
    case "video":
      validateVideoActivity(config as VideoActivityConfig, blocks, errors, warnings);
      break;
    case "daily_dilemma":
      validateDailyDilemmaActivity(config as DailyDilemmaConfig, blocks, errors, warnings);
      break;
    case "quick_dive":
      validateQuickDiveActivity(config as QuickDiveConfig, blocks, errors, warnings);
      break;
    case "in_practice":
      validateInPracticeActivity(config as InPracticeConfig, blocks, errors, warnings);
      break;
    case "quiz":
      validateQuizActivity(config as QuizConfig, blocks, errors, warnings);
      break;
    case "podcast":
      validatePodcastActivity(config as PodcastConfig, blocks, errors, warnings);
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Video Activity Validation
 */
function validateVideoActivity(
  config: VideoActivityConfig,
  blocks: Block[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Video URL is required
  if (!config.videoUrl) {
    errors.push({
      type: "error",
      field: "videoUrl",
      message: "Video URL is required",
    });
  }

  // Transcript enabled but no transcript block
  if (config.transcriptEnabled) {
    const hasTranscriptBlock = blocks.some((b) => b.type === "transcript");
    if (!hasTranscriptBlock) {
      warnings.push({
        type: "warning",
        field: "transcript",
        message: "Transcript is enabled but no transcript block exists",
      });
    }
  }
}

/**
 * Daily Dilemma Activity Validation
 */
function validateDailyDilemmaActivity(
  config: DailyDilemmaConfig,
  blocks: Block[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Check for slide_deck block
  const slideDeck = blocks.find((b) => b.type === "slide_deck");
  if (!slideDeck) {
    errors.push({
      type: "error",
      field: "slides",
      message: "Daily Dilemma requires a slide deck with screens",
    });
    return;
  }

  // Check for at least one dilemma slide with options
  const slides = blocks.filter((b) => b.type === "slide" && b.parentId === slideDeck.id);
  if (slides.length < 2) {
    errors.push({
      type: "error",
      field: "slides",
      message: "Daily Dilemma requires at least 2 screens (anecdote + dilemma)",
    });
  }

  // Check for option blocks within slides
  const options = blocks.filter((b) => b.type === "option");
  if (options.length < 2) {
    errors.push({
      type: "error",
      field: "options",
      message: "Daily Dilemma requires at least 2 options",
    });
  }

  // Check that at least one option is marked correct
  const hasCorrectOption = options.some((o) => o.content?.isCorrect === true);
  if (options.length > 0 && !hasCorrectOption) {
    errors.push({
      type: "error",
      field: "options",
      message: "At least one option must be marked as correct",
    });
  }

  // Check that all options have feedback
  const optionsWithoutFeedback = options.filter((o) => {
    const feedback = o.content?.feedback as string | undefined;
    return !feedback?.trim();
  });
  if (optionsWithoutFeedback.length > 0) {
    warnings.push({
      type: "warning",
      field: "options",
      message: `${optionsWithoutFeedback.length} option(s) missing feedback text`,
    });
  }
}

/**
 * Quick Dive Activity Validation
 */
function validateQuickDiveActivity(
  config: QuickDiveConfig,
  blocks: Block[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Check for minimum content
  const contentBlocks = blocks.filter((b) =>
    ["text", "heading", "image", "video", "callout", "list"].includes(b.type)
  );

  if (contentBlocks.length < 2) {
    warnings.push({
      type: "warning",
      field: "content",
      message: "Quick Dive should have substantial content (at least 2 blocks)",
    });
  }

  // Check for heading
  const hasHeading = blocks.some((b) => b.type === "heading");
  if (!hasHeading) {
    warnings.push({
      type: "warning",
      field: "heading",
      message: "Consider adding a heading for better structure",
    });
  }
}

/**
 * In Practice Activity Validation
 */
function validateInPracticeActivity(
  config: InPracticeConfig,
  blocks: Block[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Check for slide_deck
  const slideDeck = blocks.find((b) => b.type === "slide_deck");
  if (!slideDeck) {
    errors.push({
      type: "error",
      field: "slides",
      message: "In Practice requires a slide deck with practice steps",
    });
    return;
  }

  // Check for slides
  const slides = blocks.filter((b) => b.type === "slide" && b.parentId === slideDeck.id);
  if (slides.length < 2) {
    warnings.push({
      type: "warning",
      field: "slides",
      message: "In Practice should have at least 2 slides (steps + takeaway)",
    });
  }
}

/**
 * Quiz Activity Validation
 */
function validateQuizActivity(
  config: QuizConfig,
  blocks: Block[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Check for quiz questions
  const questions = blocks.filter((b) => b.type === "quiz_question");
  if (questions.length === 0) {
    errors.push({
      type: "error",
      field: "questions",
      message: "Quiz requires at least 1 question",
    });
    return;
  }

  // Check each question has options
  for (const question of questions) {
    const questionOptions = blocks.filter(
      (b) => b.type === "option" && b.parentId === question.id
    );

    const questionText = (question.content?.text as string | undefined)?.slice(0, 30) || "Untitled";

    if (questionOptions.length < 2) {
      errors.push({
        type: "error",
        field: `question_${question.id}`,
        message: `Question "${questionText}..." needs at least 2 options`,
      });
    }

    // Check for correct answer
    const hasCorrect = questionOptions.some((o) => o.content?.isCorrect === true);
    if (questionOptions.length >= 2 && !hasCorrect) {
      errors.push({
        type: "error",
        field: `question_${question.id}`,
        message: `Question "${questionText}..." has no correct answer marked`,
      });
    }
  }

  // Validate passing score
  if (config.passingScore < 0 || config.passingScore > 100) {
    errors.push({
      type: "error",
      field: "passingScore",
      message: "Passing score must be between 0 and 100",
    });
  }

  // Warn about very high or low passing scores
  if (config.passingScore < 50) {
    warnings.push({
      type: "warning",
      field: "passingScore",
      message: "Passing score is below 50%, learners may not be adequately tested",
    });
  }
  if (config.passingScore > 90) {
    warnings.push({
      type: "warning",
      field: "passingScore",
      message: "Passing score is above 90%, this may be difficult for learners",
    });
  }
}

/**
 * Podcast Activity Validation
 */
function validatePodcastActivity(
  config: PodcastConfig,
  blocks: Block[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Must have audio source
  if (config.audioSource === "url" && !config.audioUrl) {
    errors.push({
      type: "error",
      field: "audioUrl",
      message: "Audio URL is required when source is set to URL",
    });
  }

  if (config.audioSource === "upload" && !config.audioUrl) {
    errors.push({
      type: "error",
      field: "audioUrl",
      message: "Please upload an audio file",
    });
  }

  if (config.audioSource === "generated" && !config.audioUrl) {
    errors.push({
      type: "error",
      field: "audioUrl",
      message: "Please generate audio from your script before publishing",
    });
  }

  // Transcript enabled but empty
  if (config.transcriptEnabled && !config.transcript?.trim()) {
    warnings.push({
      type: "warning",
      field: "transcript",
      message: "Transcript is enabled but empty - consider adding one for accessibility",
    });
  }

  // No cover image
  if (!config.coverImage) {
    warnings.push({
      type: "warning",
      field: "coverImage",
      message: "Consider adding a cover image for better presentation",
    });
  }
}
