/**
 * InPracticeActivitySettings Component
 *
 * Global settings panel for In Practice activity type.
 * Controls two-column layout mode and provides guidance.
 */

"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { InPracticeConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Plus, Columns, Rows, SplitSquareHorizontal } from "lucide-react";

export function InPracticeActivitySettings() {
  const { activityConfig, setActivityConfig, blocks, addBlock } = useEditorStore();
  const config = activityConfig as InPracticeConfig | null;

  // Calculate stats
  const stats = useMemo(() => {
    const slideDecks = blocks.filter((b) => b.type === "slide_deck");
    const slides = blocks.filter((b) => b.type === "slide");
    const twoColumns = blocks.filter((b) => b.type === "two_column");

    return {
      slideDecks: slideDecks.length,
      slides: slides.length,
      twoColumns: twoColumns.length,
    };
  }, [blocks]);

  if (!config || config.type !== "in_practice") {
    return (
      <div className="text-sm text-zinc-500">
        No In Practice activity configuration found.
      </div>
    );
  }

  const handleLayoutModeChange = (value: string) => {
    setActivityConfig({ layoutMode: value as "side_by_side" | "stacked" });
  };

  const handleAddSlideDeck = () => {
    if (stats.slideDecks === 0) {
      addBlock("slide_deck");
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="bg-zinc-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Content Overview</h4>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<SplitSquareHorizontal className="h-4 w-4" />}
            label="Slides"
            value={stats.slides}
          />
          <StatCard
            icon={<Columns className="h-4 w-4" />}
            label="Two-Column Sections"
            value={stats.twoColumns}
          />
        </div>
      </div>

      {/* Quick Add */}
      {stats.slideDecks === 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 mb-3">
            Start by adding a slide deck to structure your practical examples.
          </p>
          <Button variant="outline" size="sm" onClick={handleAddSlideDeck}>
            <Plus className="h-4 w-4 mr-2" />
            Add Slide Deck
          </Button>
        </div>
      )}

      {/* Layout Mode */}
      <div className="space-y-3">
        <Label>Layout Mode</Label>
        <RadioGroup
          value={config.layoutMode}
          onValueChange={handleLayoutModeChange}
          className="space-y-2"
        >
          <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 hover:border-zinc-300">
            <RadioGroupItem value="side_by_side" id="side_by_side" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="side_by_side" className="cursor-pointer font-medium">
                  Side by Side
                </Label>
                <Columns className="h-4 w-4 text-zinc-400" />
              </div>
              <p className="text-xs text-zinc-500">
                Display "How to Apply" and "Why it Matters" columns next to each other
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 hover:border-zinc-300">
            <RadioGroupItem value="stacked" id="stacked" className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="stacked" className="cursor-pointer font-medium">
                  Stacked
                </Label>
                <Rows className="h-4 w-4 text-zinc-400" />
              </div>
              <p className="text-xs text-zinc-500">
                Display sections vertically for mobile-first reading
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Column Structure Guide */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-900">Column Structure</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <h5 className="text-xs font-medium text-zinc-700 mb-1">How to Apply</h5>
            <p className="text-xs text-zinc-500">
              Practical steps and actions learners can take
            </p>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <h5 className="text-xs font-medium text-zinc-700 mb-1">Why it Matters</h5>
            <p className="text-xs text-zinc-500">
              Context, benefits, and rationale for the approach
            </p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-900">In Practice Best Practices</h4>
        <ul className="space-y-2 text-xs text-zinc-600">
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Use two-column blocks for each slide to compare application vs. rationale
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Include concrete examples and action items
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Keep each slide focused on one concept or technique
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Add images or diagrams to illustrate practical applications
          </li>
        </ul>
      </div>
    </div>
  );
}

// Stat card helper component
function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-zinc-200">
      <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
        {icon}
      </div>
      <div>
        <p className="text-lg font-medium text-zinc-900">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}
