/**
 * LayerTree Component
 *
 * Hierarchical tree view for the Layers panel with nested drag-and-drop.
 * Supports all container block types: Card Group, Card, Section, Slide Deck, etc.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { Block, BlockType } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
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

// Block type icons
const BLOCK_ICONS: Record<BlockType, React.ReactNode> = {
  text: <Type className="h-3.5 w-3.5" />,
  heading: <Heading className="h-3.5 w-3.5" />,
  image: <Image className="h-3.5 w-3.5" />,
  video: <Video className="h-3.5 w-3.5" />,
  card: <Square className="h-3.5 w-3.5" />,
  card_group: <LayoutGrid className="h-3.5 w-3.5" />,
  divider: <Minus className="h-3.5 w-3.5" />,
  two_column: <Columns className="h-3.5 w-3.5" />,
  callout: <AlertCircle className="h-3.5 w-3.5" />,
  list: <List className="h-3.5 w-3.5" />,
  transcript: <FileText className="h-3.5 w-3.5" />,
  quiz_question: <HelpCircle className="h-3.5 w-3.5" />,
  option: <CheckSquare className="h-3.5 w-3.5" />,
  section: <Layers className="h-3.5 w-3.5" />,
  slide: <SplitSquareHorizontal className="h-3.5 w-3.5" />,
  slide_deck: <LayoutGrid className="h-3.5 w-3.5" />,
};

// Block types that can contain children
const CONTAINER_TYPES: BlockType[] = [
  "card_group",
  "card",
  "section",
  "slide_deck",
  "slide",
  "two_column",
  "quiz_question",
];

interface LayerItemProps {
  block: Block;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  childCount: number;
}

function LayerItem({
  block,
  depth,
  isExpanded,
  onToggleExpand,
  childCount,
}: LayerItemProps) {
  const { selectedBlockId, selectBlock } = useEditorStore();
  const isSelected = selectedBlockId === block.id;
  const isContainer = CONTAINER_TYPES.includes(block.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: block.id,
    data: {
      type: "layer-item",
      block,
      parentId: block.parentId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectBlock(block.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(block.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-1 py-1 px-1 rounded text-xs cursor-pointer
        ${isSelected ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-700"}
        ${isOver && isContainer ? "ring-2 ring-blue-400 ring-inset" : ""}
      `}
      onClick={handleClick}
    >
      {/* Indent based on depth */}
      {depth > 0 && <div style={{ width: depth * 12 }} />}

      {/* Drag handle */}
      <button
        className="cursor-grab active:cursor-grabbing p-0.5 -ml-0.5"
        {...attributes}
        {...listeners}
      >
        <GripVertical className={`h-3 w-3 ${isSelected ? "text-zinc-400" : "text-zinc-300"}`} />
      </button>

      {/* Expand/collapse for containers */}
      {isContainer ? (
        <button
          onClick={handleToggle}
          className="p-0.5 hover:bg-zinc-200 rounded"
        >
          {isExpanded ? (
            <ChevronDown className={`h-3 w-3 ${isSelected ? "text-zinc-300" : "text-zinc-500"}`} />
          ) : (
            <ChevronRight className={`h-3 w-3 ${isSelected ? "text-zinc-300" : "text-zinc-500"}`} />
          )}
        </button>
      ) : (
        <div className="w-4" /> // Spacer for alignment
      )}

      {/* Icon */}
      <span className={isSelected ? "text-zinc-300" : "text-zinc-500"}>
        {BLOCK_ICONS[block.type] || <Square className="h-3.5 w-3.5" />}
      </span>

      {/* Label */}
      <span className="flex-1 truncate capitalize">
        {block.type.replace("_", " ")}
      </span>

      {/* Child count badge */}
      {isContainer && childCount > 0 && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            isSelected ? "bg-zinc-700 text-zinc-300" : "bg-zinc-200 text-zinc-500"
          }`}
        >
          {childCount}
        </span>
      )}
    </div>
  );
}

// Overlay item shown while dragging
function DragOverlayItem({ block }: { block: Block }) {
  return (
    <div className="flex items-center gap-1 py-1 px-2 rounded text-xs bg-white shadow-lg border border-zinc-200 text-zinc-700">
      <GripVertical className="h-3 w-3 text-zinc-300" />
      <span className="text-zinc-500">
        {BLOCK_ICONS[block.type] || <Square className="h-3.5 w-3.5" />}
      </span>
      <span className="capitalize">{block.type.replace("_", " ")}</span>
    </div>
  );
}

interface LayerTreeProps {
  blocks: Block[];
}

export function LayerTree({ blocks }: LayerTreeProps) {
  const { reorderBlocks, selectBlock, selectedBlockId } = useEditorStore();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Get children for a parent (null = root)
  const getChildren = useCallback(
    (parentId: string | null) => {
      return blocks
        .filter((b) => (parentId === null ? !b.parentId : b.parentId === parentId))
        .sort((a, b) => a.order - b.order);
    },
    [blocks]
  );

  // Build a flat list of all visible items with their depth
  const visibleItems = useMemo(() => {
    const items: { block: Block; depth: number }[] = [];

    const addItems = (parentId: string | null, depth: number) => {
      const children = getChildren(parentId);
      for (const block of children) {
        items.push({ block, depth });
        const isContainer = CONTAINER_TYPES.includes(block.type);
        const isExpanded = expandedIds.has(block.id);
        if (isContainer && isExpanded) {
          addItems(block.id, depth + 1);
        }
      }
    };

    addItems(null, 0);
    return items;
  }, [blocks, expandedIds, getChildren]);

  // Toggle expand/collapse
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Get the active block for overlay
  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeBlock = blocks.find((b) => b.id === active.id);
    const overBlock = blocks.find((b) => b.id === over.id);

    if (!activeBlock || !overBlock) return;

    // Determine the target parent and position
    const overIsContainer = CONTAINER_TYPES.includes(overBlock.type);
    const sameParent = activeBlock.parentId === overBlock.parentId;

    if (sameParent) {
      // Reorder within same parent
      const siblings = getChildren(activeBlock.parentId || null);
      const oldIndex = siblings.findIndex((b) => b.id === active.id);
      const newIndex = siblings.findIndex((b) => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = [...siblings];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        reorderBlocks(
          reordered.map((block, index) => ({
            id: block.id,
            order: index,
            parentId: block.parentId || null,
          }))
        );
      }
    } else if (overIsContainer && expandedIds.has(overBlock.id)) {
      // Move into a container (drop on expanded container)
      const targetChildren = getChildren(overBlock.id);

      // Update the dragged block's parent and order
      reorderBlocks([
        {
          id: activeBlock.id,
          order: targetChildren.length,
          parentId: overBlock.id,
        },
      ]);

      // Re-order the old siblings
      const oldSiblings = getChildren(activeBlock.parentId || null).filter(
        (b) => b.id !== activeBlock.id
      );
      if (oldSiblings.length > 0) {
        reorderBlocks(
          oldSiblings.map((block, index) => ({
            id: block.id,
            order: index,
            parentId: block.parentId || null,
          }))
        );
      }
    } else {
      // Move to different parent (same level as over block)
      const targetParentId = overBlock.parentId || null;
      const targetSiblings = getChildren(targetParentId);
      const overIndex = targetSiblings.findIndex((b) => b.id === over.id);

      // Remove from old parent and update order
      const oldSiblings = getChildren(activeBlock.parentId || null).filter(
        (b) => b.id !== activeBlock.id
      );

      // Insert at new position
      const newSiblings = [...targetSiblings.filter((b) => b.id !== activeBlock.id)];
      newSiblings.splice(overIndex, 0, activeBlock);

      // Update all affected blocks
      const updates = [
        ...newSiblings.map((block, index) => ({
          id: block.id,
          order: index,
          parentId: targetParentId,
        })),
        ...oldSiblings
          .filter((b) => !newSiblings.find((ns) => ns.id === b.id))
          .map((block, index) => ({
            id: block.id,
            order: index,
            parentId: block.parentId || null,
          })),
      ];

      reorderBlocks(updates);
    }
  };

  if (visibleItems.length === 0) {
    return (
      <p className="text-xs text-zinc-400 text-center py-4">
        No blocks yet. Add one from Tools above.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleItems.map((item) => item.block.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0.5">
          {visibleItems.map(({ block, depth }) => {
            const childCount = getChildren(block.id).length;
            return (
              <LayerItem
                key={block.id}
                block={block}
                depth={depth}
                isExpanded={expandedIds.has(block.id)}
                onToggleExpand={handleToggleExpand}
                childCount={childCount}
              />
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeBlock ? <DragOverlayItem block={activeBlock} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
