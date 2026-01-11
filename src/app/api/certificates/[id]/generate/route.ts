/**
 * Certificate Generation API
 *
 * POST /api/certificates/[id]/generate - Generate certificate with data
 *
 * Generates a certificate by rendering the template with provided data.
 * Returns the certificate as HTML that can be converted to PDF client-side
 * or by a separate PDF service.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entities } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  CertificateTemplate,
  CertificateElement,
  CertificateTextElement,
  CertificateVariableElement,
  CertificateImageElement,
  CertificateShapeElement,
  certificateVariables,
} from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Variable data that can be passed in
interface CertificateData {
  name?: string;
  date?: string;
  course?: string;
  score?: string;
  instructor?: string;
  organization?: string;
}

// Render text element to HTML
function renderTextElement(element: CertificateTextElement): string {
  const style = `
    position: absolute;
    left: ${element.x}px;
    top: ${element.y}px;
    width: ${element.width}px;
    height: ${element.height}px;
    font-family: ${element.fontFamily};
    font-size: ${element.fontSize}px;
    font-weight: ${element.fontWeight};
    font-style: ${element.fontStyle};
    text-align: ${element.textAlign};
    color: ${element.color};
    display: flex;
    align-items: center;
    justify-content: ${
      element.textAlign === "center"
        ? "center"
        : element.textAlign === "right"
        ? "flex-end"
        : "flex-start"
    };
    ${element.rotation ? `transform: rotate(${element.rotation}deg);` : ""}
    opacity: ${element.opacity ?? 1};
    z-index: ${element.zIndex};
  `.trim();

  return `<div style="${style}">${element.text}</div>`;
}

// Render variable element to HTML with data substitution
function renderVariableElement(
  element: CertificateVariableElement,
  data: CertificateData
): string {
  const variableInfo = certificateVariables.find((v) => v.key === element.variable);
  const value = data[element.variable] || variableInfo?.example || `{${element.variable}}`;

  const style = `
    position: absolute;
    left: ${element.x}px;
    top: ${element.y}px;
    width: ${element.width}px;
    height: ${element.height}px;
    font-family: ${element.fontFamily};
    font-size: ${element.fontSize}px;
    font-weight: ${element.fontWeight};
    font-style: ${element.fontStyle};
    text-align: ${element.textAlign};
    color: ${element.color};
    display: flex;
    align-items: center;
    justify-content: ${
      element.textAlign === "center"
        ? "center"
        : element.textAlign === "right"
        ? "flex-end"
        : "flex-start"
    };
    ${element.rotation ? `transform: rotate(${element.rotation}deg);` : ""}
    opacity: ${element.opacity ?? 1};
    z-index: ${element.zIndex};
  `.trim();

  return `<div style="${style}">${value}</div>`;
}

// Render image element to HTML
function renderImageElement(element: CertificateImageElement): string {
  const containerStyle = `
    position: absolute;
    left: ${element.x}px;
    top: ${element.y}px;
    width: ${element.width}px;
    height: ${element.height}px;
    overflow: hidden;
    ${element.rotation ? `transform: rotate(${element.rotation}deg);` : ""}
    opacity: ${element.opacity ?? 1};
    z-index: ${element.zIndex};
  `.trim();

  if (!element.src) {
    return `<div style="${containerStyle}; background: #f5f5f5;"></div>`;
  }

  return `
    <div style="${containerStyle}">
      <img src="${element.src}" style="width: 100%; height: 100%; object-fit: ${element.objectFit};" />
    </div>
  `;
}

// Render shape element to HTML
function renderShapeElement(element: CertificateShapeElement): string {
  let style = `
    position: absolute;
    left: ${element.x}px;
    top: ${element.y}px;
    width: ${element.width}px;
    height: ${element.height}px;
    ${element.rotation ? `transform: rotate(${element.rotation}deg);` : ""}
    opacity: ${element.opacity ?? 1};
    z-index: ${element.zIndex};
  `.trim();

  if (element.shapeType === "line") {
    style += `
      height: ${element.strokeWidth || 2}px;
      background-color: ${element.stroke || "#000"};
    `;
    return `<div style="${style}"></div>`;
  }

  if (element.shapeType === "border") {
    style += `
      background-color: transparent;
      border: ${element.strokeWidth || 1}px solid ${element.stroke || "#000"};
      border-radius: ${element.cornerRadius || 0}px;
    `;
    return `<div style="${style}"></div>`;
  }

  style += `
    background-color: ${element.fill || "transparent"};
    border: ${element.strokeWidth || 0}px solid ${element.stroke || "transparent"};
    border-radius: ${element.shapeType === "circle" ? "50%" : `${element.cornerRadius || 0}px`};
  `;

  return `<div style="${style}"></div>`;
}

// Render element based on type
function renderElement(element: CertificateElement, data: CertificateData): string {
  switch (element.type) {
    case "text":
      return renderTextElement(element);
    case "variable":
      return renderVariableElement(element, data);
    case "image":
      return renderImageElement(element);
    case "shape":
      return renderShapeElement(element);
    default:
      return "";
  }
}

// Generate full HTML for the certificate
function generateCertificateHTML(
  template: CertificateTemplate,
  data: CertificateData
): string {
  const sortedElements = [...template.elements].sort((a, b) => a.zIndex - b.zIndex);
  const elementsHTML = sortedElements.map((el) => renderElement(el, data)).join("\n");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${template.width}px ${template.height}px;
      margin: 0;
    }
    body {
      margin: 0;
      padding: 0;
    }
    .certificate {
      position: relative;
      width: ${template.width}px;
      height: ${template.height}px;
      background-color: ${template.backgroundColor};
      ${template.backgroundImage ? `background-image: url(${template.backgroundImage});` : ""}
      background-size: cover;
      background-position: center;
      overflow: hidden;
      font-family: serif;
    }
  </style>
</head>
<body>
  <div class="certificate">
    ${elementsHTML}
  </div>
</body>
</html>
  `.trim();
}

// POST - Generate certificate with data
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { data, format = "html" } = body as {
      data: CertificateData;
      format?: "html" | "json";
    };

    // Fetch template
    const [templateRecord] = await db
      .select()
      .from(entities)
      .where(eq(entities.id, id))
      .limit(1);

    if (!templateRecord) {
      return NextResponse.json(
        { success: false, error: "Certificate template not found" },
        { status: 404 }
      );
    }

    if (templateRecord.type !== "certificate_template") {
      return NextResponse.json(
        { success: false, error: "Entity is not a certificate template" },
        { status: 400 }
      );
    }

    const template = templateRecord.content as CertificateTemplate;

    // Provide default values for missing data
    const certificateData: CertificateData = {
      name: data?.name || "Recipient Name",
      date: data?.date || new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      course: data?.course || "Course Name",
      score: data?.score || "100%",
      instructor: data?.instructor || "Instructor Name",
      organization: data?.organization || "Organization",
    };

    if (format === "json") {
      // Return the template with data for client-side rendering
      return NextResponse.json({
        success: true,
        data: {
          template,
          certificateData,
        },
      });
    }

    // Generate HTML
    const html = generateCertificateHTML(template, certificateData);

    // Return as HTML for PDF generation
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Failed to generate certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate certificate" },
      { status: 500 }
    );
  }
}
