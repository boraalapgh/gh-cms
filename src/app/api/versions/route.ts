/**
 * Versions API
 *
 * Version management for entities - create, list, and restore versions.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entityVersions, entities, blocks } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";

// GET /api/versions - List versions for an entity
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
      .from(entityVersions)
      .where(eq(entityVersions.entityId, entityId))
      .orderBy(desc(entityVersions.versionNumber));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error fetching versions:", error);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}

// POST /api/versions - Create a new version (snapshot current state)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityId, publish } = body;

    if (!entityId) {
      return NextResponse.json(
        { error: "entityId is required" },
        { status: 400 }
      );
    }

    // Get current entity
    const [entity] = await db
      .select()
      .from(entities)
      .where(eq(entities.id, entityId))
      .limit(1);

    if (!entity) {
      return NextResponse.json(
        { error: "Entity not found" },
        { status: 404 }
      );
    }

    // Get current blocks as content snapshot
    const currentBlocks = await db
      .select()
      .from(blocks)
      .where(eq(blocks.entityId, entityId))
      .orderBy(asc(blocks.order));

    // Get next version number
    const [latestVersion] = await db
      .select()
      .from(entityVersions)
      .where(eq(entityVersions.entityId, entityId))
      .orderBy(desc(entityVersions.versionNumber))
      .limit(1);

    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1;

    // Create new version
    const [newVersion] = await db
      .insert(entityVersions)
      .values({
        entityId,
        versionNumber: nextVersionNumber,
        content: { blocks: currentBlocks, settings: entity.settings },
        publishedAt: publish ? new Date() : null,
      })
      .returning();

    // Update entity version number
    await db
      .update(entities)
      .set({
        version: nextVersionNumber,
        status: publish ? "published" : entity.status,
        updatedAt: new Date(),
      })
      .where(eq(entities.id, entityId));

    return NextResponse.json({ data: newVersion }, { status: 201 });
  } catch (error) {
    console.error("Error creating version:", error);
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    );
  }
}
