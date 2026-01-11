/**
 * OptionRenderer Component
 *
 * Renders option blocks for quiz questions or daily dilemma.
 * Shows correct/best answer indicators in edit mode.
 */

"use client";

import { Block, OptionBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Input } from "@/components/ui/input";
import { Check, Circle } from "lucide-react";

interface OptionRendererProps {
  block: Block;
}

export function OptionRenderer({ block }: OptionRendererProps) {
  const { selectedBlockId, updateBlock } = useEditorStore();
  const content = block.content as unknown as OptionBlockContent;
  const isEditing = selectedBlockId === block.id;

  const isCorrectOrBest = content.isCorrect || content.isBestAnswer;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(block.id, {
      content: { ...content, label: e.target.value },
    });
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
        isCorrectOrBest
          ? "border-green-200 bg-green-50"
          : "border-zinc-200 bg-white hover:border-zinc-300"
      }`}
    >
      {/* Radio/Checkbox indicator */}
      <div
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          isCorrectOrBest
            ? "border-green-500 bg-green-500"
            : "border-zinc-300"
        }`}
      >
        {isCorrectOrBest && <Check className="h-3 w-3 text-white" />}
      </div>

      {/* Option content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={content.label || ""}
            onChange={handleChange}
            placeholder="Option text..."
            className="h-8"
            autoFocus
          />
        ) : (
          <span className="text-sm text-zinc-900 leading-relaxed">
            {content.label || (
              <span className="text-zinc-400 italic">Option text...</span>
            )}
          </span>
        )}

        {/* Feedback preview */}
        {content.feedback && !isEditing && (
          <p className="text-xs text-zinc-500 mt-1">{content.feedback}</p>
        )}
      </div>

      {/* Correct/Best indicator badge */}
      {isCorrectOrBest && (
        <span className="flex-shrink-0 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded">
          {content.isCorrect ? "Correct" : "Best"}
        </span>
      )}
    </div>
  );
}
