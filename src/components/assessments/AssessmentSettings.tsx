/**
 * AssessmentSettings Component
 *
 * Global settings panel for Assessment entity type.
 * Controls sections, scoring, timing, and certificate settings.
 */

"use client";

import { useMemo, useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { AssessmentConfig, AssessmentSection } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  Target,
  Award,
  HelpCircle,
  Shuffle,
  Eye,
  Shield,
  Layers,
  Percent,
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

// Sortable section card
function SortableSectionCard({
  section,
  onUpdate,
  onRemove,
}: {
  section: AssessmentSection;
  onUpdate: (updates: Partial<AssessmentSection>) => void;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
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
            <span className="font-medium text-sm text-zinc-900">{section.title || "Untitled Section"}</span>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary">
                {section.questionIds.length} questions
              </Badge>
              <Badge variant="outline">
                {section.points} pts
              </Badge>
            </div>
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
            {/* Section Title */}
            <div className="space-y-2">
              <Label htmlFor={`section-title-${section.id}`}>Title</Label>
              <Input
                id={`section-title-${section.id}`}
                value={section.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Section title..."
              />
            </div>

            {/* Section Description */}
            <div className="space-y-2">
              <Label htmlFor={`section-desc-${section.id}`}>Description</Label>
              <Textarea
                id={`section-desc-${section.id}`}
                value={section.description || ""}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Brief description of this section..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Section Points */}
              <div className="space-y-2">
                <Label htmlFor={`section-points-${section.id}`}>Total Points</Label>
                <Input
                  id={`section-points-${section.id}`}
                  type="number"
                  min={0}
                  value={section.points}
                  onChange={(e) => onUpdate({ points: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Section Time Limit */}
              <div className="space-y-2">
                <Label htmlFor={`section-time-${section.id}`}>Time Limit (min)</Label>
                <Input
                  id={`section-time-${section.id}`}
                  type="number"
                  min={0}
                  value={section.timeLimit || ""}
                  onChange={(e) =>
                    onUpdate({ timeLimit: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Questions Info */}
            <div className="p-3 bg-zinc-50 rounded-lg">
              <p className="text-xs text-zinc-500">
                Add questions to this section using the quiz question blocks in the editor canvas.
                Questions will be automatically linked to sections.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function AssessmentSettings() {
  const {
    assessmentConfig,
    setAssessmentConfig,
    addAssessmentSection,
    updateAssessmentSection,
    removeAssessmentSection,
    reorderAssessmentSections,
    blocks,
  } = useEditorStore();
  const config = assessmentConfig as AssessmentConfig | null;

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Calculate stats
  const stats = useMemo(() => {
    const questions = blocks.filter((b) => b.type === "quiz_question");
    const totalPoints = config?.sections.reduce((sum, s) => sum + s.points, 0) || 0;
    return {
      sectionsCount: config?.sections.length || 0,
      questionsCount: questions.length,
      totalPoints,
    };
  }, [blocks, config?.sections]);

  if (!config || config.type !== "assessment") {
    return (
      <div className="text-sm text-zinc-500">No assessment configuration found.</div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);
    const oldIndex = sortedSections.findIndex((s) => s.id === active.id);
    const newIndex = sortedSections.findIndex((s) => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderAssessmentSections(oldIndex, newIndex);
    }
  };

  const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-zinc-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Assessment Overview</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-zinc-200">
            <Layers className="h-4 w-4 text-zinc-500 mb-1" />
            <p className="text-lg font-medium text-zinc-900">{stats.sectionsCount}</p>
            <p className="text-xs text-zinc-500">Sections</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-zinc-200">
            <HelpCircle className="h-4 w-4 text-zinc-500 mb-1" />
            <p className="text-lg font-medium text-zinc-900">{stats.questionsCount}</p>
            <p className="text-xs text-zinc-500">Questions</p>
          </div>
          <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-zinc-200">
            <Target className="h-4 w-4 text-zinc-500 mb-1" />
            <p className="text-lg font-medium text-zinc-900">{stats.totalPoints}</p>
            <p className="text-xs text-zinc-500">Total Points</p>
          </div>
        </div>
      </div>

      {/* Scoring Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-zinc-900">Scoring</h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="passing-score" className="flex items-center gap-1">
              <Percent className="h-3.5 w-3.5" />
              Passing Score (%)
            </Label>
            <Input
              id="passing-score"
              type="number"
              min={0}
              max={100}
              value={config.passingScore}
              onChange={(e) =>
                setAssessmentConfig({ passingScore: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attempts" className="flex items-center gap-1">
              Attempts Allowed
            </Label>
            <Input
              id="attempts"
              type="number"
              min={1}
              value={config.attemptsAllowed || ""}
              onChange={(e) =>
                setAssessmentConfig({
                  attemptsAllowed: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="Unlimited"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="time-limit" className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Total Time Limit (minutes)
          </Label>
          <Input
            id="time-limit"
            type="number"
            min={0}
            value={config.timeLimit || ""}
            onChange={(e) =>
              setAssessmentConfig({
                timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            placeholder="No time limit"
          />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Sections</Label>
          <Button variant="outline" size="sm" onClick={() => addAssessmentSection()}>
            <Plus className="h-4 w-4 mr-1" />
            Add Section
          </Button>
        </div>

        {sortedSections.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sortedSections.map((section) => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    onUpdate={(updates) => updateAssessmentSection(section.id, updates)}
                    onRemove={() => removeAssessmentSection(section.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 bg-zinc-50 rounded-lg border border-dashed border-zinc-300">
            <Layers className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">No sections created yet</p>
            <p className="text-xs text-zinc-400 mt-1">
              Add sections to organize your assessment questions
            </p>
          </div>
        )}
      </div>

      {/* Display Settings */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <h4 className="text-sm font-medium text-zinc-900">Display Options</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-zinc-400" />
              <Label htmlFor="show-correct" className="cursor-pointer">
                Show Correct Answers
              </Label>
            </div>
            <Switch
              id="show-correct"
              checked={config.showCorrectAnswers}
              onCheckedChange={(checked) => setAssessmentConfig({ showCorrectAnswers: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-zinc-400" />
              <Label htmlFor="show-section-scores" className="cursor-pointer">
                Show Section Scores
              </Label>
            </div>
            <Switch
              id="show-section-scores"
              checked={config.showSectionScores}
              onCheckedChange={(checked) => setAssessmentConfig({ showSectionScores: checked })}
            />
          </div>
        </div>
      </div>

      {/* Randomization */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <h4 className="text-sm font-medium text-zinc-900">Randomization</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-zinc-400" />
              <Label htmlFor="randomize-questions" className="cursor-pointer">
                Randomize Questions
              </Label>
            </div>
            <Switch
              id="randomize-questions"
              checked={config.randomizeQuestions}
              onCheckedChange={(checked) => setAssessmentConfig({ randomizeQuestions: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shuffle className="h-4 w-4 text-zinc-400" />
              <Label htmlFor="randomize-sections" className="cursor-pointer">
                Randomize Sections
              </Label>
            </div>
            <Switch
              id="randomize-sections"
              checked={config.randomizeSections}
              onCheckedChange={(checked) => setAssessmentConfig({ randomizeSections: checked })}
            />
          </div>
        </div>
      </div>

      {/* Certificate */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-zinc-500" />
            <div>
              <Label htmlFor="certificate-enabled" className="cursor-pointer">
                Award Certificate
              </Label>
              <p className="text-xs text-zinc-400">Issue certificate on passing</p>
            </div>
          </div>
          <Switch
            id="certificate-enabled"
            checked={config.certificateEnabled}
            onCheckedChange={(checked) =>
              setAssessmentConfig({
                certificateEnabled: checked,
                certificateTemplateId: checked ? config.certificateTemplateId : undefined,
              })
            }
          />
        </div>

        {config.certificateEnabled && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-2">Certificate Template</p>
            <p className="text-xs text-blue-600">
              Design your certificate using the Certificate Designer.
              Select a template after creating one.
            </p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => window.open("/certificates/new", "_blank")}>
              <Plus className="h-4 w-4 mr-1" />
              Create Certificate Template
            </Button>
          </div>
        )}
      </div>

      {/* Proctoring */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-zinc-500" />
            <div>
              <Label htmlFor="proctoring" className="cursor-pointer">
                Proctoring
              </Label>
              <p className="text-xs text-zinc-400">Monitor assessment attempts</p>
            </div>
          </div>
          <Switch
            id="proctoring"
            checked={config.proctoringEnabled}
            onCheckedChange={(checked) => setAssessmentConfig({ proctoringEnabled: checked })}
          />
        </div>

        {config.proctoringEnabled && (
          <div className="p-3 bg-zinc-50 rounded-lg">
            <p className="text-xs text-zinc-500">
              Proctoring features will be available in a future update.
              This setting is saved for future use.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
