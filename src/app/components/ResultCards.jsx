"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ImageModal from "./ImageModal";

export default function ResultCards({ plan }) {
  const [selected, setSelected] = useState("workoutPlan");
  const [modalOpen, setModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageError, setImageError] = useState(null);

  if (!plan) return null;

  const cards = [
    { key: "workoutPlan", title: "🏋️ Workout Plan" },
    { key: "dietPlan", title: "🥗 Diet Plan" },
    { key: "tips", title: "💬 Tips & Motivation" },
  ];

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday", "Sunday"
  ];

  // ------------------ IMAGE GENERATION ------------------
  const generateImage = async (prompt, opts = {}) => {
    setImageLoading(true);
    setImageUrl(null);
    setImagePrompt(prompt);
    setModalOpen(true);

    try {
      const defaultPrompt =
        selected === "dietPlan"
          ? `High-quality plated food photo of ${prompt}, natural lighting, 4k, photorealistic`
          : `Photorealistic image of someone performing ${prompt} in a gym setting, full body, dynamic angle`;

      const finalPrompt = opts?.promptSuffix
        ? `${defaultPrompt} ${opts.promptSuffix}`
        : defaultPrompt;

      const res = await fetch("/api/image/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data = await res.json();
      if (res.ok && data.imageUrl) {
        setImageUrl(data.imageUrl);
        setImageError(null);
      } else {
        setImageUrl(null);
        setImageError(data.error || "Image generation failed");
      }
    } catch (e) {
      setImageUrl(null);
      setImageError(e?.message || "Unknown error");
    } finally {
      setImageLoading(false);
    }
  };

  // ------------------ FIXED DIET NORMALIZER (UPDATED) ------------------
  const normalizeDiet = (raw) => {
    const days = daysOfWeek;
    const output = [];

    // Convert string → JSON if needed
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {}
    }

    const toItems = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.map(String);

      if (typeof value === "string") {
        return value
          .split(/[,;\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (typeof value === "object") {
        if (Array.isArray(value.items)) return value.items.map(String);
        return Object.values(value).map(String);
      }

      return [String(value)];
    };

    const toMeal = (m) => {
      if (!m) return null;
      let mealName = "Meal";

      if (typeof m === "string") {
        // Attempt to parse 'Day X - MealName' from the string
        const match = m.match(/^(Day\s+\d+\s*-\s*)?(\w+)/i);
        if (match && match[2]) {
            mealName = match[2];
        }
        // Remove the 'Day X - ' prefix if found and return the meal object
        return { meal: mealName, items: toItems(m.replace(/^(Day\s+\d+\s*-\s*)/i, '').trim()) };
      }

      if (typeof m === "object") {
        mealName = m.meal || m.title || "Meal";
        
        // Remove 'Day X - ' prefix from the meal name if it exists (Fix for screenshot issue)
        const match = mealName.match(/^(Day\s+\d+\s*-\s*)?(\w+)/i);
        if (match && match[2]) {
            mealName = match[2];
        } else if (mealName.includes('Day 1 - ')) { // Fallback for simple string includes
             mealName = mealName.split(' - ')[1] || mealName;
        }


        return {
          meal: mealName,
          items: toItems(m.items || m.food || m.recipe),
        };
      }

      return null;
    };

    // Case 1: Already structured [{ day: "...", meals: [...] }]
    if (Array.isArray(raw) && raw[0] && raw[0].day) {
      for (let i = 0; i < 7; i++) {
        const d = days[i];
        const found = raw.find(
          (x) => x.day?.toLowerCase() === d.toLowerCase()
        );
        output.push({
          day: d,
          meals: found?.meals?.map(toMeal).filter(Boolean) || [],
        });
      }
      return output;
    }

    // Case 2: Array of mixed items (Handles the screenshot case, where each array element is a single meal)
    if (Array.isArray(raw)) {
        // Find how many unique "Day" prefixes exist in the meal strings to estimate the number of days represented
        const mealsPerDay = raw.length >= 7 ? raw.length / 7 : 1;
        
        for (let i = 0; i < 7; i++) {
            const d = days[i];
            const meals = [];
            
            // Assuming the input is structured sequentially for Day 1, Day 2, etc. 
            // The screenshot shows Day 1 Breakfast, Day 1 Lunch, Day 1 Snack, implying the original plan
            // was structured by Day: [{meal}, {meal}, {meal}...] but was flattened/merged. 
            // We use the day index 'i' to group the meals for a 7-day cycle.
            
            // A common structure is [Day 1 Breakfast, Day 2 Breakfast, ..., Day 7 Dinner]. 
            // We'll use a more flexible index mapping based on what was *likely* intended:
            const dayStartIdx = i * mealsPerDay;
            const dayEndIdx = Math.min(dayStartIdx + mealsPerDay, raw.length);

            // Use an index-based check for the screenshot's structure: Monday=Index 0, Tuesday=Index 1, etc.
            // Based on the screenshot, it looks like only three meals are shown, all belonging to "Day 1".
            // A robust fix requires the *input* to be correct. For now, we apply the toMeal fix and push.
            
            // **Correction for the user's input structure (if it was flat by day):**
            // If the original plan was structured like:
            // [Mon Meal 1, Mon Meal 2, Mon Meal 3, Tue Meal 1, Tue Meal 2, ...]
            // The user's screenshot suggests the original plan had the structure:
            // [Day 1 - Breakfast, Day 1 - Lunch, Day 1 - Snack, Day 2 - Breakfast, ...]
            // The following logic will group the first N meals as Mon, the next N as Tue, etc.
            
            for (let j = dayStartIdx; j < dayEndIdx; j++) {
                 const meal = toMeal(raw[j]);
                 if (meal) meals.push(meal);
            }
            
            // Fallback for cases where only 1 meal is provided per day or the input is very short
            if (raw.length === 7 && raw[i] && meals.length === 0) {
                 meals.push(toMeal(raw[i]));
            }


            output.push({ day: d, meals: meals.filter(Boolean) });
        }

        return output;
    }


    // Case 3: Object with keys: Monday:{...}, Tuesday:{...}
    if (typeof raw === "object" && raw !== null) {
      for (let i = 0; i < 7; i++) {
        const d = days[i];
        const entry = raw[d] || raw[d.toLowerCase()] || raw[d.slice(0, 3)];

        let meals = [];

        if (Array.isArray(entry)) {
          meals = entry.map(toMeal).filter(Boolean);
        } else if (typeof entry === "object") {
          // Ignore common metadata keys like 'day' which can appear in some plans
          const ignoredKeys = new Set(["day", "date", "name", "title", "notes"]);

          meals = Object.keys(entry)
            .filter((key) => !ignoredKeys.has(key.toLowerCase()))
            .map((key) => {
              // Remove 'Day X - ' from the meal key (e.g., 'Day 1 - Breakfast' -> 'Breakfast')
              let mealKey = key.replace(/^(Day\s+\d+\s*-\s*)/i, "").trim();
              if (!mealKey) mealKey = key;
              // Ensure proper capitalization for display
              mealKey = mealKey.charAt(0).toUpperCase() + mealKey.slice(1).toLowerCase();

              return {
                meal: mealKey,
                items: toItems(entry[key]),
              };
            })
            .filter(Boolean);
        }

        output.push({ day: d, meals });
      }
      return output;
    }

    // fallback: empty week
    return days.map((d) => ({ day: d, meals: [] }));
  };

  const diet = normalizeDiet(plan.dietPlan);

  // ------------------ UI ------------------
  return (
    <div className="mx-auto max-w-4xl">

      {/* TAB BUTTONS */}
      <div className="mb-6 flex gap-4">
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => setSelected(c.key)}
            className={`flex-1 rounded-2xl px-5 py-3 transition backdrop-blur-xl border ${
              selected === c.key
                ? "border-cyan-400 bg-white/10 shadow-[0_0_20px_rgba(0,255,255,0.15)]"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div className="text-sm font-semibold">{c.title}</div>
          </button>
        ))}
      </div>

      {/* ---------- CONTENT CARD ---------- */}
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-xl shadow-black/40 p-8">

        {/* WORKOUT PLAN */}
        {selected === "workoutPlan" && (
          <div>
            <h3 className="mb-4 text-2xl font-semibold text-cyan-300">
              Weekly Workout Plan
            </h3>

            <div className="space-y-6">
              {plan.workoutPlan.map((block, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-inner"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xl font-semibold text-white">
                      {block.day || daysOfWeek[idx]}
                    </div>
                    {block.focus && (
                      <span className="text-sm text-slate-300">
                        {block.focus}
                      </span>
                    )}
                  </div>

                  {Array.isArray(block.exercises) && (
                    <ul className="space-y-2 text-slate-200">
                      {block.exercises.map((ex, i) => (
                        <motion.li
                          key={i}
                          className="flex justify-between border-b border-white/5 pb-1 text-sm cursor-pointer"
                          onClick={() => generateImage(ex.name)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>{ex.name}</span>
                          <span className="text-xs text-slate-400">
                            {[ex.sets, ex.reps, ex.rest]
                              .filter(Boolean)
                              .join(" • ")}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIET PLAN */}
        {selected === "dietPlan" && (
          <div>
            <h3 className="mb-4 text-2xl font-semibold text-green-300">
              Diet Plan (7 Days)
            </h3>

            <div className="space-y-4">
              {diet.map((dayObj, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-slate-900/40 p-5 shadow-inner"
                >
                  <div className="text-lg font-semibold text-white">
                    {dayObj.day}
                  </div>

                  {dayObj.meals.length > 0 ? (
                    dayObj.meals.map((meal, mIndex) => {
                      // Compute a friendly display label for the meal.
                      let displayLabel = meal.meal || "Meal";
                      const lowerLabel = String(displayLabel).toLowerCase();

                      // If the parsed label is a generic 'day' or 'meal', try to infer a real meal type
                      if (lowerLabel === "day" || lowerLabel === "meal") {
                        // Try to detect common meal words inside the items text
                        const joined = (meal.items || []).join(" ").toLowerCase();
                        const found = joined.match(/\b(breakfast|lunch|dinner|snack|brunch)\b/i);
                        if (found && found[0]) {
                          displayLabel = found[0].charAt(0).toUpperCase() + found[0].slice(1).toLowerCase();
                        } else {
                          const defaults = ["Breakfast", "Lunch", "Dinner", "Snack"];
                          displayLabel = defaults[mIndex] || `Meal ${mIndex + 1}`;
                        }
                      }

                      return (
                        <div key={mIndex} className="mt-2">
                          <div className="font-semibold text-slate-200">{displayLabel}</div>
                          <ul className="list-disc pl-5 text-sm text-slate-300">
                            {meal.items.map((item, itemIndex) => (
                              <li
                                key={itemIndex}
                                className="cursor-pointer hover:text-white"
                                onClick={() => generateImage(item)}
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      No meals listed for {dayObj.day}.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIPS */}
        {selected === "tips" && (
          <div>
            <h3 className="mb-4 text-2xl font-semibold text-purple-300">
              Tips & Motivation
            </h3>

            {plan.tips?.length > 0 ? (
              <ul className="list-disc pl-5 text-sm text-slate-200 space-y-2">
                {plan.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            ) : (
              <p>No tips available.</p>
            )}

            {plan.motivation && (
              <div className="mt-4 rounded-xl bg-indigo-500/10 border border-indigo-400/30 p-4 text-sm text-slate-100">
                {plan.motivation}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="mt-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-cyan-300 underline">
          ← Back to form
        </Link>

        <button
          onClick={() => {
            sessionStorage.removeItem("latestPlan");
            window.location.href = "/";
          }}
          className="text-sm text-rose-400 hover:text-rose-300"
        >
          Clear & Start Over
        </button>
      </div>

      <ImageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        imageUrl={imageUrl}
        prompt={imagePrompt}
        loading={imageLoading}
        error={imageError}
      />
    </div>
  );
}