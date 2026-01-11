/**
 * Version Restore API
 *
 * Restore an entity to a specific version.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entityVersions, entities, blocks } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/versions/[id]/restore - Restore entity to this version
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get the version to restore
    const [version] = await db
      .select()
      .from(entityVersions)
      .where(eq(entityVersions.id, id))
      .limit(1);

    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    const content = version.content as { blocks?: unknown[]; settings?: unknown };

    // Delete current blocks
    await db.delete(blocks).where(eq(blocks.entityId, version.entityId));

    // Restore blocks from version
    if (content.blocks && Array.isArray(content.blocks)) {
      for (const block of content.blocks) {
        const blockData = block as {
          id: string;
          type: string;
          content: unknown;
          order: number;
          settings: unknown;
          parentId: string | null;
        };
        await db.insert(blocks).values({
          entityId: version.entityId,
          type: blockData.type as "text" | "heading" | "image" | "video" | "card" | "card_group" | "slide" | "slide_deck" | "quiz_question" | "option" | "section" | "divider" | "two_column" | "callout" | "list",
          content: blockData.content || {},
          order: blockData.order || 0,
          settings: blockData.settings || {},
          parentId: blockData.parentId || null,
        });
      }
    }

    // Update entity settings if stored in version
    if (content.settings) {
      await db
        .update(entities)
        .set({
          settings: content.settings,
          updatedAt: new Date(),
        })
        .where(eq(entities.id, version.entityId));
    }

    return NextResponse.json({ data: { success: true, restoredTo: version.versionNumber } });
  } catch (error) {
    console.error("Error restoring version:", error);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 }
    );
  }
}
