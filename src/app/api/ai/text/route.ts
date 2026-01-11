/**
 * AI Text Generation API
 *
 * Generate or improve text using OpenAI.
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/text - Generate or improve text
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, existingText, context, maxTokens = 500 } = body;

    if (!prompt && !existingText) {
      return NextResponse.json(
        { error: "prompt or existingText is required" },
        { status: 400 }
      );
    }

    let systemPrompt = "You are a helpful assistant that creates educational content for e-learning courses.";
    let userPrompt = prompt;

    // If improving existing text
    if (existingText) {
      systemPrompt = "You are a helpful assistant that improves educational content. Make the text clearer, more engaging, and better suited for learning.";
      userPrompt = `Improve the following text${context ? ` (Context: ${context})` : ""}:\n\n${existingText}`;
    } else if (context) {
      userPrompt = `${context}\n\n${prompt}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
    });

    const generatedText = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ data: { text: generatedText } });
  } catch (error) {
    console.error("Error generating text:", error);
    return NextResponse.json(
      { error: "Failed to generate text" },
      { status: 500 }
    );
  }
}
