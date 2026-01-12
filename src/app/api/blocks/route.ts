/**
 * Blocks API
 *
 * CRUD operations for content blocks. Supports filtering by entity and reordering.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blocks } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// GET /api/blocks - List blocks for an entity
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entityId = searchParams.get("entityId");

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId is required" },
        { status: 400 }
      );
    }

    const result = await db
      .select()
      .from(blocks)
      .where(eq(blocks.entityId, entityId))
      .orderBy(asc(blocks.order));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error fetching blocks:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocks" },
      { status: 500 }
    );
  }
}

// POST /api/blocks - Create a new block
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityId, parentId, type, content, order, settings } = body;

    if (!entityId || !type) {
      return NextResponse.json(
        { error: "entityId and type are required" },
        { status: 400 }
      );
    }

    const [newBlock] = await db
      .insert(blocks)
      .values({
        entityId,
        parentId: parentId || null,
        type,
        content: content || {},
        order: order ?? 0,
        settings: settings || {},
      })
      .returning();

    return NextResponse.json({ data: newBlock }, { status: 201 });
  } catch (error) {
    console.error("Error creating block:", error);
    return NextResponse.json(
      { error: "Failed to create block" },
      { status: 500 }
    );
  }
}

// PUT /api/blocks - Bulk save/update blocks for an entity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityId, blocks: blocksToSave } = body;

    if (!entityId || !blocksToSave) {
      return NextResponse.json(
        { error: "entityId and blocks are required" },
        { status: 400 }
      );
    }

    // Get existing blocks
    const existingBlocks = await db
      .select()
      .from(blocks)
      .where(eq(blocks.entityId, entityId));

    const existingIds = new Set(existingBlocks.map((b) => b.id));
    const newIds = new Set(blocksToSave.map((b: { id: string }) => b.id));

    // Delete removed blocks
    for (const existing of existingBlocks) {
      if (!newIds.has(existing.id)) {
        await db.delete(blocks).where(eq(blocks.id, existing.id));
      }
    }

    // Update or create blocks
    for (const block of blocksToSave) {
      if (existingIds.has(block.id)) {
        // Update existing block
        await db
          .update(blocks)
          .set({
            content: block.content,
            settings: block.settings,
            order: block.order,
            parentId: block.parentId || null,
            updatedAt: new Date(),
          })
          .where(eq(blocks.id, block.id));
      } else {
        // Create new block
        await db.insert(blocks).values({
          id: block.id,
          entityId,
          parentId: block.parentId || null,
          type: block.type,
          content: block.content || {},
          order: block.order ?? 0,
          settings: block.settings || {},
        });
      }
    }

    // Return updated blocks
    const updatedBlocks = await db
      .select()
      .from(blocks)
      .where(eq(blocks.entityId, entityId))
      .orderBy(asc(blocks.order));

    return NextResponse.json({ data: updatedBlocks });
  } catch (error) {
    console.error("Error saving blocks:", error);
    return NextResponse.json(
      { error: "Failed to save blocks" },
      { status: 500 }
    );
  }
}

// PATCH /api/blocks - Bulk reorder blocks
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reorder } = body;

    if (!reorder || !Array.isArray(reorder)) {
      return NextResponse.json(
        { error: "reorder array is required" },
        { status: 400 }
      );
    }

    // Update order for each block
    const updates = await Promise.all(
      reorder.map(async ({ id, order, parentId }: { id: string; order: number; parentId?: string }) => {
        const [updated] = await db
          .update(blocks)
          .set({
            order,
            ...(parentId !== undefined && { parentId }),
            updatedAt: new Date(),
          })
          .where(eq(blocks.id, id))
          .returning();
        return updated;
      })
    );

    return NextResponse.json({ data: updates });
  } catch (error) {
    console.error("Error reordering blocks:", error);
    return NextResponse.json(
      { error: "Failed to reorder blocks" },
      { status: 500 }
    );
  }
}
