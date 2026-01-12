/**
 * SkillsetPicker Component
 *
 * A picker for selecting skillsets (for lessons/courses) or
 * subskills (for activities) from the taxonomy.
 */

"use client";

import { useState, useMemo } from "react";
import { ChevronRight, Search, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TaggingContext, SkillsetTag, Skillset, Subskill } from "@/types";
import {
  getAllSkillsets,
  getSkillset,
  getSubskill,
  searchSkillsets,
  searchSubskills,
} from "@/lib/skillsets";

interface SkillsetPickerProps {
  context: TaggingContext;
  value?: SkillsetTag;
  onChange: (tag: SkillsetTag | undefined) => void;
  label?: string;
}

export function SkillsetPicker({
  context,
  value,
  onChange,
  label,
}: SkillsetPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSkillset, setSelectedSkillset] = useState<Skillset | null>(null);

  const skillsets = getAllSkillsets();

  // For activities, we select subskills; for lessons/courses, we select skillsets
  const isActivityMode = context === "activity";

  // Filter results based on search
  const filteredSkillsets = useMemo(() => {
    if (!search.trim()) return skillsets;
    return searchSkillsets(search);
  }, [skillsets, search]);

  const filteredSubskills = useMemo(() => {
    if (!selectedSkillset) return [];
    if (!search.trim()) return selectedSkillset.subskills;
    return selectedSkillset.subskills.filter(
      (s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
    );
  }, [selectedSkillset, search]);

  const handleSkillsetSelect = (skillset: Skillset) => {
    if (isActivityMode) {
      // Drill into subskills
      setSelectedSkillset(skillset);
      setSearch("");
    } else {
      // Select skillset directly
      onChange({
        skillsetId: skillset.id,
        skillsetName: skillset.name,
      });
      setOpen(false);
      setSearch("");
    }
  };

  const handleSubskillSelect = (subskill: Subskill) => {
    if (!selectedSkillset) return;

    onChange({
      skillsetId: selectedSkillset.id,
      skillsetName: selectedSkillset.name,
      subskillId: subskill.id,
      subskillName: subskill.name,
    });
    setOpen(false);
    setSearch("");
    setSelectedSkillset(null);
  };

  const handleClear = () => {
    onChange(undefined);
  };

  const handleBack = () => {
    setSelectedSkillset(null);
    setSearch("");
  };

  const displayLabel = label || (isActivityMode ? "Subskill" : "Skillset");

  return (
    <div className="space-y-2">
      <Label>{displayLabel}</Label>

      {value ? (
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1"
            style={{
              backgroundColor: getSkillset(value.skillsetId)?.color + "20",
              borderColor: getSkillset(value.skillsetId)?.color,
            }}
          >
            {value.subskillName || value.skillsetName}
            <button
              onClick={handleClear}
              className="ml-1 hover:bg-black/10 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
          {value.subskillName && (
            <span className="text-xs text-muted-foreground">
              in {value.skillsetName}
            </span>
          )}
        </div>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <Search className="h-4 w-4 mr-2" />
              Select {isActivityMode ? "subskill" : "skillset"}...
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedSkillset
                  ? `${selectedSkillset.name} Subskills`
                  : `Select ${isActivityMode ? "Subskill" : "Skillset"}`}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Back button when viewing subskills */}
              {selectedSkillset && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="w-full justify-start"
                >
                  ← Back to skillsets
                </Button>
              )}

              {/* List */}
              <ScrollArea className="h-[300px]">
                {!selectedSkillset ? (
                  // Skillset list
                  <div className="space-y-1">
                    {filteredSkillsets.map((skillset) => (
                      <button
                        key={skillset.id}
                        onClick={() => handleSkillsetSelect(skillset)}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted text-left"
                      >
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: skillset.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{skillset.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {skillset.description}
                          </p>
                        </div>
                        {isActivityMode && (
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </button>
                    ))}
                    {filteredSkillsets.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No skillsets found
                      </p>
                    )}
                  </div>
                ) : (
                  // Subskill list
                  <div className="space-y-1">
                    {filteredSubskills.map((subskill) => (
                      <button
                        key={subskill.id}
                        onClick={() => handleSubskillSelect(subskill)}
                        className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{subskill.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {subskill.description}
                          </p>
                        </div>
                      </button>
                    ))}
                    {filteredSubskills.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No subskills found
                      </p>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <p className="text-xs text-muted-foreground">
        {isActivityMode
          ? "Tag this activity with a specific subskill"
          : `Tag this ${context} with a skillset category`}
      </p>
    </div>
  );
}
