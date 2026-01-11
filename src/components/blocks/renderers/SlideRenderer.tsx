/**
 * SlideRenderer Component
 *
 * Renders a single slide within a slide deck.
 * Can contain content blocks and option cards.
 */

"use client";

import { useMemo } from "react";
import { Block } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { BlockWrapper } from "../BlockWrapper";
import { BlockRenderer } from "../BlockRenderer";
import { Input } from "@/components/ui/input";
import { SplitSquareHorizontal } from "lucide-react";

interface SlideRendererProps {
  block: Block;
}

interface SlideBlockContent {
  title?: string;
}

export function SlideRenderer({ block }: SlideRendererProps) {
  const { selectedBlockId, updateBlock, blocks } = useEditorStore();
  const content = block.content as unknown as SlideBlockContent;
  const isEditing = selectedBlockId === block.id;

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

  // Separate content blocks from option blocks
  const contentBlocks = children.filter((b) => b.type !== "option");
  const optionBlocks = children.filter((b) => b.type === "option");

  return (
    <div className="space-y-4">
      {/* Slide Title */}
      <div className="flex items-center gap-2">
        <SplitSquareHorizontal className="h-4 w-4 text-zinc-400" />
        {isEditing ? (
          <Input
            value={content.title || ""}
            onChange={handleTitleChange}
            placeholder="Slide title (optional)..."
            className="text-lg font-medium border-0 p-0 h-auto focus-visible:ring-0"
            autoFocus
          />
        ) : (
          <h3 className="text-lg font-medium text-zinc-900">
            {content.title || (
              <span className="text-zinc-400 italic">Untitled slide</span>
            )}
          </h3>
        )}
      </div>

      {/* Slide Content */}
      {contentBlocks.length > 0 && (
        <div className="space-y-3">
          {contentBlocks.map((childBlock) => (
            <BlockWrapper key={childBlock.id} block={childBlock}>
              <BlockRenderer block={childBlock} />
            </BlockWrapper>
          ))}
        </div>
      )}

      {/* Option Cards */}
      {optionBlocks.length > 0 && (
        <div className="pt-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
            Options
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {optionBlocks.map((optionBlock) => (
              <BlockWrapper key={optionBlock.id} block={optionBlock}>
                <BlockRenderer block={optionBlock} />
              </BlockWrapper>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {children.length === 0 && (
        <div className="text-center py-8 text-sm text-zinc-400">
          Add content blocks and options to this slide
        </div>
      )}
    </div>
  );
}
