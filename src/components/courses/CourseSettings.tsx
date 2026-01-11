/**
 * CourseSettings Component
 *
 * Global settings panel for Course entity type.
 * Controls modules, lesson assignment, placement tests, and completion criteria.
 */

"use client";

import { useMemo, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { CourseConfig, CourseModule } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Library,
  Clock,
  BookOpen,
  Award,
  FileQuestion,
  Layers,
} from "lucide-react";
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LessonPicker } from "./LessonPicker";

// Sortable module card
function SortableModuleCard({
  module,
  onUpdate,
  onRemove,
  onAddLesson,
  onRemoveLesson,
}: {
  module: CourseModule;
  onUpdate: (updates: Partial<CourseModule>) => void;
  onRemove: () => void;
  onAddLesson: () => void;
  onRemoveLesson: (lessonId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.id,
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
      className="border border-zinc-200 rounded-lg bg-white"
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="flex items-center gap-2 p-3 border-b border-zinc-100">
          <div {...attributes} {...listeners} className="cursor-grab text-zinc-400 hover:text-zinc-600">
            <GripVertical className="h-4 w-4" />
          </div>
          <CollapsibleTrigger className="flex items-center gap-2 flex-1">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-zinc-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-zinc-400" />
            )}
            <span className="font-medium text-sm text-zinc-900">{module.title || "Untitled Module"}</span>
            <Badge variant="secondary" className="ml-auto">
              {module.lessonIds.length} lesson{module.lessonIds.length !== 1 ? "s" : ""}
            </Badge>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        <CollapsibleContent>
          <div className="p-4 space-y-4">
            {/* Module Title */}
            <div className="space-y-2">
              <Label htmlFor={`module-title-${module.id}`}>Title</Label>
              <Input
                id={`module-title-${module.id}`}
                value={module.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Module title..."
              />
            </div>

            {/* Module Description */}
            <div className="space-y-2">
              <Label htmlFor={`module-desc-${module.id}`}>Description</Label>
              <Textarea
                id={`module-desc-${module.id}`}
                value={module.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Brief description of this module..."
                rows={2}
              />
            </div>

            {/* Is Required Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor={`module-required-${module.id}`} className="cursor-pointer">
                Required Module
              </Label>
              <Switch
                id={`module-required-${module.id}`}
                checked={module.isRequired}
                onCheckedChange={(checked) => onUpdate({ isRequired: checked })}
              />
            </div>

            {/* Skip Threshold */}
            <div className="space-y-2">
              <Label htmlFor={`module-skip-${module.id}`}>Skip Threshold (%)</Label>
              <Input
                id={`module-skip-${module.id}`}
                type="number"
                min={0}
                max={100}
                value={module.skipThreshold || ""}
                onChange={(e) =>
                  onUpdate({ skipThreshold: e.target.value ? parseInt(e.target.value) : undefined })
                }
                placeholder="Score % to skip this module"
              />
              <p className="text-xs text-zinc-400">
                If learner scores above this on placement test, they can skip this module
              </p>
            </div>

            {/* Lessons in Module */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Lessons</Label>
                <Button variant="outline" size="sm" onClick={onAddLesson}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add Lesson
                </Button>
              </div>
              {module.lessonIds.length > 0 ? (
                <div className="space-y-1">
                  {module.lessonIds.map((lessonId, index) => (
                    <div
                      key={lessonId}
                      className="flex items-center gap-2 p-2 bg-zinc-50 rounded text-sm group"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="flex-1 truncate">Lesson {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        onClick={() => onRemoveLesson(lessonId)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 text-center py-3 bg-zinc-50 rounded">
                  No lessons added to this module
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function CourseSettings() {
  const {
    courseConfig,
    setCourseConfig,
    courseModules,
    addCourseModule,
    updateCourseModule,
    removeCourseModule,
    reorderCourseModules,
    addLessonToModule,
    removeLessonFromModule,
  } = useEditorStore();
  const config = courseConfig as CourseConfig | null;

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showLessonPicker, setShowLessonPicker] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Calculate stats
  const stats = useMemo(() => {
    const totalLessons = courseModules.reduce((sum, m) => sum + m.lessonIds.length, 0);
    const requiredModules = courseModules.filter((m) => m.isRequired).length;
    return {
      modulesCount: courseModules.length,
      lessonsCount: totalLessons,
      requiredModules,
    };
  }, [courseModules]);

  if (!config || config.type !== "course") {
    return (
      <div className="text-sm text-zinc-500">No course configuration found.</div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sortedModules = [...courseModules].sort((a, b) => a.order - b.order);
    const oldIndex = sortedModules.findIndex((m) => m.id === active.id);
    const newIndex = sortedModules.findIndex((m) => m.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderCourseModules(oldIndex, newIndex);
    }
  };

  const handleAddLessonToModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setShowLessonPicker(true);
  };

  const handleLessonSelected = (lessonId: string) => {
    if (selectedModuleId) {
      addLessonToModule(selectedModuleId, lessonId);
    }
    setShowLessonPicker(false);
    setSelectedModuleId(null);
  };

  const sortedModules = [...courseModules].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-zinc-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Course Overview</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-zinc-200">
            <Layers className="h-4 w-4 text-zinc-500 mb-1" />
            <p className="text-lg font-medium text-zinc-900">{stats.modulesCount}</p>
            <p className="text-xs text-zinc-500">Modules</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-zinc-200">
            <BookOpen className="h-4 w-4 text-zinc-500 mb-1" />
            <p className="text-lg font-medium text-zinc-900">{stats.lessonsCount}</p>
            <p className="text-xs text-zinc-500">Lessons</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-zinc-200">
            <Award className="h-4 w-4 text-zinc-500 mb-1" />
            <p className="text-lg font-medium text-zinc-900">{stats.requiredModules}</p>
            <p className="text-xs text-zinc-500">Required</p>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Modules</Label>
          <Button variant="outline" size="sm" onClick={() => addCourseModule()}>
            <Plus className="h-4 w-4 mr-1" />
            Add Module
          </Button>
        </div>

        {sortedModules.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedModules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedModules.map((module) => (
                  <SortableModuleCard
                    key={module.id}
                    module={module}
                    onUpdate={(updates) => updateCourseModule(module.id, updates)}
                    onRemove={() => removeCourseModule(module.id)}
                    onAddLesson={() => handleAddLessonToModule(module.id)}
                    onRemoveLesson={(lessonId) => removeLessonFromModule(module.id, lessonId)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
            <Layers className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">No modules created yet</p>
            <p className="text-xs text-zinc-400 mt-1">
              Click "Add Module" to start organizing your course
            </p>
          </div>
        )}
      </div>

      {/* Course Settings */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <h4 className="text-sm font-medium text-zinc-900">Course Settings</h4>

        {/* Is Ordered */}
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="is-ordered" className="cursor-pointer">
              Sequential Order
            </Label>
            <p className="text-xs text-zinc-400">Learners must complete modules in order</p>
          </div>
          <Switch
            id="is-ordered"
            checked={config.isOrdered}
            onCheckedChange={(checked) => setCourseConfig({ isOrdered: checked })}
          />
        </div>

        {/* Completion Criteria */}
        <div className="space-y-2">
          <Label htmlFor="completion-criteria">Completion Criteria</Label>
          <Select
            value={config.completionCriteria}
            onValueChange={(value: "all_modules" | "required_modules" | "percentage") =>
              setCourseConfig({ completionCriteria: value })
            }
          >
            <SelectTrigger id="completion-criteria">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_modules">Complete All Modules</SelectItem>
              <SelectItem value="required_modules">Complete Required Modules Only</SelectItem>
              <SelectItem value="percentage">Complete Percentage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.completionCriteria === "percentage" && (
          <div className="space-y-2">
            <Label htmlFor="completion-percentage">Required Percentage (%)</Label>
            <Input
              id="completion-percentage"
              type="number"
              min={0}
              max={100}
              value={config.completionPercentage || ""}
              onChange={(e) =>
                setCourseConfig({
                  completionPercentage: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Percentage of course to complete"
            />
          </div>
        )}
      </div>

      {/* Placement Test Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-zinc-500" />
            <div>
              <Label htmlFor="placement-test" className="cursor-pointer">
                Placement Test
              </Label>
              <p className="text-xs text-zinc-400">Allow learners to skip modules based on assessment</p>
            </div>
          </div>
          <Switch
            id="placement-test"
            checked={config.placementTestEnabled}
            onCheckedChange={(checked) =>
              setCourseConfig({
                placementTestEnabled: checked,
                placementTestId: checked ? config.placementTestId : undefined,
              })
            }
          />
        </div>

        {config.placementTestEnabled && (
          <div className="p-3 bg-zinc-50 rounded-lg">
            <p className="text-xs text-zinc-500">
              Configure skip thresholds on each module to define what score allows learners
              to skip that module. Assessment selection coming soon.
            </p>
          </div>
        )}
      </div>

      {/* Certificate Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-zinc-500" />
            <div>
              <Label htmlFor="certificate" className="cursor-pointer">
                Certificate
              </Label>
              <p className="text-xs text-zinc-400">Award certificate on completion</p>
            </div>
          </div>
          <Switch
            id="certificate"
            checked={config.certificateEnabled}
            onCheckedChange={(checked) =>
              setCourseConfig({
                certificateEnabled: checked,
                certificateTemplateId: checked ? config.certificateTemplateId : undefined,
              })
            }
          />
        </div>

        {config.certificateEnabled && (
          <div className="p-3 bg-zinc-50 rounded-lg">
            <p className="text-xs text-zinc-500">
              Certificate template selection will be available in the Assessments phase.
            </p>
          </div>
        )}
      </div>

      {/* Lesson Picker Modal */}
      <LessonPicker
        open={showLessonPicker}
        onOpenChange={setShowLessonPicker}
        onSelect={handleLessonSelected}
        excludeLessonIds={selectedModuleId ? courseModules.find((m) => m.id === selectedModuleId)?.lessonIds || [] : []}
      />
    </div>
  );
}
