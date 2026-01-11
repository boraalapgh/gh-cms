/**
 * LeftPanel Component
 *
 * Contains Tools palette (add blocks) and Layers tree (block hierarchy).
 * Supports drag-and-drop reordering of blocks in the layers list.
 */

"use client";

import { useState, useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BlockType, activityBlockPalette, ActivityType, lessonBlockPalette, courseBlockPalette, assessmentBlockPalette } from "@/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Type,
  Heading,
  Image,
  Video,
  Square,
  LayoutGrid,
  Minus,
  Columns,
  AlertCircle,
  List,
  ChevronDown,
  ChevronRight,
  GripVertical,
  FileText,
  HelpCircle,
  CheckSquare,
  Layers,
  SplitSquareHorizontal,
} from "lucide-react";

// All block tools configuration with icons
const ALL_BLOCK_TOOLS: Record<BlockType, { label: string; icon: React.ReactNode }> = {
  text: { label: "Text", icon: <Type className="h-4 w-4" /> },
  heading: { label: "Heading", icon: <Heading className="h-4 w-4" /> },
  image: { label: "Image", icon: <Image className="h-4 w-4" /> },
  video: { label: "Video", icon: <Video className="h-4 w-4" /> },
  card: { label: "Card", icon: <Square className="h-4 w-4" /> },
  card_group: { label: "Card Group", icon: <LayoutGrid className="h-4 w-4" /> },
  divider: { label: "Divider", icon: <Minus className="h-4 w-4" /> },
  two_column: { label: "Two Column", icon: <Columns className="h-4 w-4" /> },
  callout: { label: "Callout", icon: <AlertCircle className="h-4 w-4" /> },
  list: { label: "List", icon: <List className="h-4 w-4" /> },
  transcript: { label: "Transcript", icon: <FileText className="h-4 w-4" /> },
  quiz_question: { label: "Question", icon: <HelpCircle className="h-4 w-4" /> },
  option: { label: "Option", icon: <CheckSquare className="h-4 w-4" /> },
  section: { label: "Section", icon: <Layers className="h-4 w-4" /> },
  slide: { label: "Slide", icon: <SplitSquareHorizontal className="h-4 w-4" /> },
  slide_deck: { label: "Slide Deck", icon: <LayoutGrid className="h-4 w-4" /> },
};

// Default block tools (when no activity type is set)
const DEFAULT_BLOCK_TYPES: BlockType[] = [
  "text", "heading", "image", "video", "card", "card_group",
  "divider", "two_column", "callout", "list",
];

// Get available block tools based on entity type and activity type
function getBlockTools(
  entityType: string | null,
  activityType: ActivityType | null
): { type: BlockType; label: string; icon: React.ReactNode }[] {
  let blockTypes: BlockType[];

  if (entityType === "lesson") {
    blockTypes = lessonBlockPalette;
  } else if (entityType === "course") {
    blockTypes = courseBlockPalette;
  } else if (entityType === "assessment") {
    blockTypes = assessmentBlockPalette;
  } else if (activityType) {
    blockTypes = activityBlockPalette[activityType];
    // Add transcript to video activity
    if (activityType === "video") {
      blockTypes = [...blockTypes, "transcript" as BlockType];
    }
  } else {
    blockTypes = DEFAULT_BLOCK_TYPES;
  }

  return blockTypes.map((type) => ({
    type,
    ...ALL_BLOCK_TOOLS[type],
  }));
}

// Sortable layer item
function SortableLayerItem({
  id,
  type,
  isSelected,
  onSelect,
}: {
  id: string;
  type: BlockType;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = ALL_BLOCK_TOOLS[type]?.icon || <Square className="h-4 w-4" />;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
        isSelected
          ? "bg-zinc-900 text-white"
          : "hover:bg-zinc-100 text-zinc-700"
      }`}
      onClick={onSelect}
    >
      <button
        className="cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3 text-zinc-400" />
      </button>
      {Icon}
      <span className="capitalize flex-1 truncate">{type.replace("_", " ")}</span>
    </div>
  );
}

export function LeftPanel() {
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(true);

  const { addBlock, selectBlock, selectedBlockId, reorderBlocks, activityType, entityType, blocks } = useEditorStore();

  // Memoize root blocks to prevent infinite re-renders
  const rootBlocks = useMemo(
    () => blocks.filter((b) => !b.parentId).sort((a, b) => a.order - b.order),
    [blocks]
  );

  // Get block tools based on entity type and activity type
  const blockTools = getBlockTools(entityType, activityType);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddBlock = (type: BlockType) => {
    const newBlock = addBlock(type);
    selectBlock(newBlock.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = rootBlocks.findIndex((b) => b.id === active.id);
      const newIndex = rootBlocks.findIndex((b) => b.id === over.id);

      const reordered = arrayMove(rootBlocks, oldIndex, newIndex);
      reorderBlocks(
        reordered.map((block, index) => ({
          id: block.id,
          order: index,
        }))
      );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tools Section */}
      <div className="border-b border-zinc-200">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          onClick={() => setToolsExpanded(!toolsExpanded)}
        >
          {toolsExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Tools
        </button>
        {toolsExpanded && (
          <div className="px-2 pb-2 grid grid-cols-2 gap-1">
            {blockTools.map((tool) => (
              <Button
                key={tool.type}
                variant="ghost"
                size="sm"
                className="justify-start gap-2 h-8 text-xs"
                onClick={() => handleAddBlock(tool.type)}
              >
                {tool.icon}
                {tool.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Layers Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 border-b border-zinc-200"
          onClick={() => setLayersExpanded(!layersExpanded)}
        >
          {layersExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Layers
          <span className="ml-auto text-xs text-zinc-400">{rootBlocks.length}</span>
        </button>
        {layersExpanded && (
          <ScrollArea className="flex-1">
            <div className="p-2">
              {rootBlocks.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-4">
                  No blocks yet. Add one from Tools above.
                </p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={rootBlocks.map((b) => b.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {rootBlocks.map((block) => (
                        <SortableLayerItem
                          key={block.id}
                          id={block.id}
                          type={block.type}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => selectBlock(block.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
