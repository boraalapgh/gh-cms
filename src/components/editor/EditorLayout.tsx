/**
 * EditorLayout Component
 *
 * Main layout for the block editor with three-panel structure:
 * - Left Panel: Tools and Layers
 * - Center Panel: Live preview canvas
 * - Right Panel: Element and Global settings
 */

"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { useAutoSave, useKeyboardShortcuts } from "@/hooks";
import { LeftPanel } from "./LeftPanel";
import { CenterPanel } from "./CenterPanel";
import { RightPanel } from "./RightPanel";
import { EditorBreadcrumb } from "./EditorBreadcrumb";
import { Block, ActivityType } from "@/types";

interface BreadcrumbAncestor {
  id: string;
  title: string;
  type: string;
  href?: string;
}

interface EditorLayoutProps {
  entityId: string;
  entityType: string;
  entityTitle?: string;
  activityType?: ActivityType;
  initialBlocks?: Block[];
  ancestors?: BreadcrumbAncestor[];
}

export function EditorLayout({
  entityId,
  entityType,
  entityTitle = "Untitled",
  activityType,
  initialBlocks = [],
  ancestors = [],
}: EditorLayoutProps) {
  const {
    setEntity,
    setBlocks,
    leftPanelCollapsed,
    rightPanelCollapsed,
    isDirty,
    isSaving,
  } = useEditorStore();

  // Enable auto-save with debounce
  const { saveNow } = useAutoSave({ entityId, debounceMs: 3000 });

  // Enable keyboard shortcuts (Cmd+S, Cmd+Z, Cmd+Shift+Z, Delete)
  useKeyboardShortcuts({ entityId, onSave: saveNow });

  // Initialize editor with entity data
  useEffect(() => {
    setEntity(entityId, entityType, activityType);
    setBlocks(initialBlocks);
  }, [entityId, entityType, activityType, initialBlocks, setEntity, setBlocks]);

  return (
    <div className="h-screen flex flex-col bg-zinc-50">
      {/* Top Bar */}
      <div className="h-12 border-b border-zinc-200 bg-white flex items-center justify-between px-4">
        <EditorBreadcrumb title={entityTitle} ancestors={ancestors} />
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="text-xs text-zinc-500">Unsaved changes</span>
          )}
          {isSaving && (
            <span className="text-xs text-zinc-400">Saving...</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {!leftPanelCollapsed && (
          <div className="w-60 flex-shrink-0 bg-white border-r border-zinc-200">
            <LeftPanel />
          </div>
        )}

        {/* Center Panel */}
        <div className="flex-1 min-w-0">
          <CenterPanel />
        </div>

        {/* Right Panel */}
        {!rightPanelCollapsed && (
          <div className="w-80 flex-shrink-0 bg-white border-l border-zinc-200">
            <RightPanel />
          </div>
        )}
      </div>
    </div>
  );
}
