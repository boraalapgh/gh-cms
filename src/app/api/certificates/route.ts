/**
 * Certificate Templates API
 *
 * Handles CRUD operations for certificate templates.
 * Templates are stored as JSON in the database.
 *
 * GET  /api/certificates - List all templates
 * POST /api/certificates - Create new template
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { entities } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { CertificateTemplate } from "@/types";

// GET - List all certificate templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch entities where type is "certificate_template"
    const templates = await db
      .select()
      .from(entities)
      .where(eq(entities.type, "certificate_template"))
      .orderBy(desc(entities.updatedAt))
      .limit(limit)
      .offset(offset);

    // Parse template data from content JSON
    const parsedTemplates = templates.map((t) => ({
      id: t.id,
      name: t.title,
      template: t.content as CertificateTemplate,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: parsedTemplates,
      pagination: {
        limit,
        offset,
        total: templates.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch certificate templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate templates" },
      { status: 500 }
    );
  }
}

// POST - Create new certificate template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, template } = body as {
      name: string;
      template: CertificateTemplate;
    };

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Template name is required" },
        { status: 400 }
      );
    }

    if (!template) {
      return NextResponse.json(
        { success: false, error: "Template data is required" },
        { status: 400 }
      );
    }

    // Create entity record for the certificate template
    const [newTemplate] = await db
      .insert(entities)
      .values({
        type: "certificate_template",
        title: name,
        content: template,
        status: "published",
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        id: newTemplate.id,
        name: newTemplate.title,
        template: newTemplate.content as CertificateTemplate,
        createdAt: newTemplate.createdAt,
        updatedAt: newTemplate.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to create certificate template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create certificate template" },
      { status: 500 }
    );
  }
}
