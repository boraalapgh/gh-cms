/**
 * useAutoSave Hook
 *
 * Automatically saves blocks to the API when they change.
 * Uses debouncing to prevent excessive API calls.
 */

"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { Block } from "@/types";

const DEBOUNCE_MS = 1000;

export function useAutoSave() {
  const { entityId, blocks, isDirty, setIsSaving, markClean } = useEditorStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");

  const saveBlocks = useCallback(async (blocksToSave: Block[]) => {
    if (!entityId) return;

    const serialized = JSON.stringify(blocksToSave);
    if (serialized === lastSavedRef.current) return;

    setIsSaving(true);
    try {
      // Delete existing blocks and create new ones
      // In production, use a more efficient diff-based approach
      const response = await fetch(`/api/blocks?entityId=${entityId}`);
      const { data: existingBlocks } = await response.json();

      // Delete removed blocks
      const newIds = new Set(blocksToSave.map((b) => b.id));
      for (const existing of existingBlocks) {
        if (!newIds.has(existing.id)) {
          await fetch(`/api/blocks/${existing.id}`, { method: "DELETE" });
        }
      }

      // Update or create blocks
      const existingIds = new Set(existingBlocks.map((b: Block) => b.id));
      for (const block of blocksToSave) {
        if (existingIds.has(block.id)) {
          await fetch(`/api/blocks/${block.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: block.content,
              settings: block.settings,
              order: block.order,
              parentId: block.parentId,
            }),
          });
        } else {
          await fetch("/api/blocks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entityId,
              type: block.type,
              content: block.content,
              settings: block.settings,
              order: block.order,
              parentId: block.parentId,
            }),
          });
        }
      }

      lastSavedRef.current = serialized;
      markClean();
    } catch (error) {
      console.error("Failed to save blocks:", error);
    } finally {
      setIsSaving(false);
    }
  }, [entityId, setIsSaving, markClean]);

  useEffect(() => {
    if (!isDirty || !entityId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveBlocks(blocks);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [blocks, isDirty, entityId, saveBlocks]);

  return { saveBlocks };
}
