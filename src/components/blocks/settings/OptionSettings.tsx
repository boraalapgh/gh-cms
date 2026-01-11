/**
 * OptionSettings Component
 *
 * Settings panel for option blocks.
 * Used in quiz questions and daily dilemma activities.
 */

"use client";

import { Block, OptionBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface OptionSettingsProps {
  block: Block;
}

export function OptionSettings({ block }: OptionSettingsProps) {
  const { updateBlock, activityType } = useEditorStore();
  const content = block.content as unknown as OptionBlockContent;

  // Determine context - quiz uses isCorrect, daily_dilemma uses isBestAnswer
  const isQuizContext = activityType === "quiz";

  const handleChange = (field: keyof OptionBlockContent, value: string | boolean) => {
    updateBlock(block.id, {
      content: { ...content, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      {/* Option Label */}
      <div className="space-y-2">
        <Label htmlFor="option-label">Option Text</Label>
        <Input
          id="option-label"
          value={content.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Enter option text..."
        />
      </div>

      {/* Correct / Best Answer Toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="option-correct" className="cursor-pointer">
          {isQuizContext ? "Correct Answer" : "Best Answer"}
        </Label>
        <Switch
          id="option-correct"
          checked={isQuizContext ? content.isCorrect || false : content.isBestAnswer || false}
          onCheckedChange={(checked) =>
            handleChange(isQuizContext ? "isCorrect" : "isBestAnswer", checked)
          }
        />
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="option-feedback">
          Feedback <span className="text-zinc-400">(shown after selection)</span>
        </Label>
        <Textarea
          id="option-feedback"
          value={content.feedback || ""}
          onChange={(e) => handleChange("feedback", e.target.value)}
          placeholder="Explain why this answer is correct or incorrect..."
          rows={3}
        />
      </div>
    </div>
  );
}
