/**
 * useActivityValidation Hook
 *
 * React hook for validating activity content before publishing.
 * Provides real-time validation status and issues.
 */

"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { validateActivity, ValidationResult } from "@/lib/validation";

/**
 * Hook to validate the current activity in the editor
 */
export function useActivityValidation(): ValidationResult & {
  canPublish: boolean;
  issueCount: number;
} {
  const { activityType, activityConfig, blocks } = useEditorStore();

  const validation = useMemo(() => {
    if (!activityType || !activityConfig) {
      return {
        isValid: false,
        errors: [{ type: "error" as const, field: "activity", message: "No activity loaded" }],
        warnings: [],
      };
    }

    return validateActivity(activityType, activityConfig, blocks);
  }, [activityType, activityConfig, blocks]);

  return {
    ...validation,
    canPublish: validation.isValid,
    issueCount: validation.errors.length + validation.warnings.length,
  };
}
