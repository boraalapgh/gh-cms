/**
 * QuizActivitySettings Component
 *
 * Global settings panel for Quiz activity type.
 * Controls scoring, randomization, and display options.
 */

"use client";

import { useEditorStore } from "@/stores/editor-store";
import { QuizConfig } from "@/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export function QuizActivitySettings() {
  const { activityConfig, setActivityConfig, blocks } = useEditorStore();
  const config = activityConfig as QuizConfig | null;

  if (!config || config.type !== "quiz") {
    return (
      <div className="text-sm text-zinc-500">
        No quiz activity configuration found.
      </div>
    );
  }

  const handleChange = (field: keyof QuizConfig, value: string | number | boolean) => {
    setActivityConfig({ [field]: value });
  };

  // Count questions and total points
  const questionBlocks = blocks.filter((b) => b.type === "quiz_question");
  const totalPoints = questionBlocks.reduce((sum, q) => {
    const content = q.content as { points?: number };
    return sum + (content.points || 1);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Quiz Stats */}
      <div className="bg-zinc-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Quiz Overview</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-zinc-500">Questions</span>
            <p className="font-medium text-zinc-900">{questionBlocks.length}</p>
          </div>
          <div>
            <span className="text-zinc-500">Total Points</span>
            <p className="font-medium text-zinc-900">{totalPoints}</p>
          </div>
        </div>
      </div>

      {/* Passing Score */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Passing Score</Label>
          <span className="text-sm font-medium text-zinc-900">
            {config.passingScore}%
          </span>
        </div>
        <Slider
          value={[config.passingScore]}
          onValueChange={(values) => handleChange("passingScore", values[0])}
          min={0}
          max={100}
          step={5}
          className="w-full"
        />
        <p className="text-xs text-zinc-400">
          Learners need {Math.ceil(totalPoints * (config.passingScore / 100))} out of {totalPoints} points to pass
        </p>
      </div>

      {/* Display Options */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-zinc-900">Display Options</h4>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="show-correct" className="cursor-pointer">
              Show Correct Answers
            </Label>
            <p className="text-xs text-zinc-400">Display correct answers after completion</p>
          </div>
          <Switch
            id="show-correct"
            checked={config.showCorrectAnswers}
            onCheckedChange={(checked) => handleChange("showCorrectAnswers", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="randomize" className="cursor-pointer">
              Randomize Questions
            </Label>
            <p className="text-xs text-zinc-400">Shuffle question order for each attempt</p>
          </div>
          <Switch
            id="randomize"
            checked={config.randomizeQuestions}
            onCheckedChange={(checked) => handleChange("randomizeQuestions", checked)}
          />
        </div>
      </div>

      {/* Time Limit */}
      <div className="space-y-2">
        <Label htmlFor="time-limit">
          Time Limit (minutes) <span className="text-zinc-400">(optional)</span>
        </Label>
        <Input
          id="time-limit"
          type="number"
          min={0}
          value={config.timeLimit || ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            handleChange("timeLimit", value as number);
          }}
          placeholder="No limit"
        />
        <p className="text-xs text-zinc-400">
          Leave empty for unlimited time
        </p>
      </div>

      {/* Attempts */}
      <div className="space-y-2">
        <Label htmlFor="attempts">
          Attempts Allowed <span className="text-zinc-400">(optional)</span>
        </Label>
        <Input
          id="attempts"
          type="number"
          min={1}
          value={config.attemptsAllowed || ""}
          onChange={(e) => {
            const value = e.target.value ? parseInt(e.target.value) : undefined;
            handleChange("attemptsAllowed", value as number);
          }}
          placeholder="Unlimited"
        />
        <p className="text-xs text-zinc-400">
          Leave empty for unlimited attempts
        </p>
      </div>
    </div>
  );
}
