/**
 * QuizQuestionSettings Component
 *
 * Settings panel for quiz question blocks.
 * Allows editing question text, image, points, and explanation.
 */

"use client";

import { useState } from "react";
import { Block, QuizQuestionBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, Loader2 } from "lucide-react";

interface QuizQuestionSettingsProps {
  block: Block;
}

export function QuizQuestionSettings({ block }: QuizQuestionSettingsProps) {
  const { updateBlock, addBlock } = useEditorStore();
  const content = block.content as unknown as QuizQuestionBlockContent;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (field: keyof QuizQuestionBlockContent, value: string | number) => {
    updateBlock(block.id, {
      content: { ...content, [field]: value },
    });
  };

  const handleAddOption = () => {
    addBlock("option", block.id);
  };

  const handleGenerateExplanation = async () => {
    if (!content.question) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a brief educational explanation (2-3 sentences) for the following quiz question: "${content.question}". The explanation should help learners understand the concept.`,
          maxTokens: 200,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      handleChange("explanation", data.text);
    } catch (error) {
      console.error("Failed to generate explanation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="question-text">Question</Label>
        <Textarea
          id="question-text"
          value={content.question || ""}
          onChange={(e) => handleChange("question", e.target.value)}
          placeholder="Enter your question..."
          rows={3}
        />
      </div>

      {/* Question Image */}
      <div className="space-y-2">
        <Label htmlFor="question-image">Question Image (optional)</Label>
        <Input
          id="question-image"
          value={content.questionImage || ""}
          onChange={(e) => handleChange("questionImage", e.target.value)}
          placeholder="Image URL..."
        />
        {content.questionImage && (
          <div className="rounded border border-zinc-200 overflow-hidden">
            <img
              src={content.questionImage}
              alt="Question"
              className="w-full h-24 object-cover"
            />
          </div>
        )}
      </div>

      {/* Points */}
      <div className="space-y-2">
        <Label htmlFor="question-points">Points</Label>
        <Input
          id="question-points"
          type="number"
          min={0}
          value={content.points || 1}
          onChange={(e) => handleChange("points", parseInt(e.target.value) || 1)}
        />
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="question-explanation">Explanation</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateExplanation}
            disabled={!content.question || isGenerating}
            className="text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Generate
              </>
            )}
          </Button>
        </div>
        <Textarea
          id="question-explanation"
          value={content.explanation || ""}
          onChange={(e) => handleChange("explanation", e.target.value)}
          placeholder="Explanation shown after answering..."
          rows={3}
        />
      </div>

      {/* Add Option */}
      <div className="pt-2 border-t border-zinc-200">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Option
        </Button>
      </div>
    </div>
  );
}
