/**
 * RightPanel Component
 *
 * Contains tabs for Element Settings and Global Settings.
 * Element Settings shows properties for the selected block.
 * Global Settings shows entity/activity-level configuration.
 * When an activity is selected (in lesson editor), shows the LessonActivityEditor.
 */

"use client";

import { useEditorStore, selectBlockById } from "@/stores/editor-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlockSettings } from "../blocks/settings/BlockSettings";
import { ActivitySettings } from "../activities/ActivitySettings";
import { VersionHistory } from "./VersionHistory";
import { LessonActivityEditor } from "../lessons/LessonActivityEditor";

export function RightPanel() {
  const {
    selectedBlockId,
    rightPanelTab,
    setRightPanelTab,
    entityId,
    loadBlocks,
    selectedActivityId,
    entityType,
  } = useEditorStore();
  const selectedBlock = useEditorStore(
    selectedBlockId ? selectBlockById(selectedBlockId) : () => undefined
  );

  // Show activity editor when an activity is selected in a lesson
  if (entityType === "lesson" && selectedActivityId) {
    return <LessonActivityEditor />;
  }

  // Handle version restore - reload blocks
  const handleVersionRestore = () => {
    if (entityId) {
      loadBlocks(entityId);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs
        value={rightPanelTab}
        onValueChange={(v) => setRightPanelTab(v as "element" | "global" | "versions")}
        className="flex-1 flex flex-col"
      >
        <div className="border-b border-zinc-200">
          <TabsList className="w-full grid grid-cols-3 h-10 bg-transparent rounded-none">
            <TabsTrigger
              value="element"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent text-xs"
            >
              Element
            </TabsTrigger>
            <TabsTrigger
              value="global"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent text-xs"
            >
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="versions"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-zinc-900 data-[state=active]:bg-transparent text-xs"
            >
              Versions
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="element" className="m-0 p-4">
            {selectedBlock ? (
              <BlockSettings block={selectedBlock} />
            ) : (
              <div className="text-center text-zinc-400 py-8">
                <p className="text-sm">No block selected</p>
                <p className="text-xs mt-1">
                  Click a block to edit its properties
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="global" className="m-0 p-4">
            <ActivitySettings />
          </TabsContent>

          <TabsContent value="versions" className="m-0 p-4">
            {entityId ? (
              <VersionHistory entityId={entityId} onRestore={handleVersionRestore} />
            ) : (
              <div className="text-center text-zinc-400 py-8">
                <p className="text-sm">No entity loaded</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
