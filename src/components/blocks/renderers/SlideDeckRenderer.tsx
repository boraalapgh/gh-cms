/**
 * SlideDeckRenderer Component
 *
 * Renders a slide deck container with navigation between slides.
 * Used in Daily Dilemma and In Practice activities.
 */

"use client";

import { useState, useMemo } from "react";
import { Block } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Button } from "@/components/ui/button";
import { BlockWrapper } from "../BlockWrapper";
import { BlockRenderer } from "../BlockRenderer";
import { ChevronLeft, ChevronRight, Plus, LayoutTemplate } from "lucide-react";

interface SlideDeckRendererProps {
  block: Block;
}

export function SlideDeckRenderer({ block }: SlideDeckRendererProps) {
  const { addBlock, selectBlock, blocks } = useEditorStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Memoize child slides to prevent infinite re-renders
  const slides = useMemo(
    () => blocks.filter((b) => b.parentId === block.id).sort((a, b) => a.order - b.order),
    [blocks, block.id]
  );

  const handleAddSlide = () => {
    const newSlide = addBlock("slide", block.id, slides.length);
    selectBlock(newSlide.id);
  };

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-zinc-500" />
          <span className="text-sm font-medium text-zinc-700">Slide Deck</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {slides.length > 0
              ? `Slide ${currentSlideIndex + 1} of ${slides.length}`
              : "No slides"}
          </span>
          <Button variant="outline" size="sm" onClick={handleAddSlide}>
            <Plus className="h-3 w-3 mr-1" />
            Add Slide
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="min-h-[200px]">
        {slides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LayoutTemplate className="h-12 w-12 text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500 mb-3">No slides yet</p>
            <Button variant="outline" size="sm" onClick={handleAddSlide}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Slide
            </Button>
          </div>
        ) : currentSlide ? (
          <div className="p-4">
            <BlockWrapper key={currentSlide.id} block={currentSlide}>
              <BlockRenderer block={currentSlide} />
            </BlockWrapper>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      {slides.length > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-t border-zinc-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToSlide(currentSlideIndex - 1)}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {/* Slide Indicators */}
          <div className="flex gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentSlideIndex
                    ? "bg-zinc-900"
                    : "bg-zinc-300 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToSlide(currentSlideIndex + 1)}
            disabled={currentSlideIndex === slides.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
