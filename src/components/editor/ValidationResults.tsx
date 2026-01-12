/**
 * ValidationResults Component
 *
 * Displays validation results grouped by category.
 * Each issue shows what's wrong and a "Jump to fix" button.
 */

"use client";

import { useMemo } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ValidationResult, ValidationIssue } from "@/lib/validation";
import { cn } from "@/lib/utils";

interface ValidationResultsProps {
  result: ValidationResult;
  onJumpToFix?: (field: string) => void;
  compact?: boolean;
}

// Group issues by category based on field name
function categorizeIssue(issue: ValidationIssue): string {
  const field = issue.field.toLowerCase();

  if (field.includes("url") || field.includes("image") || field.includes("audio") || field.includes("video")) {
    return "Media";
  }
  if (field.includes("option") || field.includes("question") || field.includes("slide") || field.includes("screen")) {
    return "Structure";
  }
  if (field.includes("transcript") || field.includes("alt")) {
    return "Accessibility";
  }
  if (field.includes("score") || field.includes("time") || field.includes("attempt")) {
    return "Settings";
  }
  return "Content";
}

export function ValidationResults({ result, onJumpToFix, compact = false }: ValidationResultsProps) {
  const { isValid, errors, warnings } = result;

  // Group issues by category
  const groupedIssues = useMemo(() => {
    const allIssues = [...errors, ...warnings];
    const groups: Record<string, ValidationIssue[]> = {};

    for (const issue of allIssues) {
      const category = categorizeIssue(issue);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(issue);
    }

    return groups;
  }, [errors, warnings]);

  const categoryOrder = ["Content", "Structure", "Media", "Accessibility", "Settings"];

  if (isValid && warnings.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-green-900">Ready to publish</p>
          <p className="text-xs text-green-700">All validation checks passed</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {errors.length > 0 && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{errors.length} error{errors.length !== 1 ? "s" : ""} must be fixed</span>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{warnings.length} warning{warnings.length !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={cn(
        "p-4 rounded-lg border",
        errors.length > 0 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"
      )}>
        <div className="flex items-center gap-2">
          {errors.length > 0 ? (
            <AlertCircle className="h-5 w-5 text-red-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          )}
          <div>
            <p className={cn(
              "text-sm font-medium",
              errors.length > 0 ? "text-red-900" : "text-amber-900"
            )}>
              {errors.length > 0
                ? `${errors.length} issue${errors.length !== 1 ? "s" : ""} must be fixed before publishing`
                : `${warnings.length} warning${warnings.length !== 1 ? "s" : ""} to review`
              }
            </p>
            {errors.length > 0 && warnings.length > 0 && (
              <p className="text-xs text-amber-700 mt-0.5">
                Plus {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Grouped Issues */}
      <div className="space-y-2">
        {categoryOrder.map((category) => {
          const issues = groupedIssues[category];
          if (!issues || issues.length === 0) return null;

          const hasErrors = issues.some((i) => i.type === "error");

          return (
            <Collapsible key={category} defaultOpen={hasErrors}>
              <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                <span className="text-sm font-medium">{category}</span>
                <div className="flex gap-1 ml-auto">
                  {issues.filter((i) => i.type === "error").length > 0 && (
                    <Badge variant="destructive" className="h-5 text-xs">
                      {issues.filter((i) => i.type === "error").length}
                    </Badge>
                  )}
                  {issues.filter((i) => i.type === "warning").length > 0 && (
                    <Badge variant="secondary" className="h-5 text-xs bg-amber-100 text-amber-800">
                      {issues.filter((i) => i.type === "warning").length}
                    </Badge>
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-1 pl-6">
                  {issues.map((issue, index) => (
                    <IssueItem
                      key={`${issue.field}-${index}`}
                      issue={issue}
                      onJumpToFix={onJumpToFix}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}

function IssueItem({
  issue,
  onJumpToFix,
}: {
  issue: ValidationIssue;
  onJumpToFix?: (field: string) => void;
}) {
  const isError = issue.type === "error";

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border",
      isError ? "bg-red-50/50 border-red-200" : "bg-amber-50/50 border-amber-200"
    )}>
      {isError ? (
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm",
          isError ? "text-red-900" : "text-amber-900"
        )}>
          {issue.message}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Field: {issue.field}
        </p>
      </div>
      {onJumpToFix && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-7 text-xs"
          onClick={() => onJumpToFix(issue.field)}
        >
          Jump to fix
        </Button>
      )}
    </div>
  );
}
