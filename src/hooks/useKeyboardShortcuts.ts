/**
 * useKeyboardShortcuts Hook
 *
 * Handles keyboard shortcuts for the editor.
 * Supports: Cmd/Ctrl+S (save), Cmd/Ctrl+Z (undo), Cmd/Ctrl+Shift+Z (redo), Delete (delete block)
 */

"use client";

import { useEffect, useCallback } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { toast } from "sonner";

interface UseKeyboardShortcutsOptions {
  entityId: string | null;
  onSave?: () => Promise<void>;
}

export function useKeyboardShortcuts({ entityId, onSave }: UseKeyboardShortcutsOptions) {
  const { undo, redo, selectedBlockId, deleteBlock, blocks } = useEditorStore();

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + S - Save
      if (isMod && e.key === "s") {
        e.preventDefault();
        if (onSave) {
          try {
            await onSave();
            toast.success("Changes saved");
          } catch (error) {
            toast.error("Failed to save");
          }
        }
        return;
      }

      // Cmd/Ctrl + Z - Undo
      if (isMod && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        toast.info("Undo");
        return;
      }

      // Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y - Redo
      if ((isMod && e.shiftKey && e.key === "z") || (isMod && e.key === "y")) {
        e.preventDefault();
        redo();
        toast.info("Redo");
        return;
      }

      // Delete or Backspace - Delete selected block
      if ((e.key === "Delete" || e.key === "Backspace") && selectedBlockId) {
        // Don't delete if user is typing in an input
        const activeElement = document.activeElement;
        const isInputElement =
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement ||
          activeElement?.getAttribute("contenteditable") === "true";

        if (!isInputElement) {
          e.preventDefault();
          deleteBlock(selectedBlockId);
          toast.info("Block deleted");
          return;
        }
      }

      // Escape - Deselect block
      if (e.key === "Escape") {
        useEditorStore.getState().selectBlock(null);
        return;
      }
    },
    [undo, redo, selectedBlockId, deleteBlock, onSave]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
