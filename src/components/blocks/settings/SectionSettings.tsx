/**
 * SectionSettings Component
 *
 * Settings panel for section blocks.
 * Controls title, expandability, and default state.
 */

"use client";

import { Block } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface SectionSettingsProps {
  block: Block;
}

interface SectionBlockContent {
  title: string;
  isExpandable?: boolean;
  defaultExpanded?: boolean;
}

export function SectionSettings({ block }: SectionSettingsProps) {
  const { updateBlock } = useEditorStore();
  const content = block.content as unknown as SectionBlockContent;

  const handleChange = (field: keyof SectionBlockContent, value: string | boolean) => {
    updateBlock(block.id, {
      content: { ...content, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      {/* Section Title */}
      <div className="space-y-2">
        <Label htmlFor="section-title">Section Title</Label>
        <Input
          id="section-title"
          value={content.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Enter section title..."
        />
      </div>

      {/* Expandable Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="section-expandable" className="cursor-pointer">
            Expandable
          </Label>
          <p className="text-xs text-zinc-400">Allow users to collapse this section</p>
        </div>
        <Switch
          id="section-expandable"
          checked={content.isExpandable !== false}
          onCheckedChange={(checked) => handleChange("isExpandable", checked)}
        />
      </div>

      {/* Default Expanded */}
      {content.isExpandable !== false && (
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="section-expanded" className="cursor-pointer">
              Expanded by Default
            </Label>
            <p className="text-xs text-zinc-400">Show content when page loads</p>
          </div>
          <Switch
            id="section-expanded"
            checked={content.defaultExpanded !== false}
            onCheckedChange={(checked) => handleChange("defaultExpanded", checked)}
          />
        </div>
      )}
    </div>
  );
}
