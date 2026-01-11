/**
 * TwoColumnRenderer Component
 *
 * Renders a two-column layout block.
 * Each column can contain child blocks.
 */

"use client";

import { useMemo } from "react";
import { Block, TwoColumnBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { BlockWrapper } from "../BlockWrapper";
import { BlockRenderer } from "../BlockRenderer";

interface TwoColumnRendererProps {
  block: Block;
}

export function TwoColumnRenderer({ block }: TwoColumnRendererProps) {
  const content = block.content as unknown as TwoColumnBlockContent;
  const blocks = useEditorStore((state) => state.blocks);
  const splitRatio = content.splitRatio || 0.5;

  // Memoize child blocks to prevent infinite re-renders
  const childBlocks = useMemo(
    () => blocks.filter((b) => b.parentId === block.id).sort((a, b) => a.order - b.order),
    [blocks, block.id]
  );

  // Split children into left and right based on a simple convention:
  // Odd order = left, even order = right
  const leftBlocks = childBlocks.filter((_, i) => i % 2 === 0);
  const rightBlocks = childBlocks.filter((_, i) => i % 2 === 1);

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `${splitRatio}fr ${1 - splitRatio}fr` }}>
      <div className="space-y-2">
        {content.leftTitle && (
          <h4 className="font-medium text-sm text-zinc-700 mb-2">
            {content.leftTitle}
          </h4>
        )}
        {leftBlocks.length === 0 ? (
          <div className="p-4 bg-zinc-50 border border-dashed border-zinc-300 rounded text-center">
            <p className="text-xs text-zinc-400">Left column</p>
          </div>
        ) : (
          leftBlocks.map((child) => (
            <BlockWrapper key={child.id} block={child}>
              <BlockRenderer block={child} />
            </BlockWrapper>
          ))
        )}
      </div>
      <div className="space-y-2">
        {content.rightTitle && (
          <h4 className="font-medium text-sm text-zinc-700 mb-2">
            {content.rightTitle}
          </h4>
        )}
        {rightBlocks.length === 0 ? (
          <div className="p-4 bg-zinc-50 border border-dashed border-zinc-300 rounded text-center">
            <p className="text-xs text-zinc-400">Right column</p>
          </div>
        ) : (
          rightBlocks.map((child) => (
            <BlockWrapper key={child.id} block={child}>
              <BlockRenderer block={child} />
            </BlockWrapper>
          ))
        )}
      </div>
    </div>
  );
}
