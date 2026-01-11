/**
 * CertificateCanvas Component
 *
 * Visual canvas for designing certificate templates.
 * Renders certificate elements and handles selection/movement.
 * Uses CSS transforms for element positioning.
 */

"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  CertificateElement,
  CertificateTemplate,
  CertificateTextElement,
  CertificateVariableElement,
  CertificateImageElement,
  CertificateShapeElement,
  certificateVariables,
} from "@/types";

interface CertificateCanvasProps {
  template: CertificateTemplate;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CertificateElement>) => void;
  scale?: number;
}

// Render text element
function TextElement({
  element,
  isSelected,
  onSelect,
  onMove,
}: {
  element: CertificateTextElement;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (dx: number, dy: number) => void;
}) {
  return (
    <div
      className={`absolute cursor-move select-none ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        opacity: element.opacity ?? 1,
        zIndex: element.zIndex,
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textAlign: element.textAlign,
        color: element.color,
        display: "flex",
        alignItems: "center",
        justifyContent:
          element.textAlign === "center"
            ? "center"
            : element.textAlign === "right"
            ? "flex-end"
            : "flex-start",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {element.text || "Text"}
    </div>
  );
}

// Render variable placeholder element
function VariableElement({
  element,
  isSelected,
  onSelect,
}: {
  element: CertificateVariableElement;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const variableInfo = certificateVariables.find((v) => v.key === element.variable);
  const displayText = variableInfo?.example || `{${element.variable}}`;

  return (
    <div
      className={`absolute cursor-move select-none ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        opacity: element.opacity ?? 1,
        zIndex: element.zIndex,
        fontFamily: element.fontFamily,
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        fontStyle: element.fontStyle,
        textAlign: element.textAlign,
        color: element.color,
        display: "flex",
        alignItems: "center",
        justifyContent:
          element.textAlign === "center"
            ? "center"
            : element.textAlign === "right"
            ? "flex-end"
            : "flex-start",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <span className="border-b border-dashed border-current">{displayText}</span>
    </div>
  );
}

// Render image element
function ImageElement({
  element,
  isSelected,
  onSelect,
}: {
  element: CertificateImageElement;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`absolute cursor-move ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        opacity: element.opacity ?? 1,
        zIndex: element.zIndex,
        overflow: "hidden",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {element.src ? (
        <img
          src={element.src}
          alt=""
          className="w-full h-full"
          style={{ objectFit: element.objectFit }}
          draggable={false}
        />
      ) : (
        <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400 text-sm">
          Image
        </div>
      )}
    </div>
  );
}

// Render shape element
function ShapeElement({
  element,
  isSelected,
  onSelect,
}: {
  element: CertificateShapeElement;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const shapeStyle: React.CSSProperties = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: element.opacity ?? 1,
    zIndex: element.zIndex,
    backgroundColor: element.fill || "transparent",
    borderColor: element.stroke || "transparent",
    borderWidth: element.strokeWidth || 0,
    borderStyle: "solid",
    borderRadius:
      element.shapeType === "circle"
        ? "50%"
        : element.cornerRadius
        ? element.cornerRadius
        : 0,
  };

  // Line shape
  if (element.shapeType === "line") {
    return (
      <div
        className={`absolute cursor-move ${
          isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
        }`}
        style={{
          ...shapeStyle,
          height: element.strokeWidth || 2,
          backgroundColor: element.stroke || "#000",
          borderWidth: 0,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      />
    );
  }

  // Border shape (only borders, no fill)
  if (element.shapeType === "border") {
    return (
      <div
        className={`absolute cursor-move ${
          isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
        }`}
        style={{
          ...shapeStyle,
          backgroundColor: "transparent",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      />
    );
  }

  return (
    <div
      className={`absolute cursor-move ${
        isSelected ? "ring-2 ring-blue-500 ring-offset-1" : ""
      }`}
      style={shapeStyle}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    />
  );
}

export function CertificateCanvas({
  template,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  scale = 1,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elementX: number; elementY: number } | null>(null);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      const element = template.elements.find((el) => el.id === elementId);
      if (!element) return;

      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        elementX: element.x,
        elementY: element.y,
      });
      onSelectElement(elementId);
    },
    [template.elements, onSelectElement]
  );

  // Handle mouse move for dragging
  useEffect(() => {
    if (!isDragging || !dragStart || !selectedElementId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;

      onUpdateElement(selectedElementId, {
        x: Math.max(0, dragStart.elementX + dx),
        y: Math.max(0, dragStart.elementY + dy),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStart(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, selectedElementId, onUpdateElement, scale]);

  // Sort elements by zIndex
  const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="relative overflow-auto bg-zinc-100 p-8 flex items-center justify-center min-h-full">
      <div
        ref={canvasRef}
        className="relative shadow-xl"
        style={{
          width: template.width * scale,
          height: template.height * scale,
          backgroundColor: template.backgroundColor,
          backgroundImage: template.backgroundImage
            ? `url(${template.backgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
        onClick={() => onSelectElement(null)}
      >
        {/* Render elements */}
        {sortedElements.map((element) => {
          const isSelected = element.id === selectedElementId;
          const commonProps = {
            isSelected,
            onSelect: () => onSelectElement(element.id),
          };

          return (
            <div
              key={element.id}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
            >
              {element.type === "text" && (
                <TextElement element={element} {...commonProps} onMove={() => {}} />
              )}
              {element.type === "variable" && (
                <VariableElement element={element} {...commonProps} />
              )}
              {element.type === "image" && (
                <ImageElement element={element} {...commonProps} />
              )}
              {element.type === "shape" && (
                <ShapeElement element={element} {...commonProps} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
