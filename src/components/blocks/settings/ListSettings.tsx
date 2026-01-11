/**
 * ListSettings Component
 *
 * Settings panel for list blocks.
 */

"use client";

import { useState } from "react";
import { Block, ListBlockContent } from "@/types";
import { useEditorStore } from "@/stores/editor-store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, X } from "lucide-react";

interface ListSettingsProps {
  block: Block;
}

export function ListSettings({ block }: ListSettingsProps) {
  const { updateBlock } = useEditorStore();
  const content = block.content as unknown as ListBlockContent;
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    const items = [...(content.items || []), newItem.trim()];
    updateBlock(block.id, {
      content: { ...content, items },
    });
    setNewItem("");
  };

  const handleRemoveItem = (index: number) => {
    const items = [...(content.items || [])];
    items.splice(index, 1);
    updateBlock(block.id, {
      content: { ...content, items },
    });
  };

  const handleUpdateItem = (index: number, value: string) => {
    const items = [...(content.items || [])];
    items[index] = value;
    updateBlock(block.id, {
      content: { ...content, items },
    });
  };

  const handleOrderedChange = (checked: boolean) => {
    updateBlock(block.id, {
      content: { ...content, ordered: checked },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="list-ordered" className="cursor-pointer">
          Numbered List
        </Label>
        <Switch
          id="list-ordered"
          checked={content.ordered || false}
          onCheckedChange={handleOrderedChange}
        />
      </div>

      <div className="space-y-2">
        <Label>Items</Label>
        <div className="space-y-2">
          {(content.items || []).map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(e) => handleUpdateItem(index, e.target.value)}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                onClick={() => handleRemoveItem(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Add item..."
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
          />
          <Button size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
