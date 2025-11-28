"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Form() {
  const [user, setUser] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    level: "",
    location: "",
    diet: "",
    medical: "",
  });

  const updateField = (field, value) => {
    setUser({ ...user, [field]: value });
  };

  const selectFields = [
    {
      field: "goal",
      label: "Fitness Goal (Weight Loss, Muscle Gain, etc.)",
      options: ["Weight Loss", "Muscle Gain", "Endurance", "General Wellness"],
    },
    {
      field: "level",
      label: "Current Fitness Level (Beginner / Intermediate / Advanced)",
      options: ["Beginner", "Intermediate", "Advanced"],
    },
    {
      field: "location",
      label: "Workout Location (Home / Gym / Outdoor)",
      options: ["Home", "Gym", "Outdoor"],
    },
    {
      field: "diet",
      label: "Dietary Preferences (Veg / Non-Veg / Vegan / Keto)",
      options: ["Veg", "Non-Veg", "Vegan", "Keto"],
    },
  ];

  const planFeatures = [
    {
      emoji: "🏋️",
      title: "Workout Plan",
      description: "Daily routines with sets, reps, and precise rest windows.",
    },
    {
      emoji: "🥗",
      title: "Diet Plan",
      description: "Breakfast through snacks, complete with macros and swaps.",
    },
    {
      emoji: "💬",
      title: "AI Tips & Motivation",
      description: "Posture cues, recovery advice, and mindset boosters.",
    },
  ];

  const promptNotes = [
    "Each response is generated dynamically based on user input.",
    "No hardcoded plans — every recommendation is AI-personalized.",
  ];

  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setPlan(null);

    const sanitizedUser = Object.fromEntries(
      Object.entries(user).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
    );

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: sanitizedUser }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => ({}));
        throw new Error(details?.error || "Failed to generate your plan. Please try again.");
      }

      const data = await response.json();

      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("latestPlan", JSON.stringify(data));
          sessionStorage.setItem("latestUser", JSON.stringify(sanitizedUser));
        }
      } catch (e) {
        // ignore storage errors
      }

      router.push("/results");
    } catch (requestError) {
      setError(requestError.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-linear-to-br from-[#040615] via-[#081637] to-[#060814] text-slate-100 overflow-hidden px-6 py-14">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-32 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-[140px]" />
        <div className="absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-purple-500/20 blur-[160px]" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 lg:flex-row">
        {/* LEFT SECTION */}
        <section className="flex-1 space-y-8 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-blue-900/20 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1 text-sm text-cyan-100">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Powered by Gemini-inspired AI
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.35em] text-cyan-200/80">
              AI-POWERED PLAN GENERATION
            </p>
            <h1 className="text-4xl font-semibold text-white leading-tight md:text-5xl">
              Your luminous AI{" "}
              <span className="text-transparent bg-linear-to-r from-cyan-300 to-indigo-400 bg-clip-text">
                fitness twin
              </span>
            </h1>
            <p className="text-slate-200 text-lg">
              This coach taps directly into AI to craft
              plans in real time—no templates, no guesswork, just adaptive intelligence.
            </p>
          </div>

          <div className="space-y-5">
            {planFeatures.map(({ emoji, title, description }) => (
              <div
                key={title}
                className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-blue-900/30"
              >
                <span className="text-2xl" aria-hidden>
                  {emoji}
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-slate-200">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-cyan-200/30 bg-cyan-500/5 p-5 shadow-lg shadow-cyan-900/20">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
              ⚡ Prompt Engineering
            </p>
            <p className="mt-2 text-sm text-slate-100">
              Each response is orchestrated with structured prompts, so the output reads like a personal coach,
              not a generic template.
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {promptNotes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span className="text-cyan-200">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* RIGHT SECTION */}
        <section className="flex-1 rounded-3xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-indigo-900/30 backdrop-blur-xl">
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Customize your AI plan
          </h2>
          <p className="text-sm text-slate-300">
            Share essentials so the model can craft workouts, nutrition, and recovery.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {/* SELECT FIELDS */}
            {selectFields.map(({ field, label, options }) => (
              <div key={field} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-100">{label}</label>

                <div className="relative rounded-2xl bg-linear-to-r from-cyan-400/40 via-blue-500/30 to-indigo-500/40 p-px shadow-[0_10px_30px_rgba(8,24,64,0.35)]">
                  <select
                    className="w-full appearance-none rounded-2xl bg-slate-950/70 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-slate-400 focus:bg-slate-950/80 focus:ring-0"
                    value={user[field]}
                    onChange={(e) => updateField(field, e.target.value)}
                  >
                    <option value="" hidden disabled>
                      Select an option
                    </option>

                    {options.map((option) => (
                      <option key={option} value={option} className="bg-slate-900 text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-cyan-200">
                    ▾
                  </span>
                </div>
              </div>
            ))}

            {/* INPUT FIELDS */}
            {[
              { field: "name", label: "Full Name" },
              { field: "age", label: "Age" },
              { field: "gender", label: "Gender" },
              { field: "height", label: "Height (cm)" },
              { field: "weight", label: "Weight (kg)" },
              { field: "medical", label: "Medical History (optional)" },
            ].map(({ field, label }) => (
              <div key={field} className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-100">{label}</label>
                <input
                  className="rounded-2xl border-none ring-0 bg-white/5 px-4 py-3 text-white placeholder:text-slate-400 outline-none transition focus:bg-white/10"
                  value={user[field]}
                  onChange={(e) => updateField(field, e.target.value)}
                  placeholder={label}
                />
              </div>
            ))}

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-6 w-full rounded-2xl bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500 px-6 py-4 text-lg font-semibold text-slate-950 shadow-xl shadow-cyan-500/40 transition hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Generating your plan..." : "Generate My AI Plan"}
            </button>
          </form>

          {plan && (
            <div className="mt-8 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-blue-900/20">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-200">
                AI-Generated Preview
              </p>

              {plan.summary && (
                <p className="text-base text-slate-100">{plan.summary}</p>
              )}

              {Array.isArray(plan.workoutPlan) && plan.workoutPlan.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">🏋️ Workout Plan</h3>
                  {plan.workoutPlan.map((block, index) => (
                    <div
                      key={`${block.title || block.day || "workout"}-${index}`}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
                        <p className="font-semibold text-white">{block.title || block.day}</p>
                        {block.focus && <span>{block.focus}</span>}
                      </div>
                      {Array.isArray(block.exercises) && block.exercises.length > 0 && (
                        <ul className="mt-3 space-y-2 text-sm text-slate-200">
                          {block.exercises.map((exercise, exerciseIndex) => (
                            <li
                              key={`${exercise.name}-${exerciseIndex}`}
                              className="flex items-center justify-between gap-4"
                            >
                              <span>{exercise.name}</span>
                              <span className="text-xs text-slate-400">
                                {[exercise.sets, exercise.reps, exercise.rest].filter(Boolean).join(" • ")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(plan.dietPlan) && plan.dietPlan.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">🥗 Diet Plan</h3>
                  {plan.dietPlan.map((meal, index) => (
                    <div
                      key={`${meal.meal || meal.title}-${index}`}
                      className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"
                    >
                      <p className="font-semibold text-white">{meal.meal || meal.title}</p>
                      {Array.isArray(meal.items) && meal.items.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-200">
                          {meal.items.map((item, itemIndex) => (
                            <li key={`${item}-${itemIndex}`}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(plan.tips) && plan.tips.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">💬 AI Tips & Motivation</h3>
                  <ul className="space-y-2 text-sm text-slate-200">
                    {plan.tips.map((tip, index) => (
                      <li key={`${tip}-${index}`} className="flex gap-2">
                        <span className="text-cyan-200">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {plan.motivation && (
                <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4 text-sm text-slate-100">
                  {plan.motivation}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
