/**
 * LeftPanel Component
 *
 * Contains Tools palette (add blocks), Activities (for lessons), and Layers tree.
 * Supports hierarchical drag-and-drop reordering of blocks with nesting.
 */

"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  BlockType,
  activityBlockPalette,
  ActivityType,
  lessonBlockPalette,
  courseBlockPalette,
  assessmentBlockPalette,
  activityTypeInfo,
  defaultActivityConfigs,
  LessonActivityRef,
} from "@/types";
import { LayerTree } from "./LayerTree";
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
  FileText,
  HelpCircle,
  CheckSquare,
  Layers,
  SplitSquareHorizontal,
  Play,
  BookOpen,
  Loader2,
  Mic,
} from "lucide-react";

// Activity type icons mapping
const ACTIVITY_TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  video: <Play className="h-4 w-4" />,
  quiz: <CheckSquare className="h-4 w-4" />,
  quick_dive: <BookOpen className="h-4 w-4" />,
  daily_dilemma: <HelpCircle className="h-4 w-4" />,
  in_practice: <Columns className="h-4 w-4" />,
  podcast: <Mic className="h-4 w-4" />,
};

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

export function LeftPanel() {
  const [toolsExpanded, setToolsExpanded] = useState(true);
  const [activitiesExpanded, setActivitiesExpanded] = useState(true);
  const [layersExpanded, setLayersExpanded] = useState(true);
  const [isCreatingActivity, setIsCreatingActivity] = useState(false);

  const {
    addBlock,
    selectBlock,
    activityType,
    entityType,
    blocks,
    lessonActivities,
    addLessonActivity,
    setSelectedActivityId,
    selectedActivityId,
  } = useEditorStore();

  // Get block tools based on entity type and activity type
  const blockTools = getBlockTools(entityType, activityType);

  const handleAddBlock = (type: BlockType) => {
    const newBlock = addBlock(type);
    selectBlock(newBlock.id);
  };

  // Create a new activity and add it to the lesson
  const handleAddActivity = async (type: ActivityType) => {
    setIsCreatingActivity(true);

    try {
      const info = activityTypeInfo[type];
      const defaultTitle = `New ${info?.label || type} Activity`;

      // Create the entity via API
      const response = await fetch("/api/entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "activity",
          title: defaultTitle,
          settings: {
            activityType: type,
            ...defaultActivityConfigs[type],
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create activity");
      }

      const { data: newEntity } = await response.json();

      // Add the activity reference to the lesson
      const ref: LessonActivityRef = {
        id: crypto.randomUUID(),
        entityId: newEntity.id,
        title: newEntity.title,
        type: type,
        order: lessonActivities.length,
      };
      addLessonActivity(ref);

      // Select the new activity for inline editing
      setSelectedActivityId(ref.id);
    } catch (error) {
      console.error("Failed to create activity:", error);
    } finally {
      setIsCreatingActivity(false);
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

      {/* Activities Section - Only for Lessons */}
      {entityType === "lesson" && (
        <div className="border-b border-zinc-200">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            onClick={() => setActivitiesExpanded(!activitiesExpanded)}
          >
            {activitiesExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Activities
            <span className="ml-auto text-xs text-zinc-400">{lessonActivities.length}</span>
          </button>
          {activitiesExpanded && (
            <div className="px-2 pb-2">
              {/* Add Activity Buttons */}
              <div className="grid grid-cols-2 gap-1 mb-2">
                {(Object.keys(activityTypeInfo) as ActivityType[]).map((type) => {
                  const info = activityTypeInfo[type];
                  return (
                    <Button
                      key={type}
                      variant="ghost"
                      size="sm"
                      className="justify-start gap-2 h-8 text-xs"
                      onClick={() => handleAddActivity(type)}
                      disabled={isCreatingActivity}
                    >
                      {ACTIVITY_TYPE_ICONS[type]}
                      {info.label}
                    </Button>
                  );
                })}
              </div>

              {isCreatingActivity && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-zinc-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Creating...
                </div>
              )}

              {/* Activity List */}
              {lessonActivities.length > 0 && (
                <div className="space-y-1 mt-2 pt-2 border-t border-zinc-100">
                  {lessonActivities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => setSelectedActivityId(activity.id)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm ${
                        selectedActivityId === activity.id
                          ? "bg-zinc-900 text-white"
                          : "hover:bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {ACTIVITY_TYPE_ICONS[activity.type as ActivityType] || <BookOpen className="h-4 w-4" />}
                      <span className="flex-1 truncate">{activity.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
          <span className="ml-auto text-xs text-zinc-400">{blocks.length}</span>
        </button>
        {layersExpanded && (
          <ScrollArea className="flex-1">
            <div className="p-2">
              <LayerTree blocks={blocks} />
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
