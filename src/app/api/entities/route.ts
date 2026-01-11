/**
 * Entities API
 *
 * CRUD operations for all entity types (activities, lessons, courses, assessments).
 * Supports filtering by type and status.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entities, entityVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET /api/entities - List all entities with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    let query = db.select().from(entities);

    // Apply filters if provided
    const conditions = [];
    if (type) {
      conditions.push(eq(entities.type, type as "activity" | "lesson" | "course" | "assessment"));
    }
    if (status) {
      conditions.push(eq(entities.status, status as "draft" | "published"));
    }

    const result = conditions.length > 0
      ? await query.where(conditions.length === 1 ? conditions[0] : conditions[0]).orderBy(desc(entities.updatedAt))
      : await query.orderBy(desc(entities.updatedAt));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error fetching entities:", error);
    return NextResponse.json(
      { error: "Failed to fetch entities" },
      { status: 500 }
    );
  }
}

// POST /api/entities - Create a new entity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, settings } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Type and title are required" },
        { status: 400 }
      );
    }

    // Create the entity
    const [newEntity] = await db
      .insert(entities)
      .values({
        type,
        title,
        description: description || null,
        settings: settings || {},
      })
      .returning();

    // Create initial version
    await db.insert(entityVersions).values({
      entityId: newEntity.id,
      versionNumber: 1,
      content: { blocks: [] },
    });

    return NextResponse.json({ data: newEntity }, { status: 201 });
  } catch (error) {
    console.error("Error creating entity:", error);
    return NextResponse.json(
      { error: "Failed to create entity" },
      { status: 500 }
    );
  }
}
