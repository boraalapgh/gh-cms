/**
 * VideoSettings Component
 *
 * Settings panel for video blocks.
 */

"use client";

import { Block, VideoBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface VideoSettingsProps {
  block: Block;
}

export function VideoSettings({ block }: VideoSettingsProps) {
  const { updateBlock } = useEditorStore();
  const content = block.content as unknown as VideoBlockContent;

  const handleChange = (field: keyof VideoBlockContent, value: string | boolean) => {
    updateBlock(block.id, {
      content: { ...content, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="video-url">Video URL</Label>
        <Input
          id="video-url"
          value={content.url || ""}
          onChange={(e) => handleChange("url", e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
        />
        <p className="text-xs text-zinc-400">
          Supports YouTube, Vimeo, or direct video URLs
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="video-thumbnail">Thumbnail URL</Label>
        <Input
          id="video-thumbnail"
          value={content.thumbnailUrl || ""}
          onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
          placeholder="Optional thumbnail image..."
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="video-autoplay" className="cursor-pointer">
            Autoplay
          </Label>
          <Switch
            id="video-autoplay"
            checked={content.autoplay || false}
            onCheckedChange={(checked) => handleChange("autoplay", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="video-controls" className="cursor-pointer">
            Show Controls
          </Label>
          <Switch
            id="video-controls"
            checked={content.controls !== false}
            onCheckedChange={(checked) => handleChange("controls", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="video-loop" className="cursor-pointer">
            Loop
          </Label>
          <Switch
            id="video-loop"
            checked={content.loop || false}
            onCheckedChange={(checked) => handleChange("loop", checked)}
          />
        </div>
      </div>
    </div>
  );
}
