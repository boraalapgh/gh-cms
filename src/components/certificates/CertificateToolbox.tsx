/**
 * CertificateToolbox Component
 *
 * Provides tools to add elements to the certificate canvas.
 * Includes text, variables, images, and shapes.
 */

"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Type,
  Variable,
  ImageIcon,
  Square,
  Circle,
  Minus,
  Frame,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Trash2,
  Copy,
} from "lucide-react";
import {
  CertificateElement,
  CertificateTextElement,
  CertificateVariableElement,
  CertificateImageElement,
  CertificateShapeElement,
  certificateVariables,
} from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CertificateToolboxProps {
  onAddElement: (element: Omit<CertificateElement, "id" | "zIndex">) => void;
  onDeleteSelected: () => void;
  onDuplicateSelected: () => void;
  selectedElementId: string | null;
  scale: number;
  onScaleChange: (scale: number) => void;
}

export function CertificateToolbox({
  onAddElement,
  onDeleteSelected,
  onDuplicateSelected,
  selectedElementId,
  scale,
  onScaleChange,
}: CertificateToolboxProps) {
  // Add text element
  const addTextElement = () => {
    const element: Omit<CertificateTextElement, "id" | "zIndex"> = {
      type: "text",
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      text: "Sample Text",
      fontFamily: "serif",
      fontSize: 24,
      fontWeight: "normal",
      fontStyle: "normal",
      textAlign: "center",
      color: "#000000",
    };
    onAddElement(element);
  };

  // Add variable element
  const addVariableElement = (variableKey: string) => {
    const element: Omit<CertificateVariableElement, "id" | "zIndex"> = {
      type: "variable",
      x: 100,
      y: 100,
      width: 300,
      height: 40,
      variable: variableKey as CertificateVariableElement["variable"],
      fontFamily: "serif",
      fontSize: 28,
      fontWeight: "bold",
      fontStyle: "normal",
      textAlign: "center",
      color: "#000000",
    };
    onAddElement(element);
  };

  // Add image element
  const addImageElement = () => {
    const element: Omit<CertificateImageElement, "id" | "zIndex"> = {
      type: "image",
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      src: "",
      objectFit: "contain",
    };
    onAddElement(element);
  };

  // Add shape elements
  const addRectangleElement = () => {
    const element: Omit<CertificateShapeElement, "id" | "zIndex"> = {
      type: "shape",
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      shapeType: "rectangle",
      fill: "#f5f5f5",
      stroke: "#000000",
      strokeWidth: 1,
      cornerRadius: 0,
    };
    onAddElement(element);
  };

  const addCircleElement = () => {
    const element: Omit<CertificateShapeElement, "id" | "zIndex"> = {
      type: "shape",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      shapeType: "circle",
      fill: "#f5f5f5",
      stroke: "#000000",
      strokeWidth: 1,
    };
    onAddElement(element);
  };

  const addLineElement = () => {
    const element: Omit<CertificateShapeElement, "id" | "zIndex"> = {
      type: "shape",
      x: 100,
      y: 100,
      width: 200,
      height: 2,
      shapeType: "line",
      stroke: "#000000",
      strokeWidth: 2,
    };
    onAddElement(element);
  };

  const addBorderElement = () => {
    const element: Omit<CertificateShapeElement, "id" | "zIndex"> = {
      type: "shape",
      x: 20,
      y: 20,
      width: 1016, // Full width - 40px margins
      height: 776, // Full height - 40px margins
      shapeType: "border",
      stroke: "#d4af37", // Gold color
      strokeWidth: 3,
      cornerRadius: 0,
    };
    onAddElement(element);
  };

  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.1, 2));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.1, 0.3));
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-2 bg-white border-b border-zinc-200">
        {/* Add Elements */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={addTextElement}>
                <Type className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Text</TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Variable className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>Add Variable</TooltipContent>
            </Tooltip>
            <DropdownMenuContent>
              {certificateVariables.map((variable) => (
                <DropdownMenuItem
                  key={variable.key}
                  onClick={() => addVariableElement(variable.key)}
                >
                  <span className="flex-1">{variable.label}</span>
                  <span className="text-xs text-zinc-400 ml-2">{variable.example}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={addImageElement}>
                <ImageIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Image</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Shapes */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={addRectangleElement}>
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Rectangle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={addCircleElement}>
                <Circle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Circle</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={addLineElement}>
                <Minus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Line</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={addBorderElement}>
                <Frame className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Border</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Element Actions */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDuplicateSelected}
                disabled={!selectedElementId}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteSelected}
                disabled={!selectedElementId}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>

        <div className="flex-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <span className="text-xs text-zinc-500 w-12 text-center">
            {Math.round(scale * 100)}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
