/**
 * VideoRenderer Component
 *
 * Renders video blocks with placeholder for empty URLs.
 * Supports autoplay, controls, and loop settings.
 */

"use client";

import { Block, VideoBlockContent } from "@/types";
import { Video as VideoIcon } from "lucide-react";

interface VideoRendererProps {
  block: Block;
}

export function VideoRenderer({ block }: VideoRendererProps) {
  const content = block.content as unknown as VideoBlockContent;

  if (!content.url) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 bg-zinc-50 border border-dashed border-zinc-300 rounded-lg">
        <VideoIcon className="h-10 w-10 text-zinc-300 mb-2" />
        <p className="text-sm text-zinc-400">No video selected</p>
        <p className="text-xs text-zinc-400 mt-1">
          Add a video URL in the settings panel
        </p>
      </div>
    );
  }

  // Handle YouTube URLs
  const isYouTube =
    content.url.includes("youtube.com") || content.url.includes("youtu.be");

  if (isYouTube) {
    let videoId = "";
    if (content.url.includes("youtu.be")) {
      videoId = content.url.split("/").pop() || "";
    } else {
      const urlParams = new URLSearchParams(new URL(content.url).search);
      videoId = urlParams.get("v") || "";
    }

    return (
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}${content.autoplay ? "?autoplay=1" : ""}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Handle direct video URLs
  return (
    <video
      src={content.url}
      poster={content.thumbnailUrl}
      autoPlay={content.autoplay}
      controls={content.controls !== false}
      loop={content.loop}
      className="w-full rounded-lg"
    />
  );
}
