/**
 * TextSettings Component
 *
 * Settings panel for text blocks with AI generation capabilities.
 */

"use client";

import { useState } from "react";
import { Block, TextBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Wand2, Loader2 } from "lucide-react";

interface TextSettingsProps {
  block: Block;
}

export function TextSettings({ block }: TextSettingsProps) {
  const { updateBlock, activityType } = useEditorStore();
  const content = block.content as unknown as TextBlockContent;
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, {
      content: { ...content, text: e.target.value },
    });
  };

  const handleFormatChange = (value: string) => {
    updateBlock(block.id, {
      content: { ...content, format: value as "plain" | "markdown" | "html" },
    });
  };

  const getContextPrompt = () => {
    switch (activityType) {
      case "video":
        return "for an educational video activity";
      case "quiz":
        return "for a quiz or assessment";
      case "quick_dive":
        return "for a quick dive article on e-learning content";
      case "daily_dilemma":
        return "for a daily dilemma scenario with ethical considerations";
      case "in_practice":
        return "for a practical application guide";
      default:
        return "for e-learning content";
    }
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate engaging educational text content ${getContextPrompt()}. Write 2-3 paragraphs that are informative, clear, and accessible to learners. Use a professional but conversational tone.`,
          maxTokens: 400,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      updateBlock(block.id, {
        content: { ...content, text: data.text },
      });
    } catch (error) {
      console.error("Failed to generate text:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!content.text) return;

    setIsImproving(true);
    try {
      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Improve the following educational text ${getContextPrompt()}. Make it clearer, more engaging, and better structured while preserving the core message. Keep similar length.\n\nOriginal text:\n${content.text}`,
          maxTokens: 500,
        }),
      });

      if (!response.ok) throw new Error("Failed to improve");

      const data = await response.json();
      updateBlock(block.id, {
        content: { ...content, text: data.text },
      });
    } catch (error) {
      console.error("Failed to improve text:", error);
    } finally {
      setIsImproving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="text-content">Content</Label>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateWithAI}
              disabled={isGenerating}
              className="h-7 text-xs"
            >
              {isGenerating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate
                </>
              )}
            </Button>
            {content.text && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImproveWithAI}
                disabled={isImproving}
                className="h-7 text-xs"
              >
                {isImproving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Wand2 className="h-3 w-3 mr-1" />
                    Improve
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        <Textarea
          id="text-content"
          value={content.text || ""}
          onChange={handleTextChange}
          placeholder="Enter text content..."
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-format">Format</Label>
        <Select
          value={content.format || "plain"}
          onValueChange={handleFormatChange}
        >
          <SelectTrigger id="text-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plain">Plain Text</SelectItem>
            <SelectItem value="markdown">Markdown</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
