/**
 * QuizQuestionRenderer Component
 *
 * Renders quiz question blocks with inline editing support.
 * Displays question text, optional image, and points value.
 */

"use client";

import { useMemo } from "react";
import { Block, QuizQuestionBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";

interface QuizQuestionRendererProps {
  block: Block;
}

export function QuizQuestionRenderer({ block }: QuizQuestionRendererProps) {
  const { selectedBlockId, updateBlock, blocks } = useEditorStore();
  const content = block.content as unknown as QuizQuestionBlockContent;
  const isEditing = selectedBlockId === block.id;

  // Memoize child option blocks to prevent infinite re-renders
  const options = useMemo(
    () => blocks.filter((b) => b.parentId === block.id).sort((a, b) => a.order - b.order),
    [blocks, block.id]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, {
      content: { ...content, question: e.target.value },
    });
  };

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      {/* Question Header */}
      <div className="bg-zinc-50 px-4 py-2 flex items-center justify-between border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">Question</span>
        </div>
        {content.points !== undefined && (
          <span className="text-xs text-zinc-500 bg-white px-2 py-0.5 rounded border border-zinc-200">
            {content.points} {content.points === 1 ? "point" : "points"}
          </span>
        )}
      </div>

      {/* Question Content */}
      <div className="p-4 space-y-4">
        {/* Question Image */}
        {content.questionImage && (
          <div className="rounded-lg overflow-hidden border border-zinc-200">
            <img
              src={content.questionImage}
              alt="Question illustration"
              className="w-full max-h-48 object-contain bg-zinc-50"
            />
          </div>
        )}

        {/* Question Text */}
        {isEditing ? (
          <Textarea
            value={content.question || ""}
            onChange={handleChange}
            placeholder="Enter your question..."
            rows={3}
            className="text-base"
            autoFocus
          />
        ) : (
          <p className="text-base text-zinc-900">
            {content.question || (
              <span className="text-zinc-400 italic">Enter your question...</span>
            )}
          </p>
        )}

        {/* Options (rendered separately via children) */}
        {options.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Options</p>
            <div className="text-sm text-zinc-500 italic">
              {options.length} option{options.length !== 1 ? "s" : ""} configured
            </div>
          </div>
        )}

        {/* Explanation Preview */}
        {content.explanation && !isEditing && (
          <div className="pt-3 border-t border-zinc-100">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Explanation</p>
            <p className="text-sm text-zinc-600">{content.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
