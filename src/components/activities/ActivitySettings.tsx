/**
 * ActivitySettings Component
 *
 * Routes to the appropriate entity/activity settings component
 * based on the current entity type and activity type.
 * Includes "Run Checks" functionality for pre-publish validation.
 */

"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { VideoActivitySettings } from "./VideoActivitySettings";
import { QuizActivitySettings } from "./QuizActivitySettings";
import { QuickDiveActivitySettings } from "./QuickDiveActivitySettings";
import { DailyDilemmaActivitySettings } from "./DailyDilemmaActivitySettings";
import { InPracticeActivitySettings } from "./InPracticeActivitySettings";
import { PodcastActivitySettings } from "./PodcastActivitySettings";
import { LessonSettings } from "../lessons";
import { CourseSettings } from "../courses";
import { AssessmentSettings } from "../assessments";
import { SkillsetPicker } from "../skillsets";
import { ValidationResults } from "../editor/ValidationResults";
import { Button } from "@/components/ui/button";
import { validateActivity } from "@/lib/validation";
import { activityTypeInfo, lessonTypeInfo, courseTypeInfo, assessmentTypeInfo } from "@/types";
import type { SkillsetTag, ActivityConfig } from "@/types";
import type { ValidationResult } from "@/lib/validation";
import { buildTagFromSubskill } from "@/lib/skillsets";
import { ClipboardCheck, Loader2 } from "lucide-react";

export function ActivitySettings() {
  const { entityType, activityType, subskillId, setSubskillId, blocks, activityConfig } = useEditorStore();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Build tag from stored subskillId
  const currentTag = subskillId ? buildTagFromSubskill(subskillId) : undefined;

  const handleSubskillChange = (tag: SkillsetTag | undefined) => {
    setSubskillId(tag?.subskillId ?? null);
  };

  const runValidation = useCallback(() => {
    setIsValidating(true);
    // Simulate async validation
    setTimeout(() => {
      if (entityType === "activity" && activityType && activityConfig) {
        const result = validateActivity(activityType, activityConfig as ActivityConfig, blocks);
        setValidationResult(result);
      } else {
        // Basic validation for lessons/courses
        setValidationResult({
          isValid: true,
          errors: [],
          warnings: blocks.length === 0 ? [{
            type: "warning",
            field: "content",
            message: "No content blocks have been added",
          }] : [],
        });
      }
      setIsValidating(false);
    }, 300);
  }, [entityType, activityType, activityConfig, blocks]);

  // Handle lesson entity
  if (entityType === "lesson") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900">{lessonTypeInfo.label} Settings</h3>
          <p className="text-xs text-zinc-500 mt-1">{lessonTypeInfo.description}</p>
        </div>

        <div className="border-t border-zinc-200 pt-4">
          <LessonSettings />
        </div>
      </div>
    );
  }

  // Handle course entity
  if (entityType === "course") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900">{courseTypeInfo.label} Settings</h3>
          <p className="text-xs text-zinc-500 mt-1">{courseTypeInfo.description}</p>
        </div>

        <div className="border-t border-zinc-200 pt-4">
          <CourseSettings />
        </div>
      </div>
    );
  }

  // Handle assessment entity
  if (entityType === "assessment") {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-zinc-900">{assessmentTypeInfo.label} Settings</h3>
          <p className="text-xs text-zinc-500 mt-1">{assessmentTypeInfo.description}</p>
        </div>

        <div className="border-t border-zinc-200 pt-4">
          <AssessmentSettings />
        </div>
      </div>
    );
  }

  // Handle activity entity
  if (!activityType) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-zinc-500">
          No activity type selected
        </p>
      </div>
    );
  }

  const info = activityTypeInfo[activityType];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-zinc-900">{info.label} Settings</h3>
        <p className="text-xs text-zinc-500 mt-1">{info.description}</p>
      </div>

      <div className="border-t border-zinc-200 pt-4">
        {renderActivitySettings(activityType)}
      </div>

      {/* Skillset Tagging */}
      <div className="border-t border-zinc-200 pt-4">
        <SkillsetPicker
          context="activity"
          value={currentTag}
          onChange={handleSubskillChange}
          label="Subskill Tag"
        />
      </div>

      {/* Validation Section */}
      <div className="border-t border-zinc-200 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-zinc-900">Pre-publish Checks</h4>
            <p className="text-xs text-zinc-500">Validate before publishing</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={runValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <ClipboardCheck className="h-3.5 w-3.5 mr-1.5" />
                Run Checks
              </>
            )}
          </Button>
        </div>

        {validationResult && (
          <ValidationResults result={validationResult} compact />
        )}
      </div>
    </div>
  );
}

function renderActivitySettings(activityType: string) {
  switch (activityType) {
    case "video":
      return <VideoActivitySettings />;
    case "quiz":
      return <QuizActivitySettings />;
    case "quick_dive":
      return <QuickDiveActivitySettings />;
    case "daily_dilemma":
      return <DailyDilemmaActivitySettings />;
    case "in_practice":
      return <InPracticeActivitySettings />;
    case "podcast":
      return <PodcastActivitySettings />;
    default:
      return (
        <p className="text-sm text-zinc-500">
          Settings for this activity type are not yet available.
        </p>
      );
  }
}
