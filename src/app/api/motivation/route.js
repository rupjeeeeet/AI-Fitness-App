import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-2.5-flash";

export async function GET() {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
  }

  const prompt = `Provide a single 1-2 sentence motivational fitness quote. Keep it punchy, positive, and suitable to display as a daily message.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'AI error' }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) return NextResponse.json({ error: 'No quote returned' }, { status: 500 });

    // Strip markdown fences if any
    let quote = text;
    if (quote.startsWith('```')) {
      const firstLine = quote.indexOf('\n');
      const lastFence = quote.lastIndexOf('```');
      if (firstLine !== -1 && lastFence !== -1 && lastFence > firstLine) {
        quote = quote.substring(firstLine, lastFence).trim();
      } else {
        quote = quote.replace(/```/g, '').trim();
      }
    }

    return NextResponse.json({ quote });
  } catch (e) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
