/**
 * EditorBreadcrumb Component
 *
 * Displays hierarchical navigation for nested entity editing.
 * Shows the path from Course → Module → Lesson → Activity.
 */

"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useEditorStore } from "@/stores/editor-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home, Library, GraduationCap, Play, HelpCircle, BookOpen, Columns, CheckSquare } from "lucide-react";

// Icon mapping for entity types
const entityIcons: Record<string, React.ReactNode> = {
  course: <Library className="h-3.5 w-3.5" />,
  lesson: <GraduationCap className="h-3.5 w-3.5" />,
  activity: <Play className="h-3.5 w-3.5" />,
  assessment: <CheckSquare className="h-3.5 w-3.5" />,
};

// Activity type icons
const activityIcons: Record<string, React.ReactNode> = {
  video: <Play className="h-3.5 w-3.5" />,
  quiz: <CheckSquare className="h-3.5 w-3.5" />,
  quick_dive: <BookOpen className="h-3.5 w-3.5" />,
  daily_dilemma: <HelpCircle className="h-3.5 w-3.5" />,
  in_practice: <Columns className="h-3.5 w-3.5" />,
};

interface BreadcrumbItemData {
  id: string;
  title: string;
  type: string;
  href?: string;
}

interface EditorBreadcrumbProps {
  title: string;
  ancestors?: BreadcrumbItemData[];
}

export function EditorBreadcrumb({ title, ancestors = [] }: EditorBreadcrumbProps) {
  const { entityType, activityType } = useEditorStore();

  // Get the appropriate icon
  const currentIcon = useMemo(() => {
    if (entityType === "activity" && activityType) {
      return activityIcons[activityType] || entityIcons.activity;
    }
    return entityIcons[entityType || ""] || null;
  }, [entityType, activityType]);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home/Dashboard Link */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900">
              <Home className="h-3.5 w-3.5" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Ancestor Items (Course → Module → Lesson chain) */}
        {ancestors.map((ancestor) => (
          <React.Fragment key={ancestor.id}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href={ancestor.href || `/editor/${ancestor.type}/${ancestor.id}`}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900"
                >
                  {entityIcons[ancestor.type]}
                  <span className="max-w-[120px] truncate">{ancestor.title}</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </React.Fragment>
        ))}

        {/* Current Item */}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-1.5">
            {currentIcon}
            <span className="max-w-[200px] truncate font-medium">{title}</span>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
