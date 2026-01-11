/**
 * LessonPicker Component
 *
 * Modal dialog for selecting existing lessons to add to a course module.
 * Supports search and displays lesson info.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Search, GraduationCap, Clock, Loader2, Plus } from "lucide-react";

// Lesson from API
interface Lesson {
  id: string;
  entityId: string;
  title: string;
  status: string;
  activitiesCount?: number;
  duration?: number;
  createdAt: string;
}

interface LessonPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (lessonId: string) => void;
  excludeLessonIds?: string[];
}

export function LessonPicker({ open, onOpenChange, onSelect, excludeLessonIds = [] }: LessonPickerProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch lessons from API
  useEffect(() => {
    if (!open) return;

    const fetchLessons = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/entities?type=lesson");
        if (response.ok) {
          const data = await response.json();
          setLessons(data.entities || []);
        }
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessons();
  }, [open]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    let filtered = lessons;

    // Exclude already added lessons
    const excludeSet = new Set(excludeLessonIds);
    filtered = filtered.filter((l) => !excludeSet.has(l.entityId));

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((l) => l.title.toLowerCase().includes(query));
    }

    return filtered;
  }, [lessons, excludeLessonIds, searchQuery]);

  const handleSelect = (lesson: Lesson) => {
    onSelect(lesson.entityId);
    onOpenChange(false);
  };

  const handleCreateNew = () => {
    window.open("/editor/lesson/new", "_blank");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Lesson to Module</DialogTitle>
          <DialogDescription>
            Select an existing lesson to add to this module.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Lessons List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
              <p className="text-sm text-zinc-500">No lessons found</p>
              <p className="text-xs text-zinc-400 mt-1">
                Try adjusting your search or create a new lesson
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-1" />
                Create New Lesson
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredLessons.map((lesson) => (
                <button
                  key={lesson.entityId}
                  onClick={() => handleSelect(lesson)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 flex-shrink-0">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 truncate">{lesson.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">
                        {lesson.status}
                      </Badge>
                      {lesson.activitiesCount !== undefined && (
                        <span className="text-xs text-zinc-400">
                          {lesson.activitiesCount} activities
                        </span>
                      )}
                    </div>
                  </div>
                  {lesson.duration && (
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}m
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Create New Button */}
        <div className="pt-4 border-t border-zinc-200">
          <Button variant="outline" className="w-full" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Lesson
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
