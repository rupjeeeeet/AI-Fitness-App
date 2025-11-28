import { NextResponse } from "next/server";

// Simple image generation endpoint.
// If you provide `REPLICATE_API_TOKEN` in your environment, you can extend this
// handler to call Replicate (or another image API). Without a token this
// returns a fallback image from Unsplash using a query search.

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const NANO_URL = process.env.GEMINI_API_KEY;
    const NANO_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_IMAGE_ENDPOINT = GEMINI_API_KEY
      ? `https://generativelanguage.googleapis.com/v1/images:generate?key=${GEMINI_API_KEY}`
      : null;

    // 1) If Nano Banana is configured, prefer it for image generation (user requested Nano Banana)
    if (NANO_URL && NANO_KEY) {
      try {
        const res = await fetch(NANO_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${NANO_KEY}`,
          },
          body: JSON.stringify({ prompt }),
        });

        const json = await res.json();

        // Expect either { url: "..." } or { image: "data:image/...;base64,..." }
        if (json.url) {
          return NextResponse.json({ imageUrl: json.url });
        }

        if (json.image) {
          return NextResponse.json({ imageUrl: json.image });
        }

        // If Nano returns an unexpected shape, continue to try Gemini as fallback
      } catch (err) {
        console.error('Nano Banana proxy failed:', err?.message || err);
        // fallthrough to Gemini/Unsplash
      }
    }

    // 2) Try Gemini image generation if API key is present
    if (GEMINI_IMAGE_ENDPOINT) {
      try {
        const payload = {
          prompt,
          imageFormat: "PNG",
          size: "1024x1024",
        };

        const gRes = await fetch(GEMINI_IMAGE_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const gJson = await gRes.json().catch(() => null);

        if (gRes.ok && gJson) {
          let found = null;

          if (gJson.artifacts && Array.isArray(gJson.artifacts) && gJson.artifacts[0]) {
            const a = gJson.artifacts[0];
            if (a.image) found = a.image;
            if (a.uri) found = a.uri;
          }

          if (!found && gJson.candidates && Array.isArray(gJson.candidates) && gJson.candidates[0]) {
            const c = gJson.candidates[0];
            if (c.image) found = c.image;
            if (c.uri) found = c.uri;
          }

          if (!found && gJson.images && Array.isArray(gJson.images) && gJson.images[0]) {
            const im = gJson.images[0];
            if (im.url) found = im.url;
            if (im.b64_json) found = `data:image/png;base64,${im.b64_json}`;
            if (im.base64) found = `data:image/png;base64,${im.base64}`;
          }

          if (!found && gJson.data && gJson.data[0]) {
            const d = gJson.data[0];
            if (d.b64_json) found = `data:image/png;base64,${d.b64_json}`;
            if (d.url) found = d.url;
          }

          if (found) return NextResponse.json({ imageUrl: found });
        }
      } catch (err) {
        console.error('Gemini image generation failed:', err?.message || err);
      }
    }

    // 3) Fallback: use a search image from Unsplash (public, free to use for prototyping)
    const query = encodeURIComponent(prompt.replace(/\s+/g, "+"));
    const imageUrl = `https://source.unsplash.com/800x600/?${query}`;

    return NextResponse.json({ imageUrl });
  } catch (e) {
    return NextResponse.json({ error: e.message || String(e) }, { status: 500 });
  }
}
