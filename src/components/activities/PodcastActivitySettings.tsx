/**
 * PodcastActivitySettings Component
 *
 * Global settings panel for Podcast activity type.
 * Controls audio source, script for AI generation, voice settings, and transcript.
 */

"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { PodcastConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Upload, Link, Mic, Play } from "lucide-react";

type AudioSource = "url" | "upload" | "generated";

const VOICE_OPTIONS = [
  { id: "sofia", label: "Sofia (Female, Warm)" },
  { id: "marcus", label: "Marcus (Male, Professional)" },
  { id: "elena", label: "Elena (Female, Energetic)" },
  { id: "james", label: "James (Male, Calm)" },
];

const SPEED_OPTIONS = [
  { value: "slow", label: "Slow" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
];

export function PodcastActivitySettings() {
  const { activityConfig, setActivityConfig } = useEditorStore();
  const config = activityConfig as PodcastConfig | null;
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPreviewingAudio, setIsPreviewingAudio] = useState(false);
  const [script, setScript] = useState("");

  if (!config || config.type !== "podcast") {
    return (
      <div className="text-sm text-muted-foreground">
        No podcast activity configuration found.
      </div>
    );
  }

  const handleChange = (field: keyof PodcastConfig, value: string | boolean) => {
    setActivityConfig({ [field]: value });
  };

  const handleSourceChange = (source: AudioSource) => {
    handleChange("audioSource", source);
  };

  // Calculate estimated duration from script (approx 150 words per minute)
  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedMinutes = Math.ceil(wordCount / 150);

  const handleGenerateAudio = async () => {
    if (!script.trim()) return;

    setIsGeneratingAudio(true);
    try {
      // TODO: Implement AI TTS API call
      const response = await fetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          voiceId: config.voiceId || "sofia",
          speed: config.voiceSpeed || "normal",
        }),
      });

      if (!response.ok) throw new Error("Failed to generate audio");

      const data = await response.json();
      handleChange("audioUrl", data.url);
      handleChange("transcript", script);
    } catch (error) {
      console.error("Failed to generate audio:", error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handlePreviewAudio = () => {
    if (!config.audioUrl) return;
    setIsPreviewingAudio(true);
    // Audio preview would use HTML5 audio element
    setTimeout(() => setIsPreviewingAudio(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Audio Source Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Audio Source</h4>

        <div className="flex gap-2">
          <Button
            variant={config.audioSource === "url" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSourceChange("url")}
          >
            <Link className="h-4 w-4 mr-1" />
            URL
          </Button>
          <Button
            variant={config.audioSource === "upload" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSourceChange("upload")}
          >
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
          <Button
            variant={config.audioSource === "generated" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSourceChange("generated")}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generate
          </Button>
        </div>

        {config.audioSource === "url" && (
          <div className="space-y-2">
            <Label htmlFor="audio-url">Audio URL</Label>
            <Input
              id="audio-url"
              value={config.audioUrl || ""}
              onChange={(e) => handleChange("audioUrl", e.target.value)}
              placeholder="https://example.com/podcast.mp3"
            />
            <p className="text-xs text-muted-foreground">
              Direct link to an MP3, WAV, or M4A file
            </p>
          </div>
        )}

        {config.audioSource === "upload" && (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop an audio file or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              MP3, WAV, M4A supported
            </p>
            <Button variant="outline" size="sm" className="mt-3">
              Choose File
            </Button>
          </div>
        )}

        {config.audioSource === "generated" && (
          <div className="space-y-4">
            {/* Script Editor */}
            <div className="space-y-2">
              <Label htmlFor="script">Script</Label>
              <Textarea
                id="script"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Write or paste your podcast script here..."
                rows={8}
                className="font-mono text-sm"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Word count: {wordCount}</span>
                <span>Est. duration: ~{estimatedMinutes} min</span>
              </div>
            </div>

            {/* Voice Selection */}
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select
                value={config.voiceId || "sofia"}
                onValueChange={(value) => handleChange("voiceId", value)}
              >
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      <div className="flex items-center gap-2">
                        <Mic className="h-3 w-3" />
                        {voice.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Speed Selection */}
            <div className="space-y-2">
              <Label htmlFor="speed">Speed</Label>
              <Select
                value={config.voiceSpeed || "normal"}
                onValueChange={(value) => handleChange("voiceSpeed", value)}
              >
                <SelectTrigger id="speed">
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  {SPEED_OPTIONS.map((speed) => (
                    <SelectItem key={speed.value} value={speed.value}>
                      {speed.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleGenerateAudio}
                disabled={!script.trim() || isGeneratingAudio}
                className="flex-1"
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Audio
                  </>
                )}
              </Button>
              {config.audioUrl && (
                <Button
                  variant="outline"
                  onClick={handlePreviewAudio}
                  disabled={isPreviewingAudio}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Audio Preview (if URL exists) */}
      {config.audioUrl && (
        <div className="space-y-2">
          <Label>Audio Preview</Label>
          <audio
            src={config.audioUrl}
            controls
            className="w-full"
          />
        </div>
      )}

      {/* Cover Image */}
      <div className="space-y-2">
        <Label htmlFor="cover-image">Cover Image</Label>
        <Input
          id="cover-image"
          value={config.coverImage || ""}
          onChange={(e) => handleChange("coverImage", e.target.value)}
          placeholder="Optional cover image URL..."
        />
        {config.coverImage && (
          <div className="mt-2 rounded border border-border overflow-hidden">
            <img
              src={config.coverImage}
              alt="Podcast cover"
              className="w-full h-32 object-cover"
            />
          </div>
        )}
      </div>

      {/* Transcript Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Transcript</h4>

        <div className="flex items-center justify-between">
          <Label htmlFor="transcript-enabled" className="cursor-pointer">
            Enable Transcript
          </Label>
          <Switch
            id="transcript-enabled"
            checked={config.transcriptEnabled || false}
            onCheckedChange={(checked) => handleChange("transcriptEnabled", checked)}
          />
        </div>

        {config.transcriptEnabled && (
          <div className="space-y-3 pt-2">
            <Textarea
              value={config.transcript || ""}
              onChange={(e) => handleChange("transcript", e.target.value)}
              placeholder="Podcast transcript..."
              rows={6}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (script.trim()) {
                    handleChange("transcript", script);
                  }
                }}
                disabled={!script.trim()}
              >
                Copy from Script
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The transcript appears below the audio player for accessibility
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
