/**
 * QuickDiveActivitySettings Component
 *
 * Global settings panel for Quick Dive activity type.
 * Auto-calculates reading time and provides content organization options.
 */

"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { QuickDiveConfig, TextBlockContent, HeadingBlockContent } from "@/types";
import { Label } from "@/components/ui/label";
import { BookOpen, Clock, FileText } from "lucide-react";

export function QuickDiveActivitySettings() {
  const { activityConfig, blocks } = useEditorStore();
  const config = activityConfig as QuickDiveConfig | null;

  // Calculate reading time based on text content
  const stats = useMemo(() => {
    let totalWords = 0;
    let headings = 0;
    let images = 0;
    let videos = 0;

    blocks.forEach((block) => {
      if (block.type === "text") {
        const content = block.content as unknown as TextBlockContent;
        const text = content.text || "";
        totalWords += text.split(/\s+/).filter((word) => word.length > 0).length;
      } else if (block.type === "heading") {
        const content = block.content as unknown as HeadingBlockContent;
        const text = content.text || "";
        totalWords += text.split(/\s+/).filter((word) => word.length > 0).length;
        headings++;
      } else if (block.type === "image") {
        images++;
      } else if (block.type === "video") {
        videos++;
      } else if (block.type === "callout") {
        const content = block.content as { text?: string };
        const text = content.text || "";
        totalWords += text.split(/\s+/).filter((word) => word.length > 0).length;
      } else if (block.type === "list") {
        const content = block.content as { items?: string[] };
        (content.items || []).forEach((item) => {
          totalWords += item.split(/\s+/).filter((word) => word.length > 0).length;
        });
      }
    });

    // Average reading speed: 200-250 words per minute
    // Add 12 seconds per image for comprehension
    const readingTimeMinutes = totalWords / 225;
    const imageTime = (images * 12) / 60;
    const totalMinutes = Math.max(1, Math.ceil(readingTimeMinutes + imageTime));

    return {
      words: totalWords,
      headings,
      images,
      videos,
      readingTime: totalMinutes,
    };
  }, [blocks]);

  if (!config || config.type !== "quick_dive") {
    return (
      <div className="text-sm text-zinc-500">
        No Quick Dive activity configuration found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Stats */}
      <div className="bg-zinc-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Content Overview</h4>

        {/* Reading Time */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-zinc-200">
          <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-zinc-600" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-zinc-900">
              {stats.readingTime} min
            </p>
            <p className="text-xs text-zinc-500">Estimated reading time</p>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<FileText className="h-4 w-4" />}
            label="Words"
            value={stats.words.toLocaleString()}
          />
          <StatCard
            icon={<BookOpen className="h-4 w-4" />}
            label="Sections"
            value={stats.headings}
          />
        </div>

        {/* Media Count */}
        {(stats.images > 0 || stats.videos > 0) && (
          <div className="mt-3 pt-3 border-t border-zinc-200">
            <p className="text-xs text-zinc-500">
              Media: {stats.images} image{stats.images !== 1 ? "s" : ""}
              {stats.videos > 0 && `, ${stats.videos} video${stats.videos !== 1 ? "s" : ""}`}
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-900">Quick Dive Best Practices</h4>
        <ul className="space-y-2 text-xs text-zinc-600">
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Keep content focused on a single topic
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Use headings to break up content into scannable sections
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Add callouts to highlight key points
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Aim for 3-5 minute reading time for microlearning
          </li>
        </ul>
      </div>

      {/* Blocks Summary */}
      <div className="space-y-2">
        <Label>Content Blocks</Label>
        <p className="text-sm text-zinc-500">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""} in this Quick Dive
        </p>
      </div>
    </div>
  );
}

// Stat card helper component
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded border border-zinc-200">
      <div className="text-zinc-400">{icon}</div>
      <div>
        <p className="text-sm font-medium text-zinc-900">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}
