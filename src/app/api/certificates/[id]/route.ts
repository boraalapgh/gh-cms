/**
 * Certificate Template API - Single Template Operations
 *
 * GET    /api/certificates/[id] - Get template by ID
 * PUT    /api/certificates/[id] - Update template
 * DELETE /api/certificates/[id] - Delete template
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CertificateTemplate } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get certificate template by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const [template] = await db
      .select()
      .from(entities)
      .where(eq(entities.id, id))
      .limit(1);

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Certificate template not found" },
        { status: 404 }
      );
    }

    if (template.type !== "certificate_template") {
      return NextResponse.json(
        { success: false, error: "Entity is not a certificate template" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: template.id,
        name: template.title,
        template: template.content as CertificateTemplate,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to fetch certificate template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate template" },
      { status: 500 }
    );
  }
}

// PUT - Update certificate template
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, template } = body as {
      name?: string;
      template?: CertificateTemplate;
    };

    // Check if template exists
    const [existing] = await db
      .select()
      .from(entities)
      .where(eq(entities.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Certificate template not found" },
        { status: 404 }
      );
    }

    if (existing.type !== "certificate_template") {
      return NextResponse.json(
        { success: false, error: "Entity is not a certificate template" },
        { status: 400 }
      );
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updates.title = name;
    }

    if (template !== undefined) {
      updates.content = template;
    }

    // Update template
    const [updated] = await db
      .update(entities)
      .set(updates)
      .where(eq(entities.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.title,
        template: updated.content as CertificateTemplate,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to update certificate template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update certificate template" },
      { status: 500 }
    );
  }
}

// DELETE - Delete certificate template
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if template exists
    const [existing] = await db
      .select()
      .from(entities)
      .where(eq(entities.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Certificate template not found" },
        { status: 404 }
      );
    }

    if (existing.type !== "certificate_template") {
      return NextResponse.json(
        { success: false, error: "Entity is not a certificate template" },
        { status: 400 }
      );
    }

    // Delete template
    await db.delete(entities).where(eq(entities.id, id));

    return NextResponse.json({
      success: true,
      message: "Certificate template deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete certificate template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete certificate template" },
      { status: 500 }
    );
  }
}
