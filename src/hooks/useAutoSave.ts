/**
 * useAutoSave Hook
 *
 * Automatically saves changes after a debounce period.
 * Prevents data loss when editing content.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { toast } from "sonner";

interface UseAutoSaveOptions {
  entityId: string | null;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave({
  entityId,
  debounceMs = 3000,
  enabled = true,
}: UseAutoSaveOptions) {
  const { blocks, isDirty, setIsSaving, markClean } = useEditorStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  const saveBlocks = useCallback(async () => {
    if (!entityId || !isDirty) return;

    setIsSaving(true);
    try {
      // Save all blocks to the API
      const response = await fetch("/api/blocks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId,
          blocks,
        }),
      });

      if (response.ok) {
        markClean();
        // Silent auto-save, no toast to avoid spam
      } else {
        toast.error("Auto-save failed");
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast.error("Auto-save failed");
    } finally {
      setIsSaving(false);
    }
  }, [entityId, blocks, isDirty, setIsSaving, markClean]);

  useEffect(() => {
    // Skip first render to avoid saving on load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!enabled || !entityId || !isDirty) return;

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
  }, [blocks, entityId, isDirty, enabled, debounceMs, saveBlocks]);

  // Manual save function for immediate saves
  return { saveNow: saveBlocks };
}
