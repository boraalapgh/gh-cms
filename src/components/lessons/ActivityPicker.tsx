/**
 * ActivityPicker Component
 *
 * Modal dialog for selecting existing activities to add to a lesson.
 * Supports search, filter by type, and creating new activities inline.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { LessonActivityRef, activityTypeInfo } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Check,
  Play,
  HelpCircle,
  BookOpen,
  Columns,
  CheckSquare,
  Clock,
  Loader2,
} from "lucide-react";

// Activity type icons mapping
const activityTypeIcons: Record<string, React.ReactNode> = {
  video: <Play className="h-4 w-4" />,
  quiz: <CheckSquare className="h-4 w-4" />,
  quick_dive: <BookOpen className="h-4 w-4" />,
  daily_dilemma: <HelpCircle className="h-4 w-4" />,
  in_practice: <Columns className="h-4 w-4" />,
};

// Activity from API
interface Activity {
  id: string;
  entityId: string;
  title: string;
  type: string;
  status: string;
  duration?: number;
  createdAt: string;
}

interface ActivityPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ActivityPicker({ open, onOpenChange }: ActivityPickerProps) {
  const { lessonActivities, addLessonActivity } = useEditorStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  // Fetch activities from API
  useEffect(() => {
    if (!open) return;

    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/entities?type=activity");
        if (response.ok) {
          const data = await response.json();
          setActivities(data.entities || []);
        }
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [open]);

  // Filter activities
  const filteredActivities = useMemo(() => {
    let filtered = activities;

    // Exclude already added activities
    const existingIds = new Set(lessonActivities.map((a) => a.entityId));
    filtered = filtered.filter((a) => !existingIds.has(a.entityId));

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => a.title.toLowerCase().includes(query));
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((a) => a.type === selectedType);
    }

    return filtered;
  }, [activities, lessonActivities, searchQuery, selectedType]);

  // Toggle activity selection
  const toggleActivity = (activity: Activity) => {
    const newSelected = new Set(selectedActivities);
    if (newSelected.has(activity.entityId)) {
      newSelected.delete(activity.entityId);
    } else {
      newSelected.add(activity.entityId);
    }
    setSelectedActivities(newSelected);
  };

  // Add selected activities
  const handleAddSelected = () => {
    const activitiesToAdd = activities.filter((a) => selectedActivities.has(a.entityId));

    activitiesToAdd.forEach((activity) => {
      const ref: LessonActivityRef = {
        id: crypto.randomUUID(),
        entityId: activity.entityId,
        title: activity.title,
        type: activity.type,
        duration: activity.duration,
        order: lessonActivities.length,
      };
      addLessonActivity(ref);
    });

    setSelectedActivities(new Set());
    onOpenChange(false);
  };

  // Create new activity
  const handleCreateNew = (type: string) => {
    // Open activity creation in new tab (will be improved with inline creation)
    window.open(`/editor/activity/new?type=${type}`, "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Activities to Lesson</DialogTitle>
          <DialogDescription>
            Select existing activities or create new ones to add to this lesson.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="existing" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="existing">Existing Activities</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="flex-1 flex flex-col min-h-0 mt-4">
            {/* Search and Filter */}
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-zinc-200 rounded-md text-sm bg-white"
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="quiz">Quiz</option>
                <option value="quick_dive">Quick Dive</option>
                <option value="daily_dilemma">Daily Dilemma</option>
                <option value="in_practice">In Practice</option>
              </select>
            </div>

            {/* Activities List */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-500">No activities found</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Try adjusting your search or create a new activity
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredActivities.map((activity) => {
                    const isSelected = selectedActivities.has(activity.entityId);
                    return (
                      <div
                        key={activity.entityId}
                        onClick={() => toggleActivity(activity)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : "bg-white border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            isSelected ? "bg-white/20" : "bg-zinc-100"
                          }`}
                        >
                          {activityTypeIcons[activity.type] || <BookOpen className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{activity.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant={isSelected ? "outline" : "secondary"}
                              className={`text-xs capitalize ${isSelected ? "border-white/40 text-white" : ""}`}
                            >
                              {activity.type.replace("_", " ")}
                            </Badge>
                            <Badge
                              variant={isSelected ? "outline" : "secondary"}
                              className={`text-xs ${isSelected ? "border-white/40 text-white" : ""}`}
                            >
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                        {activity.duration && (
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              isSelected ? "text-white/70" : "text-zinc-400"
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            {activity.duration}m
                          </div>
                        )}
                        {isSelected && (
                          <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                            <Check className="h-4 w-4 text-zinc-900" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Add Selected Button */}
            {selectedActivities.size > 0 && (
              <div className="mt-4 pt-4 border-t border-zinc-200">
                <Button className="w-full" onClick={handleAddSelected}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add {selectedActivities.size} Activit{selectedActivities.size === 1 ? "y" : "ies"}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(activityTypeInfo) as Array<keyof typeof activityTypeInfo>).map(
                (type) => {
                  const info = activityTypeInfo[type];
                  return (
                    <button
                      key={type}
                      onClick={() => handleCreateNew(type)}
                      className="flex items-start gap-3 p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 flex-shrink-0">
                        {activityTypeIcons[type] || <BookOpen className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{info.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{info.description}</p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
            <p className="text-xs text-zinc-400 text-center mt-4">
              Creating a new activity will open in a new tab. Return here to add it to your lesson.
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
