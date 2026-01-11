/**
 * CenterPanel Component
 *
 * Live preview canvas with device preview toggle.
 * Displays blocks as the learner would see them.
 * Click-to-select blocks for editing.
 */

"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { DeviceType, DEVICE_DIMENSIONS } from "@/types";
import { BlockCanvas } from "./BlockCanvas";
import { Monitor, Tablet, Smartphone, PanelLeft, PanelRight } from "lucide-react";

const DEVICE_ICONS: Record<DeviceType, React.ReactNode> = {
  desktop: <Monitor className="h-4 w-4" />,
  tablet: <Tablet className="h-4 w-4" />,
  mobile: <Smartphone className="h-4 w-4" />,
};

export function CenterPanel() {
  const {
    devicePreview,
    setDevicePreview,
    toggleLeftPanel,
    toggleRightPanel,
    leftPanelCollapsed,
    rightPanelCollapsed,
    blocks,
  } = useEditorStore();

  // Memoize root blocks to prevent infinite re-renders
  const rootBlocks = useMemo(
    () => blocks.filter((b) => !b.parentId).sort((a, b) => a.order - b.order),
    [blocks]
  );
  const dimensions = DEVICE_DIMENSIONS[devicePreview];

  return (
    <div className="h-full flex flex-col bg-zinc-100">
      {/* Toolbar */}
      <div className="h-10 border-b border-zinc-200 bg-white flex items-center justify-between px-3">
        {/* Left controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={toggleLeftPanel}
          >
            <PanelLeft
              className={`h-4 w-4 ${leftPanelCollapsed ? "text-zinc-400" : ""}`}
            />
          </Button>
        </div>

        {/* Device toggle */}
        <div className="flex items-center gap-1 bg-zinc-100 rounded-md p-0.5">
          {(["desktop", "tablet", "mobile"] as DeviceType[]).map((device) => (
            <Button
              key={device}
              variant={devicePreview === device ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setDevicePreview(device)}
            >
              {DEVICE_ICONS[device]}
            </Button>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={toggleRightPanel}
          >
            <PanelRight
              className={`h-4 w-4 ${rightPanelCollapsed ? "text-zinc-400" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <ScrollArea className="flex-1">
        <div className="p-6 flex justify-center min-h-full">
          <div
            className="bg-white shadow-sm border border-zinc-200 rounded-lg overflow-hidden transition-all duration-200"
            style={{
              width: devicePreview === "desktop" ? "100%" : dimensions.width,
              maxWidth: dimensions.width,
              minHeight: dimensions.height * 0.75,
            }}
          >
            {rootBlocks.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-zinc-400">
                <div className="text-center">
                  <p className="text-sm">No content yet</p>
                  <p className="text-xs mt-1">
                    Add blocks from the Tools panel on the left
                  </p>
                </div>
              </div>
            ) : (
              <BlockCanvas blocks={rootBlocks} />
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
