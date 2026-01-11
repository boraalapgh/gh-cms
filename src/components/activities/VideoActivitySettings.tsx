/**
 * VideoActivitySettings Component
 *
 * Global settings panel for Video activity type.
 * Controls video playback options, transcript settings, and AI generation.
 */

"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { VideoActivityConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Upload, Link } from "lucide-react";

type VideoSource = "url" | "upload" | "ai_placeholder";

export function VideoActivitySettings() {
  const { activityConfig, setActivityConfig, addBlock, blocks } = useEditorStore();
  const config = activityConfig as VideoActivityConfig | null;
  const [videoSource, setVideoSource] = useState<VideoSource>("url");
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [aiDescription, setAiDescription] = useState("");

  if (!config || config.type !== "video") {
    return (
      <div className="text-sm text-zinc-500">
        No video activity configuration found.
      </div>
    );
  }

  const handleChange = (field: keyof VideoActivityConfig, value: string | boolean) => {
    setActivityConfig({ [field]: value });
  };

  const handleAddTranscriptBlock = () => {
    // Check if transcript block already exists
    const hasTranscript = blocks.some((b) => b.type === "transcript");
    if (!hasTranscript) {
      addBlock("transcript");
    }
  };

  const handleGenerateTranscript = async () => {
    if (!config.videoUrl) return;

    setIsGeneratingTranscript(true);
    try {
      const response = await fetch("/api/ai/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate a realistic transcript for an educational video. The video URL is: ${config.videoUrl}. Create a natural, conversational transcript that would be typical for an educational video. Include natural pauses, transitions, and explanations. About 300-400 words.`,
          maxTokens: 800,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();

      // Add a transcript block with the generated content
      const hasTranscript = blocks.some((b) => b.type === "transcript");
      if (!hasTranscript) {
        const newBlock = addBlock("transcript");
        // Update with AI content after creation
        setTimeout(() => {
          useEditorStore.getState().updateBlock(newBlock.id, {
            content: {
              text: data.text,
              source: "ai_generated",
              isCollapsible: true,
              defaultExpanded: true,
            },
          });
        }, 0);
      }

      setActivityConfig({ transcriptEnabled: true });
    } catch (error) {
      console.error("Failed to generate transcript:", error);
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const handleGeneratePlaceholder = async () => {
    if (!aiDescription.trim()) return;

    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `A video thumbnail or placeholder image for: ${aiDescription}. Professional, clean, educational style.`,
          size: "1792x1024",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      handleChange("thumbnailUrl", data.url);
    } catch (error) {
      console.error("Failed to generate placeholder:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Source Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-zinc-900">Video Source</h4>

        <div className="flex gap-2">
          <Button
            variant={videoSource === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => setVideoSource("url")}
          >
            <Link className="h-4 w-4 mr-1" />
            URL
          </Button>
          <Button
            variant={videoSource === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => setVideoSource("upload")}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
          <Button
            variant={videoSource === "ai_placeholder" ? "default" : "outline"}
            size="sm"
            onClick={() => setVideoSource("ai_placeholder")}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI Placeholder
          </Button>
        </div>

        {videoSource === "url" && (
          <div className="space-y-2">
            <Label htmlFor="video-url">Video URL</Label>
            <Input
              id="video-url"
              value={config.videoUrl || ""}
              onChange={(e) => handleChange("videoUrl", e.target.value)}
              placeholder="https://youtube.com/watch?v=... or Vimeo URL"
            />
            <p className="text-xs text-zinc-400">
              Supports YouTube, Vimeo, or direct video URLs
            </p>
          </div>
        )}

        {videoSource === "upload" && (
          <div className="border-2 border-dashed border-zinc-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-zinc-400 mb-2" />
            <p className="text-sm text-zinc-500">
              Drag and drop a video file or click to browse
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Choose File
            </Button>
          </div>
        )}

        {videoSource === "ai_placeholder" && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ai-description">Describe your video</Label>
              <Textarea
                id="ai-description"
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                placeholder="E.g., An instructor explaining cloud computing concepts with diagrams..."
                rows={3}
              />
            </div>
            <Button
              size="sm"
              onClick={handleGeneratePlaceholder}
              disabled={!aiDescription.trim()}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              Generate Placeholder Image
            </Button>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail-url">Thumbnail URL</Label>
        <Input
          id="thumbnail-url"
          value={config.thumbnailUrl || ""}
          onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
          placeholder="Optional thumbnail image URL..."
        />
        {config.thumbnailUrl && (
          <div className="mt-2 rounded border border-zinc-200 overflow-hidden">
            <img
              src={config.thumbnailUrl}
              alt="Video thumbnail"
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>

      {/* Playback Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-zinc-900">Playback Settings</h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoplay" className="cursor-pointer">
              Autoplay
            </Label>
            <Switch
              id="autoplay"
              checked={config.autoplay || false}
              onCheckedChange={(checked) => handleChange("autoplay", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="controls" className="cursor-pointer">
              Show Controls
            </Label>
            <Switch
              id="controls"
              checked={config.controls !== false}
              onCheckedChange={(checked) => handleChange("controls", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="loop" className="cursor-pointer">
              Loop
            </Label>
            <Switch
              id="loop"
              checked={config.loop || false}
              onCheckedChange={(checked) => handleChange("loop", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="muted" className="cursor-pointer">
              Muted
            </Label>
            <Switch
              id="muted"
              checked={config.muted || false}
              onCheckedChange={(checked) => handleChange("muted", checked)}
            />
          </div>
        </div>
      </div>

      {/* Transcript Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-zinc-900">Transcript</h4>

        <div className="flex items-center justify-between">
          <Label htmlFor="transcript-enabled" className="cursor-pointer">
            Enable Transcript
          </Label>
          <Switch
            id="transcript-enabled"
            checked={config.transcriptEnabled || false}
            onCheckedChange={(checked) => {
              handleChange("transcriptEnabled", checked);
              if (checked) handleAddTranscriptBlock();
            }}
          />
        </div>

        {config.transcriptEnabled && (
          <div className="space-y-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateTranscript}
              disabled={!config.videoUrl || isGeneratingTranscript}
              className="w-full"
            >
              {isGeneratingTranscript ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Transcript...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Transcript with AI
                </>
              )}
            </Button>
            <p className="text-xs text-zinc-400">
              AI will generate a sample transcript based on the video URL
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
