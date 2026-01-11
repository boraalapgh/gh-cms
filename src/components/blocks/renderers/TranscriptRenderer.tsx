/**
 * TranscriptRenderer Component
 *
 * Renders transcript blocks with optional collapsible functionality.
 * Supports manual text or timestamped AI-generated transcripts.
 */

"use client";

import { useState } from "react";
import { Block, TranscriptBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";

interface TranscriptRendererProps {
  block: Block;
}

export function TranscriptRenderer({ block }: TranscriptRendererProps) {
  const { selectedBlockId, updateBlock } = useEditorStore();
  const content = block.content as unknown as TranscriptBlockContent;
  const isEditing = selectedBlockId === block.id;
  const [isExpanded, setIsExpanded] = useState(content.defaultExpanded !== false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, {
      content: { ...content, text: e.target.value },
    });
  };

  // Collapsible wrapper
  if (content.isCollapsible) {
    return (
      <div className="border border-zinc-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-2 px-4 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors text-left"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-zinc-500" />
          )}
          <FileText className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">Transcript</span>
          {content.source === "ai_generated" && (
            <span className="ml-auto text-xs text-zinc-400 bg-zinc-200 px-2 py-0.5 rounded">
              AI Generated
            </span>
          )}
        </button>
        {isExpanded && (
          <div className="p-4 border-t border-zinc-200">
            <TranscriptContent
              content={content}
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 border border-zinc-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700">Transcript</span>
        {content.source === "ai_generated" && (
          <span className="ml-auto text-xs text-zinc-400 bg-zinc-200 px-2 py-0.5 rounded">
            AI Generated
          </span>
        )}
      </div>
      <TranscriptContent
        content={content}
        isEditing={isEditing}
        onChange={handleChange}
      />
    </div>
  );
}

// Inner content component
function TranscriptContent({
  content,
  isEditing,
  onChange,
}: {
  content: TranscriptBlockContent;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  if (isEditing) {
    return (
      <Textarea
        value={content.text || ""}
        onChange={onChange}
        placeholder="Enter transcript text..."
        rows={8}
        className="font-mono text-sm"
        autoFocus
      />
    );
  }

  // If we have timestamps, render with time markers
  if (content.timestamps && content.timestamps.length > 0) {
    return (
      <div className="space-y-2">
        {content.timestamps.map((segment, idx) => (
          <div key={idx} className="flex gap-3 text-sm">
            <span className="text-zinc-400 font-mono shrink-0">
              {formatTime(segment.start)}
            </span>
            <span className="text-zinc-700">{segment.text}</span>
          </div>
        ))}
      </div>
    );
  }

  // Plain text transcript
  return (
    <div className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
      {content.text || (
        <span className="text-zinc-400 italic">No transcript available</span>
      )}
    </div>
  );
}

// Helper to format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
