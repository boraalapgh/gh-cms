/**
 * TextRenderer Component
 *
 * Renders text blocks with support for inline editing.
 * Supports plain text, markdown, and HTML formats.
 */

"use client";

import { Block, TextBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Textarea } from "@/components/ui/textarea";

interface TextRendererProps {
  block: Block;
}

export function TextRenderer({ block }: TextRendererProps) {
  const { selectedBlockId, updateBlock } = useEditorStore();
  const content = block.content as unknown as TextBlockContent;
  const isEditing = selectedBlockId === block.id;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, {
      content: { ...content, text: e.target.value },
    });
  };

  if (isEditing) {
    return (
      <Textarea
        value={content.text || ""}
        onChange={handleChange}
        placeholder="Enter text..."
        className="min-h-[60px] border-0 focus-visible:ring-0 resize-none p-0 text-zinc-700"
        autoFocus
      />
    );
  }

  return (
    <p className="text-zinc-700 whitespace-pre-wrap">
      {content.text || (
        <span className="text-zinc-400 italic">Enter text...</span>
      )}
    </p>
  );
}
