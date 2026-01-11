/**
 * BlockRenderer Component
 *
 * Routes block rendering to the appropriate renderer component
 * based on block type. This is the central dispatch for block visualization.
 */

"use client";

import { Block } from "@/types";
import { TextRenderer } from "./renderers/TextRenderer";
import { HeadingRenderer } from "./renderers/HeadingRenderer";
import { ImageRenderer } from "./renderers/ImageRenderer";
import { VideoRenderer } from "./renderers/VideoRenderer";
import { CardRenderer } from "./renderers/CardRenderer";
import { DividerRenderer } from "./renderers/DividerRenderer";
import { TwoColumnRenderer } from "./renderers/TwoColumnRenderer";
import { CalloutRenderer } from "./renderers/CalloutRenderer";
import { ListRenderer } from "./renderers/ListRenderer";
import { TranscriptRenderer } from "./renderers/TranscriptRenderer";
import { QuizQuestionRenderer } from "./renderers/QuizQuestionRenderer";
import { OptionRenderer } from "./renderers/OptionRenderer";
import { SectionRenderer } from "./renderers/SectionRenderer";
import { SlideDeckRenderer } from "./renderers/SlideDeckRenderer";
import { SlideRenderer } from "./renderers/SlideRenderer";

interface BlockRendererProps {
  block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  switch (block.type) {
    case "text":
      return <TextRenderer block={block} />;
    case "heading":
      return <HeadingRenderer block={block} />;
    case "image":
      return <ImageRenderer block={block} />;
    case "video":
      return <VideoRenderer block={block} />;
    case "card":
    case "card_group":
      return <CardRenderer block={block} />;
    case "divider":
      return <DividerRenderer />;
    case "two_column":
      return <TwoColumnRenderer block={block} />;
    case "callout":
      return <CalloutRenderer block={block} />;
    case "list":
      return <ListRenderer block={block} />;
    case "transcript":
      return <TranscriptRenderer block={block} />;
    case "quiz_question":
      return <QuizQuestionRenderer block={block} />;
    case "option":
      return <OptionRenderer block={block} />;
    case "section":
      return <SectionRenderer block={block} />;
    case "slide_deck":
      return <SlideDeckRenderer block={block} />;
    case "slide":
      return <SlideRenderer block={block} />;
    default:
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-center text-sm text-red-500">
          Unknown block type: {block.type}
        </div>
      );
  }
}
