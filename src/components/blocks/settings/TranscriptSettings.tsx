/**
 * TranscriptSettings Component
 *
 * Settings panel for transcript blocks.
 * Includes AI generation capability.
 */

"use client";

import { useState } from "react";
import { Block, TranscriptBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface TranscriptSettingsProps {
  block: Block;
}

export function TranscriptSettings({ block }: TranscriptSettingsProps) {
  const { updateBlock } = useEditorStore();
  const content = block.content as unknown as TranscriptBlockContent;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, {
      content: { ...content, text: e.target.value, source: "manual" },
    });
  };

  const handleCollapsibleChange = (checked: boolean) => {
    updateBlock(block.id, {
      content: { ...content, isCollapsible: checked },
    });
  };

  const handleExpandedChange = (checked: boolean) => {
    updateBlock(block.id, {
      content: { ...content, defaultExpanded: checked },
    });
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Generate a sample video transcript for an educational video. Include natural pauses and conversational tone. About 200 words.",
          maxTokens: 500,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate transcript");

      const data = await response.json();
      updateBlock(block.id, {
        content: {
          ...content,
          text: data.text,
          source: "ai_generated",
        },
      });
    } catch (error) {
      console.error("Failed to generate transcript:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="transcript-text">Transcript Text</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
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
                Generate with AI
              </>
            )}
          </Button>
        </div>
        <Textarea
          id="transcript-text"
          value={content.text || ""}
          onChange={handleTextChange}
          placeholder="Enter transcript text or generate with AI..."
          rows={8}
          className="font-mono text-sm"
        />
        {content.source === "ai_generated" && (
          <p className="text-xs text-zinc-400">
            This transcript was AI-generated
          </p>
        )}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="transcript-collapsible" className="cursor-pointer">
            Collapsible
          </Label>
          <Switch
            id="transcript-collapsible"
            checked={content.isCollapsible !== false}
            onCheckedChange={handleCollapsibleChange}
          />
        </div>

        {content.isCollapsible !== false && (
          <div className="flex items-center justify-between">
            <Label htmlFor="transcript-expanded" className="cursor-pointer">
              Expanded by Default
            </Label>
            <Switch
              id="transcript-expanded"
              checked={content.defaultExpanded !== false}
              onCheckedChange={handleExpandedChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
