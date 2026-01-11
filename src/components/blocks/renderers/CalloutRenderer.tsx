/**
 * CalloutRenderer Component
 *
 * Renders styled callout boxes for highlighting information.
 * Supports info, warning, success, and error variants.
 */

"use client";

import { Block, CalloutBlockContent } from "@/types";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

interface CalloutRendererProps {
  block: Block;
}

const variantStyles = {
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Info className="h-5 w-5 text-blue-500" />,
    text: "text-blue-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
    text: "text-amber-800",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    text: "text-green-800",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: <XCircle className="h-5 w-5 text-red-500" />,
    text: "text-red-800",
  },
};

export function CalloutRenderer({ block }: CalloutRendererProps) {
  const content = block.content as unknown as CalloutBlockContent;
  const variant = content.variant || "info";
  const styles = variantStyles[variant];

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border ${styles.bg} ${styles.border}`}
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <p className={`text-sm ${styles.text}`}>
        {content.text || (
          <span className="italic opacity-60">Enter callout text...</span>
        )}
      </p>
    </div>
  );
}
