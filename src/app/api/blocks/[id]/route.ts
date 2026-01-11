/**
 * Block by ID API
 *
 * GET, PUT, DELETE operations for individual blocks.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { blocks } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/blocks/[id] - Get a single block
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [block] = await db
      .select()
      .from(blocks)
      .where(eq(blocks.id, id))
      .limit(1);

    if (!block) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: block });
  } catch (error) {
    console.error("Error fetching block:", error);
    return NextResponse.json(
      { error: "Failed to fetch block" },
      { status: 500 }
    );
  }
}

// PUT /api/blocks/[id] - Update a block
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, settings, order, parentId } = body;

    const [updated] = await db
      .update(blocks)
      .set({
        ...(content && { content }),
        ...(settings && { settings }),
        ...(order !== undefined && { order }),
        ...(parentId !== undefined && { parentId }),
        updatedAt: new Date(),
      })
      .where(eq(blocks.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating block:", error);
    return NextResponse.json(
      { error: "Failed to update block" },
      { status: 500 }
    );
  }
}

// DELETE /api/blocks/[id] - Delete a block
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [deleted] = await db
      .delete(blocks)
      .where(eq(blocks.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Block not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Error deleting block:", error);
    return NextResponse.json(
      { error: "Failed to delete block" },
      { status: 500 }
    );
  }
}
