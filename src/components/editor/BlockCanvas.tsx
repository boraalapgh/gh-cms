/**
 * BlockCanvas Component
 *
 * Renders blocks on the preview canvas with selection and hover states.
 * Each block is wrapped in BlockWrapper for consistent interaction.
 */

"use client";

import { Block } from "@/types";
import { BlockWrapper } from "../blocks/BlockWrapper";
import { BlockRenderer } from "../blocks/BlockRenderer";

interface BlockCanvasProps {
  blocks: Block[];
}

export function BlockCanvas({ blocks }: BlockCanvasProps) {
  return (
    <div className="p-4 space-y-2">
      {blocks.map((block) => (
        <BlockWrapper key={block.id} block={block}>
          <BlockRenderer block={block} />
        </BlockWrapper>
      ))}
    </div>
  );
}
