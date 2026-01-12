/**
 * CardRenderer Component
 *
 * Renders card and card_group blocks.
 * Cards can contain child blocks.
 */

"use client";

import { useMemo } from "react";
import { Block, BlockType, CardBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Plus,
  Type,
  Heading,
  Image,
  Video,
  AlertCircle,
  List,
  Square,
} from "lucide-react";

// Block types that can be added inside a card
const CARD_CHILD_BLOCKS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
  { type: "heading", label: "Heading", icon: <Heading className="h-4 w-4" /> },
  { type: "image", label: "Image", icon: <Image className="h-4 w-4" /> },
  { type: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
  { type: "callout", label: "Callout", icon: <AlertCircle className="h-4 w-4" /> },
  { type: "list", label: "List", icon: <List className="h-4 w-4" /> },
];

// Block types for card groups (only cards)
const CARD_GROUP_CHILD_BLOCKS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "card", label: "Card", icon: <Square className="h-4 w-4" /> },
];

interface CardRendererProps {
  block: Block;
}

export function CardRenderer({ block }: CardRendererProps) {
  const content = block.content as unknown as CardBlockContent;
  const { blocks, addBlock, selectBlock } = useEditorStore();

  // Memoize child blocks to prevent infinite re-renders
  const childBlocks = useMemo(
    () => blocks.filter((b) => b.parentId === block.id).sort((a, b) => a.order - b.order),
    [blocks, block.id]
  );

  const handleAddChildBlock = (type: BlockType) => {
    const newBlock = addBlock(type, block.id, childBlocks.length);
    selectBlock(newBlock.id);
  };

  // Get appropriate child block types based on block type
  const childBlockTypes = block.type === "card_group" ? CARD_GROUP_CHILD_BLOCKS : CARD_CHILD_BLOCKS;

  if (block.type === "card_group") {
    return (
      <div className="grid grid-cols-2 gap-4">
        {childBlocks.length === 0 ? (
          <div className="col-span-2 p-8 bg-zinc-50 border border-dashed border-zinc-300 rounded-lg text-center">
            <p className="text-sm text-zinc-400 mb-3">Empty card group</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddChildBlock("card")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        ) : (
          <>
            {childBlocks.map((child) => (
              <BlockWrapper key={child.id} block={child}>
                <BlockRenderer block={child} />
              </BlockWrapper>
            ))}
            {/* Add more cards button */}
            <div className="flex items-center justify-center p-4 border border-dashed border-zinc-300 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-600"
                onClick={() => handleAddChildBlock("card")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          </>
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
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <p className="text-sm text-zinc-400">Empty card</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {childBlockTypes.map((item) => (
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
          <div className="space-y-2">
            {childBlocks.map((child) => (
              <BlockWrapper key={child.id} block={child}>
                <BlockRenderer block={child} />
              </BlockWrapper>
            ))}
            {/* Add more content button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-zinc-400 hover:text-zinc-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Content
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                {childBlockTypes.map((item) => (
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
        )}
      </CardContent>
    </Card>
  );
}
