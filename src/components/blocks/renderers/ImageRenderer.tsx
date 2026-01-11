/**
 * ImageRenderer Component
 *
 * Renders image blocks with placeholder for empty URLs.
 * Supports captions and alt text.
 */

"use client";

import { Block, ImageBlockContent } from "@/types";
import { Image as ImageIcon } from "lucide-react";

interface ImageRendererProps {
  block: Block;
}

export function ImageRenderer({ block }: ImageRendererProps) {
  const content = block.content as unknown as ImageBlockContent;

  if (!content.url) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-zinc-50 border border-dashed border-zinc-300 rounded-lg">
        <ImageIcon className="h-10 w-10 text-zinc-300 mb-2" />
        <p className="text-sm text-zinc-400">No image selected</p>
        <p className="text-xs text-zinc-400 mt-1">
          Add an image URL in the settings panel
        </p>
      </div>
    );
  }

  return (
    <figure className="space-y-2">
      <img
        src={content.url}
        alt={content.alt || ""}
        className="w-full rounded-lg object-cover"
        style={{
          maxHeight: content.height || 400,
        }}
      />
      {content.caption && (
        <figcaption className="text-sm text-zinc-500 text-center">
          {content.caption}
        </figcaption>
      )}
    </figure>
  );
}
