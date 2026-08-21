import { NextResponse } from "next/server";
import type { DraftFlashcardPair } from "@/types/api";

const MIN_CARDS = 3;
const MAX_CARDS = 30;
const DEFAULT_MAX_CARDS = 12;

// --- 1. Detectar cantidad solicitada en el texto/instrucción ---
function detectRequestedCount(text: string): number | null {
  const patterns = [
    /genera(?:r)?\s+(\d+)\s+tarjetas/i,
    /(\d+)\s+tarjetas/i,
    /crea(?:r)?\s+(\d+)\s+tarjetas/i,
  ];
  for (const re of patterns) {
    const match = text.match(re);
    if (match) {
      const n = parseInt(match[1], 10);
      if (!isNaN(n)) return Math.min(Math.max(n, MIN_CARDS), MAX_CARDS);
    }
  }
  return null;
}

// --- 2. Detectar pares explícitos "Frente: ... Reverso: ..." ---
function extractExplicitPairs(text: string): DraftFlashcardPair[] {
  const blocks = text.split(/\n{2,}/);
  const pairs: DraftFlashcardPair[] = [];

  for (const block of blocks) {
    const frenteMatch = block.match(/frente\s*[:\-]\s*([\s\S]+?)(?=\n?reverso\s*[:\-]|$)/i);
    const reversoMatch = block.match(/reverso\s*[:\-]\s*([\s\S]+)/i);

    if (frenteMatch && reversoMatch) {
      const front = frenteMatch[1].trim();
      const back = reversoMatch[1].trim();
      if (front && back) {
        pairs.push({ front, back, approved: false });
      }
    }
  }

  return pairs;
}

function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function extractDefinitionPairs(paragraph: string): DraftFlashcardPair[] {
  // ... (fallback heurístico existente, sin cambios)
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
    pairs.push({ front: `Define: ${term}`, back: paragraph, approved: false });
  }
  return pairs;
}

// --- 3. Generación con IA, ahora recibe la cantidad deseada ---
async function generateWithOpenAI(
  text: string,
  requestedCount: number | null,
): Promise<DraftFlashcardPair[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY no configurada");
    return [];
  }

  const countInstruction = requestedCount
    ? `Genera EXACTAMENTE ${requestedCount} tarjetas. No generes más ni menos.`
    : `Genera entre ${MIN_CARDS} y ${DEFAULT_MAX_CARDS} tarjetas, según la cantidad de conceptos distintos que encuentres en el texto.`;

  const systemPrompt = `Eres un experto en psicología que genera flashcards educativas en español.

Reglas estrictas:
- Cada tarjeta debe contener EXACTAMENTE un concepto o pregunta en el frente y su respuesta en el reverso.
- Nunca combines varios conceptos en una sola tarjeta.
- Nunca incluyas las palabras "Frente" o "Reverso" dentro del contenido de front/back.
- Si el texto ya viene estructurado como pares "Frente: ... Reverso: ...", respeta ese contenido casi literal (solo corrige ortografía/formato), uno por tarjeta, sin fusionarlos.
- ${countInstruction}

Responde ÚNICAMENTE con JSON válido, sin texto adicional, con esta forma:
{"cards":[{"front":"string","back":"string"}]}`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI API error:", response.status, await response.text());
      return [];
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };
    const content = data.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content) as { cards: { front: string; back: string }[] };
    return parsed.cards.map((c) => ({ front: c.front, back: c.back, approved: false }));
  } catch (err) {
    console.error("Fallo generando tarjetas con OpenAI:", err);
    return [];
  }
}

export async function POST(request: Request) {
  const { text } = (await request.json()) as { text: string };

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const requestedCount = detectRequestedCount(text);
  const explicitPairs = extractExplicitPairs(text);

  let cards: DraftFlashcardPair[];

  if (explicitPairs.length > 0) {
    cards = explicitPairs;
  } else {
    cards = await generateWithOpenAI(text, requestedCount);

    if (cards.length === 0) {
      return NextResponse.json(
        {
          error:
            "No se pudo generar contenido con IA en este momento. Intenta de nuevo en unos minutos, o usa el formato 'Frente:/Reverso:' para crear tarjetas directamente.",
        },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ cards });
}