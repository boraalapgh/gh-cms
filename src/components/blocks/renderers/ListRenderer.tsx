/**
 * ListRenderer Component
 *
 * Renders ordered and unordered list blocks.
 */

"use client";

import { Block, ListBlockContent } from "@/types";

interface ListRendererProps {
  block: Block;
}

export function ListRenderer({ block }: ListRendererProps) {
  const content = block.content as unknown as ListBlockContent;
  const items = content.items || [];

  if (items.length === 0) {
    return (
      <p className="text-sm text-zinc-400 italic">
        Empty list - add items in settings
      </p>
    );
  }

  const ListTag = content.ordered ? "ol" : "ul";
  const listClass = content.ordered
    ? "list-decimal list-inside space-y-1"
    : "list-disc list-inside space-y-1";

  return (
    <ListTag className={listClass}>
      {items.map((item, index) => (
        <li key={index} className="text-zinc-700">
          {item}
        </li>
      ))}
    </ListTag>
  );
}
