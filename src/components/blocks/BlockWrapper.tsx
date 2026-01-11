/**
 * BlockWrapper Component
 *
 * Wraps each block with consistent selection, hover states, and interaction.
 * Shows grey border on hover, black border on select.
 */

"use client";

import { ReactNode } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { Block } from "@/types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BlockWrapperProps {
  block: Block;
  children: ReactNode;
}

export function BlockWrapper({ block, children }: BlockWrapperProps) {
  const {
    selectedBlockId,
    hoveredBlockId,
    selectBlock,
    setHoveredBlock,
    deleteBlock,
  } = useEditorStore();

  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteBlock(block.id);
  };

  return (
    <div
      className={`relative group transition-all duration-150 rounded-sm ${
        isSelected
          ? "ring-2 ring-zinc-900"
          : isHovered
          ? "ring-1 ring-zinc-300"
          : ""
      }`}
      onClick={handleClick}
      onMouseEnter={() => setHoveredBlock(block.id)}
      onMouseLeave={() => setHoveredBlock(null)}
    >
      {/* Block type label */}
      {(isSelected || isHovered) && (
        <div className="absolute -top-5 left-0 text-[10px] text-zinc-500 capitalize">
          {block.type.replace("_", " ")}
        </div>
      )}

      {/* Delete button */}
      {isSelected && (
        <div className="absolute -top-5 right-0">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 hover:bg-red-100 hover:text-red-600"
            onClick={handleDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Block content */}
      <div className="min-h-[24px]">{children}</div>
    </div>
  );
}
