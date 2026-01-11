/**
 * CertificateDesigner Component
 *
 * Main canvas-based visual editor for designing certificate templates.
 * Combines toolbox, canvas, and properties panel for a complete design experience.
 * Supports text, variables, images, and shapes with drag-and-drop positioning.
 */

"use client";

import { useState, useCallback } from "react";
import {
  CertificateElement,
  CertificateTemplate,
  defaultCertificateTemplate,
} from "@/types";
import { CertificateCanvas } from "./CertificateCanvas";
import { CertificateToolbox } from "./CertificateToolbox";
import { CertificateProperties } from "./CertificateProperties";
import { Button } from "@/components/ui/button";
import { Save, Download, RotateCcw } from "lucide-react";

interface CertificateDesignerProps {
  initialTemplate?: CertificateTemplate;
  onSave?: (template: CertificateTemplate) => void;
  onExport?: (template: CertificateTemplate) => void;
}

export function CertificateDesigner({
  initialTemplate,
  onSave,
  onExport,
}: CertificateDesignerProps) {
  const [template, setTemplate] = useState<CertificateTemplate>(
    initialTemplate || {
      ...defaultCertificateTemplate,
      id: crypto.randomUUID(),
    }
  );
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.7);

  // Get selected element
  const selectedElement = selectedElementId
    ? template.elements.find((el) => el.id === selectedElementId) || null
    : null;

  // Add element to template
  const handleAddElement = useCallback(
    (elementData: Omit<CertificateElement, "id" | "zIndex">) => {
      const maxZIndex = template.elements.reduce(
        (max, el) => Math.max(max, el.zIndex),
        0
      );
      const newElement: CertificateElement = {
        ...elementData,
        id: crypto.randomUUID(),
        zIndex: maxZIndex + 1,
      } as CertificateElement;

      setTemplate((prev) => ({
        ...prev,
        elements: [...prev.elements, newElement],
      }));
      setSelectedElementId(newElement.id);
    },
    [template.elements]
  );

  // Update element
  const handleUpdateElement = useCallback(
    (id: string, updates: Partial<CertificateElement>) => {
      setTemplate((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? ({ ...el, ...updates } as CertificateElement) : el
        ),
      }));
    },
    []
  );

  // Delete selected element
  const handleDeleteSelected = useCallback(() => {
    if (!selectedElementId) return;
    setTemplate((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== selectedElementId),
    }));
    setSelectedElementId(null);
  }, [selectedElementId]);

  // Duplicate selected element
  const handleDuplicateSelected = useCallback(() => {
    if (!selectedElementId) return;
    const element = template.elements.find((el) => el.id === selectedElementId);
    if (!element) return;

    const maxZIndex = template.elements.reduce(
      (max, el) => Math.max(max, el.zIndex),
      0
    );
    const newElement: CertificateElement = {
      ...element,
      id: crypto.randomUUID(),
      x: element.x + 20,
      y: element.y + 20,
      zIndex: maxZIndex + 1,
    };

    setTemplate((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElementId(newElement.id);
  }, [selectedElementId, template.elements]);

  // Update template settings
  const handleUpdateTemplate = useCallback(
    (updates: Partial<CertificateTemplate>) => {
      setTemplate((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  // Bring element forward
  const handleBringForward = useCallback(() => {
    if (!selectedElementId) return;
    setTemplate((prev) => {
      const elements = [...prev.elements];
      const idx = elements.findIndex((el) => el.id === selectedElementId);
      if (idx === -1) return prev;

      // Find next higher zIndex
      const currentZ = elements[idx].zIndex;
      const nextElement = elements
        .filter((el) => el.zIndex > currentZ)
        .sort((a, b) => a.zIndex - b.zIndex)[0];

      if (nextElement) {
        // Swap zIndexes
        elements[idx] = { ...elements[idx], zIndex: nextElement.zIndex };
        const nextIdx = elements.findIndex((el) => el.id === nextElement.id);
        elements[nextIdx] = { ...elements[nextIdx], zIndex: currentZ };
      } else {
        // Already at top, just increment
        elements[idx] = { ...elements[idx], zIndex: currentZ + 1 };
      }

      return { ...prev, elements };
    });
  }, [selectedElementId]);

  // Send element backward
  const handleSendBackward = useCallback(() => {
    if (!selectedElementId) return;
    setTemplate((prev) => {
      const elements = [...prev.elements];
      const idx = elements.findIndex((el) => el.id === selectedElementId);
      if (idx === -1) return prev;

      // Find next lower zIndex
      const currentZ = elements[idx].zIndex;
      const prevElement = elements
        .filter((el) => el.zIndex < currentZ)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

      if (prevElement) {
        // Swap zIndexes
        elements[idx] = { ...elements[idx], zIndex: prevElement.zIndex };
        const prevIdx = elements.findIndex((el) => el.id === prevElement.id);
        elements[prevIdx] = { ...elements[prevIdx], zIndex: currentZ };
      } else {
        // Already at bottom, just decrement to 0 minimum
        elements[idx] = { ...elements[idx], zIndex: Math.max(0, currentZ - 1) };
      }

      return { ...prev, elements };
    });
  }, [selectedElementId]);

  // Reset template
  const handleReset = useCallback(() => {
    setTemplate({
      ...defaultCertificateTemplate,
      id: crypto.randomUUID(),
    });
    setSelectedElementId(null);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedElementId && document.activeElement?.tagName !== "INPUT") {
          e.preventDefault();
          handleDeleteSelected();
        }
      }
      if (e.key === "Escape") {
        setSelectedElementId(null);
      }
      // Duplicate with Ctrl/Cmd + D
      if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        handleDuplicateSelected();
      }
    },
    [selectedElementId, handleDeleteSelected, handleDuplicateSelected]
  );

  return (
    <div
      className="h-full flex flex-col bg-zinc-50"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-zinc-200">
        <h2 className="text-sm font-medium text-zinc-900">
          {template.name || "Certificate Designer"}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport(template)}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          )}
          {onSave && (
            <Button size="sm" onClick={() => onSave(template)}>
              <Save className="h-4 w-4 mr-1" />
              Save Template
            </Button>
          )}
        </div>
      </div>

      {/* Toolbox */}
      <CertificateToolbox
        onAddElement={handleAddElement}
        onDeleteSelected={handleDeleteSelected}
        onDuplicateSelected={handleDuplicateSelected}
        selectedElementId={selectedElementId}
        scale={scale}
        onScaleChange={setScale}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 overflow-auto">
          <CertificateCanvas
            template={template}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={handleUpdateElement}
            scale={scale}
          />
        </div>

        {/* Properties Panel */}
        <div className="w-72 border-l border-zinc-200 bg-white">
          <CertificateProperties
            template={template}
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
            onUpdateTemplate={handleUpdateTemplate}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
          />
        </div>
      </div>
    </div>
  );
}
