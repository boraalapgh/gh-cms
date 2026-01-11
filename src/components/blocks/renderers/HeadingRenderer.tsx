/**
 * HeadingRenderer Component
 *
 * Renders heading blocks (H1-H6) with inline editing.
 */

"use client";

import { Block, HeadingBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Input } from "@/components/ui/input";

interface HeadingRendererProps {
  block: Block;
}

const headingStyles: Record<number, string> = {
  1: "text-3xl font-bold",
  2: "text-2xl font-semibold",
  3: "text-xl font-semibold",
  4: "text-lg font-medium",
  5: "text-base font-medium",
  6: "text-sm font-medium",
};

export function HeadingRenderer({ block }: HeadingRendererProps) {
  const { selectedBlockId, updateBlock } = useEditorStore();
  const content = block.content as unknown as HeadingBlockContent;
  const isEditing = selectedBlockId === block.id;
  const level = content.level || 2;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(block.id, {
      content: { ...content, text: e.target.value },
    });
  };

  const className = `${headingStyles[level]} text-zinc-900`;

  if (isEditing) {
    return (
      <Input
        value={content.text || ""}
        onChange={handleChange}
        placeholder="Enter heading..."
        className={`${className} border-0 focus-visible:ring-0 p-0 h-auto`}
        autoFocus
      />
    );
  }

  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  return (
    <Tag className={className}>
      {content.text || (
        <span className="text-zinc-400 italic">Enter heading...</span>
      )}
    </Tag>
  );
}
