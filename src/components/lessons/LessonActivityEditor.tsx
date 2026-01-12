/**
 * LessonActivityEditor Component
 *
 * Inline activity editor panel for lessons.
 * Displays activity details and provides quick editing options.
 * Shown when an activity is selected in the lesson editor.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditorStore } from "@/stores/editor-store";
import { activityTypeInfo, ActivityType } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  CheckSquare,
  BookOpen,
  HelpCircle,
  Columns,
  X,
  ExternalLink,
  Trash2,
  Loader2,
  Save,
  GripVertical,
  Mic,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Activity type icons mapping
const ACTIVITY_TYPE_ICONS: Record<ActivityType, React.ReactNode> = {
  video: <Play className="h-5 w-5" />,
  quiz: <CheckSquare className="h-5 w-5" />,
  quick_dive: <BookOpen className="h-5 w-5" />,
  daily_dilemma: <HelpCircle className="h-5 w-5" />,
  in_practice: <Columns className="h-5 w-5" />,
  podcast: <Mic className="h-5 w-5" />,
};

interface ActivityDetails {
  id: string;
  title: string;
  type: ActivityType;
  status: string;
  description?: string;
}

export function LessonActivityEditor() {
  const router = useRouter();
  const {
    selectedActivityId,
    setSelectedActivityId,
    lessonActivities,
    removeLessonActivity,
  } = useEditorStore();

  const [activity, setActivity] = useState<ActivityDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get the activity reference from the lesson
  const activityRef = lessonActivities.find((a) => a.id === selectedActivityId);

  // Load activity details when selected
  useEffect(() => {
    if (!activityRef?.entityId) {
      setActivity(null);
      return;
    }

    const loadActivity = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/entities/${activityRef.entityId}`);
        if (response.ok) {
          const { data } = await response.json();
          setActivity({
            id: data.id,
            title: data.title,
            type: data.settings?.activityType || "video",
            status: data.status,
            description: data.description,
          });
          setTitle(data.title);
          setDescription(data.description || "");
        }
      } catch (error) {
        console.error("Failed to load activity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [activityRef?.entityId]);

  // Handle title/description save
  const handleSave = async () => {
    if (!activityRef?.entityId) return;

    setIsSaving(true);
    try {
      await fetch(`/api/entities/${activityRef.entityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      // Update local activity state
      setActivity((prev) => (prev ? { ...prev, title, description } : null));
    } catch (error) {
      console.error("Failed to save activity:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle remove from lesson
  const handleRemove = () => {
    if (selectedActivityId) {
      removeLessonActivity(selectedActivityId);
      setSelectedActivityId(null);
    }
    setShowDeleteDialog(false);
  };

  // Handle open in editor
  const handleOpenInEditor = () => {
    if (activityRef?.entityId) {
      router.push(`/editor/activity/${activityRef.entityId}`);
    }
  };

  // Close panel
  const handleClose = () => {
    setSelectedActivityId(null);
  };

  if (!selectedActivityId || !activityRef) {
    return null;
  }

  return (
    <>
      <div className="bg-white border-l border-zinc-200 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
              {ACTIVITY_TYPE_ICONS[activityRef.type as ActivityType] || (
                <BookOpen className="h-4 w-4" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-sm">Edit Activity</h3>
              <Badge variant="secondary" className="text-xs capitalize mt-0.5">
                {activityRef.type?.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="activity-title">Title</Label>
                <Input
                  id="activity-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Activity title..."
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="activity-description">Description</Label>
                <Input
                  id="activity-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description..."
                />
              </div>

              {/* Save button */}
              {(title !== activity?.title || description !== (activity?.description || "")) && (
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                  size="sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              )}

              {/* Status */}
              {activity?.status && (
                <div className="flex items-center justify-between py-2 px-3 bg-zinc-50 rounded-lg">
                  <span className="text-sm text-zinc-600">Status</span>
                  <Badge
                    variant={activity.status === "published" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {activity.status}
                  </Badge>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-zinc-200 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleOpenInEditor}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Edit Content
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove from Lesson
                </Button>
              </div>

              {/* Order hint */}
              <div className="pt-4 border-t border-zinc-200">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <GripVertical className="h-4 w-4" />
                  <span>
                    Drag activities in the left panel to reorder them
                  </span>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove activity from lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the activity from this lesson. The activity itself will not be
              deleted and can be added back later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
