/**
 * useAutoSave Hook
 *
 * Automatically saves changes after a debounce period.
 * Includes conflict detection via revision tracking.
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { toast } from "sonner";
import type { SaveState } from "@/components/editor/SaveStatus";

interface UseAutoSaveOptions {
  entityId: string | null;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  saveNow: () => Promise<void>;
  saveState: SaveState;
  lastSavedAt: Date | null;
  hasConflict: boolean;
  conflictData: ConflictData | null;
  resolveConflict: (resolution: "reload" | "overwrite" | "copy") => Promise<void>;
}

interface ConflictData {
  serverRevision: number;
  clientRevision: number;
  serverUpdatedAt: string;
}

export function useAutoSave({
  entityId,
  debounceMs = 3000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const { blocks, isDirty, setIsSaving, markClean, activityConfig, lessonConfig, courseConfig } = useEditorStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const revisionRef = useRef<number>(1);

  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);

  // Track online status
  useEffect(() => {
    const handleOnline = () => {
      if (saveState === "offline") {
        setSaveState(isDirty ? "unsaved" : "saved");
      }
    };
    const handleOffline = () => setSaveState("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (!navigator.onLine) {
      setSaveState("offline");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isDirty, saveState]);

  const saveBlocks = useCallback(async () => {
    if (!entityId || !isDirty) return;

    if (!navigator.onLine) {
      setSaveState("offline");
      return;
    }

    setIsSaving(true);
    setSaveState("saving");

    try {
      const response = await fetch("/api/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId,
          blocks,
          revision: revisionRef.current,
          config: activityConfig || lessonConfig || courseConfig,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        revisionRef.current = data.revision || revisionRef.current + 1;
        markClean();
        setLastSavedAt(new Date());
        setSaveState("saved");
        setHasConflict(false);
        setConflictData(null);
      } else if (response.status === 409) {
        // Conflict detected
        const errorData = await response.json();
        setSaveState("conflict");
        setHasConflict(true);
        setConflictData({
          serverRevision: errorData.serverRevision,
          clientRevision: revisionRef.current,
          serverUpdatedAt: errorData.updatedAt,
        });
        toast.error("Conflict detected - content was updated elsewhere");
      } else {
        setSaveState("unsaved");
        toast.error("Auto-save failed");
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
      setSaveState(navigator.onLine ? "unsaved" : "offline");
      if (navigator.onLine) {
        toast.error("Auto-save failed");
      }
    } finally {
      setIsSaving(false);
    }
  }, [entityId, blocks, isDirty, setIsSaving, markClean, activityConfig, lessonConfig, courseConfig]);

  const resolveConflict = useCallback(async (resolution: "reload" | "overwrite" | "copy") => {
    if (!entityId) return;

    switch (resolution) {
      case "reload":
        // Reload the entity from server
        window.location.reload();
        break;

      case "overwrite":
        // Force save, ignoring server revision
        setIsSaving(true);
        setSaveState("saving");
        try {
          const response = await fetch("/api/blocks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entityId,
              blocks,
              forceOverwrite: true,
              config: activityConfig || lessonConfig || courseConfig,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            revisionRef.current = data.revision;
            markClean();
            setLastSavedAt(new Date());
            setSaveState("saved");
            setHasConflict(false);
            setConflictData(null);
            toast.success("Changes saved successfully");
          } else {
            toast.error("Failed to save changes");
            setSaveState("conflict");
          }
        } catch (error) {
          console.error("Force save failed:", error);
          toast.error("Failed to save changes");
        } finally {
          setIsSaving(false);
        }
        break;

      case "copy":
        // Copy current content to clipboard
        const content = JSON.stringify({ blocks, config: activityConfig || lessonConfig || courseConfig }, null, 2);
        await navigator.clipboard.writeText(content);
        toast.success("Content copied to clipboard");
        break;
    }
  }, [entityId, blocks, activityConfig, lessonConfig, courseConfig, setIsSaving, markClean]);

  // Initialize revision from server on mount
  useEffect(() => {
    if (!entityId) return;

    const fetchRevision = async () => {
      try {
        const response = await fetch(`/api/entities/${entityId}`);
        if (response.ok) {
          const data = await response.json();
          revisionRef.current = data.revision || 1;
        }
      } catch (error) {
        console.error("Failed to fetch entity revision:", error);
      }
    };

    fetchRevision();
  }, [entityId]);

  useEffect(() => {
    // Skip first render to avoid saving on load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled || !entityId || !isDirty || hasConflict) return;

    // Update state to show unsaved changes
    if (saveState !== "saving" && saveState !== "offline") {
      setSaveState("unsaved");
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced save
    timeoutRef.current = setTimeout(() => {
      saveBlocks();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [blocks, entityId, isDirty, enabled, debounceMs, saveBlocks, hasConflict, saveState]);

  return {
    saveNow: saveBlocks,
    saveState,
    lastSavedAt,
    hasConflict,
    conflictData,
    resolveConflict,
  };
}
