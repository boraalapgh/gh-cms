/**
 * SectionRenderer Component
 *
 * Renders expandable section blocks with nested content.
 * Used in Quick Dive and other content-rich activities.
 */

"use client";

import { useState, useMemo } from "react";
import { Block } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Input } from "@/components/ui/input";
import { BlockWrapper } from "../BlockWrapper";
import { BlockRenderer } from "../BlockRenderer";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";

interface SectionRendererProps {
  block: Block;
}

interface SectionBlockContent {
  title: string;
  isExpandable?: boolean;
  defaultExpanded?: boolean;
}

export function SectionRenderer({ block }: SectionRendererProps) {
  const { selectedBlockId, updateBlock, blocks } = useEditorStore();
  const content = block.content as unknown as SectionBlockContent;
  const isEditing = selectedBlockId === block.id;
  const [isExpanded, setIsExpanded] = useState(content.defaultExpanded !== false);

  // Memoize child blocks to prevent infinite re-renders
  const children = useMemo(
    () => blocks.filter((b) => b.parentId === block.id).sort((a, b) => a.order - b.order),
    [blocks, block.id]
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(block.id, {
      content: { ...content, title: e.target.value },
    });
  };

  const isExpandable = content.isExpandable !== false;

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div
        className={`flex items-center gap-2 px-4 py-3 bg-zinc-50 ${
          isExpandable ? "cursor-pointer hover:bg-zinc-100" : ""
        }`}
        onClick={() => isExpandable && setIsExpanded(!isExpanded)}
      >
        {isExpandable && (
          <span className="text-zinc-400">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
        <Layers className="h-4 w-4 text-zinc-500" />

        {isEditing ? (
          <Input
            value={content.title || ""}
            onChange={handleTitleChange}
            placeholder="Section title..."
            className="flex-1 h-7 text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-medium text-zinc-700">
            {content.title || (
              <span className="text-zinc-400 italic">Section title...</span>
            )}
          </span>
        )}

        {children.length > 0 && (
          <span className="text-xs text-zinc-400">
            {children.length} item{children.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Section Content */}
      {(!isExpandable || isExpanded) && (
        <div className="p-4 space-y-3 border-t border-zinc-200">
          {children.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">
              Add blocks to this section from the Tools panel
            </p>
          ) : (
            children.map((childBlock) => (
              <BlockWrapper key={childBlock.id} block={childBlock}>
                <BlockRenderer block={childBlock} />
              </BlockWrapper>
            ))
          )}
        </div>
      )}
    </div>
  );
}
