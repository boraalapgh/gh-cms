/**
 * CertificateProperties Component
 *
 * Properties panel for editing the selected certificate element.
 * Shows different options based on element type.
 */

"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  CertificateElement,
  CertificateTextElement,
  CertificateVariableElement,
  CertificateImageElement,
  CertificateShapeElement,
  CertificateTemplate,
  certificateVariables,
} from "@/types";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

interface CertificatePropertiesProps {
  template: CertificateTemplate;
  selectedElement: CertificateElement | null;
  onUpdateElement: (id: string, updates: Partial<CertificateElement>) => void;
  onUpdateTemplate: (updates: Partial<CertificateTemplate>) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
}

// Font families available
const FONT_FAMILIES = [
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans Serif" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "cursive", label: "Cursive" },
];

// Text properties editor
function TextPropertiesEditor({
  element,
  onUpdate,
}: {
  element: CertificateTextElement;
  onUpdate: (updates: Partial<CertificateTextElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-content">Text Content</Label>
        <Input
          id="text-content"
          value={element.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Enter text..."
        />
      </div>

      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select
          value={element.fontFamily}
          onValueChange={(value) => onUpdate({ fontFamily: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="font-size">Font Size</Label>
          <Input
            id="font-size"
            type="number"
            min={8}
            max={200}
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 16 })}
          />
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={element.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-10 h-9 p-0.5 cursor-pointer"
            />
            <Input
              value={element.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Style</Label>
        <div className="flex gap-2">
          <Button
            variant={element.fontWeight === "bold" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onUpdate({ fontWeight: element.fontWeight === "bold" ? "normal" : "bold" })
            }
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={element.fontStyle === "italic" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onUpdate({ fontStyle: element.fontStyle === "italic" ? "normal" : "italic" })
            }
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alignment</Label>
        <div className="flex gap-2">
          <Button
            variant={element.textAlign === "left" ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdate({ textAlign: "left" })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={element.textAlign === "center" ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdate({ textAlign: "center" })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={element.textAlign === "right" ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdate({ textAlign: "right" })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Variable properties editor
function VariablePropertiesEditor({
  element,
  onUpdate,
}: {
  element: CertificateVariableElement;
  onUpdate: (updates: Partial<CertificateVariableElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Variable</Label>
        <Select
          value={element.variable}
          onValueChange={(value) =>
            onUpdate({ variable: value as CertificateVariableElement["variable"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {certificateVariables.map((variable) => (
              <SelectItem key={variable.key} value={variable.key}>
                {variable.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Font Family</Label>
        <Select
          value={element.fontFamily}
          onValueChange={(value) => onUpdate({ fontFamily: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="var-font-size">Font Size</Label>
          <Input
            id="var-font-size"
            type="number"
            min={8}
            max={200}
            value={element.fontSize}
            onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 16 })}
          />
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={element.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-10 h-9 p-0.5 cursor-pointer"
            />
            <Input
              value={element.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Style</Label>
        <div className="flex gap-2">
          <Button
            variant={element.fontWeight === "bold" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onUpdate({ fontWeight: element.fontWeight === "bold" ? "normal" : "bold" })
            }
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={element.fontStyle === "italic" ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onUpdate({ fontStyle: element.fontStyle === "italic" ? "normal" : "italic" })
            }
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alignment</Label>
        <div className="flex gap-2">
          <Button
            variant={element.textAlign === "left" ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdate({ textAlign: "left" })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={element.textAlign === "center" ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdate({ textAlign: "center" })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={element.textAlign === "right" ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdate({ textAlign: "right" })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Image properties editor
function ImagePropertiesEditor({
  element,
  onUpdate,
}: {
  element: CertificateImageElement;
  onUpdate: (updates: Partial<CertificateImageElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-src">Image URL</Label>
        <Input
          id="image-src"
          value={element.src}
          onChange={(e) => onUpdate({ src: e.target.value })}
          placeholder="Enter image URL..."
        />
      </div>

      <div className="space-y-2">
        <Label>Fit Mode</Label>
        <Select
          value={element.objectFit}
          onValueChange={(value) =>
            onUpdate({ objectFit: value as CertificateImageElement["objectFit"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contain">Contain</SelectItem>
            <SelectItem value="cover">Cover</SelectItem>
            <SelectItem value="fill">Fill</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// Shape properties editor
function ShapePropertiesEditor({
  element,
  onUpdate,
}: {
  element: CertificateShapeElement;
  onUpdate: (updates: Partial<CertificateShapeElement>) => void;
}) {
  return (
    <div className="space-y-4">
      {element.shapeType !== "line" && (
        <div className="space-y-2">
          <Label>Fill Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={element.fill || "#ffffff"}
              onChange={(e) => onUpdate({ fill: e.target.value })}
              className="w-10 h-9 p-0.5 cursor-pointer"
            />
            <Input
              value={element.fill || ""}
              onChange={(e) => onUpdate({ fill: e.target.value })}
              placeholder="transparent"
              className="flex-1"
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Stroke Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={element.stroke || "#000000"}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="w-10 h-9 p-0.5 cursor-pointer"
          />
          <Input
            value={element.stroke || ""}
            onChange={(e) => onUpdate({ stroke: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="stroke-width">Stroke Width</Label>
        <Input
          id="stroke-width"
          type="number"
          min={0}
          max={20}
          value={element.strokeWidth || 0}
          onChange={(e) => onUpdate({ strokeWidth: parseInt(e.target.value) || 0 })}
        />
      </div>

      {(element.shapeType === "rectangle" || element.shapeType === "border") && (
        <div className="space-y-2">
          <Label htmlFor="corner-radius">Corner Radius</Label>
          <Input
            id="corner-radius"
            type="number"
            min={0}
            max={100}
            value={element.cornerRadius || 0}
            onChange={(e) => onUpdate({ cornerRadius: parseInt(e.target.value) || 0 })}
          />
        </div>
      )}
    </div>
  );
}

// Position and size editor (common for all elements)
function PositionSizeEditor({
  element,
  onUpdate,
}: {
  element: CertificateElement;
  onUpdate: (updates: Partial<CertificateElement>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="pos-x">X Position</Label>
          <Input
            id="pos-x"
            type="number"
            value={Math.round(element.x)}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pos-y">Y Position</Label>
          <Input
            id="pos-y"
            type="number"
            value={Math.round(element.y)}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width</Label>
          <Input
            id="width"
            type="number"
            min={10}
            value={Math.round(element.width)}
            onChange={(e) => onUpdate({ width: parseInt(e.target.value) || 10 })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height</Label>
          <Input
            id="height"
            type="number"
            min={10}
            value={Math.round(element.height)}
            onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 10 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Rotation ({element.rotation || 0}°)</Label>
        <Slider
          value={[element.rotation || 0]}
          min={-180}
          max={180}
          step={1}
          onValueChange={([value]) => onUpdate({ rotation: value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Opacity ({Math.round((element.opacity ?? 1) * 100)}%)</Label>
        <Slider
          value={[(element.opacity ?? 1) * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([value]) => onUpdate({ opacity: value / 100 })}
        />
      </div>
    </div>
  );
}

// Template settings editor
function TemplateSettingsEditor({
  template,
  onUpdate,
}: {
  template: CertificateTemplate;
  onUpdate: (updates: Partial<CertificateTemplate>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template-name">Template Name</Label>
        <Input
          id="template-name"
          value={template.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Orientation</Label>
        <Select
          value={template.orientation}
          onValueChange={(value) =>
            onUpdate({
              orientation: value as CertificateTemplate["orientation"],
              // Swap dimensions when changing orientation
              width: value === "landscape" ? 1056 : 816,
              height: value === "landscape" ? 816 : 1056,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="landscape">Landscape</SelectItem>
            <SelectItem value="portrait">Portrait</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={template.backgroundColor}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="w-10 h-9 p-0.5 cursor-pointer"
          />
          <Input
            value={template.backgroundColor}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bg-image">Background Image URL</Label>
        <Input
          id="bg-image"
          value={template.backgroundImage || ""}
          onChange={(e) => onUpdate({ backgroundImage: e.target.value || undefined })}
          placeholder="Optional background image..."
        />
      </div>
    </div>
  );
}

export function CertificateProperties({
  template,
  selectedElement,
  onUpdateElement,
  onUpdateTemplate,
  onBringForward,
  onSendBackward,
}: CertificatePropertiesProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {selectedElement ? (
          <>
            {/* Element Type Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-900 capitalize">
                {selectedElement.type} Properties
              </h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={onBringForward} title="Bring Forward">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onSendBackward} title="Send Backward">
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Type-specific properties */}
            {selectedElement.type === "text" && (
              <TextPropertiesEditor
                element={selectedElement}
                onUpdate={(updates) => onUpdateElement(selectedElement.id, updates)}
              />
            )}
            {selectedElement.type === "variable" && (
              <VariablePropertiesEditor
                element={selectedElement}
                onUpdate={(updates) => onUpdateElement(selectedElement.id, updates)}
              />
            )}
            {selectedElement.type === "image" && (
              <ImagePropertiesEditor
                element={selectedElement}
                onUpdate={(updates) => onUpdateElement(selectedElement.id, updates)}
              />
            )}
            {selectedElement.type === "shape" && (
              <ShapePropertiesEditor
                element={selectedElement}
                onUpdate={(updates) => onUpdateElement(selectedElement.id, updates)}
              />
            )}

            <Separator />

            {/* Position and size (common for all) */}
            <div>
              <h4 className="text-sm font-medium text-zinc-900 mb-3">Position & Size</h4>
              <PositionSizeEditor
                element={selectedElement}
                onUpdate={(updates) => onUpdateElement(selectedElement.id, updates)}
              />
            </div>
          </>
        ) : (
          <>
            {/* Template Settings when nothing selected */}
            <h3 className="text-sm font-medium text-zinc-900">Template Settings</h3>
            <Separator />
            <TemplateSettingsEditor template={template} onUpdate={onUpdateTemplate} />
          </>
        )}
      </div>
    </ScrollArea>
  );
}
