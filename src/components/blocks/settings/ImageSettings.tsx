/**
 * ImageSettings Component
 *
 * Settings panel for image blocks with AI generation capabilities.
 */

"use client";

import { useState } from "react";
import { Block, ImageBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface ImageSettingsProps {
  block: Block;
}

export function ImageSettings({ block }: ImageSettingsProps) {
  const { updateBlock, activityType } = useEditorStore();
  const content = block.content as unknown as ImageBlockContent;
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const handleChange = (field: keyof ImageBlockContent, value: string | number) => {
    updateBlock(block.id, {
      content: { ...content, [field]: value },
    });
  };

  const getContextHint = () => {
    switch (activityType) {
      case "video":
        return "a video thumbnail or educational illustration";
      case "quiz":
        return "an educational diagram or illustration for a quiz question";
      case "quick_dive":
        return "an informative illustration for an article";
      case "daily_dilemma":
        return "a scenario illustration for ethical decision-making";
      case "in_practice":
        return "a practical how-to illustration";
      default:
        return "an educational illustration";
    }
  };

  const handleGenerateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${aiPrompt}. Style: Clean, professional, suitable for ${getContextHint()}. Educational, modern design.`,
          size: "1024x1024",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      updateBlock(block.id, {
        content: { ...content, url: data.url, alt: aiPrompt },
      });
      setAiPrompt("");
    } catch (error) {
      console.error("Failed to generate image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Image Generation */}
      <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">Generate with AI</span>
        </div>
        <Textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder={`Describe ${getContextHint()}...`}
          rows={2}
          className="text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateWithAI}
          disabled={!aiPrompt.trim() || isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-500">or</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-url">Image URL</Label>
        <Input
          id="image-url"
          value={content.url || ""}
          onChange={(e) => handleChange("url", e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        {content.url && (
          <div className="mt-2 rounded border border-zinc-200 overflow-hidden">
            <img
              src={content.url}
              alt={content.alt || "Preview"}
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-alt">Alt Text</Label>
        <Input
          id="image-alt"
          value={content.alt || ""}
          onChange={(e) => handleChange("alt", e.target.value)}
          placeholder="Describe the image..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-caption">Caption (optional)</Label>
        <Input
          id="image-caption"
          value={content.caption || ""}
          onChange={(e) => handleChange("caption", e.target.value)}
          placeholder="Image caption..."
        />
      </div>
    </div>
  );
}
