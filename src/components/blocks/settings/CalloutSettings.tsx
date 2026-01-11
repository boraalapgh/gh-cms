/**
 * CalloutSettings Component
 *
 * Settings panel for callout blocks.
 */

"use client";

import { Block, CalloutBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalloutSettingsProps {
  block: Block;
}

export function CalloutSettings({ block }: CalloutSettingsProps) {
  const { updateBlock } = useEditorStore();
  const content = block.content as unknown as CalloutBlockContent;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, {
      content: { ...content, text: e.target.value },
    });
  };

  const handleVariantChange = (value: string) => {
    updateBlock(block.id, {
      content: { ...content, variant: value as "info" | "warning" | "success" | "error" },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="callout-text">Content</Label>
        <Textarea
          id="callout-text"
          value={content.text || ""}
          onChange={handleTextChange}
          placeholder="Enter callout message..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="callout-variant">Style</Label>
        <Select
          value={content.variant || "info"}
          onValueChange={handleVariantChange}
        >
          <SelectTrigger id="callout-variant">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info (Blue)</SelectItem>
            <SelectItem value="warning">Warning (Amber)</SelectItem>
            <SelectItem value="success">Success (Green)</SelectItem>
            <SelectItem value="error">Error (Red)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
