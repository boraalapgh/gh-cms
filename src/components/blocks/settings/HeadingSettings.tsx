/**
 * HeadingSettings Component
 *
 * Settings panel for heading blocks.
 */

"use client";

import { Block, HeadingBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeadingSettingsProps {
  block: Block;
}

export function HeadingSettings({ block }: HeadingSettingsProps) {
  const { updateBlock } = useEditorStore();
  const content = block.content as unknown as HeadingBlockContent;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(block.id, {
      content: { ...content, text: e.target.value },
    });
  };

  const handleLevelChange = (value: string) => {
    updateBlock(block.id, {
      content: { ...content, level: parseInt(value) as 1 | 2 | 3 | 4 | 5 | 6 },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="heading-text">Heading Text</Label>
        <Input
          id="heading-text"
          value={content.text || ""}
          onChange={handleTextChange}
          placeholder="Enter heading..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="heading-level">Level</Label>
        <Select
          value={String(content.level || 2)}
          onValueChange={handleLevelChange}
        >
          <SelectTrigger id="heading-level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">H1 - Main Title</SelectItem>
            <SelectItem value="2">H2 - Section</SelectItem>
            <SelectItem value="3">H3 - Subsection</SelectItem>
            <SelectItem value="4">H4 - Minor</SelectItem>
            <SelectItem value="5">H5 - Small</SelectItem>
            <SelectItem value="6">H6 - Smallest</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
