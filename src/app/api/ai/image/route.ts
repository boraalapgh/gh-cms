/**
 * AI Image Generation API
 *
 * Generate images using OpenAI DALL-E.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/db";
import { media } from "@/db/schema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/image - Generate an image
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, size = "1024x1024", style = "natural" } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "prompt is required" },
        { status: 400 }
      );
    }

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Educational illustration: ${prompt}`,
      n: 1,
      size: size as "1024x1024" | "1792x1024" | "1024x1792",
      style: style as "vivid" | "natural",
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: 500 }
      );
    }

    // Store in media library
    const [newMedia] = await db
      .insert(media)
      .values({
        type: "image",
        url: imageUrl,
        source: "ai_generated",
        metadata: { prompt, size, style },
      })
      .returning();

    return NextResponse.json({ data: { url: imageUrl, media: newMedia } });
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
