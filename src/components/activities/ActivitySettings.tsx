/**
 * ActivitySettings Component
 *
 * Routes to the appropriate entity/activity settings component
 * based on the current entity type and activity type.
 */

"use client";

import { useEditorStore } from "@/stores/editor-store";
import { VideoActivitySettings } from "./VideoActivitySettings";
import { QuizActivitySettings } from "./QuizActivitySettings";
import { QuickDiveActivitySettings } from "./QuickDiveActivitySettings";
import { DailyDilemmaActivitySettings } from "./DailyDilemmaActivitySettings";
import { InPracticeActivitySettings } from "./InPracticeActivitySettings";
import { LessonSettings } from "../lessons";
import { CourseSettings } from "../courses";
import { AssessmentSettings } from "../assessments";
import { activityTypeInfo, lessonTypeInfo, courseTypeInfo, assessmentTypeInfo } from "@/types";

export function ActivitySettings() {
  const { entityType, activityType } = useEditorStore();

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
    default:
      return (
        <p className="text-sm text-zinc-500">
          Settings for this activity type are not yet available.
        </p>
      );
  }
}
