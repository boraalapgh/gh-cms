/**
 * CardRenderer Component
 *
 * Renders card and card_group blocks.
 * Cards can contain child blocks.
 */

"use client";

import { useMemo } from "react";
import { Block, CardBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockWrapper } from "../BlockWrapper";
import { BlockRenderer } from "../BlockRenderer";

interface CardRendererProps {
  block: Block;
}

export function CardRenderer({ block }: CardRendererProps) {
  const content = block.content as unknown as CardBlockContent;
  const blocks = useEditorStore((state) => state.blocks);

  // Memoize child blocks to prevent infinite re-renders
  const childBlocks = useMemo(
    () => blocks.filter((b) => b.parentId === block.id).sort((a, b) => a.order - b.order),
    [blocks, block.id]
  );

  if (block.type === "card_group") {
    return (
      <div className="grid grid-cols-2 gap-4">
        {childBlocks.length === 0 ? (
          <div className="col-span-2 p-8 bg-zinc-50 border border-dashed border-zinc-300 rounded-lg text-center">
            <p className="text-sm text-zinc-400">Empty card group</p>
            <p className="text-xs text-zinc-400 mt-1">
              Add cards to this group
            </p>
          </div>
        ) : (
          childBlocks.map((child) => (
            <BlockWrapper key={child.id} block={child}>
              <BlockRenderer block={child} />
            </BlockWrapper>
          ))
        )}
      </div>
    );
  }

  return (
    <Card
      style={{
        backgroundColor: content.backgroundColor || undefined,
      }}
    >
      {content.title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{content.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={content.title ? "" : "pt-4"}>
        {childBlocks.length === 0 ? (
          <p className="text-sm text-zinc-400 italic">
            Empty card - add content
          </p>
        ) : (
          <div className="space-y-2">
            {childBlocks.map((child) => (
              <BlockWrapper key={child.id} block={child}>
                <BlockRenderer block={child} />
              </BlockWrapper>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
