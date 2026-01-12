/**
 * SectionRenderer Component
 *
 * Renders expandable section blocks with nested content.
 * Used in Quick Dive and other content-rich activities.
 */

"use client";

import { useState, useMemo } from "react";
import { Block, BlockType } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlockWrapper } from "../BlockWrapper";
import { BlockRenderer } from "../BlockRenderer";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Plus,
  Type,
  Heading,
  Image,
  Video,
  AlertCircle,
  List,
} from "lucide-react";

// Block types that can be added inside a section
const SECTION_CHILD_BLOCKS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  { type: "heading", label: "Heading", icon: <Heading className="h-4 w-4" /> },
  { type: "image", label: "Image", icon: <Image className="h-4 w-4" /> },
  { type: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
  { type: "callout", label: "Callout", icon: <AlertCircle className="h-4 w-4" /> },
  { type: "list", label: "List", icon: <List className="h-4 w-4" /> },
];

interface SectionRendererProps {
  block: Block;
}

interface SectionBlockContent {
  title: string;
  isExpandable?: boolean;
  defaultExpanded?: boolean;
}

export function SectionRenderer({ block }: SectionRendererProps) {
  const { selectedBlockId, updateBlock, blocks, addBlock, selectBlock } = useEditorStore();
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

  const handleAddChildBlock = (type: BlockType) => {
    const newBlock = addBlock(type, block.id, children.length);
    selectBlock(newBlock.id);
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
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <p className="text-sm text-zinc-400">This section is empty</p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {SECTION_CHILD_BLOCKS.map((item) => (
                    <DropdownMenuItem
                      key={item.type}
                      onClick={() => handleAddChildBlock(item.type)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              {children.map((childBlock) => (
                <BlockWrapper key={childBlock.id} block={childBlock}>
                  <BlockRenderer block={childBlock} />
                </BlockWrapper>
              ))}
              {/* Add more blocks button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-zinc-400 hover:text-zinc-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Block
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  {SECTION_CHILD_BLOCKS.map((item) => (
                    <DropdownMenuItem
                      key={item.type}
                      onClick={() => handleAddChildBlock(item.type)}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      )}
    </div>
  );
}
