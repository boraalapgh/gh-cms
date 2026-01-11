/**
 * Media API
 *
 * Handle media uploads and storage.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET /api/media - List all media
export async function GET() {
  try {
    const result = await db
      .select()
      .from(media)
      .orderBy(desc(media.createdAt));

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

// POST /api/media - Create media entry (for external URLs or after upload)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, source, metadata } = body;

    if (!type || !url) {
      return NextResponse.json(
        { error: "type and url are required" },
        { status: 400 }
      );
    }

    const [newMedia] = await db
      .insert(media)
      .values({
        type,
        url,
        source: source || "external",
        metadata: metadata || {},
      })
      .returning();

    return NextResponse.json({ data: newMedia }, { status: 201 });
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}
