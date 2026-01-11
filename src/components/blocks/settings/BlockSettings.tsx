/**
 * BlockSettings Component
 *
 * Renders the appropriate settings form for the selected block type.
 * Displayed in the right panel when a block is selected.
 */

"use client";

import { Block } from "@/types";
import { TextSettings } from "./TextSettings";
import { HeadingSettings } from "./HeadingSettings";
import { ImageSettings } from "./ImageSettings";
import { VideoSettings } from "./VideoSettings";
import { CalloutSettings } from "./CalloutSettings";
import { ListSettings } from "./ListSettings";
import { TranscriptSettings } from "./TranscriptSettings";
import { QuizQuestionSettings } from "./QuizQuestionSettings";
import { OptionSettings } from "./OptionSettings";
import { SectionSettings } from "./SectionSettings";
import { Label } from "@/components/ui/label";

interface BlockSettingsProps {
  block: Block;
}

export function BlockSettings({ block }: BlockSettingsProps) {
  const renderSettings = () => {
    switch (block.type) {
      case "text":
        return <TextSettings block={block} />;
      case "heading":
        return <HeadingSettings block={block} />;
      case "image":
        return <ImageSettings block={block} />;
      case "video":
        return <VideoSettings block={block} />;
      case "callout":
        return <CalloutSettings block={block} />;
      case "list":
        return <ListSettings block={block} />;
      case "transcript":
        return <TranscriptSettings block={block} />;
      case "quiz_question":
        return <QuizQuestionSettings block={block} />;
      case "option":
        return <OptionSettings block={block} />;
      case "section":
        return <SectionSettings block={block} />;
      case "card":
      case "card_group":
      case "two_column":
      case "divider":
      case "slide":
      case "slide_deck":
        return (
          <p className="text-sm text-zinc-500">
            Settings for this block type coming soon.
          </p>
        );
      default:
        return (
          <p className="text-sm text-zinc-500">No settings available.</p>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs text-zinc-400 uppercase tracking-wider">
          Block Type
        </Label>
        <p className="text-sm font-medium capitalize mt-1">
          {block.type.replace("_", " ")}
        </p>
      </div>
      <div className="border-t border-zinc-200 pt-4">{renderSettings()}</div>
    </div>
  );
}
