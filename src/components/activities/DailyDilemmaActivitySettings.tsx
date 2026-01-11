/**
 * DailyDilemmaActivitySettings Component
 *
 * Global settings panel for Daily Dilemma activity type.
 * Controls feedback mode and provides guidance for creating scenarios.
 */

"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { DailyDilemmaConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Plus, HelpCircle, MessageSquare, SplitSquareHorizontal } from "lucide-react";

export function DailyDilemmaActivitySettings() {
  const { activityConfig, setActivityConfig, blocks, addBlock } = useEditorStore();
  const config = activityConfig as DailyDilemmaConfig | null;

  // Calculate stats
  const stats = useMemo(() => {
    const slideDecks = blocks.filter((b) => b.type === "slide_deck");
    const slides = blocks.filter((b) => b.type === "slide");
    const options = blocks.filter((b) => b.type === "option");

    return {
      slideDecks: slideDecks.length,
      slides: slides.length,
      options: options.length,
    };
  }, [blocks]);

  if (!config || config.type !== "daily_dilemma") {
    return (
      <div className="text-sm text-zinc-500">
        No Daily Dilemma activity configuration found.
      </div>
    );
  }

  const handleFeedbackModeChange = (value: string) => {
    setActivityConfig({ feedbackMode: value as "immediate" | "after_selection" });
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
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Dilemma Overview</h4>
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={<SplitSquareHorizontal className="h-4 w-4" />}
            label="Slides"
            value={stats.slides}
          />
          <StatCard
            icon={<HelpCircle className="h-4 w-4" />}
            label="Options"
            value={stats.options}
          />
          <StatCard
            icon={<MessageSquare className="h-4 w-4" />}
            label="Per Slide"
            value={stats.slides > 0 ? Math.round(stats.options / stats.slides) : 0}
          />
        </div>
      </div>

      {/* Quick Add */}
      {stats.slideDecks === 0 && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 mb-3">
            Start by adding a slide deck to contain your dilemma scenarios.
          </p>
          <Button variant="outline" size="sm" onClick={handleAddSlideDeck}>
            <Plus className="h-4 w-4 mr-2" />
            Add Slide Deck
          </Button>
        </div>
      )}

      {/* Feedback Mode */}
      <div className="space-y-3">
        <Label>Feedback Mode</Label>
        <RadioGroup
          value={config.feedbackMode}
          onValueChange={handleFeedbackModeChange}
          className="space-y-2"
        >
          <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 hover:border-zinc-300">
            <RadioGroupItem value="immediate" id="immediate" className="mt-0.5" />
            <div>
              <Label htmlFor="immediate" className="cursor-pointer font-medium">
                Immediate
              </Label>
              <p className="text-xs text-zinc-500">
                Show feedback as soon as an option is selected
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 hover:border-zinc-300">
            <RadioGroupItem value="after_selection" id="after_selection" className="mt-0.5" />
            <div>
              <Label htmlFor="after_selection" className="cursor-pointer font-medium">
                After All Selections
              </Label>
              <p className="text-xs text-zinc-500">
                Show feedback after learner completes all slides
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Best Practices */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-900">Daily Dilemma Best Practices</h4>
        <ul className="space-y-2 text-xs text-zinc-600">
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Present realistic scenarios with no clear "right" answer
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Provide 2-4 options per scenario
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Use feedback to explain the implications of each choice
          </li>
          <li className="flex items-start gap-2">
            <span className="text-zinc-400">•</span>
            Mark the "best" answer but acknowledge valid alternatives
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
    <div className="flex flex-col items-center p-2 bg-white rounded border border-zinc-200">
      <div className="text-zinc-400 mb-1">{icon}</div>
      <p className="text-lg font-medium text-zinc-900">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
