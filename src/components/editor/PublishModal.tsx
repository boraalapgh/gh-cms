/**
 * PublishModal Component
 *
 * Pre-publish validation and publishing workflow.
 * Runs validation checks and blocks publishing if errors exist.
 * Warnings can be acknowledged and publishing can proceed.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Send, RefreshCw, CheckCircle } from "lucide-react";
import { ValidationResults } from "./ValidationResults";
import { validateActivity } from "@/lib/validation";
import { useEditorStore } from "@/stores/editor-store";
import type { ValidationResult } from "@/lib/validation";
import type { ActivityType, ActivityConfig } from "@/types";
import { toast } from "sonner";

interface PublishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityId: string;
  entityType: "activity" | "lesson" | "course";
  activityType?: ActivityType;
  onPublishSuccess?: () => void;
}

export function PublishModal({
  open,
  onOpenChange,
  entityId,
  entityType,
  activityType,
  onPublishSuccess,
}: PublishModalProps) {
  const { blocks, activityConfig } = useEditorStore();
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Run validation when modal opens
  const runValidation = useCallback(() => {
    setIsValidating(true);
    setPublishSuccess(false);

    // Simulate async validation (in real app, might call API)
    setTimeout(() => {
      if (entityType === "activity" && activityType && activityConfig) {
        const result = validateActivity(activityType, activityConfig as ActivityConfig, blocks);
        setValidationResult(result);
      } else {
        // For lessons and courses, basic validation
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
    }, 500);
  }, [entityType, activityType, activityConfig, blocks]);

  useEffect(() => {
    if (open) {
      runValidation();
    } else {
      // Reset state when closing
      setValidationResult(null);
      setPublishSuccess(false);
    }
  }, [open, runValidation]);

  const handlePublish = async () => {
    if (!validationResult?.isValid) return;

    setIsPublishing(true);

    try {
      const response = await fetch(`/api/entities/${entityId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          publishedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setPublishSuccess(true);
        toast.success("Published successfully!");
        onPublishSuccess?.();
        // Auto-close after success
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to publish");
      }
    } catch (error) {
      console.error("Publish failed:", error);
      toast.error("Failed to publish. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleJumpToFix = (field: string) => {
    // Close modal and scroll to the relevant field
    onOpenChange(false);
    // In a real implementation, this would navigate to the field
    toast.info(`Navigate to: ${field}`);
  };

  const canPublish = validationResult?.isValid && !isPublishing && !isValidating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {publishSuccess ? "Published!" : `Publish ${entityType}`}
          </DialogTitle>
          <DialogDescription>
            {publishSuccess
              ? "Your content is now live."
              : "Review validation results before publishing."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isValidating ? (
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Running validation checks...</span>
            </div>
          ) : publishSuccess ? (
            <div className="flex flex-col items-center justify-center gap-3 py-8">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                Your {entityType} has been published successfully.
              </p>
            </div>
          ) : validationResult ? (
            <ValidationResults
              result={validationResult}
              onJumpToFix={handleJumpToFix}
            />
          ) : null}
        </div>

        {!publishSuccess && (
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={runValidation}
              disabled={isValidating || isPublishing}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-check
            </Button>
            <Button
              onClick={handlePublish}
              disabled={!canPublish}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
