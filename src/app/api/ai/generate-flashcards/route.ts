import { NextResponse } from "next/server";
import type { DraftFlashcardPair } from "@/types/api";

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function extractDefinitionPairs(paragraph: string): DraftFlashcardPair[] {
  const pairs: DraftFlashcardPair[] = [];

  const termDefMatch = paragraph.match(/^(.+?)[:\-–—]\s*([\s\S]+)$/);
  if (termDefMatch) {
    pairs.push({
      front: termDefMatch[1].trim(),
      back: termDefMatch[2].trim(),
      approved: false,
    });
    return pairs;
  }

  const sentences = paragraph
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length >= 2) {
    const concept = sentences[0].replace(/\.$/, "");
    const question = concept.match(/^(¿|what|who|how|why|cuál|qué|quién|cómo|por qué)/i)
      ? concept
      : `¿Qué es ${concept.split(" ").slice(0, 6).join(" ")}?`;
    pairs.push({
      front: question.endsWith("?") ? question : `${question}?`,
      back: sentences.slice(1).join(" "),
      approved: false,
    });
    return pairs;
  }

  if (paragraph.length > 40) {
    const words = paragraph.split(/\s+/);
    const term = words.slice(0, Math.min(5, words.length)).join(" ");
    pairs.push({
      front: `Define: ${term}`,
      back: paragraph,
      approved: false,
    });
  }

  return pairs;
}

async function generateWithOpenAI(text: string): Promise<DraftFlashcardPair[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en psicología. Genera pares de flashcards en español a partir del texto. Responde SOLO con JSON: {\"cards\":[{\"front\":\"pregunta o término\",\"back\":\"respuesta o definición\"}]}. Genera entre 3 y 12 tarjetas concisas.",
        },
        { role: "user", content: text },
      ],
    }),
  });

  if (!response.ok) return [];

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };
  const content = data.choices[0]?.message?.content;
  if (!content) return [];

  const parsed = JSON.parse(content) as {
    cards: { front: string; back: string }[];
  };
  return parsed.cards.map((c) => ({
    front: c.front,
    back: c.back,
    approved: false,
  }));
}

export async function POST(request: Request) {
  const { text } = (await request.json()) as { text: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  let cards = await generateWithOpenAI(text);

  if (cards.length === 0) {
    cards = splitIntoParagraphs(text).flatMap(extractDefinitionPairs);
  }

  if (cards.length === 0) {
    return NextResponse.json(
      { error: "No se pudieron generar tarjetas. Intenta con más texto estructurado." },
      { status: 422 },
    );
  }

  return NextResponse.json({ cards });
}
