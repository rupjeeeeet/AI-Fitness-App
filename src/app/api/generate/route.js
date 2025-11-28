import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using the recommended model for flash performance
const MODEL = "gemini-2.5-flash";

export async function POST(req) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY in .env.local" },
      { status: 500 }
    );
  }

  const { user } = await req.json();

  const prompt = `
You are a professional fitness coach and nutrition expert. 
Generate a **personalized 7-day fitness plan** based on the user's details below.

The output MUST be a VALID JSON object with EXACTLY the following top-level keys:

1. "summary" (string)
   - A short motivational summary (2–3 sentences).

2. "workoutPlan" (array of 7 objects)
   Each workout day MUST follow this structure:
   {
     "day": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
     "focus": "Legs" | "Full Body" | "Back & Biceps" | "Cardio" | etc.,
     "exercises": [
       {
         "name": "Barbell Squat",
         "sets": "3",
         "reps": "8–12",
         "rest": "60–90 sec"
       }
     ]
   }

3. dietPlan (Array of meal objects. Each meal object MUST have keys: 'meal' (string) and 'items' (array of strings))

4. "tips" (array of 5–10 short, actionable fitness tips as strings)

5. "motivation" (string)
   - A powerful 2–3 sentence motivational message.

IMPORTANT RULES:
- RETURN ONLY RAW JSON. No explanations, no markdown, no notes.
- Make sure the JSON is valid and properly formatted.
- WorkoutPlan MUST always have exactly 7 days.
- DietPlan MUST always have exactly 7 days.
- Customize everything based on the user details below.

User Details:
${JSON.stringify(user, null, 2)}

-- NOW OUTPUT RAW JSON ONLY BELOW THIS LINE --
`;

  try {
    const response = await fetch(
      // Correct API endpoint using v1
      `https://generativelanguage.googleapis.com/v1/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
          // The problematic generationConfig block is now completely removed.
        })
      }
    );

    const data = await response.json();

    // Handle Google API errors (HTTP status 4xx/5xx)
    if (!response.ok) {
      console.error("GEMINI API ERROR:", data);
      return NextResponse.json(
        { error: data.error?.message || "Gemini API error (check server logs)" },
        { status: 500 }
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "AI returned no text content." },
        { status: 500 }
      );
    }

    // 💡 CRITICAL: The Cleanup Logic is now essential since we removed the API configuration.
    let jsonText = text.trim();
    
    // 1. Strip potential Markdown fences (```json, ```)
    if (jsonText.startsWith('```')) {
        const firstFenceEnd = jsonText.indexOf('\n'); // Find end of first line (e.g., ```json)
        const lastFenceStart = jsonText.lastIndexOf('```');
        
        if (firstFenceEnd !== -1 && lastFenceStart !== -1 && lastFenceStart > firstFenceEnd) {
            // Content is between the fences
            jsonText = jsonText.substring(firstFenceEnd, lastFenceStart).trim();
        } else if (lastFenceStart !== -1) {
            // Assume the whole thing starts with ``` and ends with ```
            jsonText = jsonText.substring(3, lastFenceStart).trim();
        } else {
            // If it starts with ``` but has no end fence, strip the beginning only
             jsonText = jsonText.substring(3).trim();
        }
    }
    
    // Attempt to parse the cleaned text
    try {
      const planObject = JSON.parse(jsonText);
      // SUCCESS: The parsed JSON object is returned to the frontend
      return NextResponse.json(planObject);
    } catch (e) {
      console.error("JSON PARSING FAILED:", e);
      // FAILURE: Return a detailed error for debugging
      return NextResponse.json(
        { 
          error: "AI response was not valid JSON, even after cleanup. Check the raw_output below.",
          raw_output: text 
        },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("Fetch/Network Error:", e);
    return NextResponse.json(
      { error: "Network or server error connecting to the API." },
      { status: 500 }
    );
  }
}