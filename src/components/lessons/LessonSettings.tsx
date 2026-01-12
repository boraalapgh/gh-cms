/**
 * LessonSettings Component
 *
 * Global settings panel for Lesson entity type.
 * Controls learning objectives, prerequisites, and displays activity list.
 */

"use client";

import { useMemo, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { LessonConfig, SkillsetTag } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillsetPicker } from "../skillsets";
import { buildTagFromSkillset } from "@/lib/skillsets";
import {
  Plus,
  X,
  GripVertical,
  Clock,
  Target,
  BookOpen,
  Play,
  HelpCircle,
  Columns,
  CheckSquare,
  FileText,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { ActivityPicker } from "./ActivityPicker";
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

// Activity type icons
const activityTypeIcons: Record<string, React.ReactNode> = {
  video: <Play className="h-4 w-4" />,
  quiz: <CheckSquare className="h-4 w-4" />,
  quick_dive: <BookOpen className="h-4 w-4" />,
  daily_dilemma: <HelpCircle className="h-4 w-4" />,
  in_practice: <Columns className="h-4 w-4" />,
};

// Sortable activity item component
function SortableActivityItem({
  activity,
  onRemove,
  onEdit,
}: {
  activity: { id: string; title: string; type: string; duration?: number };
  onRemove: () => void;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: activity.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 group"
    >
      <div {...attributes} {...listeners} className="cursor-grab text-zinc-400 hover:text-zinc-600">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
        {activityTypeIcons[activity.type] || <FileText className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{activity.title}</p>
        <p className="text-xs text-zinc-500 capitalize">{activity.type.replace("_", " ")}</p>
      </div>
      {activity.duration && (
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <Clock className="h-3 w-3" />
          {activity.duration}m
        </div>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function LessonSettings() {
  const {
    lessonConfig,
    setLessonConfig,
    lessonActivities,
    removeLessonActivity,
    reorderLessonActivities,
    skillsetId,
    setSkillsetId,
  } = useEditorStore();
  const config = lessonConfig as LessonConfig | null;

  const [newObjective, setNewObjective] = useState("");
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [showActivityPicker, setShowActivityPicker] = useState(false);

  // Build tag from stored skillsetId
  const currentSkillsetTag = skillsetId ? buildTagFromSkillset(skillsetId) : undefined;

  const handleSkillsetChange = (tag: SkillsetTag | undefined) => {
    setSkillsetId(tag?.skillsetId ?? null);
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalDuration = lessonActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
    return {
      activitiesCount: lessonActivities.length,
      totalDuration,
    };
  }, [lessonActivities]);

  if (!config || config.type !== "lesson") {
    return (
      <div className="text-sm text-zinc-500">No lesson configuration found.</div>
    );
  }

  const handleAddObjective = () => {
    if (!newObjective.trim()) return;
    setLessonConfig({
      learningObjectives: [...(config.learningObjectives || []), newObjective.trim()],
    });
    setNewObjective("");
  };

  const handleRemoveObjective = (index: number) => {
    const objectives = [...(config.learningObjectives || [])];
    objectives.splice(index, 1);
    setLessonConfig({ learningObjectives: objectives });
  };

  const handleAddPrerequisite = () => {
    if (!newPrerequisite.trim()) return;
    setLessonConfig({
      prerequisites: [...(config.prerequisites || []), newPrerequisite.trim()],
    });
    setNewPrerequisite("");
  };

  const handleRemovePrerequisite = (index: number) => {
    const prerequisites = [...(config.prerequisites || [])];
    prerequisites.splice(index, 1);
    setLessonConfig({ prerequisites: prerequisites });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sortedActivities = [...lessonActivities].sort((a, b) => a.order - b.order);
    const oldIndex = sortedActivities.findIndex((a) => a.id === active.id);
    const newIndex = sortedActivities.findIndex((a) => a.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderLessonActivities(oldIndex, newIndex);
    }
  };

  const handleEditActivity = (activityId: string) => {
    // Navigate to activity editor (will be implemented with nested navigation)
    window.open(`/editor/activity/${activityId}`, "_blank");
  };

  const sortedActivities = [...lessonActivities].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-zinc-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Lesson Overview</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-200">
            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-900">{stats.activitiesCount}</p>
              <p className="text-xs text-zinc-500">Activities</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-200">
            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-lg font-medium text-zinc-900">
                {stats.totalDuration || "—"}
              </p>
              <p className="text-xs text-zinc-500">Est. Minutes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Activities</Label>
          <Button variant="outline" size="sm" onClick={() => setShowActivityPicker(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Activity
          </Button>
        </div>

        {sortedActivities.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedActivities.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedActivities.map((activity) => (
                  <SortableActivityItem
                    key={activity.id}
                    activity={activity}
                    onRemove={() => removeLessonActivity(activity.id)}
                    onEdit={() => handleEditActivity(activity.entityId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
            <BookOpen className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">No activities added yet</p>
            <p className="text-xs text-zinc-400 mt-1">
              Click "Add Activity" to select from existing activities
            </p>
          </div>
        )}
      </div>

      {/* Learning Objectives */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-zinc-500" />
          <Label>Learning Objectives</Label>
        </div>
        <div className="flex gap-2">
          <Input
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            placeholder="Add a learning objective..."
            onKeyDown={(e) => e.key === "Enter" && handleAddObjective()}
          />
          <Button variant="outline" size="icon" onClick={handleAddObjective}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {config.learningObjectives && config.learningObjectives.length > 0 && (
          <div className="space-y-2">
            {config.learningObjectives.map((objective, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-zinc-50 rounded-lg group"
              >
                <span className="text-sm text-zinc-600 flex-1">{objective}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={() => handleRemoveObjective(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Prerequisites */}
      <div className="space-y-3">
        <Label>Prerequisites (Optional)</Label>
        <div className="flex gap-2">
          <Input
            value={newPrerequisite}
            onChange={(e) => setNewPrerequisite(e.target.value)}
            placeholder="Add a prerequisite..."
            onKeyDown={(e) => e.key === "Enter" && handleAddPrerequisite()}
          />
          <Button variant="outline" size="icon" onClick={handleAddPrerequisite}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {config.prerequisites && config.prerequisites.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {config.prerequisites.map((prereq, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {prereq}
                <button
                  onClick={() => handleRemovePrerequisite(index)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Skillset Tagging */}
      <div className="space-y-3">
        <SkillsetPicker
          context="lesson"
          value={currentSkillsetTag}
          onChange={handleSkillsetChange}
          label="Skillset Category"
        />
      </div>

      {/* Intro/Outro Guidance */}
      <div className="p-4 bg-muted rounded-lg border">
        <h4 className="text-sm font-medium mb-2">Intro & Outro Content</h4>
        <p className="text-xs text-muted-foreground">
          Use the block canvas to add intro content at the beginning and outro content at
          the end of your lesson. The activities will appear between them in the learner view.
        </p>
      </div>

      {/* Activity Picker Modal */}
      <ActivityPicker open={showActivityPicker} onOpenChange={setShowActivityPicker} />
    </div>
  );
}
