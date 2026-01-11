/**
 * Certificate Type Definitions
 *
 * Configuration types for certificates in the CMS.
 * Canvas-based design with variable placeholders.
 */

// Certificate element types
export type CertificateElementType = "text" | "image" | "shape" | "variable";

// Base certificate element
export interface CertificateElementBase {
  id: string;
  type: CertificateElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex: number;
}

// Text element
export interface CertificateTextElement extends CertificateElementBase {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  color: string;
}

// Variable placeholder element
export interface CertificateVariableElement extends CertificateElementBase {
  type: "variable";
  variable: "name" | "date" | "course" | "score" | "instructor" | "organization";
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textAlign: "left" | "center" | "right";
  color: string;
}

// Image element
export interface CertificateImageElement extends CertificateElementBase {
  type: "image";
  src: string;
  objectFit: "contain" | "cover" | "fill";
}

// Shape element
export interface CertificateShapeElement extends CertificateElementBase {
  type: "shape";
  shapeType: "rectangle" | "circle" | "line" | "border";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

// Union type for all elements
export type CertificateElement =
  | CertificateTextElement
  | CertificateVariableElement
  | CertificateImageElement
  | CertificateShapeElement;

// Certificate template structure
export interface CertificateTemplate {
  id: string;
  name: string;
  width: number; // in pixels
  height: number; // in pixels
  orientation: "landscape" | "portrait";
  backgroundColor: string;
  backgroundImage?: string;
  elements: CertificateElement[];
}

// Certificate settings
export interface CertificateSettings {
  showLogo: boolean;
  showScore: boolean;
  showDescription: boolean;
  showSignature: boolean;
  showDate: boolean;
  showOrganization: boolean;
  pageSize: "letter" | "a4" | "custom";
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Default certificate settings
export const defaultCertificateSettings: CertificateSettings = {
  showLogo: true,
  showScore: false,
  showDescription: true,
  showSignature: true,
  showDate: true,
  showOrganization: true,
  pageSize: "letter",
  margins: {
    top: 40,
    right: 40,
    bottom: 40,
    left: 40,
  },
};

// Default certificate template (blank)
export const defaultCertificateTemplate: CertificateTemplate = {
  id: "",
  name: "New Certificate",
  width: 1056, // 11 inches at 96 DPI
  height: 816, // 8.5 inches at 96 DPI
  orientation: "landscape",
  backgroundColor: "#ffffff",
  backgroundImage: undefined,
  elements: [],
};

// Pre-built template starters
export const certificateTemplates: { id: string; name: string; preview: string }[] = [
  { id: "classic", name: "Classic", preview: "/templates/classic.png" },
  { id: "modern", name: "Modern", preview: "/templates/modern.png" },
  { id: "elegant", name: "Elegant", preview: "/templates/elegant.png" },
  { id: "minimal", name: "Minimal", preview: "/templates/minimal.png" },
];

// Variable placeholders with descriptions
export const certificateVariables = [
  { key: "name", label: "Recipient Name", example: "John Doe" },
  { key: "date", label: "Completion Date", example: "January 1, 2025" },
  { key: "course", label: "Course Name", example: "Introduction to Programming" },
  { key: "score", label: "Final Score", example: "95%" },
  { key: "instructor", label: "Instructor Name", example: "Jane Smith" },
  { key: "organization", label: "Organization", example: "Acme Learning" },
] as const;
